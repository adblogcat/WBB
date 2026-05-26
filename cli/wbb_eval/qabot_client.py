"""qabot HTTP client — submit a test, poll until done, fetch the bug report.

Auth: uses INTERNAL_SECRET via X-Internal-Secret header (same path the
orchestrator uses to call the backend). Falls back to bearer if an
API key is provided instead.
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
    secret = os.environ.get("QABOT_INTERNAL_SECRET")
    if not secret:
        raise QabotError(
            "QABOT_INTERNAL_SECRET is not set; cannot authenticate to backend"
        )
    return {"X-Internal-Secret": secret, "Content-Type": "application/json"}


def submit_task(
    *,
    url: str,
    project_id: str | None = None,
    mode: str = "exploratory",
    viewport: dict[str, int] | None = None,
    api_url: str = DEFAULT_API_URL,
) -> str:
    """POST /tasks — returns task_id."""
    payload: dict[str, Any] = {
        "url": url,
        "mode": mode,
        "viewport": viewport or {"width": 1440, "height": 900},
    }
    if project_id:
        payload["project_id"] = project_id
    with httpx.Client(timeout=30.0) as client:
        resp = client.post(
            f"{api_url}/tasks",
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
    with httpx.Client(timeout=30.0) as client:
        resp = client.get(
            f"{api_url}/tasks/{task_id}",
            headers=_auth_headers(),
        )
    if resp.status_code >= 400:
        raise QabotError(f"get_task failed: {resp.status_code} {resp.text[:400]}")
    return resp.json()


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
        data = get_task(task_id, api_url=api_url)
        status = (data.get("status") or "").lower()
        if status != last_logged_status:
            if progress_callback:
                progress_callback(status, data)
            last_logged_status = status
        if status in {"done", "completed", "failed", "error"}:
            bugs = data.get("bugs") or []
            return TaskResult(task_id=task_id, status=status, bugs=bugs, raw=data)
        time.sleep(poll_interval)

    raise QabotError(f"task {task_id} did not complete within {timeout}s")
