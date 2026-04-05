"""FastAPI application for MoPilot Ideenplattform."""

import logging
import sys

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import SessionLocal, engine
from .models import Base
from .routers import attachments, auth, comments, export, ideas, ratings, roles, tags, users
from .seed import seed_roles, seed_admin

# Structured JSON logging
logging.basicConfig(
    level=logging.INFO,
    format='{"time":"%(asctime)s","level":"%(levelname)s","logger":"%(name)s","message":"%(message)s"}',
    stream=sys.stdout,
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="MoPilot Ideenplattform API",
    version="0.5.0",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json",
)

# CORS
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(ideas.router)
app.include_router(ratings.router)
app.include_router(comments.router)
app.include_router(roles.router)
app.include_router(users.router)
app.include_router(attachments.router)
app.include_router(export.router)
app.include_router(tags.router)


@app.on_event("startup")
def on_startup() -> None:
    """Create tables and seed data on startup."""
    logger.info("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("Seeding data...")
    db = SessionLocal()
    try:
        seed_roles(db)
        seed_admin(db)
    finally:
        db.close()
    logger.info("Startup complete.")


@app.get("/api/health", tags=["health"])
def health_check():
    """Health check endpoint."""
    return {"status": "ok"}
