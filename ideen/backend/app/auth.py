"""Authentication utilities: JWT tokens and password hashing."""

import os
from datetime import datetime, timedelta, timezone

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from .database import get_db
from .models import Role, User, UserType

SECRET_KEY = os.getenv("JWT_SECRET", "mopilot-jwt-secret-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()


def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(user_id: int) -> str:
    """Create a JWT access token."""
    expire = datetime.now(timezone.utc) + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    payload = {"sub": str(user_id), "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def create_verification_token(user_id: int) -> str:
    """Create a JWT token for email verification (24h validity)."""
    expire = datetime.now(timezone.utc) + timedelta(hours=24)
    payload = {"sub": str(user_id), "purpose": "verify", "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def create_reset_token(user_id: int) -> str:
    """Create a JWT token for password reset (1h validity)."""
    expire = datetime.now(timezone.utc) + timedelta(hours=1)
    payload = {"sub": str(user_id), "purpose": "reset", "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_purpose_token(token: str, expected_purpose: str) -> int:
    """Decode a purpose-bound JWT token. Returns user_id."""
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    if payload.get("purpose") != expected_purpose:
        raise jwt.InvalidTokenError("Wrong token purpose")
    return int(payload["sub"])


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    """Extract and validate the current user from JWT token."""
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload["sub"])
    except (jwt.InvalidTokenError, KeyError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Ungültiger Token",
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Benutzer nicht gefunden",
        )
    return user


# Category hierarchy: higher categories include all lower ones
CATEGORY_HIERARCHY: dict[str, list[str]] = {
    "kundennah": ["kundennah"],
    "betrieb": ["kundennah", "betrieb"],
    "strategie": ["kundennah", "betrieb", "strategie"],
}


def get_accessible_role_ids(user: User, db: Session) -> list[int] | None:
    """Return accessible role IDs for a stakeholder, or None for team/admin (= all).

    Kundennah → sees kundennah roles only
    Betrieb   → sees kundennah + betrieb roles
    Strategie → sees all roles
    """
    if user.user_type != UserType.stakeholder:
        return None  # team/admin see everything

    role = db.query(Role).filter(Role.id == user.role_id).first()
    if not role:
        return []

    cats = CATEGORY_HIERARCHY.get(role.category.value, [role.category.value])
    rows = db.query(Role.id).filter(Role.category.in_(cats)).all()
    return [r[0] for r in rows]
