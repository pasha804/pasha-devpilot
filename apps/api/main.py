"""
Pasha DevPilot — Main Application Entrypoint
FastAPI application with async database lifecycle, CORS, routing, and health checks.
"""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .core.config import settings
from .core.database import init_db
from .routes import (
    auth_router,
    repo_router,
    task_router,
    agent_router,
    verification_router,
    pr_router,
    events_router,
    settings_router,
)

logger = logging.getLogger("devpilot.main")

# ---------------------------------------------------------------------------
# Startup validation
# ---------------------------------------------------------------------------

def _validate_startup_config():
    """Warn about missing critical config before accepting traffic."""
    if not settings.SECRET_KEY:
        logger.warning(
            "SECRET_KEY is not set — JWT tokens will be unsigned and insecure. "
            "Set SECRET_KEY in your .env file before production deployment."
        )
    github_configured = (
        settings.GITHUB_CLIENT_ID
        and settings.GITHUB_CLIENT_ID != "mock_client_id"
        and settings.GITHUB_CLIENT_SECRET
        and settings.GITHUB_CLIENT_SECRET != "mock_client_secret"
    )
    if not github_configured:
        logger.warning(
            "GitHub OAuth is not configured (GITHUB_CLIENT_ID/GITHUB_CLIENT_SECRET use mock values). "
            "Real GitHub authentication will not work. Set these in your .env file."
        )
    ai_key = settings.BOB_API_KEY or settings.AI_API_KEY or settings.DEEPSEEK_API_KEY
    if not ai_key:
        logger.warning(
            "No AI provider key found (BOB_API_KEY / AI_API_KEY / DEEPSEEK_API_KEY). "
            "Agent will fall back to MockAIProvider which returns template responses."
        )


@asynccontextmanager
async def lifespan(app: FastAPI):
    _validate_startup_config()
    await init_db()
    logger.info(
        "Pasha DevPilot started — provider=%s mode=%s production=%s",
        settings.AI_PROVIDER,
        settings.EXECUTION_MODE,
        settings.is_production(),
    )
    yield


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Your AI Software Engineer. Understand. Plan. Build. Verify. Ship.",
    lifespan=lifespan,
    # In production, hide /docs and /redoc
    docs_url=None if settings.is_production() else "/docs",
    redoc_url=None if settings.is_production() else "/redoc",
)

# ---------------------------------------------------------------------------
# CORS Middleware — use dynamic origins that include production URLs
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error("Unhandled exception: %s", exc, exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )


# ---------------------------------------------------------------------------
# Mount Routers
# ---------------------------------------------------------------------------
app.include_router(auth_router)
app.include_router(repo_router)
app.include_router(task_router)
app.include_router(agent_router)
app.include_router(verification_router)
app.include_router(pr_router)
app.include_router(events_router)
app.include_router(settings_router)


# ---------------------------------------------------------------------------
# Health & Root
# ---------------------------------------------------------------------------

@app.get("/health")
async def health_check():
    """Health endpoint used by Railway, Docker, and load balancers."""
    github_configured = (
        settings.GITHUB_CLIENT_ID != "mock_client_id"
        and bool(settings.GITHUB_CLIENT_ID)
    )
    ai_key_present = bool(
        settings.BOB_API_KEY or settings.AI_API_KEY or settings.DEEPSEEK_API_KEY
    )
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "ai_provider": settings.AI_PROVIDER,
        "execution_mode": settings.EXECUTION_MODE,
        "github_configured": github_configured,
        "ai_key_present": ai_key_present,
        "production": settings.is_production(),
    }


@app.get("/")
async def root():
    return {
        "product": "Pasha DevPilot",
        "tagline": "Your AI Software Engineer. Understand. Plan. Build. Verify. Ship.",
        "version": settings.APP_VERSION,
        "health_url": "/health",
    }
