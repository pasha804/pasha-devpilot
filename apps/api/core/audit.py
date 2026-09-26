"""
Pasha DevPilot — Audit Logging System
Logs all significant user and agent actions (logins, task approvals, file writes, tests, PR creation).
"""

import json
import logging
from datetime import datetime, timezone
from typing import Optional, Dict, Any

logger = logging.getLogger("pasha.audit")


async def record_audit_log(
    db_session: Any,
    action: str,
    user_id: Optional[str] = None,
    workspace_id: Optional[str] = None,
    resource_type: Optional[str] = None,
    resource_id: Optional[str] = None,
    status: str = "SUCCESS",
    metadata: Optional[Dict[str, Any]] = None,
) -> None:
    from ..models.task import AuditLog

    meta_json = json.dumps(metadata or {})
    log_entry = AuditLog(
        action=action,
        user_id=user_id,
        workspace_id=workspace_id,
        resource_type=resource_type,
        resource_id=resource_id,
        status=status,
        audit_metadata=meta_json,
    )

    if db_session:
        db_session.add(log_entry)
        try:
            await db_session.commit()
        except Exception as e:
            logger.warning(f"Could not persist audit log to DB: {e}")

    logger.info(
        f"[AUDIT] action={action} user={user_id} resource={resource_type}:{resource_id} status={status}"
    )
