"""MoPilot Backend - FastAPI Application"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.core.database import engine, Base
from app.api import auth, chat, knowledge, stations, vehicles, tariffs, users

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    # Seed demo data
    from app.core.seed import seed_demo_data
    await seed_demo_data()
    yield
    # Shutdown
    await engine.dispose()

app = FastAPI(
    title="MoPilot API",
    description="KI-gestützter Mobilitätsassistent für nachhaltiges Carsharing",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(auth.router, prefix="/api/auth", tags=["Authentifizierung"])
app.include_router(chat.router, prefix="/api/chat", tags=["KI-Chat"])
app.include_router(knowledge.router, prefix="/api/knowledge", tags=["Wissensbasis"])
app.include_router(stations.router, prefix="/api/stations", tags=["Standorte"])
app.include_router(vehicles.router, prefix="/api/vehicles", tags=["Fahrzeuge"])
app.include_router(tariffs.router, prefix="/api/tariffs", tags=["Tarife"])
app.include_router(users.router, prefix="/api/users", tags=["Benutzer"])

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "service": "MoPilot API", "version": "0.1.0"}
