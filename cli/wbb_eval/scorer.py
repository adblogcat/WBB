"""Score one agent run vs one site's ground truth.

A ground-truth bug is "covered" when at least one reported bug matches it.
Precision = covered / total_unique_reported (reported bugs not matching
any GT and not fuzzy-duplicates of other FPs are counted once).
Recall = covered / total_GT.
F1 = harmonic mean.

Detector findings (axe/dom/a11y/console/network from passive scanners)
are excluded from both precision numerator and denominator — they're
legitimate findings of a different class (universal a11y/console
defects) that we surface separately in ``detector_findings_count``.
Including them as FPs would penalize the agent for finding extra
real bugs that just happen to not be on this site's bespoke GT.

Iter#8: scoring-side fuzzy dedup of false positives. The backend
deduplicates by signature_hash (cat + normalised title + url +
component) which silently collapses identical reports, but syntactic
title variations ('Кнопка Далее не реагирует' vs 'Кнопка «Далее»
не реагирует на нажатие') hash differently and produce many rows
the agent meant as one. Without fuzzy dedup precision is dragged by
self-duplication, not by genuine over-reporting.

Dedup rule: token-Jaccard >= 0.55 (case-folded, punctuation stripped,
short stopwords dropped) → fold into a single FP bucket.
"""
from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import Any

from .ground_truth import GroundTruthBug, bug_matches

# Bug ``source`` values produced by passive detectors. The agent's
# scenario LLM path emits ``agent_scenario``; these come from background
# axe / DOM / network probes that are always on.
DETECTOR_SOURCES = frozenset({
    "detector_a11y",
    "detector_dom",
    "detector_console",
    "detector_network",
})


def _is_detector(reported: dict[str, Any]) -> bool:
    src = str(reported.get("source", "") or "").lower()
    if src in DETECTOR_SOURCES:
        return True
    # iter#12: agent's own hallucination-self-detection (added in qabot
    # commit 7b315bc) lands with source='agent_scenario' but
    # provenance.hallucinated=true. Semantically these are diagnostic
    # signals about the agent's own behaviour, not site defects — same
    # category as detector findings. Treat them as detector so they
    # don't drag precision down through self-blame.
    prov = reported.get("provenance") or {}
    if isinstance(prov, dict) and prov.get("hallucinated") is True:
        return True
    title = str(reported.get("title", "") or "").lower()
    if title.startswith("[agent] claimed action"):
        return True
    return False


# Iter#8 fuzzy dedup helpers. Short stopwords (RU + EN) that flood
# titles without carrying semantic weight — dropped before Jaccard.
_FUZZY_STOPWORDS = frozenset({
    "и", "в", "на", "не", "по", "из", "к", "с", "у", "о", "от",
    "а", "the", "a", "to", "of", "in", "on", "for", "is", "at",
    "or", "but", "no", "yes",
})
_FUZZY_TOKEN_RE = re.compile(r"[a-zа-я0-9]+", re.IGNORECASE)
_FUZZY_JACCARD_THRESHOLD = 0.55


def _fuzzy_tokens(text: str) -> set[str]:
    """Tokenise a bug title for fuzzy-similarity comparison."""
    return {
        t.lower()
        for t in _FUZZY_TOKEN_RE.findall(text or "")
        if len(t) >= 3 and t.lower() not in _FUZZY_STOPWORDS
    }


def _fuzzy_dedup_titles(titles: list[str]) -> list[str]:
    """Collapse near-duplicate titles via token-Jaccard >= threshold.

    Greedy single-pass: each new title compared against accepted set;
    if any accepted title has Jaccard >= threshold it's treated as
    the same bug and dropped. Preserves first-seen ordering.
    """
    accepted: list[tuple[str, set[str]]] = []
    out: list[str] = []
    for raw in titles:
        toks = _fuzzy_tokens(raw)
        if not toks:
            out.append(raw)  # empty-token titles pass through
            continue
        is_dup = False
        for _, existing in accepted:
            union = toks | existing
            if not union:
                continue
            jaccard = len(toks & existing) / len(union)
            if jaccard >= _FUZZY_JACCARD_THRESHOLD:
                is_dup = True
                break
        if not is_dup:
            accepted.append((raw, toks))
            out.append(raw)
    return out


