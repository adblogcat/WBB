"""Score one agent run vs one site's ground truth.

A ground-truth bug is "covered" when at least one reported bug matches it.
Precision = covered / total_reported (reported bugs not matching any GT
are counted as false positives).
Recall = covered / total_GT.
F1 = harmonic mean.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from .ground_truth import GroundTruthBug, bug_matches


@dataclass
class ScoreReport:
    site_id: str
    ground_truth_count: int
    reported_count: int
    matched_gt_ids: list[str] = field(default_factory=list)
    unmatched_gt_ids: list[str] = field(default_factory=list)
    false_positive_titles: list[str] = field(default_factory=list)
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
            "precision": round(self.precision, 4),
            "recall": round(self.recall, 4),
            "f1": round(self.f1, 4),
        }


def score(
    site_id: str,
    ground_truth: list[GroundTruthBug],
    reported_bugs: list[dict[str, Any]],
) -> ScoreReport:
    matched_gt_ids: set[str] = set()
    matched_reported_indices: set[int] = set()

    for gt in ground_truth:
        for idx, rep in enumerate(reported_bugs):
            if bug_matches(rep, gt):
                matched_gt_ids.add(gt.id)
                matched_reported_indices.add(idx)
                break  # one match is enough; same reported bug may cover several GTs

    false_positives = [
        str(reported_bugs[i].get("title", "(no title)"))
        for i in range(len(reported_bugs))
        if i not in matched_reported_indices
    ]

    precision = (
        len(matched_reported_indices) / len(reported_bugs)
        if reported_bugs
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
        precision=precision,
        recall=recall,
        f1=f1,
    )
