"""Quiz database models."""
import uuid
from sqlalchemy import Column, String, Boolean, Integer, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from app.core.database import Base


class QuizDefinition(Base):
    __tablename__ = "quiz_definitions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    slug = Column(String(100), unique=True, nullable=False)
    title = Column(String(200), nullable=False)
    operator = Column(String(20), nullable=False)  # 'CC' | 'ZEO'
    voucher_code = Column(String(50), nullable=False)
    voucher_label = Column(String(200), nullable=False)
    registration_url = Column(String(500), nullable=False)
    notification_email = Column(String(200), nullable=False)
    questions_json = Column(JSONB, nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())


class QuizSession(Base):
    __tablename__ = "quiz_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True)  # explicitly set = cookie value
    quiz_id = Column(UUID(as_uuid=True), ForeignKey("quiz_definitions.id", ondelete="CASCADE"), nullable=False)
    started_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    completed_at = Column(DateTime(timezone=True))
    abandoned_at = Column(DateTime(timezone=True))
    correct_count = Column(Integer, nullable=False, default=0)
    total_count = Column(Integer, nullable=False, default=0)
    referrer = Column(String(255))
    user_agent_class = Column(String(20))  # 'mobile' | 'desktop' | 'tablet'
    notification_sent = Column(Boolean, nullable=False, default=False)


class QuizEvent(Base):
    __tablename__ = "quiz_events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(UUID(as_uuid=True), ForeignKey("quiz_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    question_index = Column(Integer)
    selected_index = Column(Integer)
    is_correct = Column(Boolean)
    event_type = Column(String(20), nullable=False)  # 'start' | 'answer' | 'next' | 'finish' | 'abandon'
    timestamp = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
