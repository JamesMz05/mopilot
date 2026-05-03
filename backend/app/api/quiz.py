"""Quiz API endpoints."""

import uuid
import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models.quiz import QuizDefinition, QuizSession, QuizEvent
from app.schemas.quiz import (
    QuestionPublic,
    QuizDefinitionPublic,
    QuizStartRequest,
    QuizStartResponse,
    QuizAnswerRequest,
    QuizAnswerResponse,
    QuizCompleteResponse,
    QuizSessionState,
)
from app.services.quiz_mail import send_quiz_completion_email

logger = logging.getLogger(__name__)

router = APIRouter()


def _strip_correct_index(questions_json: list[dict]) -> list[QuestionPublic]:
    """Return questions without correct_index to prevent spoiling."""
    return [
        QuestionPublic(
            category=q["category"],
            question=q["question"],
            answers=q["answers"],
            explanation=q["explanation"],
        )
        for q in questions_json
    ]


async def _get_quiz_by_slug(slug: str, db: AsyncSession) -> QuizDefinition:
    result = await db.execute(
        select(QuizDefinition).where(QuizDefinition.slug == slug, QuizDefinition.is_active == True)
    )
    quiz = result.scalar_one_or_none()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz nicht gefunden")
    return quiz


@router.get("/{slug}")
async def get_quiz(slug: str, db: AsyncSession = Depends(get_db)):
    """Get quiz definition without correct answers."""
    quiz = await _get_quiz_by_slug(slug, db)
    return QuizDefinitionPublic(
        slug=quiz.slug,
        title=quiz.title,
        operator=quiz.operator,
        questions=_strip_correct_index(quiz.questions_json),
    )


