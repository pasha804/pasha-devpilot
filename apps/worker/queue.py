"""
Pasha DevPilot — Redis Job Queue Service
Provides asynchronous job queuing for background repository indexing, AI investigation,
execution, verification, and pull request workflows.
"""

import json
import uuid
import logging
from datetime import datetime, timezone
from typing import Optional, Dict, Any
import redis.asyncio as aioredis
from apps.api.core.config import settings

logger = logging.getLogger("devpilot.queue")

QUEUE_NAME = "devpilot:jobs"


class JobQueue:
    def __init__(self, redis_url: Optional[str] = None):
        self.redis_url = redis_url or settings.REDIS_URL
        self._client: Optional[aioredis.Redis] = None

    async def get_client(self) -> Optional[aioredis.Redis]:
        if self._client is None:
            try:
                self._client = aioredis.from_url(
                    self.redis_url,
                    decode_responses=True,
                    socket_connect_timeout=3.0,
                    socket_timeout=5.0,
                )
                await self._client.ping()
            except Exception as e:
                logger.debug("Redis connection not available: %s", e)
                self._client = None
        return self._client

    async def is_available(self) -> bool:
        try:
            client = await self.get_client()
            if client:
                await client.ping()
                return True
        except Exception:
            self._client = None
        return False

    async def enqueue(self, job_type: str, payload: Dict[str, Any]) -> Optional[str]:
        """
        Pushes a new job onto the Redis queue.
        Returns job_id if successful, None if Redis is unavailable.
        """
        try:
            client = await self.get_client()
            if not client:
                return None

            job_id = str(uuid.uuid4())
            job_data = {
                "job_id": job_id,
                "job_type": job_type,
                "payload": payload,
                "enqueued_at": datetime.now(timezone.utc).isoformat(),
            }
            await client.lpush(QUEUE_NAME, json.dumps(job_data))
            logger.info("[QUEUE] Enqueued %s job: %s", job_type, job_id)
            return job_id
        except Exception as e:
            logger.warning("[QUEUE] Failed to enqueue job %s: %s", job_type, e)
            return None

    async def dequeue(self, timeout: int = 5) -> Optional[Dict[str, Any]]:
        """
        Blocks and waits for a job from the Redis queue.
        """
        try:
            client = await self.get_client()
            if not client:
                return None

            res = await client.brpop(QUEUE_NAME, timeout=timeout)
            if res:
                _, raw_data = res
                return json.loads(raw_data)
        except Exception as e:
            logger.debug("[QUEUE] Error dequeuing job: %s", e)
            self._client = None
        return None

    async def close(self):
        if self._client:
            await self._client.close()
            self._client = None


job_queue = JobQueue()
