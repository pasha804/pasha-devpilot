"""
Pasha DevPilot — Real-Time Task Event Bus
Broadcasting task execution events, step transitions, diff updates, and token streams
via Server-Sent Events (SSE).
"""

import json
import asyncio
from typing import Dict, List, Any


class TaskEventBus:
    def __init__(self):
        # task_id -> list of subscriber queues
        self._subscribers: Dict[str, List[asyncio.Queue]] = {}

    def subscribe(self, task_id: str) -> asyncio.Queue:
        if task_id not in self._subscribers:
            self._subscribers[task_id] = []
        q: asyncio.Queue = asyncio.Queue()
        self._subscribers[task_id].append(q)
        return q

    def unsubscribe(self, task_id: str, q: asyncio.Queue) -> None:
        if task_id in self._subscribers:
            if q in self._subscribers[task_id]:
                self._subscribers[task_id].remove(q)
            if not self._subscribers[task_id]:
                del self._subscribers[task_id]

    async def publish(self, task_id: str, event_data: Dict[str, Any]) -> None:
        if task_id in self._subscribers:
            msg = json.dumps(event_data)
            for q in list(self._subscribers[task_id]):
                try:
                    await q.put(msg)
                except Exception:
                    pass


event_bus = TaskEventBus()
