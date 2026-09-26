"""
Pasha DevPilot — Real-Time SSE Event Streaming Route
Streams live agent progress, tool executions, code diff updates, and state transitions.
"""

import asyncio
from fastapi import APIRouter, Request
from starlette.responses import StreamingResponse

from ..services.event_bus import event_bus

router = APIRouter(prefix="/tasks", tags=["Realtime Events"])


@router.get("/{task_id}/events")
async def stream_task_events(task_id: str, request: Request):
    """
    Server-Sent Events (SSE) endpoint providing real-time task lifecycle updates.
    """
    queue = event_bus.subscribe(task_id)

    async def event_generator():
        try:
            # Send initial keepalive / connection confirmation
            yield f"event: connected\ndata: {{\"task_id\": \"{task_id}\", \"status\": \"connected\"}}\n\n"
            while True:
                if await request.is_disconnected():
                    break
                try:
                    # Wait for message with timeout for heartbeat
                    data = await asyncio.wait_for(queue.get(), timeout=15.0)
                    yield f"data: {data}\n\n"
                except asyncio.TimeoutError:
                    # Heartbeat ping
                    yield f": heartbeat\n\n"
        finally:
            event_bus.unsubscribe(task_id, queue)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
