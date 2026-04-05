"""Admin API: User management (admin-only)."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from app.core.database import get_db
from app.core.auth import require_admin
from app.models.models import User, UserRole

router = APIRouter()


class ChangeRoleRequest(BaseModel):
    role: str


@router.get("/users")
async def list_all_users(
    admin: dict = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """List all users. Admin only."""
    result = await db.execute(select(User).order_by(User.id))
    users = result.scalars().all()
    return {
        "users": [
            {
                "id": u.id,
                "email": u.email,
                "name": u.name,
                "role": u.role.value,
                "operator": u.operator,
                "is_active": u.is_active,
                "created_at": u.created_at.isoformat() if u.created_at else None,
            }
            for u in users
        ]
    }


@router.get("/roles")
async def list_all_roles(admin: dict = Depends(require_admin)):
    """List all available roles. Admin only."""
    return {
        "roles": [{"value": r.value, "name": r.name} for r in UserRole]
    }


@router.put("/users/{user_id}/role")
async def change_user_role(
    user_id: int,
    req: ChangeRoleRequest,
    admin: dict = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Change a user's role. Admin only."""
    try:
        new_role = UserRole(req.role)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ungültige Rolle: {req.role}",
        )

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Benutzer nicht gefunden.",
        )

    user.role = new_role
    await db.commit()

    return {"success": True, "user_id": user.id, "new_role": new_role.value}
