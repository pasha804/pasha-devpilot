"""
Pasha DevPilot — Anthropic Provider Implementation
Supports Claude 3.5 Sonnet, Claude 3 Opus, Claude 3.7 Sonnet.
"""

from typing import List, Optional, AsyncIterator, Dict, Any
import httpx
from .base import BaseAIProvider, AgentMessage, ToolDefinition, ToolCallRequest, AICompletionResponse


class AnthropicProvider(BaseAIProvider):
    def __init__(self, api_key: Optional[str] = None, model_name: str = "claude-3-5-sonnet-20241022"):
        super().__init__(api_key=api_key, model_name=model_name)
        self.base_url = "https://api.anthropic.com/v1"

    async def generate_completion(
        self,
        messages: List[AgentMessage],
        tools: Optional[List[ToolDefinition]] = None,
        temperature: float = 0.2,
        max_tokens: int = 4096,
        system_instruction: Optional[str] = None,
    ) -> AICompletionResponse:
        headers = {
            "x-api-key": self.api_key or "",
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        }

        formatted_messages = []
        for msg in messages:
            role = "user" if msg.role in ("user", "system") else "assistant"
            formatted_messages.append({"role": role, "content": msg.content or ""})

        payload: Dict[str, Any] = {
            "model": self.model_name or "claude-3-5-sonnet-20241022",
            "messages": formatted_messages,
            "max_tokens": max_tokens,
            "temperature": temperature,
        }

        if system_instruction:
            payload["system"] = system_instruction

        if tools:
            payload["tools"] = [
                {
                    "name": t.name,
                    "description": t.description,
                    "input_schema": t.parameters,
                }
                for t in tools
            ]

        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(f"{self.base_url}/messages", headers=headers, json=payload)
            resp.raise_for_status()
            data = resp.json()

        content_parts = []
        tool_calls = []
        for block in data.get("content", []):
            if block.get("type") == "text":
                content_parts.append(block.get("text", ""))
            elif block.get("type") == "tool_use":
                tool_calls.append(
                    ToolCallRequest(
                        id=block.get("id"),
                        name=block.get("name"),
                        arguments=block.get("input", {}),
                    )
                )

        return AICompletionResponse(
            content="".join(content_parts),
            tool_calls=tool_calls,
            finish_reason=data.get("stop_reason", "end_turn"),
            usage=data.get("usage", {}),
            raw_response=data,
        )

    async def stream_completion(
        self,
        messages: List[AgentMessage],
        tools: Optional[List[ToolDefinition]] = None,
        temperature: float = 0.2,
        max_tokens: int = 4096,
        system_instruction: Optional[str] = None,
    ) -> AsyncIterator[str]:
        res = await self.generate_completion(messages, tools, temperature, max_tokens, system_instruction)
        yield res.content
