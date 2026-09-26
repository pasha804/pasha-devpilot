"""
Pasha DevPilot — Repository, Symbols, and Project Memory Models
"""

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, Boolean, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from ..core.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


class Project(Base):
    __tablename__ = "projects"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    workspace_id = Column(String(36), ForeignKey("workspaces.id"), nullable=False)
    name = Column(String(128), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    repositories = relationship("Repository", back_populates="project", cascade="all, delete-orphan")
    memories = relationship("ProjectMemory", back_populates="project", cascade="all, delete-orphan")


class Repository(Base):
    __tablename__ = "repositories"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    workspace_id = Column(String(36), ForeignKey("workspaces.id"), nullable=False)
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=True)
    name = Column(String(255), nullable=False)
    owner = Column(String(255), nullable=False)
    full_name = Column(String(512), index=True, nullable=False)
    github_repo_id = Column(Integer, nullable=True)
    default_branch = Column(String(128), default="main")
    primary_language = Column(String(64), nullable=True)
    detected_frameworks = Column(Text, default="[]")  # JSON serialized list
    detected_test_runners = Column(Text, default="[]")  # JSON serialized list
    is_private = Column(Boolean, default=False)
    local_path = Column(Text, nullable=True)
    clone_url = Column(Text, nullable=True)
    indexed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    workspace = relationship("Workspace", back_populates="repositories")
    project = relationship("Project", back_populates="repositories")
    files = relationship("RepositoryFile", back_populates="repository", cascade="all, delete-orphan")
    symbols = relationship("RepositorySymbol", back_populates="repository", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="repository", cascade="all, delete-orphan")


class RepositoryFile(Base):
    __tablename__ = "repository_files"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    repository_id = Column(String(36), ForeignKey("repositories.id"), nullable=False)
    path = Column(String(1024), index=True, nullable=False)
    extension = Column(String(32), nullable=True)
    size_bytes = Column(Integer, default=0)
    line_count = Column(Integer, default=0)
    language = Column(String(64), nullable=True)
    is_sensitive = Column(Boolean, default=False)
    sha256 = Column(String(64), nullable=True)
    last_modified = Column(DateTime(timezone=True), nullable=True)

    repository = relationship("Repository", back_populates="files")


class RepositorySymbol(Base):
    __tablename__ = "repository_symbols"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    repository_id = Column(String(36), ForeignKey("repositories.id"), nullable=False)
    file_path = Column(String(1024), index=True, nullable=False)
    symbol_name = Column(String(255), index=True, nullable=False)
    symbol_type = Column(String(64), nullable=False)  # function, class, route, type
    line_number = Column(Integer, nullable=False)
    signature = Column(Text, nullable=True)

    repository = relationship("Repository", back_populates="symbols")


class ProjectMemory(Base):
    __tablename__ = "project_memories"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False)
    key = Column(String(128), nullable=False)
    value = Column(Text, nullable=False)
    category = Column(String(64), default="architecture")  # architecture, testing, conventions, auth
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    project = relationship("Project", back_populates="memories")


class Integration(Base):
    __tablename__ = "integrations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    workspace_id = Column(String(36), ForeignKey("workspaces.id"), nullable=False)
    provider = Column(String(64), default="github")
    access_token_encrypted = Column(Text, nullable=True)
    refresh_token_encrypted = Column(Text, nullable=True)
    scopes = Column(String(255), default="repo,read:user,user:email")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
