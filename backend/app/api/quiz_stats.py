"""Quiz statistics API endpoints for the admin dashboard."""

import csv
import io
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy import select, func, case, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.quiz import QuizDefinition, QuizSession, QuizEvent

router = APIRouter()

ALLOWED_ROLES = [
    "plattform_support", "plattform-support",
    "projekttraeger", "fahrzeugsteller", "validierungsstelle",
    "mopilot_team", "admin",
]


async def require_stats_access(user: dict = Depends(get_current_user)):
    role = user.get("role", "")
    email = user.get("sub", "")
    if role not in ALLOWED_ROLES and email != "admin@mopilot.website":
        raise HTTPException(status_code=403, detail="Zugriff verweigert")
    return user


def _parse_date(date_str: Optional[str]) -> Optional[datetime]:
    if not date_str:
        return None
    try:
        return datetime.fromisoformat(date_str).replace(tzinfo=timezone.utc)
    except ValueError:
        return None


@router.get("/overview")
async def stats_overview(
    from_date: Optional[str] = Query(None, alias="from"),
    to_date: Optional[str] = Query(None, alias="to"),
    slug: str = "cc-mobilitaets-check",
    user: dict = Depends(require_stats_access),
    db: AsyncSession = Depends(get_db),
):
    """Overview KPIs for the quiz dashboard."""
    # Get quiz
    q = await db.execute(select(QuizDefinition).where(QuizDefinition.slug == slug))
    quiz = q.scalar_one_or_none()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz nicht gefunden")

    # Build date filter
    filters = [QuizSession.quiz_id == quiz.id]
    dt_from = _parse_date(from_date)
    dt_to = _parse_date(to_date)
    if dt_from:
        filters.append(QuizSession.started_at >= dt_from)
    if dt_to:
        filters.append(QuizSession.started_at <= dt_to)

    # Total sessions
    result = await db.execute(
        select(
            func.count(QuizSession.id).label("total"),
            func.count(QuizSession.completed_at).label("completed"),
            func.avg(QuizSession.correct_count).label("avg_score"),
        ).where(and_(*filters))
    )
    row = result.one()
    total = row.total or 0
    completed = row.completed or 0
    avg_score = round(float(row.avg_score or 0), 1)
    completion_rate = round(completed / total, 3) if total > 0 else 0

    # By device
    dev_result = await db.execute(
        select(
            QuizSession.user_agent_class,
            func.count(QuizSession.id),
        ).where(and_(*filters)).group_by(QuizSession.user_agent_class)
    )
    by_device = {r[0] or "unknown": r[1] for r in dev_result.all()}

    # By referrer
    ref_result = await db.execute(
        select(
            QuizSession.referrer,
            func.count(QuizSession.id),
        ).where(and_(*filters)).group_by(QuizSession.referrer)
    )
    by_referrer = {(r[0] or "direct"): r[1] for r in ref_result.all()}

    return {
        "sessions_total": total,
        "sessions_completed": completed,
        "completion_rate": completion_rate,
        "avg_score": avg_score,
        "vouchers_issued": completed,
        "by_device": by_device,
        "by_referrer": by_referrer,
    }


@router.get("/funnel")
async def stats_funnel(
    slug: str = "cc-mobilitaets-check",
    from_date: Optional[str] = Query(None, alias="from"),
    to_date: Optional[str] = Query(None, alias="to"),
    user: dict = Depends(require_stats_access),
    db: AsyncSession = Depends(get_db),
):
    """Funnel data: how many users reached/answered each question."""
    q = await db.execute(select(QuizDefinition).where(QuizDefinition.slug == slug))
    quiz = q.scalar_one_or_none()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz nicht gefunden")

    num_questions = len(quiz.questions_json)

    # Get session IDs in date range
    filters = [QuizSession.quiz_id == quiz.id]
    dt_from = _parse_date(from_date)
    dt_to = _parse_date(to_date)
    if dt_from:
        filters.append(QuizSession.started_at >= dt_from)
    if dt_to:
        filters.append(QuizSession.started_at <= dt_to)

    session_ids_q = select(QuizSession.id).where(and_(*filters))

    # For each question index, count answers + correct + abandoned
    questions = []
    for idx in range(num_questions):
        # Count who answered this question
        answered = await db.execute(
            select(func.count(QuizEvent.id)).where(
                QuizEvent.session_id.in_(session_ids_q),
                QuizEvent.event_type == "answer",
                QuizEvent.question_index == idx,
            )
        )
        answered_count = answered.scalar() or 0

        correct = await db.execute(
            select(func.count(QuizEvent.id)).where(
                QuizEvent.session_id.in_(session_ids_q),
                QuizEvent.event_type == "answer",
                QuizEvent.question_index == idx,
                QuizEvent.is_correct == True,
            )
        )
        correct_count = correct.scalar() or 0

        questions.append({
            "index": idx,
            "reached": answered_count,
            "answered_correct": correct_count,
            "answered_wrong": answered_count - correct_count,
        })

    return {"questions": questions}


