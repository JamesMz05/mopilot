"""Ideas router: CRUD with role-based access control."""

import logging

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..auth import get_accessible_role_ids, get_current_user
from ..database import get_db
from ..models import Comment, Idea, Rating, Role, User, UserType
from ..schemas import IdeaCreate, IdeaOut, IdeaUpdate

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/ideas", tags=["ideas"])


def _check_role_access(user: User, role_id: int, db: Session) -> Role:
    """Verify user has access to the given role (category hierarchy)."""
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Rolle nicht gefunden.")

    accessible = get_accessible_role_ids(user, db)
    if accessible is not None and role_id not in accessible:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sie haben keinen Zugriff auf diese Rolle.",
        )
    return role


def _idea_to_out(idea: Idea, db: Session) -> dict:
    """Convert an Idea model to response dict with aggregates."""
    avg = db.query(func.avg(Rating.score)).filter(Rating.idea_id == idea.id).scalar()
    count = db.query(func.count(Comment.id)).filter(Comment.idea_id == idea.id).scalar()
    return {
        "id": idea.id,
        "title": idea.title,
        "description": idea.description,
        "author_id": idea.author_id,
        "role_id": idea.role_id,
        "status": idea.status,
        "created_at": idea.created_at,
        "updated_at": idea.updated_at,
        "author_name": idea.author.name if idea.author else None,
        "avg_rating": round(float(avg), 2) if avg else None,
        "comment_count": count or 0,
    }


@router.get("", response_model=list[IdeaOut])
def list_ideas(
    role: str | None = Query(None, description="Role slug to filter by"),
    status_filter: str | None = Query(None, alias="status", description="Status filter"),
    sort: str = Query("newest", description="Sort: newest, best_rating, most_comments"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List ideas, optionally filtered by role slug."""
    query = db.query(Idea)

    # Stakeholders see ideas from their accessible categories
    accessible = get_accessible_role_ids(current_user, db)
    if accessible is not None:
        query = query.filter(Idea.role_id.in_(accessible))
    if role:
        role_obj = db.query(Role).filter(Role.slug == role).first()
        if not role_obj:
            raise HTTPException(status_code=404, detail="Rolle nicht gefunden.")
        query = query.filter(Idea.role_id == role_obj.id)

    if status_filter:
        query = query.filter(Idea.status == status_filter)

    # Sorting
    if sort == "best_rating":
        avg_sub = (
            db.query(Rating.idea_id, func.avg(Rating.score).label("avg_score"))
            .group_by(Rating.idea_id)
            .subquery()
        )
        query = query.outerjoin(avg_sub, Idea.id == avg_sub.c.idea_id).order_by(
            avg_sub.c.avg_score.desc().nullslast()
        )
    elif sort == "most_comments":
        count_sub = (
            db.query(Comment.idea_id, func.count(Comment.id).label("cnt"))
            .group_by(Comment.idea_id)
            .subquery()
        )
        query = query.outerjoin(count_sub, Idea.id == count_sub.c.idea_id).order_by(
            count_sub.c.cnt.desc().nullslast()
        )
    else:
        query = query.order_by(Idea.created_at.desc())

    ideas = query.all()
    return [_idea_to_out(idea, db) for idea in ideas]


@router.get("/{idea_id}", response_model=IdeaOut)
def get_idea(
    idea_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a single idea with aggregates."""
    idea = db.query(Idea).filter(Idea.id == idea_id).first()
    if not idea:
        raise HTTPException(status_code=404, detail="Idee nicht gefunden.")

    accessible = get_accessible_role_ids(current_user, db)
    if accessible is not None and idea.role_id not in accessible:
        raise HTTPException(status_code=403, detail="Kein Zugriff auf diese Idee.")

    return _idea_to_out(idea, db)


@router.post("", response_model=IdeaOut, status_code=201)
def create_idea(
    data: IdeaCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new idea."""
    _check_role_access(current_user, data.role_id, db)

    idea = Idea(
        title=data.title,
        description=data.description,
        author_id=current_user.id,
        role_id=data.role_id,
    )
    db.add(idea)
    db.commit()
    db.refresh(idea)

    logger.info("Idea created: #%d by user #%d", idea.id, current_user.id)
    return _idea_to_out(idea, db)


@router.put("/{idea_id}", response_model=IdeaOut)
def update_idea(
    idea_id: int,
    data: IdeaUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update an idea (author or admin only)."""
    idea = db.query(Idea).filter(Idea.id == idea_id).first()
    if not idea:
        raise HTTPException(status_code=404, detail="Idee nicht gefunden.")

    if current_user.user_type != UserType.admin and idea.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Keine Berechtigung zum Bearbeiten.")

    if data.title is not None:
        idea.title = data.title
    if data.description is not None:
        idea.description = data.description
    if data.status is not None:
        if current_user.user_type != UserType.admin:
            raise HTTPException(status_code=403, detail="Nur Admins können den Status ändern.")
        idea.status = data.status

    db.commit()
    db.refresh(idea)

    logger.info("Idea updated: #%d by user #%d", idea.id, current_user.id)
    return _idea_to_out(idea, db)


@router.delete("/{idea_id}", status_code=204)
def delete_idea(
    idea_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete an idea (admin only)."""
    if current_user.user_type != UserType.admin:
        raise HTTPException(status_code=403, detail="Nur Admins können Ideen löschen.")

    idea = db.query(Idea).filter(Idea.id == idea_id).first()
    if not idea:
        raise HTTPException(status_code=404, detail="Idee nicht gefunden.")

    db.delete(idea)
    db.commit()
    logger.info("Idea deleted: #%d by admin #%d", idea_id, current_user.id)
