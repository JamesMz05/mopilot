"""Comments router: create, list, delete comments on ideas."""

import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..auth import get_accessible_role_ids, get_current_user
from ..database import get_db
from ..models import Comment, Idea, User, UserType
from ..schemas import CommentCreate, CommentOut

logger = logging.getLogger(__name__)

router = APIRouter(tags=["comments"])


@router.post("/api/ideas/{idea_id}/comments", response_model=CommentOut, status_code=201)
def create_comment(
    idea_id: int,
    data: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a comment on an idea."""
    idea = db.query(Idea).filter(Idea.id == idea_id).first()
    if not idea:
        raise HTTPException(status_code=404, detail="Idee nicht gefunden.")

    accessible = get_accessible_role_ids(current_user, db)
    if accessible is not None and idea.role_id not in accessible:
        raise HTTPException(status_code=403, detail="Kein Zugriff auf diese Idee.")

    comment = Comment(
        idea_id=idea_id,
        user_id=current_user.id,
        text=data.text,
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)

    logger.info("Comment created: #%d on idea #%d by user #%d", comment.id, idea_id, current_user.id)

    # Notify idea author (async-safe, non-blocking)
    if idea.author_id != current_user.id:
        author = db.query(User).filter(User.id == idea.author_id).first()
        if author:
            from ..email import notify_new_comment
            try:
                notify_new_comment(
                    author_email=author.email,
                    author_name=author.name,
                    idea_title=idea.title,
                    idea_id=idea.id,
                    commenter_name=current_user.name,
                    comment_text=data.text,
                )
            except Exception as e:
                logger.warning("Email notification failed: %s", str(e))

    return CommentOut(
        id=comment.id,
        idea_id=comment.idea_id,
        user_id=comment.user_id,
        user_name=current_user.name,
        text=comment.text,
        created_at=comment.created_at,
    )


@router.get("/api/ideas/{idea_id}/comments", response_model=list[CommentOut])
def list_comments(
    idea_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all comments for an idea."""
    idea = db.query(Idea).filter(Idea.id == idea_id).first()
    if not idea:
        raise HTTPException(status_code=404, detail="Idee nicht gefunden.")

    accessible = get_accessible_role_ids(current_user, db)
    if accessible is not None and idea.role_id not in accessible:
        raise HTTPException(status_code=403, detail="Kein Zugriff auf diese Idee.")

    comments = (
        db.query(Comment)
        .filter(Comment.idea_id == idea_id)
        .order_by(Comment.created_at.asc())
        .all()
    )

    result = []
    for c in comments:
        user = db.query(User).filter(User.id == c.user_id).first()
        result.append(CommentOut(
            id=c.id,
            idea_id=c.idea_id,
            user_id=c.user_id,
            user_name=user.name if user else None,
            text=c.text,
            created_at=c.created_at,
        ))
    return result


@router.delete("/api/comments/{comment_id}", status_code=204)
def delete_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a comment (author or admin only)."""
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Kommentar nicht gefunden.")

    if current_user.user_type != UserType.admin and comment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Keine Berechtigung zum Löschen.")

    db.delete(comment)
    db.commit()
    logger.info("Comment deleted: #%d by user #%d", comment_id, current_user.id)
