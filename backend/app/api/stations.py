"""Stations API."""
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.models import Station

router = APIRouter()

@router.get("/")
async def list_stations(operator: str = None, db: AsyncSession = Depends(get_db)):
    query = select(Station).where(Station.is_active == True)
    if operator:
        query = query.where(Station.operator == operator)
    result = await db.execute(query.order_by(Station.city))
    stations = result.scalars().all()
    return [{"id": s.id, "name": s.name, "address": s.address, "city": s.city, "operator": s.operator, "vehicles_count": s.vehicles_count} for s in stations]
