"""
Pasha DevPilot — Real-Time Task Event Bus
Broadcasting task execution events, step transitions, diff updates, and token streams
via Server-Sent Events (SSE) with Redis Pub/Sub for cross-container synchronization.
"""

import json
import asyncio
import logging
from typing import Dict, List, Any, Optional
import redis.asyncio as aioredis

from ..core.config import settings

logger = logging.getLogger("devpilot.event_bus")


class TaskEventBus:
    def __init__(self, redis_url: Optional[str] = None):
        self.redis_url = redis_url or settings.REDIS_URL
        # task_id -> list of subscriber queues
        self._subscribers: Dict[str, List[asyncio.Queue]] = {}
        self._redis_client: Optional[aioredis.Redis] = None
        self._listener_tasks: Dict[str, asyncio.Task] = {}

    async def get_redis(self) -> Optional[aioredis.Redis]:
        if self._redis_client is None and self.redis_url:
            try:
                self._redis_client = aioredis.from_url(
                    self.redis_url,
                    decode_responses=True,
                    socket_connect_timeout=3.0,
                    socket_timeout=5.0,
                )
                await self._redis_client.ping()
            except Exception as e:
                logger.debug("Redis pub/sub unavailable: %s", e)
                self._redis_client = None
        return self._redis_client

    def subscribe(self, task_id: str) -> asyncio.Queue:
        if task_id not in self._subscribers:
            self._subscribers[task_id] = []
        q: asyncio.Queue = asyncio.Queue()
        self._subscribers[task_id].append(q)

        # Start redis channel listener if not already active
        if task_id not in self._listener_tasks:
            self._listener_tasks[task_id] = asyncio.create_task(self._listen_redis_channel(task_id))

        return q

    def unsubscribe(self, task_id: str, q: asyncio.Queue) -> None:
        if task_id in self._subscribers:
            if q in self._subscribers[task_id]:
                self._subscribers[task_id].remove(q)
            if not self._subscribers[task_id]:
                del self._subscribers[task_id]
                # Cancel redis listener
                t = self._listener_tasks.pop(task_id, None)
                if t and not t.done():
                    t.cancel()

    async def _listen_redis_channel(self, task_id: str):
        channel_name = f"devpilot:task_events:{task_id}"
        try:
            r = await self.get_redis()
            if not r:
                return
            pubsub = r.pubsub()
            await pubsub.subscribe(channel_name)
            while task_id in self._subscribers:
                try:
                    msg = await pubsub.get_message(ignore_subscribe_messages=True, timeout=1.0)
                    if msg and msg.get("data"):
                        data_str = msg["data"]
                        for q in list(self._subscribers.get(task_id, [])):
                            try:
                                await q.put(data_str)
                            except Exception:
                                pass
                    await asyncio.sleep(0.05)
                except asyncio.CancelledError:
                    break
                except Exception as e:
                    logger.debug("Error listening on redis channel %s: %s", channel_name, e)
                    await asyncio.sleep(1.0)
            await pubsub.unsubscribe(channel_name)
            await pubsub.close()
        except asyncio.CancelledError:
            pass
        except Exception as e:
            logger.debug("Redis listener failed for %s: %s", channel_name, e)

    async def publish(self, task_id: str, event_data: Dict[str, Any]) -> None:
        msg = json.dumps(event_data)
        # 1. Local in-process delivery
        if task_id in self._subscribers:
            for q in list(self._subscribers[task_id]):
                try:
                    await q.put(msg)
                except Exception:
                    pass

        # 2. Redis pub/sub delivery across containers
        try:
            r = await self.get_redis()
            if r:
                await r.publish(f"devpilot:task_events:{task_id}", msg)
        except Exception as e:
            logger.debug("Failed to publish event to Redis: %s", e)


event_bus = TaskEventBus()
