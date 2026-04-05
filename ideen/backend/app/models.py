"""SQLAlchemy models for the Ideenplattform."""

import enum
from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import relationship

from .database import Base


class UserType(str, enum.Enum):
    stakeholder = "stakeholder"
    team = "team"
    admin = "admin"


class RoleCategory(str, enum.Enum):
    kundennah = "kundennah"
    betrieb = "betrieb"
    strategie = "strategie"


class IdeaStatus(str, enum.Enum):
    neu = "neu"
    in_diskussion = "in_diskussion"
    geplant = "geplant"
    umgesetzt = "umgesetzt"
    abgelehnt = "abgelehnt"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=True)
    user_type = Column(Enum(UserType), nullable=False, default=UserType.stakeholder)
    password_hash = Column(String(255), nullable=False)
    email_verified = Column(Boolean, default=False, server_default="false", nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    role = relationship("Role", back_populates="users", lazy="joined")
    ideas = relationship("Idea", back_populates="author")
    ratings = relationship("Rating", back_populates="user")
    comments = relationship("Comment", back_populates="user")

    @property
    def role_name(self) -> str | None:
        return self.role.name if self.role else None


class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    category = Column(Enum(RoleCategory), nullable=False)
    description = Column(Text, nullable=True)
    email_alias = Column(String(255), nullable=True)
    tagline = Column(String(200), nullable=True)

    users = relationship("User", back_populates="role")
    ideas = relationship("Idea", back_populates="role")


class Idea(Base):
    __tablename__ = "ideas"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=False)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    status = Column(Enum(IdeaStatus), nullable=False, default=IdeaStatus.neu)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    author = relationship("User", back_populates="ideas")
    role = relationship("Role", back_populates="ideas")
    ratings = relationship("Rating", back_populates="idea", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="idea", cascade="all, delete-orphan")
    attachments = relationship("Attachment", back_populates="idea", cascade="all, delete-orphan")


class Rating(Base):
    __tablename__ = "ratings"
    __table_args__ = (UniqueConstraint("idea_id", "user_id", name="uq_rating_idea_user"),)

    id = Column(Integer, primary_key=True, index=True)
    idea_id = Column(Integer, ForeignKey("ideas.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    score = Column(Integer, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    idea = relationship("Idea", back_populates="ratings")
    user = relationship("User", back_populates="ratings")


class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    idea_id = Column(Integer, ForeignKey("ideas.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    text = Column(Text, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    idea = relationship("Idea", back_populates="comments")
    user = relationship("User", back_populates="comments")


class Attachment(Base):
    __tablename__ = "attachments"

    id = Column(Integer, primary_key=True, index=True)
    idea_id = Column(Integer, ForeignKey("ideas.id", ondelete="CASCADE"), nullable=False)
    filename = Column(String(500), nullable=False)
    original_filename = Column(String(500), nullable=False)
    content_type = Column(String(100), nullable=False)
    size = Column(Integer, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    idea = relationship("Idea", back_populates="attachments")


class Tag(Base):
    __tablename__ = "tags"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    slug = Column(String(100), unique=True, nullable=False, index=True)


class IdeaTag(Base):
    __tablename__ = "idea_tags"
    __table_args__ = (UniqueConstraint("idea_id", "tag_id", name="uq_idea_tag"),)

    id = Column(Integer, primary_key=True, index=True)
    idea_id = Column(Integer, ForeignKey("ideas.id", ondelete="CASCADE"), nullable=False)
    tag_id = Column(Integer, ForeignKey("tags.id", ondelete="CASCADE"), nullable=False)