@router.get("/answer-heatmap")
async def stats_heatmap(
    slug: str = "cc-mobilitaets-check",
    from_date: Optional[str] = Query(None, alias="from"),
    to_date: Optional[str] = Query(None, alias="to"),
    user: dict = Depends(require_stats_access),
    db: AsyncSession = Depends(get_db),
):
    """Heatmap data: distribution of selected answers per question."""
    q = await db.execute(select(QuizDefinition).where(QuizDefinition.slug == slug))
    quiz = q.scalar_one_or_none()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz nicht gefunden")

    filters = [QuizSession.quiz_id == quiz.id]
    dt_from = _parse_date(from_date)
    dt_to = _parse_date(to_date)
    if dt_from:
        filters.append(QuizSession.started_at >= dt_from)
    if dt_to:
        filters.append(QuizSession.started_at <= dt_to)

    session_ids_q = select(QuizSession.id).where(and_(*filters))

    questions = []
    for idx, qdef in enumerate(quiz.questions_json):
        # Count per selected_index
        counts_result = await db.execute(
            select(
                QuizEvent.selected_index,
                func.count(QuizEvent.id),
            ).where(
                QuizEvent.session_id.in_(session_ids_q),
                QuizEvent.event_type == "answer",
                QuizEvent.question_index == idx,
            ).group_by(QuizEvent.selected_index)
        )
        counts = {r[0]: r[1] for r in counts_result.all()}

        answers = []
        for ai, text in enumerate(qdef["answers"]):
            answers.append({
                "index": ai,
                "text": text,
                "count": counts.get(ai, 0),
            })

        questions.append({
            "index": idx,
            "question": qdef["question"],
            "correct_index": qdef["correct_index"],
            "answers": answers,
        })

    return {"questions": questions}


@router.get("/export.csv")
async def stats_export_csv(
    slug: str = "cc-mobilitaets-check",
    from_date: Optional[str] = Query(None, alias="from"),
    to_date: Optional[str] = Query(None, alias="to"),
    user: dict = Depends(require_stats_access),
    db: AsyncSession = Depends(get_db),
):
    """Export quiz sessions as CSV."""
    q = await db.execute(select(QuizDefinition).where(QuizDefinition.slug == slug))
    quiz = q.scalar_one_or_none()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz nicht gefunden")

    filters = [QuizSession.quiz_id == quiz.id]
    dt_from = _parse_date(from_date)
    dt_to = _parse_date(to_date)
    if dt_from:
        filters.append(QuizSession.started_at >= dt_from)
    if dt_to:
        filters.append(QuizSession.started_at <= dt_to)

    result = await db.execute(
        select(QuizSession).where(and_(*filters)).order_by(QuizSession.started_at.desc())
    )
    sessions = result.scalars().all()

    output = io.StringIO()
    writer = csv.writer(output, delimiter=";")
    writer.writerow(["Session-ID", "Datum", "Score", "Total", "Gerät", "Referrer", "Abgeschlossen", "Dauer (s)"])

    for s in sessions:
        duration = ""
        if s.completed_at and s.started_at:
            duration = str(int((s.completed_at - s.started_at).total_seconds()))
        writer.writerow([
            str(s.id),
            s.started_at.strftime("%d.%m.%Y %H:%M") if s.started_at else "",
            s.correct_count,
            s.total_count,
            s.user_agent_class or "",
            s.referrer or "",
            "Ja" if s.completed_at else ("Abgebrochen" if s.abandoned_at else "Nein"),
            duration,
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=quiz-sessions-{slug}.csv"},
    )