@router.post("/{slug}/start")
async def start_quiz(
    slug: str,
    body: QuizStartRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    """Start a new quiz session. Sets a cookie with the session UUID."""
    quiz = await _get_quiz_by_slug(slug, db)

    session_id = uuid.uuid4()
    session = QuizSession(
        id=session_id,
        quiz_id=quiz.id,
        referrer=body.referrer,
        user_agent_class=body.user_agent_class,
    )
    db.add(session)
    await db.flush()

    # Start event
    db.add(QuizEvent(session_id=session_id, event_type="start"))
    await db.commit()

    # Set cookie
    response.set_cookie(
        key="mopilot_quiz_session",
        value=str(session_id),
        max_age=30 * 24 * 3600,  # 30 days
        domain=".mopilot.website",
        samesite="lax",
        secure=True,
        httponly=False,
    )

    return QuizStartResponse(
        session_id=session_id,
        quiz=QuizDefinitionPublic(
            slug=quiz.slug,
            title=quiz.title,
            operator=quiz.operator,
            questions=_strip_correct_index(quiz.questions_json),
        ),
    )


@router.post("/sessions/{session_id}/answer")
async def answer_question(
    session_id: uuid.UUID,
    body: QuizAnswerRequest,
    db: AsyncSession = Depends(get_db),
):
    """Submit an answer for a question. Returns correctness and explanation."""
    result = await db.execute(select(QuizSession).where(QuizSession.id == session_id))
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session nicht gefunden")
    if session.completed_at:
        raise HTTPException(status_code=400, detail="Quiz bereits abgeschlossen")

    # Get quiz definition for correct answer
    result = await db.execute(select(QuizDefinition).where(QuizDefinition.id == session.quiz_id))
    quiz = result.scalar_one_or_none()
    questions = quiz.questions_json

    if body.question_index < 0 or body.question_index >= len(questions):
        raise HTTPException(status_code=400, detail="Ungültiger Frage-Index")

    question = questions[body.question_index]
    is_correct = body.selected_index == question["correct_index"]

    # Save event
    db.add(QuizEvent(
        session_id=session_id,
        question_index=body.question_index,
        selected_index=body.selected_index,
        is_correct=is_correct,
        event_type="answer",
    ))

    # Update session counters
    session.total_count += 1
    if is_correct:
        session.correct_count += 1

    await db.commit()

    return QuizAnswerResponse(
        is_correct=is_correct,
        correct_index=question["correct_index"],
        explanation=question["explanation"],
        progress=f"{session.total_count}/{len(questions)}",
    )


@router.post("/sessions/{session_id}/complete")
async def complete_quiz(
    session_id: uuid.UUID,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    """Complete a quiz session. Returns voucher code and triggers notification email."""
    result = await db.execute(select(QuizSession).where(QuizSession.id == session_id))
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session nicht gefunden")
    if session.completed_at:
        raise HTTPException(status_code=400, detail="Quiz bereits abgeschlossen")

    now = datetime.now(timezone.utc)
    session.completed_at = now

    # Finish event
    db.add(QuizEvent(session_id=session_id, event_type="finish"))

    # Get quiz definition
    result = await db.execute(select(QuizDefinition).where(QuizDefinition.id == session.quiz_id))
    quiz = result.scalar_one_or_none()

    await db.commit()

    # Send notification email in background
    duration = int((now - session.started_at).total_seconds())
    background_tasks.add_task(
        _send_notification_and_update,
        session_id=str(session_id),
        notification_email=quiz.notification_email,
        started_at=session.started_at.strftime("%d.%m.%Y %H:%M:%S"),
        completed_at=now.strftime("%d.%m.%Y %H:%M:%S"),
        duration_seconds=duration,
        score=session.correct_count,
        total=len(quiz.questions_json),
        device_class=session.user_agent_class or "",
        referrer=session.referrer or "",
        voucher_code=quiz.voucher_code,
    )

    return QuizCompleteResponse(
        score=session.correct_count,
        total=len(quiz.questions_json),
        voucher_code=quiz.voucher_code,
        voucher_label=quiz.voucher_label,
        registration_url=quiz.registration_url,
    )


async def _send_notification_and_update(**kwargs):
    """Send email and update notification_sent flag."""
    from app.core.database import async_session

    session_id = kwargs.pop("session_id")
    notification_email = kwargs.pop("notification_email")

    success = send_quiz_completion_email(
        to=notification_email,
        session_id=session_id,
        **kwargs,
    )

    async with async_session() as db:
        result = await db.execute(
            select(QuizSession).where(QuizSession.id == uuid.UUID(session_id))
        )
        session = result.scalar_one_or_none()
        if session:
            session.notification_sent = success
            await db.commit()


@router.post("/sessions/{session_id}/abandon")
async def abandon_quiz(
    session_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """Mark a quiz session as abandoned (called via sendBeacon)."""
    result = await db.execute(select(QuizSession).where(QuizSession.id == session_id))
    session = result.scalar_one_or_none()
    if not session:
        return {"ok": True}  # Beacon endpoint - don't error
    if session.completed_at or session.abandoned_at:
        return {"ok": True}

    session.abandoned_at = datetime.now(timezone.utc)
    db.add(QuizEvent(session_id=session_id, event_type="abandon"))
    await db.commit()
    return {"ok": True}


@router.get("/sessions/{session_id}/state")
async def get_session_state(
    session_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """Get session state for cookie-lock logic."""
    result = await db.execute(select(QuizSession).where(QuizSession.id == session_id))
    session = result.scalar_one_or_none()
    if not session:
        return QuizSessionState(status="expired")

    if session.completed_at:
        # Get quiz for voucher info
        result = await db.execute(select(QuizDefinition).where(QuizDefinition.id == session.quiz_id))
        quiz = result.scalar_one_or_none()
        return QuizSessionState(
            status="completed",
            voucher_code=quiz.voucher_code if quiz else None,
            voucher_label=quiz.voucher_label if quiz else None,
            registration_url=quiz.registration_url if quiz else None,
            score=session.correct_count,
            total=len(quiz.questions_json) if quiz else session.total_count,
        )

    return QuizSessionState(status="running")
