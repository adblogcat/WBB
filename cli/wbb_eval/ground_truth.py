"""Load per-site bugs.yaml ground truth + matcher logic."""
from __future__ import annotations

import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import yaml

_SEVERITY_RANK = {"low": 1, "medium": 2, "high": 3, "critical": 4}


@dataclass(frozen=True)
class GroundTruthBug:
    id: str
    category: str
    severity: str
    trigger: str
    expected: str
    actual: str
    match_predicate: dict[str, Any]


def load_ground_truth(site_dir: Path) -> list[GroundTruthBug]:
    path = site_dir / "bugs.yaml"
    if not path.exists():
        raise FileNotFoundError(f"bugs.yaml not found in {site_dir}")
    raw = yaml.safe_load(path.read_text()) or []
    return [
        GroundTruthBug(
            id=item["id"],
            category=item.get("category", "function"),
            severity=item.get("severity", "medium"),
            trigger=item.get("trigger", ""),
            expected=item.get("expected", ""),
            actual=item.get("actual", ""),
            match_predicate=item.get("match_predicate", {}) or {},
        )
        for item in raw
    ]


def bug_matches(reported: dict[str, Any], gt: GroundTruthBug) -> bool:
    """True iff a reported bug covers the ground-truth bug.

    Liberal matching: keyword OR-set + optional URL regex + severity floor.
    Pulls text from common bug fields the qabot frontend uses.
    """
    pred = gt.match_predicate
    haystack = " ".join(
        str(reported.get(k, "") or "")
        for k in (
            "title",
            "description",
            "expected_result",
            "actual_result",
            "category",
        )
    ).lower()
    keywords = [k.lower() for k in (pred.get("keywords_any") or [])]
    if keywords and not any(kw in haystack for kw in keywords):
        return False

    url_regex = pred.get("page_url_regex")
    if url_regex:
        url = str(reported.get("url_at_time") or "")
        try:
            if not re.search(url_regex, url):
                return False
        except re.error:
            pass  # malformed regex — don't fail the match on operator error

    min_sev = pred.get("max_severity_required")
    if min_sev:
        reported_sev = str(reported.get("severity", "low")).lower()
        if _SEVERITY_RANK.get(reported_sev, 0) < _SEVERITY_RANK.get(min_sev.lower(), 0):
            return False

    return True
