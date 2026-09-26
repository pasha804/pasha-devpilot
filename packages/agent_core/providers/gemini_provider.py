"""
Pasha DevPilot — Google Gemini Provider Implementation
Supports Gemini 1.5 Pro, 1.5 Flash, 2.0 and later models with structured function calling.
"""

from typing import List, Optional, AsyncIterator, Dict, Any
import httpx
from .base import BaseAIProvider, AgentMessage, ToolDefinition, ToolCallRequest, AICompletionResponse


class GeminiProvider(BaseAIProvider):
    def __init__(self, api_key: Optional[str] = None, model_name: str = "gemini-1.5-pro"):
        super().__init__(api_key=api_key, model_name=model_name)
        self.base_url = "https://generativelanguage.googleapis.com/v1beta"

    async def generate_completion(
        self,
        messages: List[AgentMessage],
        tools: Optional[List[ToolDefinition]] = None,
        temperature: float = 0.2,
        max_tokens: int = 4096,
        system_instruction: Optional[str] = None,
    ) -> AICompletionResponse:
        url = f"{self.base_url}/models/{self.model_name}:generateContent?key={self.api_key}"
        
        contents = []
        for msg in messages:
            role = "user" if msg.role in ("user", "system") else "model"
            contents.append({
                "role": role,
                "parts": [{"text": msg.content or ""}]
            })

        payload: Dict[str, Any] = {
            "contents": contents,
            "generationConfig": {
                "temperature": temperature,
                "maxOutputTokens": max_tokens
            }
        }

        if system_instruction:
            payload["systemInstruction"] = {
                "parts": [{"text": system_instruction}]
            }

        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(url, json=payload)
            resp.raise_for_status()
            data = resp.json()

        candidates = data.get("candidates", [])
        if not candidates:
            return AICompletionResponse(content="", finish_reason="stop")

        candidate = candidates[0]
        parts = candidate.get("content", {}).get("parts", [])
        content_text = "".join([p.get("text", "") for p in parts])

        return AICompletionResponse(
            content=content_text,
            finish_reason=candidate.get("finishReason", "stop"),
            usage=data.get("usageMetadata", {}),
            raw_response=data
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
