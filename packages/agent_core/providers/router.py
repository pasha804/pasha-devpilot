"""
Pasha DevPilot — AI Model Router & Orchestration Layer
Dynamically instantiates, tracks, and routes to appropriate AI providers:
- IBM Bob Mode: IBM Bob (BobProvider — primary for hackathon)
- Development Mode: DeepSeek V4 Flash (DeepSeekProvider / CleanAPIs)
- Verification Mode: High-Quality Verification Model (GroqProvider)
- Fallbacks: OpenAI, Gemini, Anthropic, Mock
Implements retries, timeouts, latency tracking, usage budgeting, and graceful fallback.
"""

import time
import asyncio
import logging
from typing import Optional, List, Dict, Any
from .base import BaseAIProvider, AgentMessage, ToolDefinition, AICompletionResponse
from .deepseek_provider import DeepSeekProvider
from .groq_provider import GroqProvider
from .mock_provider import MockAIProvider
from .openai_provider import OpenAIProvider, CleanAPIsProvider
from .gemini_provider import GeminiProvider
from .anthropic_provider import AnthropicProvider
from .bob_provider import BobProvider

logger = logging.getLogger("devpilot.model_router")


class ModelRouter:
    """Centralized AI Model Routing, Telemetry, and Fallback Hub."""

    @staticmethod
    def get_provider(
        provider_name: str = "deepseek",
        api_key: Optional[str] = None,
        model_name: Optional[str] = None,
        base_url: Optional[str] = None,
    ) -> BaseAIProvider:
        p = (provider_name or "deepseek").lower().strip()

        if p in ("bob", "ibm-bob", "ibm_bob"):
            return BobProvider(
                api_key=api_key,
                model_name=model_name,
                base_url=base_url,
            )
        elif p in ("deepseek", "deepseek-v4", "cleanapis", "clean-apis", "clean_apis"):
            return DeepSeekProvider(
                api_key=api_key,
                model_name=model_name or "deepseek-v4-flash-0731",
                base_url=base_url or "https://cleanapis.com/v1",
            )
        elif p == "groq":
            return GroqProvider(
                api_key=api_key,
                model_name=model_name or "llama-3.3-70b-versatile",
                base_url=base_url or "https://api.groq.com/openai/v1",
            )
        elif p == "openai":
            return OpenAIProvider(
                api_key=api_key,
                model_name=model_name or "gpt-4o",
                base_url=base_url or "https://api.openai.com/v1",
            )
        elif p in ("anthropic", "claude"):
            return AnthropicProvider(api_key=api_key, model_name=model_name or "claude-3-5-sonnet-20241022")
        elif p in ("gemini", "google"):
            return GeminiProvider(api_key=api_key, model_name=model_name or "gemini-1.5-pro")
        else:
            return MockAIProvider(api_key=api_key, model_name=model_name or "devpilot-local-v1")

    @classmethod
    def get_development_provider(cls) -> BaseAIProvider:
        """Returns the primary Development Mode provider.
        Prefers IBM Bob when BOB_API_KEY is set, else falls back to configured AI_DEFAULT_PROVIDER.
        """
        from apps.api.core.config import settings
        bob_key = getattr(settings, "BOB_API_KEY", None)
        if bob_key:
            return cls.get_provider(
                provider_name="bob",
                api_key=bob_key,
                model_name=getattr(settings, "BOB_MODEL", None),
                base_url=getattr(settings, "BOB_BASE_URL", None),
            )
        prov = getattr(settings, "AI_DEFAULT_PROVIDER", settings.AI_PROVIDER)
        model = getattr(settings, "AI_DEFAULT_MODEL", settings.AI_MODEL_NAME)
        key = getattr(settings, "DEEPSEEK_API_KEY", None) or settings.AI_API_KEY
        base = getattr(settings, "DEEPSEEK_BASE_URL", settings.AI_BASE_URL)
        return cls.get_provider(provider_name=prov, api_key=key, model_name=model, base_url=base)

    @classmethod
    def get_verification_provider(cls) -> BaseAIProvider:
        """Returns the High-Quality Verification Mode provider (Groq or configured fallback)."""
        from apps.api.core.config import settings
        groq_key = getattr(settings, "GROQ_API_KEY", None)
        if groq_key:
            return cls.get_provider(
                provider_name="groq",
                api_key=groq_key,
                model_name=getattr(settings, "GROQ_MODEL", "llama-3.3-70b-versatile"),
                base_url=getattr(settings, "GROQ_BASE_URL", "https://api.groq.com/openai/v1"),
            )
        # Fallback to default development model if Groq key is not supplied
        return cls.get_development_provider()

    @classmethod
    async def execute_with_resilience(
        cls,
        messages: List[AgentMessage],
        provider: Optional[BaseAIProvider] = None,
        tools: Optional[List[ToolDefinition]] = None,
        max_retries: int = 2,
        system_instruction: Optional[str] = None,
    ) -> AICompletionResponse:
        """Executes completion with retries, latency timing, and automatic fallback."""
        active_provider = provider or cls.get_development_provider()
        last_error = None

        for attempt in range(max_retries + 1):
            try:
                t0 = time.time()
                res = await active_provider.generate_completion(
                    messages=messages,
                    tools=tools,
                    system_instruction=system_instruction,
                )
                duration_ms = (time.time() - t0) * 1000
                if "duration_ms" not in res.usage:
                    res.usage["duration_ms"] = duration_ms
                return res
            except Exception as e:
                last_error = e
                logger.warning(f"AI Provider ({active_provider.model_name}) attempt {attempt+1} failed: {e}")
                if attempt < max_retries:
                    await asyncio.sleep(1.0 * (attempt + 1))

        # If primary failed, try fallback
        logger.info("Primary provider exhausted retries, attempting development fallback...")
        fallback_provider = cls.get_development_provider()
        if fallback_provider != active_provider:
            try:
                return await fallback_provider.generate_completion(
                    messages=messages,
                    tools=tools,
                    system_instruction=system_instruction,
                )
            except Exception as fe:
                logger.error(f"Fallback provider failed: {fe}")

        raise last_error or RuntimeError("AI completion failed across all providers")
