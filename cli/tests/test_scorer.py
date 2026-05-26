"""Smoke tests for the scorer: keyword matching, URL regex, severity floor."""
from __future__ import annotations

from wbb_eval.ground_truth import GroundTruthBug
from wbb_eval.scorer import score


def _gt(**overrides):
    base = dict(
        id="X-1",
        category="function",
        severity="medium",
        trigger="",
        expected="",
        actual="",
        match_predicate={"keywords_any": ["search", "поиск"]},
    )
    base.update(overrides)
    return GroundTruthBug(**base)


def test_keyword_match_hits_title_or_description():
    gt = [_gt()]
    reported = [{"title": "Search returns empty results", "description": "...", "url_at_time": ""}]
    rep = score("s1", gt, reported)
    assert rep.matched_gt_ids == ["X-1"]
    assert rep.recall == 1.0
    assert rep.precision == 1.0
    assert rep.f1 == 1.0


def test_url_regex_required_when_set():
    gt = [_gt(match_predicate={"keywords_any": ["cart"], "page_url_regex": "/cart$"})]
    miss = [{"title": "cart issue", "description": "", "url_at_time": "/home"}]
    hit = [{"title": "cart issue", "description": "", "url_at_time": "/cart"}]
    assert score("s1", gt, miss).recall == 0.0
    assert score("s1", gt, hit).recall == 1.0


def test_severity_floor_blocks_low_reports():
    gt = [_gt(match_predicate={
        "keywords_any": ["сумм", "total"],
        "max_severity_required": "high",
    })]
    weak = [{"title": "total mismatch", "severity": "low", "url_at_time": ""}]
    strong = [{"title": "total mismatch", "severity": "critical", "url_at_time": ""}]
    assert score("s1", gt, weak).recall == 0.0
    assert score("s1", gt, strong).recall == 1.0


def test_unmatched_reported_bugs_count_as_false_positives():
    gt = [_gt()]
    reported = [
        {"title": "search broken", "description": "", "url_at_time": ""},  # matches
        {"title": "unrelated noise", "description": "", "url_at_time": ""},  # FP
    ]
    rep = score("s1", gt, reported)
    assert rep.precision == 0.5
    assert rep.false_positive_titles == ["unrelated noise"]


def test_empty_inputs_zero_metrics():
    rep = score("s1", [], [])
    assert rep.precision == 0.0
    assert rep.recall == 0.0
    assert rep.f1 == 0.0
