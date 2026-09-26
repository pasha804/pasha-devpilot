from .auth_routes import router as auth_router
from .repo_routes import router as repo_router
from .task_routes import router as task_router
from .agent_routes import router as agent_router
from .verification_routes import router as verification_router
from .pr_routes import router as pr_router
from .events_routes import router as events_router
from .settings_routes import router as settings_router

__all__ = [
    "auth_router",
    "repo_router",
    "task_router",
    "agent_router",
    "verification_router",
    "pr_router",
    "events_router",
    "settings_router",
]
