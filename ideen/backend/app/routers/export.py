"""Export router: CSV export and statistics."""

import csv
import io
import logging

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..database import get_db
from ..models import Comment, Idea, Rating, Role, User, UserType

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/export", tags=["export"])


@router.get("/ideas")
def export_ideas_csv(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Export all ideas as CSV (admin only)."""
    if current_user.user_type != UserType.admin:
        raise HTTPException(status_code=403, detail="Nur Admins können exportieren.")

    ideas = db.query(Idea).order_by(Idea.created_at.desc()).all()

    output = io.StringIO()
    writer = csv.writer(output, delimiter=";")
    writer.writerow([
        "ID", "Titel", "Beschreibung", "Status", "Autor", "Autor-Email",
        "Rolle", "Kategorie", "Durchschnittsbewertung", "Anzahl Bewertungen",
        "Anzahl Kommentare", "Erstellt am", "Aktualisiert am",
    ])

    for idea in ideas:
        author = db.query(User).filter(User.id == idea.author_id).first()
        role = db.query(Role).filter(Role.id == idea.role_id).first()
        avg_rating = db.query(func.avg(Rating.score)).filter(Rating.idea_id == idea.id).scalar()
        rating_count = db.query(func.count(Rating.id)).filter(Rating.idea_id == idea.id).scalar()
        comment_count = db.query(func.count(Comment.id)).filter(Comment.idea_id == idea.id).scalar()

        writer.writerow([
            idea.id,
            idea.title,
            idea.description,
            idea.status.value,
            author.name if author else "",
            author.email if author else "",
            role.name if role else "",
            role.category.value if role else "",
            f"{float(avg_rating):.1f}" if avg_rating else "",
            rating_count or 0,
            comment_count or 0,
            idea.created_at.strftime("%d.%m.%Y %H:%M") if idea.created_at else "",
            idea.updated_at.strftime("%d.%m.%Y %H:%M") if idea.updated_at else "",
        ])

    output.seek(0)
    logger.info("CSV export by admin #%d: %d ideas", current_user.id, len(ideas))

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": "attachment; filename=ideen_export.csv"},
    )


@router.get("/stats")
def get_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get platform statistics (admin only)."""
    if current_user.user_type != UserType.admin:
        raise HTTPException(status_code=403, detail="Nur Admins können Statistiken abrufen.")

    total_ideas = db.query(func.count(Idea.id)).scalar() or 0
    total_users = db.query(func.count(User.id)).scalar() or 0
    total_comments = db.query(func.count(Comment.id)).scalar() or 0
    total_ratings = db.query(func.count(Rating.id)).scalar() or 0

    # Top 5 ideas by rating
    top_rated = (
        db.query(
            Idea.id,
            Idea.title,
            Role.name.label("role_name"),
            func.avg(Rating.score).label("avg_score"),
            func.count(Rating.id).label("rating_count"),
        )
        .join(Role, Idea.role_id == Role.id)
        .outerjoin(Rating, Rating.idea_id == Idea.id)
        .group_by(Idea.id, Idea.title, Role.name)
        .having(func.count(Rating.id) > 0)
        .order_by(func.avg(Rating.score).desc())
        .limit(5)
        .all()
    )

    # Ideas per role
    ideas_per_role = (
        db.query(Role.name, Role.slug, func.count(Idea.id).label("count"))
        .outerjoin(Idea, Idea.role_id == Role.id)
        .group_by(Role.id, Role.name, Role.slug)
        .order_by(func.count(Idea.id).desc())
        .all()
    )

    # Ideas per status
    ideas_per_status = (
        db.query(Idea.status, func.count(Idea.id).label("count"))
        .group_by(Idea.status)
        .all()
    )

    # Recent activity (last 7 days)
    from datetime import datetime, timedelta, timezone

    week_ago = datetime.now(timezone.utc) - timedelta(days=7)
    recent_ideas = db.query(func.count(Idea.id)).filter(Idea.created_at >= week_ago).scalar() or 0
    recent_comments = db.query(func.count(Comment.id)).filter(Comment.created_at >= week_ago).scalar() or 0

    return {
        "totals": {
            "ideas": total_ideas,
            "users": total_users,
            "comments": total_comments,
            "ratings": total_ratings,
        },
        "top_rated": [
            {
                "id": r.id,
                "title": r.title,
                "role": r.role_name,
                "avg_rating": round(float(r.avg_score), 2),
                "rating_count": r.rating_count,
            }
            for r in top_rated
        ],
        "ideas_per_role": [
            {"role": r.name, "slug": r.slug, "count": r.count}
            for r in ideas_per_role
        ],
        "ideas_per_status": [
            {"status": s.status.value, "count": s.count}
            for s in ideas_per_status
        ],
        "recent_activity": {
            "ideas_7d": recent_ideas,
            "comments_7d": recent_comments,
        },
    }
