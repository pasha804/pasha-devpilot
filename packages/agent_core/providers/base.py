"""
Pasha DevPilot — Agent Core AI Provider Abstraction
Provides unified, decoupled interfaces across multiple LLM providers (Gemini, OpenAI, Anthropic, Mock).
"""

from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional, AsyncIterator
from pydantic import BaseModel, Field


class ToolDefinition(BaseModel):
    name: str
    description: str
    parameters: Dict[str, Any]


class ToolCallRequest(BaseModel):
    id: str
    name: str
    arguments: Dict[str, Any]


class AgentMessage(BaseModel):
    role: str = Field(..., description="'system' | 'user' | 'assistant' | 'tool'")
    content: Optional[str] = ""
    name: Optional[str] = None
    tool_call_id: Optional[str] = None
    tool_calls: Optional[List[ToolCallRequest]] = None


class AICompletionResponse(BaseModel):
    content: str = ""
    tool_calls: List[ToolCallRequest] = Field(default_factory=list)
    finish_reason: str = "stop"
    usage: Dict[str, Any] = Field(default_factory=dict)
    raw_response: Optional[Dict[str, Any]] = None


class BaseAIProvider(ABC):
    """Abstract Base Class for AI Model Providers."""

    def __init__(self, api_key: Optional[str] = None, model_name: Optional[str] = None):
        self.api_key = api_key
        self.model_name = model_name

    @abstractmethod
    async def generate_completion(
        self,
        messages: List[AgentMessage],
        tools: Optional[List[ToolDefinition]] = None,
        temperature: float = 0.2,
        max_tokens: int = 4096,
        system_instruction: Optional[str] = None,
    ) -> AICompletionResponse:
        """Generate a model completion with optional tool calls."""
        pass

    @abstractmethod
    async def stream_completion(
        self,
        messages: List[AgentMessage],
        tools: Optional[List[ToolDefinition]] = None,
        temperature: float = 0.2,
        max_tokens: int = 4096,
        system_instruction: Optional[str] = None,
    ) -> AsyncIterator[str]:
        """Stream token chunks for real-time UI display."""
        pass
