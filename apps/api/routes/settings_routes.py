"""
Pasha DevPilot — Platform Settings & Project Memories Routes
"""

from typing import List, Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete

from ..core.config import settings
from ..core.database import get_db
from ..core.security import mask_secret
from ..models.repository import ProjectMemory, Project

router = APIRouter(prefix="/settings", tags=["Settings"])


class SettingsDTO(BaseModel):
    app_name: str
    app_version: str
    ai_provider: str
    ai_base_url: str = "https://cleanapis.com/v1"
    ai_model_name: str
    masked_api_key: str
    execution_mode: str
    sandbox_timeout_seconds: int
    max_self_healing_attempts: int


class SettingsUpdateRequest(BaseModel):
    ai_provider: Optional[str] = None
    ai_base_url: Optional[str] = None
    ai_api_key: Optional[str] = None
    ai_model_name: Optional[str] = None
    execution_mode: Optional[str] = None
    sandbox_timeout_seconds: Optional[int] = None


class ProjectMemoryDTO(BaseModel):
    id: str
    key: str
    value: str
    category: str
    is_active: bool


class CreateProjectMemoryRequest(BaseModel):
    key: str
    value: str
    category: str = "architecture"


@router.get("", response_model=SettingsDTO)
async def get_settings():
    return SettingsDTO(
        app_name=settings.APP_NAME,
        app_version=settings.APP_VERSION,
        ai_provider=settings.AI_PROVIDER,
        ai_base_url=settings.AI_BASE_URL,
        ai_model_name=settings.AI_MODEL_NAME,
        masked_api_key=mask_secret(settings.AI_API_KEY or ""),
        execution_mode=settings.EXECUTION_MODE,
        sandbox_timeout_seconds=settings.SANDBOX_TIMEOUT_SECONDS,
        max_self_healing_attempts=settings.MAX_SELF_HEALING_ATTEMPTS,
    )


@router.post("", response_model=SettingsDTO)
async def update_settings(payload: SettingsUpdateRequest):
    if payload.ai_provider:
        settings.AI_PROVIDER = payload.ai_provider
    if payload.ai_base_url:
        settings.AI_BASE_URL = payload.ai_base_url
    if payload.ai_api_key:
        settings.AI_API_KEY = payload.ai_api_key
    if payload.ai_model_name:
        settings.AI_MODEL_NAME = payload.ai_model_name
    if payload.execution_mode:
        settings.EXECUTION_MODE = payload.execution_mode
    if payload.sandbox_timeout_seconds:
        settings.SANDBOX_TIMEOUT_SECONDS = payload.sandbox_timeout_seconds

    return await get_settings()


@router.get("/memories", response_model=List[ProjectMemoryDTO])
async def list_project_memories(db: AsyncSession = Depends(get_db)):
    """List inspectable project-level memories."""
    q = await db.execute(select(ProjectMemory).order_by(ProjectMemory.created_at.desc()))
    memories = q.scalars().all()
    return [
        ProjectMemoryDTO(
            id=m.id,
            key=m.key,
            value=m.value,
            category=m.category,
            is_active=m.is_active,
        )
        for m in memories
    ]


@router.post("/memories", response_model=ProjectMemoryDTO)
async def add_project_memory(payload: CreateProjectMemoryRequest, db: AsyncSession = Depends(get_db)):
    """Add a new explicit project memory (e.g., 'API uses FastAPI')."""
    # Find or create default project
    q_proj = await db.execute(select(Project).limit(1))
    proj = q_proj.scalars().first()
    proj_id = proj.id if proj else "default_project"

    memory = ProjectMemory(
        project_id=proj_id,
        key=payload.key,
        value=payload.value,
        category=payload.category,
        is_active=True,
    )
    db.add(memory)
    await db.commit()
    await db.refresh(memory)

    return ProjectMemoryDTO(
        id=memory.id,
        key=memory.key,
        value=memory.value,
        category=memory.category,
        is_active=memory.is_active,
    )


@router.delete("/memories/{memory_id}")
async def delete_project_memory(memory_id: str, db: AsyncSession = Depends(get_db)):
    """Delete an existing project memory."""
    await db.execute(delete(ProjectMemory).where(ProjectMemory.id == memory_id))
    await db.commit()
    return {"deleted": True, "id": memory_id}
