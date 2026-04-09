"""Authentication router: register, login, email verification, password reset."""

import logging

import jwt
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ..auth import (
    create_access_token,
    create_reset_token,
    create_verification_token,
    decode_purpose_token,
    get_current_user,
    hash_password,
    verify_password,
)
from ..database import get_db
from ..email import (
    is_email_configured,
    send_admin_new_registration_email,
    send_password_reset_email,
    send_verification_email,
)
from ..models import Role, User, UserType
from ..user_sync import sync_user_to_mopilot, update_password_in_mopilot
from ..schemas import (
    AcceptInviteRequest,
    ForgotPasswordRequest,
    LoginRequest,
    MessageResponse,
    ResendVerificationRequest,
    ResetPasswordRequest,
    TokenResponse,
    UserCreate,
    UserOut,
)

# Placeholder hash used for invited users who haven't set a password yet
_INVITE_PLACEHOLDER = "!invited"

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=MessageResponse, status_code=201)
def register(data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user. Sends verification email if SMTP is configured."""
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Diese E-Mail-Adresse ist bereits registriert.",
        )

    # Validate role_id if provided
    if data.role_id:
        role = db.query(Role).filter(Role.id == data.role_id).first()
        if not role:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ungültige Rolle.",
            )

    # Stakeholders must have a role
    if data.user_type == UserType.stakeholder and not data.role_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Stakeholder müssen eine Rolle auswählen.",
        )

    smtp_available = is_email_configured()

    user = User(
        email=data.email,
        name=data.name,
        password_hash=hash_password(data.password),
        role_id=data.role_id,
        user_type=data.user_type,
        email_verified=not smtp_available,  # auto-verify if no SMTP
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    logger.info("User registered: %s (%s)", user.email, user.user_type.value)

    if smtp_available:
        token = create_verification_token(user.id)
        try:
            send_verification_email(user.email, user.name, token)
        except Exception as e:
            logger.warning("Verification email failed: %s", str(e))
        # Notify admin about pending registration
        role = db.query(Role).filter(Role.id == user.role_id).first() if user.role_id else None
        try:
            send_admin_new_registration_email(user.email, user.name, role.name if role else None)
        except Exception as e:
            logger.warning("Admin notification email failed: %s", str(e))
        return MessageResponse(
            message="Registrierung erfolgreich! Bitte prüfen Sie Ihr Postfach und bestätigen Sie Ihre E-Mail-Adresse. Nach der Bestätigung wird Ihr Konto vom Administrator freigeschaltet."
        )
    else:
        # No SMTP → auto-verified but still needs admin approval
        return MessageResponse(
            message="Registrierung erfolgreich! Ihr Konto muss noch vom Administrator freigeschaltet werden."
        )


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    """Login and receive a JWT token."""
    user = db.query(User).filter(User.email == data.email).first()
    if not user or user.password_hash == _INVITE_PLACEHOLDER or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Ungültige E-Mail oder Passwort.",
        )

    if not user.email_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="E-Mail-Adresse noch nicht bestätigt. Bitte prüfen Sie Ihr Postfach.",
        )

    if not user.approved:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Ihr Konto wurde noch nicht freigeschaltet. Bitte warten Sie auf die Bestätigung durch den Administrator.",
        )

    token = create_access_token(user.id)
    logger.info("User logged in: %s", user.email)
    return TokenResponse(access_token=token, user=UserOut.model_validate(user))


@router.get("/verify", response_model=MessageResponse)
def verify_email(token: str = Query(...), db: Session = Depends(get_db)):
    """Verify a user's email address using the token from the verification email."""
    try:
        user_id = decode_purpose_token(token, "verify")
    except (jwt.InvalidTokenError, KeyError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ungültiger oder abgelaufener Bestätigungslink.",
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Benutzer nicht gefunden.")

    if user.email_verified:
        return MessageResponse(message="E-Mail-Adresse wurde bereits bestätigt.")

    user.email_verified = True
    db.commit()
    logger.info("Email verified: %s", user.email)

    logger.info("Email verified for %s. Awaiting admin approval.", user.email)

    return MessageResponse(message="E-Mail-Adresse erfolgreich bestätigt! Sie können sich jetzt anmelden.")


@router.post("/forgot-password", response_model=MessageResponse)
def forgot_password(data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Request a password reset email. Always returns 200 to prevent email enumeration."""
    user = db.query(User).filter(User.email == data.email).first()
    if user:
        token = create_reset_token(user.id)
        try:
            send_password_reset_email(user.email, user.name, token)
        except Exception as e:
            logger.warning("Reset email failed: %s", str(e))

    # Always return success to prevent email enumeration
    return MessageResponse(
        message="Falls ein Konto mit dieser E-Mail existiert, wurde ein Link zum Zurücksetzen gesendet."
    )


@router.post("/reset-password", response_model=MessageResponse)
def reset_password(data: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Reset password using the token from the reset email."""
    try:
        user_id = decode_purpose_token(data.token, "reset")
    except (jwt.InvalidTokenError, KeyError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ungültiger oder abgelaufener Reset-Link.",
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Benutzer nicht gefunden.")

    user.password_hash = hash_password(data.new_password)
    db.commit()
    logger.info("Password reset: %s", user.email)

    # Sync to mopilot DB (upsert – also creates user if not yet synced)
    role = db.query(Role).filter(Role.id == user.role_id).first() if user.role_id else None
    sync_user_to_mopilot(user.email, user.name, user.password_hash, role.slug if role else None)

    return MessageResponse(message="Passwort erfolgreich geändert. Sie können sich jetzt anmelden.")


@router.post("/resend-verification", response_model=MessageResponse)
def resend_verification(data: ResendVerificationRequest, db: Session = Depends(get_db)):
    """Resend verification email."""
    user = db.query(User).filter(User.email == data.email).first()
    if user and not user.email_verified:
        token = create_verification_token(user.id)
        try:
            send_verification_email(user.email, user.name, token)
        except Exception as e:
            logger.warning("Verification email failed: %s", str(e))

    # Always return success to prevent email enumeration
    return MessageResponse(
        message="Falls ein Konto mit dieser E-Mail existiert, wurde eine Bestätigungsmail gesendet."
    )


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    """Get current user profile."""
    return UserOut.model_validate(current_user)


@router.post("/accept-invite", response_model=MessageResponse)
def accept_invitation(data: AcceptInviteRequest, db: Session = Depends(get_db)):
    """Accept an invitation by setting a password using the invite token."""
    try:
        user_id = decode_purpose_token(data.token, "invite")
    except (jwt.InvalidTokenError, KeyError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ungültiger oder abgelaufener Einladungslink.",
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Benutzer nicht gefunden.")

    if user.password_hash != _INVITE_PLACEHOLDER:
        raise HTTPException(
            status_code=400,
            detail="Sie haben bereits ein Passwort gesetzt. Bitte melden Sie sich an.",
        )

    user.password_hash = hash_password(data.new_password)
    db.commit()
    logger.info("Invitation accepted: %s set their password", user.email)

    role = db.query(Role).filter(Role.id == user.role_id).first() if user.role_id else None
    sync_user_to_mopilot(
        user.email, user.name, user.password_hash,
        role.slug if role else None,
    )

    return MessageResponse(message="Passwort erfolgreich gesetzt. Sie können sich jetzt anmelden.")
