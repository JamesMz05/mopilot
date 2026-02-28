"""Chat API: KI-powered chat with role-based context."""
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
import anthropic
import json
import uuid

from app.core.config import settings
from app.core.auth import get_current_user
from app.core.database import get_db
from app.models.models import ChatMessage, FAQ
from app.prompts.roles import get_system_prompt

router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    session_id: str | None = None


class ChatResponse(BaseModel):
    reply: str
    session_id: str


@router.post("/send")
async def send_message(
    req: ChatRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Send a message and get a KI response (non-streaming)."""
    role = current_user.get("role", "endkunde")
    operator = current_user.get("operator", "zeo")
    session_id = req.session_id or str(uuid.uuid4())

    # Get relevant FAQs for context
    faq_context = await _get_faq_context(db, role, operator)

    # Build conversation history
    history = await _get_chat_history(db, int(current_user["sub"]), session_id)

    # Get system prompt
    system_prompt = get_system_prompt(role, operator)
    if faq_context:
        system_prompt += f"\n\nRelevante Wissensbasis:\n{faq_context}"

    # Build messages
    messages = history + [{"role": "user", "content": req.message}]

    # Save user message
    db.add(ChatMessage(user_id=int(current_user["sub"]), session_id=session_id, role="user", content=req.message))

    # Call Anthropic API
    if settings.ANTHROPIC_API_KEY.startswith("sk-ant"):
        try:
            client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
            response = client.messages.create(
                model=settings.CLAUDE_MODEL,
                max_tokens=1024,
                system=system_prompt,
                messages=messages,
            )
            reply = response.content[0].text
        except Exception as e:
            reply = f"KI-Service vorübergehend nicht verfügbar. Fehler: {str(e)[:100]}"
    else:
        # Fallback demo response when no API key
        reply = _get_demo_response(role, req.message)

    # Save assistant message
    db.add(ChatMessage(user_id=int(current_user["sub"]), session_id=session_id, role="assistant", content=reply))
    await db.commit()

    return ChatResponse(reply=reply, session_id=session_id)


@router.post("/stream")
async def stream_message(
    req: ChatRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Send a message and stream the KI response via SSE."""
    role = current_user.get("role", "endkunde")
    operator = current_user.get("operator", "zeo")
    session_id = req.session_id or str(uuid.uuid4())

    faq_context = await _get_faq_context(db, role, operator)
    history = await _get_chat_history(db, int(current_user["sub"]), session_id)
    system_prompt = get_system_prompt(role, operator)
    if faq_context:
        system_prompt += f"\n\nRelevante Wissensbasis:\n{faq_context}"

    messages = history + [{"role": "user", "content": req.message}]

    # Save user message
    db.add(ChatMessage(user_id=int(current_user["sub"]), session_id=session_id, role="user", content=req.message))
    await db.commit()

    async def generate():
        full_reply = ""
        if settings.ANTHROPIC_API_KEY.startswith("sk-ant"):
            try:
                client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
                with client.messages.stream(
                    model=settings.CLAUDE_MODEL,
                    max_tokens=1024,
                    system=system_prompt,
                    messages=messages,
                ) as stream:
                    for text in stream.text_stream:
                        full_reply += text
                        yield f"data: {json.dumps({'text': text, 'session_id': session_id})}\n\n"
            except Exception as e:
                error_msg = f"KI-Service nicht verfügbar: {str(e)[:100]}"
                yield f"data: {json.dumps({'text': error_msg, 'session_id': session_id})}\n\n"
                full_reply = error_msg
        else:
            demo = _get_demo_response(role, req.message)
            for word in demo.split(" "):
                full_reply += word + " "
                yield f"data: {json.dumps({'text': word + ' ', 'session_id': session_id})}\n\n"

        yield f"data: {json.dumps({'done': True, 'session_id': session_id})}\n\n"

        # Save full reply
        async with get_db().__aclass__() as save_db:
            pass  # We'll save in a simpler way

    return StreamingResponse(generate(), media_type="text/event-stream")


async def _get_chat_history(db: AsyncSession, user_id: int, session_id: str, limit: int = 10) -> list[dict]:
    """Get recent chat history for context."""
    result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.user_id == user_id, ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at.desc())
        .limit(limit)
    )
    messages = result.scalars().all()
    return [{"role": m.role, "content": m.content} for m in reversed(messages)]


async def _get_faq_context(db: AsyncSession, role: str, operator: str) -> str:
    """Build FAQ context for the system prompt."""
    result = await db.execute(
        select(FAQ).where(
            (FAQ.operator == operator) | (FAQ.operator == "general")
        ).limit(20)
    )
    faqs = result.scalars().all()
    if not faqs:
        return ""
    lines = []
    for f in faqs:
        lines.append(f"F: {f.question}\nA: {f.answer}")
    return "\n\n".join(lines)


def _get_demo_response(role: str, message: str) -> str:
    """Fallback demo response when no API key is configured."""
    role_greetings = {
        "endkunde": "Hallo! Ich bin MoPilot, Ihr Carsharing-Assistent. ",
        "hotline": "MoPilot Hotline-Unterstützung aktiv. ",
        "betreiber": "MoPilot Betreiber-Dashboard bereit. ",
        "stationspate": "Hallo! Danke für Ihr ehrenamtliches Engagement als Stationspate. ",
    }
    greeting = role_greetings.get(role, "MoPilot KI-Assistent bereit. ")
    return (
        f"{greeting}"
        f"Dies ist eine Demo-Antwort, da kein Anthropic API-Key konfiguriert ist. "
        f"Ihre Nachricht war: '{message[:100]}'. "
        f"Im Vollbetrieb würde ich Ihnen hier eine KI-generierte Antwort passend zu Ihrer Rolle ({role}) geben."
    )
