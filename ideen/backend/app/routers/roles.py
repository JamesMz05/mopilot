"""Roles router: list and detail endpoints."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Idea, Role
from ..schemas import RoleOut, RoleWithCount

router = APIRouter(prefix="/api/roles", tags=["roles"])


@router.get("", response_model=dict[str, list[RoleWithCount]])
def list_roles(db: Session = Depends(get_db)):
    """List all roles grouped by category with idea counts."""
    roles = db.query(Role).order_by(Role.category, Role.name).all()

    grouped: dict[str, list[RoleWithCount]] = {}
    for role in roles:
        idea_count = db.query(func.count(Idea.id)).filter(Idea.role_id == role.id).scalar() or 0
        cat = role.category.value
        if cat not in grouped:
            grouped[cat] = []
        grouped[cat].append(RoleWithCount(
            id=role.id,
            name=role.name,
            slug=role.slug,
            category=role.category,
            description=role.description,
            email_alias=role.email_alias,
            tagline=role.tagline,
            idea_count=idea_count,
        ))
    return grouped


@router.get("/{slug}")
def get_role(slug: str, db: Session = Depends(get_db)):
    """Get role details with idea count."""
    role = db.query(Role).filter(Role.slug == slug).first()
    if not role:
        raise HTTPException(status_code=404, detail="Rolle nicht gefunden.")

    idea_count = db.query(func.count(Idea.id)).filter(Idea.role_id == role.id).scalar() or 0
    return RoleWithCount(
        id=role.id,
        name=role.name,
        slug=role.slug,
        category=role.category,
        description=role.description,
        email_alias=role.email_alias,
        tagline=role.tagline,
        idea_count=idea_count,
    )
