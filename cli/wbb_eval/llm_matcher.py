"""LLM-as-matcher: replace brittle keyword regex with semantic judgment.

WBB iter#15.1 retrospective showed the original keyword matcher
(``ground_truth.bug_matches``) was too liberal in one direction and
too brittle in the other:

* Liberal: a long ``actual_result`` text on a meta-bug ("[Judge] scenario
  did not actually pass") containing the words "фильтр" and "год" matched
  three different GT entries that were semantically unrelated, faking
  F1 from 0.0 to 0.857 on the lovable site.

* Brittle: real bugs phrased in user-friendly Russian ("кнопка
  «Подробнее» не открывает детальный вид") never matched any GT
  because the keyword lists couldn't anticipate every wording.

The user pointed out the obvious fix: have an LLM read GT spec + the
reported bug, decide semantically whether they describe the same defect.
Same idea as LLM-as-judge in RAG benchmarks.

Design:

* Single Anthropic API call per (GT, reported) pair, Sonnet 4.6 for
  judgment accuracy. ~50-100 ms per call, ~$0.001 each.
* JSON-only response: {"match": true|false, "reason": "<short>"}.
* In-process cache keyed on (gt_id, reported title+actual) so reruns
  in the same session don't pay twice.
* Fallback: if API key missing, network error, or unparseable response —
  call back into the regex matcher and log the degradation, so a broken
  matcher never silently scores 0.

Env vars:

* ``ANTHROPIC_API_KEY`` — required for LLM mode; absent → regex fallback.
* ``WBB_MATCHER_MODEL`` — model name, defaults to ``claude-sonnet-4-6``.
* ``WBB_MATCHER_DISABLE`` — set to ``1`` to force regex even if API key set
  (useful for offline reruns / unit tests).
"""
from __future__ import annotations

import json
import os
import re
from dataclasses import dataclass
from typing import Any

import httpx
import structlog

from .ground_truth import GroundTruthBug, bug_matches as regex_matches

log = structlog.get_logger(__name__)


_DEFAULT_MODEL = "claude-sonnet-4-6"
_ANTHROPIC_URL = "https://api.anthropic.com/v1/messages"
_ANTHROPIC_VERSION = "2023-06-01"


@dataclass(frozen=True)
class MatchVerdict:
    is_match: bool
    reason: str
    source: str  # "llm" | "regex_fallback" | "regex_disabled"


def _enabled() -> bool:
    if os.environ.get("WBB_MATCHER_DISABLE", "").strip() == "1":
        return False
    return bool(os.environ.get("ANTHROPIC_API_KEY", "").strip())


def _cache_key(gt: GroundTruthBug, reported: dict[str, Any]) -> str:
    title = str(reported.get("title") or "")
    actual = str(reported.get("actual_result") or "")
    return f"{gt.id}::{title[:200]}::{actual[:300]}"


_CACHE: dict[str, MatchVerdict] = {}


def reset_cache() -> None:
    """Clear the in-process verdict cache (for tests)."""
    _CACHE.clear()


def _build_prompt(gt: GroundTruthBug, reported: dict[str, Any]) -> str:
    """Compose the JSON-constrained judgment prompt.

    Both halves are quoted verbatim so the LLM sees exactly what would
    land in the dashboard / spec — no paraphrasing that could change
    meaning. Output is constrained to a single JSON object.
    """
    rep_title = str(reported.get("title") or "(no title)")
    rep_desc = str(reported.get("description") or "")[:600]
    rep_actual = str(reported.get("actual_result") or "")[:600]
    rep_expected = str(reported.get("expected_result") or "")[:300]
    rep_url = str(reported.get("url_at_time") or "")

    return f"""Ты — арбитр в QA-бенчмарке. На вход даны:

(1) ЭТАЛОННЫЙ дефект (ground-truth, известен наперёд):
ID:        {gt.id}
Категория: {gt.category}
Серьёзность: {gt.severity}
Как воспроизвести: {gt.trigger}
Ожидалось: {gt.expected}
Фактически: {gt.actual}

(2) ОТЧЁТ агента о найденном баге:
Заголовок: {rep_title}
URL:       {rep_url}
Описание:  {rep_desc}
Ожидалось: {rep_expected}
Фактически: {rep_actual}

Вопрос: описывают ли (1) и (2) ОДНУ И ТУ ЖЕ проблему?

Критерии для match=true:
* Сценарий воспроизведения совпадает или явно близок.
* Затронут тот же UI-элемент / тот же функциональный путь.
* Симптом совпадает (что именно сломано) даже если formulировка разная.
Парафразы и разные языки (русский/английский, разный регистр) — НЕ повод для no.

Критерии для match=false:
* Разные сценарии / разные баги на странице.
* Слова-совпадения без семантического пересечения.
* Отчёт о другой проблеме на той же странице.
* Мета-сигналы агента о собственном поведении (галлюцинация / провал плана)
  — это НЕ совпадение ни с каким реальным дефектом сайта.

Ответь СТРОГО одним JSON-объектом:
{{"match": true|false, "reason": "одно предложение по-русски"}}
"""


