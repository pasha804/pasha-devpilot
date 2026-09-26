"""
Pasha DevPilot — IBM Bob Provider
Routes AI completions through IBM Bob's API endpoint.
IBM Bob is the primary AI backbone for the IBM Bob 2 Hackathon submission.

Bob API is OpenAI-compatible, so this provider extends CleanAPIsProvider
with Bob-specific defaults, headers, and model routing.
"""

from typing import List, Optional, AsyncIterator, Dict, Any
import httpx
from .base import BaseAIProvider, AgentMessage, ToolDefinition, ToolCallRequest, AICompletionResponse
from .openai_provider import CleanAPIsProvider


# IBM Bob default model — use the recommended Bob model for SDLC tasks
BOB_DEFAULT_MODEL = "claude-sonnet-4-5"
BOB_DEFAULT_BASE_URL = "https://cleanapis.com/v1"


class BobProvider(CleanAPIsProvider):
    """
    IBM Bob AI Provider.

    IBM Bob is an AI SDLC partner that augments development workflows.
    This provider routes DevPilot's AI completions through Bob, making
    DevPilot a genuine IBM Bob extension rather than a standalone product.

    Bob's API is OpenAI-compatible, so this inherits the full
    CleanAPIsProvider implementation with Bob-specific configuration.
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        model_name: str = BOB_DEFAULT_MODEL,
        base_url: str = BOB_DEFAULT_BASE_URL,
    ):
        super().__init__(
            api_key=api_key,
            model_name=model_name or BOB_DEFAULT_MODEL,
            base_url=base_url or BOB_DEFAULT_BASE_URL,
        )
        # Bob-specific user agent identifies this as a Bob-powered tool
        self._user_agent = "PashaDevPilot/1.0 (IBM-Bob-Extension; SDLC-Automation)"

    async def generate_completion(
        self,
        messages: List[AgentMessage],
        tools: Optional[List[ToolDefinition]] = None,
        temperature: float = 0.2,
        max_tokens: int = 4096,
        system_instruction: Optional[str] = None,
    ) -> AICompletionResponse:
        """
        Generate a completion using IBM Bob as the AI backbone.
        Injects a Bob-SDLC-aware system preamble to align Bob's behavior
        with DevPilot's engineering workflow.
        """
        # Prepend Bob SDLC context to the system instruction
        bob_sdlc_preamble = (
            "You are IBM Bob, an AI SDLC partner embedded in Pasha DevPilot. "
            "Your role is to understand codebases, formulate precise implementation plans, "
            "and guide bounded self-healing verification. Always prioritize correctness, "
            "security, and human-in-the-loop oversight. Never modify code without an "
            "approved plan. Follow IBM secure coding standards (OWASP, no hardcoded secrets)."
        )

        combined_system = bob_sdlc_preamble
        if system_instruction:
            combined_system = f"{bob_sdlc_preamble}\n\n{system_instruction}"

        return await super().generate_completion(
            messages=messages,
            tools=tools,
            temperature=temperature,
            max_tokens=max_tokens,
            system_instruction=combined_system,
        )

    async def stream_completion(
        self,
        messages: List[AgentMessage],
        tools: Optional[List[ToolDefinition]] = None,
        temperature: float = 0.2,
        max_tokens: int = 4096,
        system_instruction: Optional[str] = None,
    ) -> AsyncIterator[str]:
        res = await self.generate_completion(
            messages, tools, temperature, max_tokens, system_instruction
        )
        yield res.content
