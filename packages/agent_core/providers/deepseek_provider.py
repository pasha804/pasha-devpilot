"""
Pasha DevPilot — DeepSeek Provider
Connects to DeepSeek API (or CleanAPIs DeepSeek endpoint) using DeepSeek V4 Flash as default development model.
Supports function/tool calling and structured outputs.
"""

from typing import List, Optional, AsyncIterator, Dict, Any
import httpx
import time
from .base import BaseAIProvider, AgentMessage, ToolDefinition, ToolCallRequest, AICompletionResponse
from .openai_provider import CleanAPIsProvider


class DeepSeekProvider(CleanAPIsProvider):
    """
    Dedicated DeepSeek AI Provider.
    Primary development model: DeepSeek V4 Flash (deepseek-v4-flash-0731).
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        model_name: str = "deepseek-v4-flash-0731",
        base_url: str = "https://cleanapis.com/v1",
    ):
        super().__init__(api_key=api_key, model_name=model_name)
        self.base_url = (base_url or "https://cleanapis.com/v1").rstrip("/")

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
            "User-Agent": "PashaDevPilot/1.0",
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
            "model": self.model_name or "deepseek-v4-flash-0731",
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

        start_time = time.time()
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(f"{self.base_url}/chat/completions", headers=headers, json=payload)
            resp.raise_for_status()
            data = resp.json()
        duration_ms = (time.time() - start_time) * 1000

        choice = data["choices"][0]
        message = choice.get("message", {})
        tool_calls = []
        if "tool_calls" in message and message["tool_calls"]:
            import json
            for tc in message["tool_calls"]:
                try:
                    args = json.loads(tc["function"]["arguments"])
                except Exception:
                    args = {"raw": tc["function"]["arguments"]}
                tool_calls.append(
                    ToolCallRequest(
                        id=tc["id"],
                        name=tc["function"]["name"],
                        arguments=args,
                    )
                )

        usage = data.get("usage", {})
        usage["duration_ms"] = int(duration_ms)

        return AICompletionResponse(
            content=message.get("content") or "",
            tool_calls=tool_calls,
            finish_reason=choice.get("finish_reason", "stop"),
            usage=usage,
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
