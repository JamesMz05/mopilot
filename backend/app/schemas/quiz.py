"""Pydantic schemas for Quiz API."""
from typing import Optional
from uuid import UUID
from pydantic import BaseModel


class QuestionPublic(BaseModel):
    category: str
    question: str
    answers: list[str]
    explanation: str
    # correct_index intentionally omitted to prevent spoiling


class QuizDefinitionPublic(BaseModel):
    slug: str
    title: str
    operator: str
    questions: list[QuestionPublic]

    model_config = {"from_attributes": True}


class QuizStartRequest(BaseModel):
    referrer: Optional[str] = None
    user_agent_class: Optional[str] = None  # 'mobile' | 'desktop' | 'tablet'


class QuizStartResponse(BaseModel):
    session_id: UUID
    quiz: QuizDefinitionPublic


class QuizAnswerRequest(BaseModel):
    question_index: int
    selected_index: int


class QuizAnswerResponse(BaseModel):
    is_correct: bool
    correct_index: int
    explanation: str
    progress: str  # e.g. "5/14"


class QuizCompleteResponse(BaseModel):
    score: int
    total: int
    voucher_code: str
    voucher_label: str
    registration_url: str


class QuizSessionState(BaseModel):
    status: str  # 'running' | 'completed' | 'expired'
    voucher_code: Optional[str] = None
    voucher_label: Optional[str] = None
    registration_url: Optional[str] = None
    score: Optional[int] = None
    total: Optional[int] = None
