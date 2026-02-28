"""Application configuration via environment variables."""
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://mopilot:mopilot_secret_2026@postgres-ns8wok04s4sgkcggwg48okcg:5432/mopilot"
    REDIS_URL: str = "redis://redis:6379/0"
    ANTHROPIC_API_KEY: str = "sk-placeholder"
    SECRET_KEY: str = "mopilot-jwt-secret-change-in-production"
    CORS_ORIGINS: str = "https://mopilot.website,http://localhost:3000"
    ENVIRONMENT: str = "production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480  # 8 hours for demo
    CLAUDE_MODEL: str = "claude-sonnet-4-20250514"

    class Config:
        env_file = ".env"

settings = Settings()
