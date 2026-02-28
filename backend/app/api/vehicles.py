"""Vehicles API."""
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.models.models import Vehicle

router = APIRouter()

@router.get("/")
async def list_vehicles(operator: str = None, db: AsyncSession = Depends(get_db)):
    query = select(Vehicle)
    if operator:
        query = query.where(Vehicle.operator == operator)
    result = await db.execute(query)
    vehicles = result.scalars().all()
    return [{"id": v.id, "model": v.model, "manufacturer": v.manufacturer, "type": v.vehicle_type, "operator": v.operator, "range_km": v.range_km, "seats": v.seats} for v in vehicles]
