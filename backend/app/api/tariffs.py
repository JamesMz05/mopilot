"""Tariffs API."""
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.models.models import Tariff

router = APIRouter()

@router.get("/")
async def list_tariffs(operator: str = None, db: AsyncSession = Depends(get_db)):
    query = select(Tariff)
    if operator:
        query = query.where(Tariff.operator == operator)
    result = await db.execute(query)
    tariffs = result.scalars().all()
    return [{"id": t.id, "name": t.name, "operator": t.operator, "base_fee": t.base_fee_monthly, "per_km": t.price_per_km, "per_hour": t.price_per_hour, "description": t.description} for t in tariffs]