@dataclass
class ScoreReport:
    site_id: str
    ground_truth_count: int
    reported_count: int
    matched_gt_ids: list[str] = field(default_factory=list)
    unmatched_gt_ids: list[str] = field(default_factory=list)
    false_positive_titles: list[str] = field(default_factory=list)
    # iter#4b: detector findings reported separately. These are real bugs
    # (axe a11y, broken-link console, missing label) but live outside the
    # site's bespoke ground truth; counting them as FP punishes the agent
    # for finding *more* real defects, not fewer.
    detector_findings_count: int = 0
    detector_findings_titles: list[str] = field(default_factory=list)
    precision: float = 0.0
    recall: float = 0.0
    f1: float = 0.0

    def to_dict(self) -> dict[str, Any]:
        return {
            "site_id": self.site_id,
            "ground_truth_count": self.ground_truth_count,
            "reported_count": self.reported_count,
            "matched_gt_ids": self.matched_gt_ids,
            "unmatched_gt_ids": self.unmatched_gt_ids,
            "false_positive_titles": self.false_positive_titles,
            "detector_findings_count": self.detector_findings_count,
            "detector_findings_titles": self.detector_findings_titles,
            "precision": round(self.precision, 4),
            "recall": round(self.recall, 4),
            "f1": round(self.f1, 4),
        }


def score(
    site_id: str,
    ground_truth: list[GroundTruthBug],
    reported_bugs: list[dict[str, Any]],
) -> ScoreReport:
    # Split detector findings off the scoring set — see module docstring.
    scoring_bugs: list[dict[str, Any]] = []
    detector_bugs: list[dict[str, Any]] = []
    for rep in reported_bugs:
        if _is_detector(rep):
            detector_bugs.append(rep)
        else:
            scoring_bugs.append(rep)

    matched_gt_ids: set[str] = set()
    matched_reported_indices: set[int] = set()

    for gt in ground_truth:
        for idx, rep in enumerate(scoring_bugs):
            if bug_matches(rep, gt):
                matched_gt_ids.add(gt.id)
                matched_reported_indices.add(idx)
                break  # one match is enough; same reported bug may cover several GTs

    raw_false_positives = [
        str(scoring_bugs[i].get("title", "(no title)"))
        for i in range(len(scoring_bugs))
        if i not in matched_reported_indices
    ]
    # Iter#8: collapse fuzzy duplicates among FPs so precision tracks
    # *distinct* over-reports, not pure repetition. The matched bucket
    # is left untouched — one true-positive cluster still counts as one
    # match against ground truth.
    false_positives = _fuzzy_dedup_titles(raw_false_positives)

    unique_scoring_count = len(matched_reported_indices) + len(false_positives)
    precision = (
        len(matched_reported_indices) / unique_scoring_count
        if unique_scoring_count
        else 0.0
    )
    recall = len(matched_gt_ids) / len(ground_truth) if ground_truth else 0.0
    f1 = (
        2 * precision * recall / (precision + recall)
        if (precision + recall) > 0
        else 0.0
    )

    return ScoreReport(
        site_id=site_id,
        ground_truth_count=len(ground_truth),
        reported_count=len(reported_bugs),
        matched_gt_ids=sorted(matched_gt_ids),
        unmatched_gt_ids=sorted({gt.id for gt in ground_truth} - matched_gt_ids),
        false_positive_titles=false_positives,
        detector_findings_count=len(detector_bugs),
        detector_findings_titles=[
            str(b.get("title", "(no title)")) for b in detector_bugs
        ],
        precision=precision,
        recall=recall,
        f1=f1,
    )
