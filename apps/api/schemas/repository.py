"""
Pasha DevPilot — Repository Schemas
"""

from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field


class RepositoryCreate(BaseModel):
    name: str
    owner: str
    local_path: Optional[str] = None
    clone_url: Optional[str] = None
    default_branch: str = "main"
    is_private: bool = False


class BatchConnectRequest(BaseModel):
    repositories: Optional[List[RepositoryCreate]] = None
    connect_all: bool = False



class RepositoryResponse(BaseModel):
    id: str
    name: str
    owner: str
    full_name: str
    default_branch: str
    primary_language: Optional[str] = None
    detected_frameworks: List[str] = Field(default_factory=list)
    detected_test_runners: List[str] = Field(default_factory=list)
    is_private: bool
    local_path: Optional[str] = None
    indexed_at: Optional[datetime] = None
    created_at: datetime
    file_count: Optional[int] = 0


class FileNode(BaseModel):
    name: str
    path: str
    is_dir: bool
    size_bytes: int = 0
    language: Optional[str] = None
    children: Optional[List["FileNode"]] = None


class CodeSearchQuery(BaseModel):
    query: str
    search_type: str = "exact"  # "exact" | "symbol" | "semantic"
    file_extension: Optional[str] = None
    limit: int = 30


class SearchMatchItem(BaseModel):
    file_path: str
    line_number: int
    line_content: str
    match_score: float = 1.0
    symbol_name: Optional[str] = None


class CodeSearchResponse(BaseModel):
    query: str
    search_type: str
    total_matches: int
    results: List[SearchMatchItem]
