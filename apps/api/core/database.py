"""
Pasha DevPilot — Asynchronous Database Layer
Supports PostgreSQL via asyncpg and SQLite via aiosqlite for local development.

Railway provides DATABASE_URL as postgres:// or postgresql:// — we normalize it
to use the correct asyncpg or aiosqlite driver automatically.
"""

import logging
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from .config import settings

logger = logging.getLogger("devpilot.database")


def _normalize_database_url(url: str) -> str:
    """
    Normalize DATABASE_URL for SQLAlchemy async drivers.
    - Railway provides: postgres://... or postgresql://...
    - We need:          postgresql+asyncpg://...  (for Postgres)
    -                   sqlite+aiosqlite://...     (for SQLite)
    """
    if url.startswith("postgres://"):
        # Railway shorthand
        url = url.replace("postgres://", "postgresql+asyncpg://", 1)
    elif url.startswith("postgresql://") and "+asyncpg" not in url:
        url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
    elif url.startswith("sqlite:///") and "+aiosqlite" not in url:
        url = url.replace("sqlite:///", "sqlite+aiosqlite:///", 1)
    return url


_db_url = _normalize_database_url(settings.DATABASE_URL)

# PostgreSQL needs pool config; SQLite does not support connection pools
_is_sqlite = _db_url.startswith("sqlite")

engine = create_async_engine(
    _db_url,
    echo=False,
    future=True,
    # SQLite does not support connection pool
    **({} if _is_sqlite else {
        "pool_size": 5,
        "max_overflow": 10,
        "pool_pre_ping": True,
    }),
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

Base = declarative_base()


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db() -> None:
    """Create all tables if they don't exist. Used at startup."""
    # Import all models so Base.metadata knows about them
    from ..models import user, repository, task  # noqa: F401

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    db_type = "SQLite" if _is_sqlite else "PostgreSQL"
    logger.info("Database initialized (%s)", db_type)
