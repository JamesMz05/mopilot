"""Pydantic schemas for request/response validation."""

from datetime import datetime

from pydantic import BaseModel, EmailStr, Field

from .models import IdeaStatus, RoleCategory, UserType


# --- Role ---
class RoleOut(BaseModel):
    id: int
    name: str
    slug: str
    category: RoleCategory
    description: str | None = None
    email_alias: str | None = None
    tagline: str | None = None

    model_config = {"from_attributes": True}


class RoleWithCount(RoleOut):
    idea_count: int = 0


# --- User ---
class UserCreate(BaseModel):
    email: EmailStr
    name: str = Field(..., min_length=1, max_length=255)
    password: str = Field(..., min_length=6)
    role_id: int | None = None
    user_type: UserType = UserType.stakeholder


class UserOut(BaseModel):
    id: int
    email: str
    name: str
    role_id: int | None = None
    role_name: str | None = None
    user_type: UserType
    email_verified: bool = False
    approved: bool = False
    created_at: datetime

    model_config = {"from_attributes": True}


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# --- Idea ---
class IdeaCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    description: str = Field(..., min_length=1)
    role_id: int


class IdeaUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    status: IdeaStatus | None = None


class IdeaOut(BaseModel):
    id: int
    title: str
    description: str
    author_id: int
    role_id: int
    status: IdeaStatus
    created_at: datetime
    updated_at: datetime | None = None
    author_name: str | None = None
    avg_rating: float | None = None
    comment_count: int = 0

    model_config = {"from_attributes": True}


# --- Rating ---
class RatingCreate(BaseModel):
    score: int = Field(..., ge=1, le=5)


class RatingOut(BaseModel):
    id: int
    idea_id: int
    user_id: int
    score: int
    created_at: datetime

    model_config = {"from_attributes": True}


# --- Comment ---
class CommentCreate(BaseModel):
    text: str = Field(..., min_length=1)


class CommentOut(BaseModel):
    id: int
    idea_id: int
    user_id: int
    user_name: str | None = None
    text: str
    created_at: datetime

    model_config = {"from_attributes": True}


# --- Attachment ---
class AttachmentOut(BaseModel):
    id: int
    idea_id: int
    filename: str
    original_filename: str
    content_type: str
    size: int
    created_at: datetime

    model_config = {"from_attributes": True}


# --- Tag ---
class TagOut(BaseModel):
    id: int
    name: str
    slug: str

    model_config = {"from_attributes": True}


class TagCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)


# --- Auth: Email Verification & Password Reset ---
class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=6)


class ResendVerificationRequest(BaseModel):
    email: EmailStr


class MessageResponse(BaseModel):
    message: str


class AdminApproveRequest(BaseModel):
    """Used for approve/reject actions."""
    pass


class AdminRoleChangeRequest(BaseModel):
    role_id: int


class AdminPasswordResetRequest(BaseModel):
    new_password: str = Field(..., min_length=6)


# --- Health ---
class HealthResponse(BaseModel):
    status: str = "ok"
