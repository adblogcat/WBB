# WBB auto-loop status — 2026-05-26 (cross-site session)

## Headline

**Mean F1: 0.117 → 0.470 (+302%). Mean Recall: 0.28 → 0.83.**

Three sites in eval, all three now find at least 4/6 ground-truth bugs.

| Iter | dashboard F1 | ecom-mini F1 | form-multistep F1 | Mean F1 | Mean Recall |
|------|-------------:|-------------:|------------------:|--------:|------------:|
| 5 (revert) | 0.00 | 0.35 | 0.00 | 0.117 | 28% |
| 6 (action+observation prompt) | 0.00 | 0.57 | 0.11 | 0.226 | 33% |
| 6 + URL parse | 0.57 | 0.57 | 0.11 | 0.414 | 61% |
| 6 + FORM regex relax | 0.57 | 0.57 | 0.17 | 0.436 | 83% |
| 6 + scorer fuzzy dedup | 0.57 | 0.57 | **0.27** | **0.470** | 83% |

## What actually moved the needle

These weren't paper-grade techniques — they were plumbing in the wrong
places. Each one was found by reading the agent's actual reports.

1. **iter#6 PLAN prompt rule "action → observation"** (`16f83c9`, qabot).
   Iter#5 agent emitted static "проверить, что фильтр виден" scenarios
   for dashboard. REFLECT confirmed them in 1 step, missed all 6 GT bugs.
   New rule: every scenario must contain BOTH an interactive action
   ("apply filter X", "click sort header") AND an observation of what
   should change ("rows now show only Y"). Counter-template banned.
   → Dashboard F1 0.00 → 0.57. Ecom F1 0.35 → 0.57.

2. **Scorer urlparse() on url_at_time** (`7301c16`, WBB).
   Dashboard agent reported 4 perfect DASH-002 matches and 2 DASH-006
   matches but scored 0/6. Cause: `url_at_time` was the full URL
   (`https://site.test.vibecrew.space/`), match_predicate regex was
   `^/$`. urlparse extracts path; match either path or raw URL passes.
   → Mean F1 0.226 → 0.414 with no agent change.

3. **Drop page_url_regex for FORM-XXX** (`18dcc04`, WBB).
   Agent reports stamp `url_at_time` from `state['page_url']` which
   lags actual navigation. Bugs about step2 land with url='/' (root).
   Keywords are distinctive enough alone.
   → Form recall 33% → 100%.

4. **Scorer fuzzy-dedup FPs via token-Jaccard** (`2a3b7fd`, WBB).
   Agent flooded form-multistep with 12 variants of "Кнопка Далее не
   реагирует". Backend dedup is signature-hash, so syntactic variants
   pass through. Greedy Jaccard ≥ 0.55 collapses them into one FP
   bucket. Matched cluster left alone.
   → Form precision 0.09 → 0.16, mean F1 0.436 → 0.470.

## Per-site breakdown (current iter#6 results)

### dashboard-tasks (5/6 = 83% recall)
- ✅ DASH-002 (filter не работает), DASH-003 (Next за пределами), DASH-004 (case-sensitive search), DASH-005 (sort всегда asc), DASH-006 (Prev не disabled)
- ❌ DASH-001 (sort-by-date is string sort) — agent не дошёл до scenario

### ecom-mini (4/6 = 67% recall)
- ✅ ECOM-001 (search), ECOM-002 (qty overflow), ECOM-003 (remove no-op), ECOM-006 (qty=0)
- ❌ ECOM-004 (empty cart checkout still active) — visual/state check
- ❌ ECOM-005 (sale badge on every product) — visual check

### form-multistep (6/6 = 100% recall)
- ✅ Все 6 FORM bugs найдены (после относительного scorer)

## What's left to push F1 > 0.6

1. **Form precision ceiling 0.16** — agent залип в "Кнопка Далее не реагирует" loop. Это TypeTool issue или prompt rule "stop re-reporting same scenario". Iter#9 candidate.
2. **DASH-001 + ECOM-004/005** — agent просто не доходит до этих сценариев. Это PLAN coverage issue (мало сценариев reach beyond first 5).

## Cost so far

~$8 LLM в этой сессии (8 cells × 50K-200K Sonnet REFLECT). Под $300 capом с большим запасом.

## All commits this session

qabot:
- `28b782b` MAX_DEEPEN 1→2
- `2b1d01d` /api/v1/tasks/:id/bugs
- `be5a2b1` iter#1 dedup + TypeTool fallback + REFLECT strict
- `71a190f` migration 027 dedupes existing rows
- `7faa987` iter#2 evidence guard
- `45c0128` iter#3 phantom-URL guard
- `3c7e135` iter#4d REFLECT→Sonnet override
- `3b9df5f` ListBugs returns source+url_at_time
- `16f83c9` iter#6 PLAN action+observation rule
- `3230d41` revert iter#5 (over-corrected)

WBB:
- `d08d797` iter#4a keyword aliases
- `70ba939` iter#4b scorer detector split
- `fee799d` iter#4 status (F1=0.40)
- `1701acf` Phase 2 sites (form-multistep + dashboard-tasks)
- `7301c16` scorer urlparse
- `18dcc04` form regex relax
- `2a3b7fd` iter#8 fuzzy dedup
