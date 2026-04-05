"""Ratings router: rate ideas (1-5 stars)."""

import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..auth import get_accessible_role_ids, get_current_user
from ..database import get_db
from ..models import Idea, Rating, User, UserType
from ..schemas import RatingCreate, RatingOut

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/ideas", tags=["ratings"])


@router.post("/{idea_id}/rate", response_model=RatingOut)
def rate_idea(
    idea_id: int,
    data: RatingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Rate an idea (1-5). Updates existing rating if already rated."""
    idea = db.query(Idea).filter(Idea.id == idea_id).first()
    if not idea:
        raise HTTPException(status_code=404, detail="Idee nicht gefunden.")

    accessible = get_accessible_role_ids(current_user, db)
    if accessible is not None and idea.role_id not in accessible:
        raise HTTPException(status_code=403, detail="Kein Zugriff auf diese Idee.")

    existing = (
        db.query(Rating)
        .filter(Rating.idea_id == idea_id, Rating.user_id == current_user.id)
        .first()
    )

    if existing:
        existing.score = data.score
        db.commit()
        db.refresh(existing)
        logger.info("Rating updated: idea #%d, user #%d, score %d", idea_id, current_user.id, data.score)
        return RatingOut.model_validate(existing)

    rating = Rating(
        idea_id=idea_id,
        user_id=current_user.id,
        score=data.score,
    )
    db.add(rating)
    db.commit()
    db.refresh(rating)

    logger.info("Rating created: idea #%d, user #%d, score %d", idea_id, current_user.id, data.score)
    return RatingOut.model_validate(rating)


@router.get("/{idea_id}/ratings")
def get_ratings(
    idea_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get rating overview for an idea."""
    idea = db.query(Idea).filter(Idea.id == idea_id).first()
    if not idea:
        raise HTTPException(status_code=404, detail="Idee nicht gefunden.")

    accessible = get_accessible_role_ids(current_user, db)
    if accessible is not None and idea.role_id not in accessible:
        raise HTTPException(status_code=403, detail="Kein Zugriff auf diese Idee.")

    avg = db.query(func.avg(Rating.score)).filter(Rating.idea_id == idea_id).scalar()
    count = db.query(func.count(Rating.id)).filter(Rating.idea_id == idea_id).scalar()
    ratings = db.query(Rating).filter(Rating.idea_id == idea_id).all()

    return {
        "idea_id": idea_id,
        "average": round(float(avg), 2) if avg else None,
        "count": count or 0,
        "ratings": [RatingOut.model_validate(r) for r in ratings],
    }