def _call_anthropic(prompt: str) -> dict | None:
    """Single Anthropic call. Returns parsed JSON dict or None on error."""
    api_key = os.environ.get("ANTHROPIC_API_KEY", "").strip()
    if not api_key:
        return None
    model = os.environ.get("WBB_MATCHER_MODEL", _DEFAULT_MODEL).strip() or _DEFAULT_MODEL
    body = {
        "model": model,
        "max_tokens": 200,
        "system": (
            "You are a strict QA bench judge. You output one JSON object only,"
            " no prose around it, no markdown fences."
        ),
        "messages": [{"role": "user", "content": prompt}],
    }
    try:
        with httpx.Client(timeout=60.0) as client:
            resp = client.post(
                _ANTHROPIC_URL,
                json=body,
                headers={
                    "x-api-key": api_key,
                    "anthropic-version": _ANTHROPIC_VERSION,
                    "content-type": "application/json",
                },
            )
    except httpx.HTTPError as exc:
        log.warning("llm_matcher_http_error", error=str(exc))
        return None
    if resp.status_code != 200:
        log.warning(
            "llm_matcher_non200",
            status=resp.status_code,
            body=resp.text[:200],
        )
        return None
    try:
        data = resp.json()
    except ValueError:
        return None
    blocks = data.get("content") or []
    text = ""
    for blk in blocks:
        if isinstance(blk, dict) and blk.get("type") == "text":
            text += blk.get("text") or ""
    text = text.strip()
    if not text:
        return None
    return _extract_json(text)


_JSON_OBJ_RE = re.compile(r"\{[^{}]*\}", re.DOTALL)


def _extract_json(text: str) -> dict | None:
    """Pull first balanced JSON object from LLM text. Tolerates trailing
    prose / leading thinking blocks that some models emit even with the
    strict system prompt."""
    start = text.find("{")
    if start < 0:
        return None
    depth = 0
    for i, ch in enumerate(text[start:], start=start):
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                fragment = text[start:i + 1]
                try:
                    return json.loads(fragment)
                except json.JSONDecodeError:
                    return None
    return None


def llm_bug_matches(reported: dict[str, Any], gt: GroundTruthBug) -> MatchVerdict:
    """Decide whether ``reported`` describes the same defect as ``gt``.

    Caches verdicts in-process. On any LLM failure, falls back to the
    regex matcher and tags the verdict.source for logging.
    """
    if not _enabled():
        verdict = MatchVerdict(
            is_match=regex_matches(reported, gt),
            reason="LLM matcher disabled (ANTHROPIC_API_KEY unset or WBB_MATCHER_DISABLE=1)",
            source="regex_disabled",
        )
        return verdict

    key = _cache_key(gt, reported)
    cached = _CACHE.get(key)
    if cached is not None:
        return cached

    prompt = _build_prompt(gt, reported)
    parsed = _call_anthropic(prompt)
    if not isinstance(parsed, dict) or "match" not in parsed:
        log.warning(
            "llm_matcher_unparseable_falling_back",
            gt_id=gt.id,
            reported_title=str(reported.get("title", ""))[:80],
        )
        verdict = MatchVerdict(
            is_match=regex_matches(reported, gt),
            reason="LLM unparseable, regex fallback",
            source="regex_fallback",
        )
        _CACHE[key] = verdict
        return verdict

    is_match = bool(parsed.get("match"))
    reason = str(parsed.get("reason") or "")[:240]
    verdict = MatchVerdict(is_match=is_match, reason=reason, source="llm")
    _CACHE[key] = verdict
    return verdict
