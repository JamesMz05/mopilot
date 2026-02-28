"""Knowledge base API (FAQs)."""
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.models.models import FAQ

router = APIRouter()

@router.get("/")
async def list_faqs(operator: str = None, category: str = None, db: AsyncSession = Depends(get_db)):
    query = select(FAQ)
    if operator:
        query = query.where((FAQ.operator == operator) | (FAQ.operator == "general"))
    if category:
        query = query.where(FAQ.category == category)
    result = await db.execute(query)
    faqs = result.scalars().all()
    return [{"id": f.id, "question": f.question, "answer": f.answer, "category": f.category, "operator": f.operator} for f in faqs]

@router.get("/{topic}")
async def get_knowledge(topic: str, operator: str = "zeo", db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(FAQ).where(FAQ.category == topic, (FAQ.operator == operator) | (FAQ.operator == "general")))
    faqs = result.scalars().all()
    return {"topic": topic, "entries": [{"question": f.question, "answer": f.answer} for f in faqs]}
