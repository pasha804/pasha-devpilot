"""
Pasha DevPilot — Configuration & Environment Settings
"""

from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # App Settings
    APP_NAME: str = "Pasha DevPilot"
    APP_VERSION: str = "1.0.0"
    APP_URL: str = "http://localhost:8000"
    FRONTEND_URL: str = "http://localhost:3000"

    # Security & Tokens
    SECRET_KEY: str = ""
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    # Database & Storage
    DATABASE_URL: str = "sqlite+aiosqlite:///./pasha_devpilot.db"
    REDIS_URL: str = "redis://localhost:6379/0"

    # GitHub OAuth
    GITHUB_CLIENT_ID: str = "mock_client_id"
    GITHUB_CLIENT_SECRET: str = "mock_client_secret"
    GITHUB_REDIRECT_URI: str = "http://localhost:3000/auth/callback"
    GITHUB_APP_NAME: str = "PashaDevPilot"

    # AI Provider Settings: "bob" | "cleanapis" | "deepseek" | "groq" | "openai" | "anthropic" | "gemini" | "mock"
    AI_PROVIDER: str = "cleanapis"
    AI_BASE_URL: str = "https://cleanapis.com/v1"
    AI_API_KEY: Optional[str] = None
    AI_MODEL_NAME: str = "deepseek-v4-flash-0731"

    # Development & Verification Provider Modes
    AI_DEFAULT_PROVIDER: str = "deepseek"
    AI_DEFAULT_MODEL: str = "deepseek-v4-flash-0731"
    AI_VERIFICATION_PROVIDER: str = "groq"
    AI_VERIFICATION_MODEL: str = "llama-3.3-70b-versatile"

    # IBM Bob Provider (primary for IBM Bob Hackathon)
    BOB_API_KEY: Optional[str] = None
    BOB_BASE_URL: str = "https://cleanapis.com/v1"
    BOB_MODEL: str = "claude-sonnet-4-5"

    # Dedicated Provider Keys
    DEEPSEEK_API_KEY: Optional[str] = None
    DEEPSEEK_BASE_URL: str = "https://cleanapis.com/v1"
    GROQ_API_KEY: Optional[str] = None
    GROQ_MODEL: str = "llama-3.3-70b-versatile"
    GROQ_BASE_URL: str = "https://api.groq.com/openai/v1"

    # Sandbox & Execution
    EXECUTION_MODE: str = "local_safe"  # "sandbox" | "local_safe" | "mock"
    SANDBOX_TIMEOUT_SECONDS: int = 60
    MAX_SELF_HEALING_ATTEMPTS: int = 3

    # Logging
    LOG_LEVEL: str = "INFO"

    # CORS — populated dynamically from FRONTEND_URL + APP_URL
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]

    # Railway environment flag
    RAILWAY_ENVIRONMENT: str = ""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    def get_cors_origins(self) -> List[str]:
        """Returns CORS origins including production URLs if set."""
        origins = list(self.CORS_ORIGINS)
        if self.FRONTEND_URL and self.FRONTEND_URL not in origins:
            origins.append(self.FRONTEND_URL)
        if self.APP_URL and self.APP_URL not in origins:
            origins.append(self.APP_URL)
        # Strip trailing slashes
        return [o.rstrip("/") for o in origins]

    def is_production(self) -> bool:
        return bool(self.RAILWAY_ENVIRONMENT) or (
            "localhost" not in self.APP_URL and "127.0.0.1" not in self.APP_URL
        )


settings = Settings()
