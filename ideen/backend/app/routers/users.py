"""Users router: user management (admin)."""

import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..auth import get_current_user, hash_password
from ..database import get_db
from ..models import Comment, Idea, Rating, Role, User, UserType
from ..schemas import (
    AdminPasswordResetRequest,
    AdminRoleChangeRequest,
    MessageResponse,
    UserOut,
)
from ..user_sync import delete_user_from_mopilot, sync_user_to_mopilot

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/users", tags=["users"])


def _require_admin(current_user: User) -> None:
    if current_user.user_type != UserType.admin:
        raise HTTPException(status_code=403, detail="Nur Admins können Nutzer verwalten.")


@router.get("", response_model=list[UserOut])
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all users (admin only). Pending users first, then by created_at desc."""
    _require_admin(current_user)
    users = (
        db.query(User)
        .order_by(User.approved.asc(), User.created_at.desc())
        .all()
    )
    return [UserOut.model_validate(u) for u in users]


@router.get("/pending-count")
def pending_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return count of users pending approval (admin only)."""
    _require_admin(current_user)
    count = db.query(User).filter(
        User.email_verified == True,
        User.approved == False,
    ).count()
    return {"count": count}


@router.post("/{user_id}/approve", response_model=MessageResponse)
def approve_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Approve a pending user and sync to mopilot DB."""
    _require_admin(current_user)
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Benutzer nicht gefunden.")
    if user.approved:
        return MessageResponse(message="Benutzer ist bereits freigeschaltet.")

    user.approved = True
    db.commit()
    logger.info("User approved: %s by admin %s", user.email, current_user.email)

    # Sync to mopilot DB
    role = db.query(Role).filter(Role.id == user.role_id).first() if user.role_id else None
    sync_user_to_mopilot(
        user.email, user.name, user.password_hash,
        role.slug if role else None,
    )

    return MessageResponse(message=f"{user.name} wurde freigeschaltet.")


@router.post("/{user_id}/reject", response_model=MessageResponse)
def reject_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Reject and delete a pending user."""
    _require_admin(current_user)
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Benutzer nicht gefunden.")
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Sie können sich nicht selbst löschen.")

    email = user.email
    db.query(Comment).filter(Comment.user_id == user_id).delete()
    db.query(Rating).filter(Rating.user_id == user_id).delete()
    db.query(Idea).filter(Idea.author_id == user_id).delete()
    db.delete(user)
    db.commit()
    logger.info("User rejected/deleted: %s by admin %s", email, current_user.email)

    delete_user_from_mopilot(email)

    return MessageResponse(message=f"{email} wurde gelöscht.")


@router.post("/{user_id}/suspend", response_model=MessageResponse)
def suspend_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Suspend a user (revoke approval). User can no longer log in."""
    _require_admin(current_user)
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Benutzer nicht gefunden.")
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Sie können sich nicht selbst sperren.")

    user.approved = False
    db.commit()
    logger.info("User suspended: %s by admin %s", user.email, current_user.email)

    delete_user_from_mopilot(user.email)

    return MessageResponse(message=f"{user.name} wurde gesperrt.")


@router.patch("/{user_id}/role", response_model=MessageResponse)
def change_role(
    user_id: int,
    data: AdminRoleChangeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Change a user's role and sync to mopilot DB."""
    _require_admin(current_user)
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Benutzer nicht gefunden.")

    role = db.query(Role).filter(Role.id == data.role_id).first()
    if not role:
        raise HTTPException(status_code=400, detail="Ungültige Rolle.")

    old_role_name = user.role.name if user.role else "keine"
    user.role_id = data.role_id
    db.commit()
    db.refresh(user)
    logger.info("Role changed for %s: %s -> %s by admin %s", user.email, old_role_name, role.name, current_user.email)

    if user.approved:
        sync_user_to_mopilot(
            user.email, user.name, user.password_hash, role.slug,
        )

    return MessageResponse(message=f"Rolle von {user.name} auf {role.name} geändert.")


@router.post("/{user_id}/reset-password", response_model=MessageResponse)
def admin_reset_password(
    user_id: int,
    data: AdminPasswordResetRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Admin sets a new password for a user."""
    _require_admin(current_user)
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Benutzer nicht gefunden.")

    user.password_hash = hash_password(data.new_password)
    db.commit()
    logger.info("Password reset for %s by admin %s", user.email, current_user.email)

    if user.approved:
        role = db.query(Role).filter(Role.id == user.role_id).first() if user.role_id else None
        sync_user_to_mopilot(
            user.email, user.name, user.password_hash,
            role.slug if role else None,
        )

    return MessageResponse(message=f"Passwort für {user.name} wurde zurückgesetzt.")


@router.delete("/{user_id}", status_code=204)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a user (admin only)."""
    _require_admin(current_user)
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Sie können sich nicht selbst löschen.")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Benutzer nicht gefunden.")

    email = user.email
    db.query(Comment).filter(Comment.user_id == user_id).delete()
    db.query(Rating).filter(Rating.user_id == user_id).delete()
    db.query(Idea).filter(Idea.author_id == user_id).delete()
    db.delete(user)
    db.commit()
    logger.info("User deleted: #%d (%s) by admin #%d", user_id, email, current_user.id)

    delete_user_from_mopilot(email)
