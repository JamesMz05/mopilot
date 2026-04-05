"""Users router: user management (admin)."""

import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..database import get_db
from ..models import Comment, Idea, Rating, User, UserType
from ..schemas import UserOut

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("", response_model=list[UserOut])
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all users (admin only)."""
    if current_user.user_type != UserType.admin:
        raise HTTPException(status_code=403, detail="Nur Admins können Nutzer verwalten.")

    users = db.query(User).order_by(User.created_at.desc()).all()
    return [UserOut.model_validate(u) for u in users]


@router.delete("/{user_id}", status_code=204)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a user (admin only)."""
    if current_user.user_type != UserType.admin:
        raise HTTPException(status_code=403, detail="Nur Admins können Nutzer löschen.")

    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Sie können sich nicht selbst löschen.")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Benutzer nicht gefunden.")

    # Delete user's dependent data first
    db.query(Comment).filter(Comment.user_id == user_id).delete()
    db.query(Rating).filter(Rating.user_id == user_id).delete()
    db.query(Idea).filter(Idea.author_id == user_id).delete()
    db.delete(user)
    db.commit()
    logger.info("User deleted: #%d by admin #%d", user_id, current_user.id)
