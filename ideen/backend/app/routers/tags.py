"""Tags router: create, list, assign tags to ideas."""

import logging
import re

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..database import get_db
from ..models import Idea, IdeaTag, Tag, User, UserType
from ..schemas import TagCreate, TagOut

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["tags"])


def _slugify(name: str) -> str:
    """Convert a tag name to a URL-safe slug."""
    slug = name.lower().strip()
    slug = re.sub(r"[äÄ]", "ae", slug)
    slug = re.sub(r"[öÖ]", "oe", slug)
    slug = re.sub(r"[üÜ]", "ue", slug)
    slug = re.sub(r"[ß]", "ss", slug)
    slug = re.sub(r"[^a-z0-9]+", "-", slug)
    return slug.strip("-")


@router.get("/tags", response_model=list[TagOut])
def list_tags(db: Session = Depends(get_db)):
    """List all tags."""
    tags = db.query(Tag).order_by(Tag.name).all()
    return [TagOut.model_validate(t) for t in tags]


@router.post("/tags", response_model=TagOut, status_code=201)
def create_tag(
    data: TagCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new tag (team or admin only)."""
    if current_user.user_type == UserType.stakeholder:
        raise HTTPException(status_code=403, detail="Keine Berechtigung zum Erstellen von Tags.")

    slug = _slugify(data.name)
    existing = db.query(Tag).filter(Tag.slug == slug).first()
    if existing:
        return TagOut.model_validate(existing)

    tag = Tag(name=data.name, slug=slug)
    db.add(tag)
    db.commit()
    db.refresh(tag)
    logger.info("Tag created: %s", tag.name)
    return TagOut.model_validate(tag)


@router.delete("/tags/{tag_id}", status_code=204)
def delete_tag(
    tag_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a tag (admin only)."""
    if current_user.user_type != UserType.admin:
        raise HTTPException(status_code=403, detail="Nur Admins können Tags löschen.")

    tag = db.query(Tag).filter(Tag.id == tag_id).first()
    if not tag:
        raise HTTPException(status_code=404, detail="Tag nicht gefunden.")

    db.query(IdeaTag).filter(IdeaTag.tag_id == tag_id).delete()
    db.delete(tag)
    db.commit()
    logger.info("Tag deleted: #%d", tag_id)


@router.post("/ideas/{idea_id}/tags/{tag_id}", status_code=201)
def add_tag_to_idea(
    idea_id: int,
    tag_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Assign a tag to an idea."""
    idea = db.query(Idea).filter(Idea.id == idea_id).first()
    if not idea:
        raise HTTPException(status_code=404, detail="Idee nicht gefunden.")

    tag = db.query(Tag).filter(Tag.id == tag_id).first()
    if not tag:
        raise HTTPException(status_code=404, detail="Tag nicht gefunden.")

    existing = db.query(IdeaTag).filter(
        IdeaTag.idea_id == idea_id, IdeaTag.tag_id == tag_id
    ).first()
    if existing:
        return {"message": "Tag bereits zugewiesen."}

    db.add(IdeaTag(idea_id=idea_id, tag_id=tag_id))
    db.commit()
    return {"message": "Tag zugewiesen."}


@router.delete("/ideas/{idea_id}/tags/{tag_id}", status_code=204)
def remove_tag_from_idea(
    idea_id: int,
    tag_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Remove a tag from an idea."""
    link = db.query(IdeaTag).filter(
        IdeaTag.idea_id == idea_id, IdeaTag.tag_id == tag_id
    ).first()
    if not link:
        raise HTTPException(status_code=404, detail="Tag-Zuweisung nicht gefunden.")

    db.delete(link)
    db.commit()


@router.get("/ideas/{idea_id}/tags", response_model=list[TagOut])
def get_idea_tags(
    idea_id: int,
    db: Session = Depends(get_db),
):
    """Get all tags for an idea."""
    tags = (
        db.query(Tag)
        .join(IdeaTag, IdeaTag.tag_id == Tag.id)
        .filter(IdeaTag.idea_id == idea_id)
        .order_by(Tag.name)
        .all()
    )
    return [TagOut.model_validate(t) for t in tags]
