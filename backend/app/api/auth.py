"""Auth API: Login and user info."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from app.core.database import get_db
from app.core.auth import verify_password, create_access_token, get_current_user
from app.models.models import User

router = APIRouter()


class LoginRequest(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


class RoleListResponse(BaseModel):
    roles: list[dict]


@router.post("/login", response_model=LoginResponse)
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == req.email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="E-Mail oder Passwort falsch")

    token = create_access_token({"sub": str(user.id), "email": user.email, "role": user.role.value, "operator": user.operator, "name": user.name})
    return LoginResponse(
        access_token=token,
        user={"id": user.id, "email": user.email, "name": user.name, "role": user.role.value, "operator": user.operator},
    )


@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return current_user


@router.get("/demo-accounts", response_model=RoleListResponse)
async def get_demo_accounts(db: AsyncSession = Depends(get_db)):
    """List all demo accounts for easy role switching."""
    result = await db.execute(select(User).order_by(User.role))
    users = result.scalars().all()
    return RoleListResponse(
        roles=[{"email": u.email, "name": u.name, "role": u.role.value, "operator": u.operator} for u in users]
    )
