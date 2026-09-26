"""
Pasha DevPilot — Background Worker Daemon
Processes asynchronous repository analysis, AI investigation, code execution,
verification, and PR workflows from the Redis job queue.
"""

import sys
import asyncio
import logging
import signal
from typing import Dict, Any

from apps.api.core.config import settings
from apps.api.core.database import init_db, AsyncSessionLocal
from apps.worker.queue import job_queue, QUEUE_NAME

# Setup logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
    format="%(asctime)s [%(levelname)s] devpilot.worker: %(message)s",
)
logger = logging.getLogger("devpilot.worker")


class DevPilotWorker:
    def __init__(self):
        self.running = True

    def stop(self, *args):
        logger.info("Worker received shutdown signal. Stopping gracefully...")
        self.running = False

    async def handle_job(self, job: Dict[str, Any]):
        job_id = job.get("job_id")
        job_type = job.get("job_type")
        payload = job.get("payload", {})

        logger.info("[WORKER] Processing job %s (type=%s)", job_id, job_type)

        try:
            if job_type == "investigate_task":
                from apps.api.routes.agent_routes import run_investigation_worker
                await run_investigation_worker(
                    task_id=payload["task_id"],
                    repo_id=payload["repo_id"],
                    repo_path=payload["repo_path"],
                    description=payload["description"],
                )

            elif job_type == "execute_task":
                from apps.api.routes.agent_routes import run_execution_worker
                await run_execution_worker(
                    task_id=payload["task_id"],
                    repo_id=payload["repo_id"],
                    repo_path=payload["repo_path"],
                )

            elif job_type == "index_repo":
                from apps.api.services.indexer_service import RepositoryIndexer
                indexer = RepositoryIndexer(payload["repo_path"])
                async with AsyncSessionLocal() as db:
                    await indexer.index_repository(db, payload["repo_id"])

            elif job_type == "scan_repo":
                from apps.api.services.analyzer_service import RepositoryAnalyzer
                analyzer = RepositoryAnalyzer(payload["repo_path"])
                await analyzer.analyze(payload["repo_id"])

            else:
                logger.warning("[WORKER] Unknown job type: %s", job_type)

            logger.info("[WORKER] Successfully finished job %s (type=%s)", job_id, job_type)

        except Exception as e:
            logger.error("[WORKER] Error executing job %s: %s", job_id, e, exc_info=True)

    async def run(self):
        logger.info(
            "Pasha DevPilot Background Worker started — Redis queue='%s' AI Provider='%s'",
            QUEUE_NAME,
            settings.AI_PROVIDER,
        )

        await init_db()

        while self.running:
            try:
                job = await job_queue.dequeue(timeout=3)
                if job:
                    await self.handle_job(job)
                else:
                    await asyncio.sleep(0.5)
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error("[WORKER] Unexpected error in polling loop: %s", e)
                await asyncio.sleep(2.0)

        await job_queue.close()
        logger.info("Worker stopped cleanly.")


def main():
    worker = DevPilotWorker()

    # Register signal handlers for clean container shutdown
    if sys.platform != "win32":
        loop = asyncio.get_event_loop()
        for sig in (signal.SIGTERM, signal.SIGINT):
            loop.add_signal_handler(sig, worker.stop)

    asyncio.run(worker.run())


if __name__ == "__main__":
    main()
