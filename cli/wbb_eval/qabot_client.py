"""qabot HTTP client — submit a test, poll until done, fetch the bug report.

Auth: ``Authorization: Bearer qab_…`` (issued via /api/api-tokens, scoped
to ``tasks:create`` + ``tasks:read``). Submit uses /api/v1/tasks (the
public API-token endpoint); read-back uses /api/tasks/{id} since v1
doesn't expose a per-task GET yet but the legacy route accepts the same
bearer through RequireAPIToken middleware.
"""
from __future__ import annotations

import os
import time
from dataclasses import dataclass
from typing import Any

import httpx

DEFAULT_API_URL = os.environ.get("QABOT_API_URL", "https://qa.vibecrew.space/api")
DEFAULT_POLL_INTERVAL_SECONDS = 15
DEFAULT_POLL_TIMEOUT_SECONDS = 60 * 25  # 25 minutes — covers a 23-scenario plan


class QabotError(RuntimeError):
    pass


@dataclass(frozen=True)
class TaskResult:
    task_id: str
    status: str
    bugs: list[dict[str, Any]]
    raw: dict[str, Any]


def _auth_headers() -> dict[str, str]:
    token = os.environ.get("QABOT_API_TOKEN")
    if not token:
        raise QabotError(
            "QABOT_API_TOKEN is not set; create one via POST /api/api-tokens "
            "with scopes [tasks:create, tasks:read, bugs:read]"
        )
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}


def submit_task(
    *,
    url: str,
    project_id: str | None = None,
    viewport: dict[str, int] | None = None,
    api_url: str = DEFAULT_API_URL,
) -> str:
    """POST /api/v1/tasks — returns task_id."""
    payload: dict[str, Any] = {
        "url": url,
        "browsers": ["chromium"],
        "viewports": [viewport or {"width": 1440, "height": 900}],
    }
    if project_id:
        payload["project_id"] = project_id
    with httpx.Client(timeout=30.0) as client:
        resp = client.post(
            f"{api_url}/v1/tasks",
            json=payload,
            headers=_auth_headers(),
        )
    if resp.status_code >= 400:
        raise QabotError(f"submit_task failed: {resp.status_code} {resp.text[:400]}")
    data = resp.json()
    task_id = data.get("id") or data.get("task_id")
    if not task_id:
        raise QabotError(f"submit_task response missing id: {data}")
    return str(task_id)


def get_task(task_id: str, *, api_url: str = DEFAULT_API_URL) -> dict[str, Any]:
    """GET /api/v1/tasks/{id} — returns envelope ``{"task": {...}, "critical_count": int, ...}``."""
    with httpx.Client(timeout=30.0) as client:
        resp = client.get(
            f"{api_url}/v1/tasks/{task_id}",
            headers=_auth_headers(),
        )
    if resp.status_code >= 400:
        raise QabotError(f"get_task failed: {resp.status_code} {resp.text[:400]}")
    return resp.json()


def get_task_bugs(task_id: str, *, api_url: str = DEFAULT_API_URL) -> list[dict[str, Any]]:
    """GET /api/v1/tasks/{id}/bugs — full bug list with provenance, severity, etc.

    Backend exposes this under the v1 API-token surface (commit 2b1d01d).
    The legacy /api/tasks/{id}/bugs sits behind session cookies and 401s
    on Bearer.
    """
    with httpx.Client(timeout=30.0) as client:
        resp = client.get(
            f"{api_url}/v1/tasks/{task_id}/bugs",
            headers=_auth_headers(),
        )
    if resp.status_code >= 400:
        raise QabotError(
            f"get_task_bugs failed: {resp.status_code} {resp.text[:400]}"
        )
    data = resp.json()
    if isinstance(data, dict):
        return data.get("bugs") or data.get("data") or []
    if isinstance(data, list):
        return data
    return []


def wait_for_completion(
    task_id: str,
    *,
    api_url: str = DEFAULT_API_URL,
    poll_interval: int = DEFAULT_POLL_INTERVAL_SECONDS,
    timeout: int = DEFAULT_POLL_TIMEOUT_SECONDS,
    progress_callback=None,
) -> TaskResult:
    """Poll /tasks/<id> until status in {done, failed} or timeout."""
    deadline = time.monotonic() + timeout
    last_logged_status: str | None = None

    while time.monotonic() < deadline:
        envelope = get_task(task_id, api_url=api_url)
        task = envelope.get("task") if isinstance(envelope, dict) else None
        if not task:
            task = envelope  # /api/v1/tasks/:id POST returns flat; GET wraps in {"task":{}}
        status = (task.get("status") or "").lower()
        if status != last_logged_status:
            if progress_callback:
                progress_callback(status, task)
            last_logged_status = status
        if status in {"done", "completed", "failed", "error"}:
            bugs = get_task_bugs(task_id, api_url=api_url)
            return TaskResult(
                task_id=task_id, status=status, bugs=bugs, raw=envelope
            )
        time.sleep(poll_interval)

    raise QabotError(f"task {task_id} did not complete within {timeout}s")
