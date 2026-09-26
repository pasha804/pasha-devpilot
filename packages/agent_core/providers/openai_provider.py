"""
Pasha DevPilot — OpenAI Provider Implementation
Supports GPT-4o, o1, o3-mini and compatible endpoints with function/tool calling.
"""

from typing import List, Optional, AsyncIterator, Dict, Any
import httpx
from .base import BaseAIProvider, AgentMessage, ToolDefinition, ToolCallRequest, AICompletionResponse


class OpenAIProvider(BaseAIProvider):
    def __init__(
        self,
        api_key: Optional[str] = None,
        model_name: str = "gpt-4o",
        base_url: str = "https://api.openai.com/v1",
    ):
        super().__init__(api_key=api_key, model_name=model_name)
        self.base_url = (base_url or "https://api.openai.com/v1").rstrip("/")


class CleanAPIsProvider(OpenAIProvider):
    """
    CleanAPIs OpenAI-Compatible Provider
    Provides access to DeepSeek, Claude, GPT, and Qwen models via cleanapis.com/v1.
    """
    def __init__(
        self,
        api_key: Optional[str] = None,
        model_name: str = "deepseek-v4-flash-0731",
        base_url: str = "https://cleanapis.com/v1",
    ):
        super().__init__(
            api_key=api_key,
            model_name=model_name or "deepseek-v4-flash-0731",
            base_url=base_url or "https://cleanapis.com/v1",
        )

    async def generate_completion(
        self,
        messages: List[AgentMessage],
        tools: Optional[List[ToolDefinition]] = None,
        temperature: float = 0.2,
        max_tokens: int = 4096,
        system_instruction: Optional[str] = None,
    ) -> AICompletionResponse:
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "User-Agent": "PashaDevPilot/1.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        }

        formatted_messages = []
        if system_instruction:
            formatted_messages.append({"role": "system", "content": system_instruction})

        for msg in messages:
            m: Dict[str, Any] = {"role": msg.role, "content": msg.content or ""}
            if msg.name:
                m["name"] = msg.name
            if msg.tool_call_id:
                m["tool_call_id"] = msg.tool_call_id
            if msg.tool_calls:
                m["tool_calls"] = [
                    {
                        "id": tc.id,
                        "type": "function",
                        "function": {"name": tc.name, "arguments": str(tc.arguments)},
                    }
                    for tc in msg.tool_calls
                ]
            formatted_messages.append(m)

        payload: Dict[str, Any] = {
            "model": self.model_name or "gpt-4o",
            "messages": formatted_messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
        }

        if tools:
            payload["tools"] = [
                {
                    "type": "function",
                    "function": {
                        "name": t.name,
                        "description": t.description,
                        "parameters": t.parameters,
                    },
                }
                for t in tools
            ]

        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(f"{self.base_url}/chat/completions", headers=headers, json=payload)
            resp.raise_for_status()
            data = resp.json()

        choice = data["choices"][0]
        message = choice.get("message", {})
        tool_calls = []
        if "tool_calls" in message and message["tool_calls"]:
            import json
            for tc in message["tool_calls"]:
                tool_calls.append(
                    ToolCallRequest(
                        id=tc["id"],
                        name=tc["function"]["name"],
                        arguments=json.loads(tc["function"]["arguments"]),
                    )
                )

        return AICompletionResponse(
            content=message.get("content") or "",
            tool_calls=tool_calls,
            finish_reason=choice.get("finish_reason", "stop"),
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
        # Fallback to single completion if streaming not requested
        res = await self.generate_completion(messages, tools, temperature, max_tokens, system_instruction)
        yield res.content
