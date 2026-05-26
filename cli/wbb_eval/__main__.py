"""wbb-eval entrypoint.

Usage:
    python -m wbb_eval run --site ecom-mini
    python -m wbb_eval run --sites store-filters,booking-calendar      # parallel by default
    python -m wbb_eval run --all                                       # parallel by default
    python -m wbb_eval run --all --sequential                          # disable parallelism
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

import yaml

from .ground_truth import load_ground_truth
from .qabot_client import (
    DEFAULT_API_URL,
    QabotError,
    submit_task,
    wait_for_completion,
)
from .scorer import score

REPO_ROOT = Path(__file__).resolve().parents[2]
SITES_DIR = REPO_ROOT / "sites"
DEFAULT_DOMAIN_BASE = os.environ.get("WBB_DOMAIN_BASE", "test.vibecrew.space")
RESULTS_DIR = REPO_ROOT / "eval" / "runs"


def _site_url(slug: str) -> str:
    # Sites with a `site.yaml` containing `url:` override the default
    # `<slug>.test.vibecrew.space` subdomain template. Used for external
    # reference sites (e.g. lovable.app pages) that the user wants pinned
    # into every eval cycle without us having to host them ourselves.
    cfg = SITES_DIR / slug / "site.yaml"
    if cfg.exists():
        try:
            data = yaml.safe_load(cfg.read_text()) or {}
            override = data.get("url")
            if isinstance(override, str) and override.strip():
                return override.strip()
        except yaml.YAMLError:
            pass
    return f"https://{slug}.{DEFAULT_DOMAIN_BASE}"


def _on_progress(status: str, _data) -> None:
    ts = time.strftime("%H:%M:%S")
    print(f"[{ts}] status={status}", flush=True)


def run_one(slug: str, *, api_url: str = DEFAULT_API_URL) -> dict:
    site_dir = SITES_DIR / slug
    gt = load_ground_truth(site_dir)
    url = _site_url(slug)
    print(f"[run] site={slug} url={url} gt_bugs={len(gt)}", flush=True)
    task_id = submit_task(url=url, api_url=api_url)
    print(f"[run] task_id={task_id}", flush=True)
    result = wait_for_completion(
        task_id, api_url=api_url, progress_callback=_on_progress
    )
    print(
        f"[run] done status={result.status} reported_bugs={len(result.bugs)}",
        flush=True,
    )
    rep = score(slug, gt, result.bugs).to_dict()
    rep["task_id"] = task_id
    rep["status"] = result.status
    return rep


def cmd_run(args: argparse.Namespace) -> int:
    if args.all:
        slugs = sorted(
            p.name for p in SITES_DIR.iterdir() if (p / "bugs.yaml").exists()
        )
    elif args.sites:
        # Comma-separated list of slugs, e.g. --sites store-filters,booking-calendar
        slugs = [s.strip() for s in args.sites.split(",") if s.strip()]
        missing = [s for s in slugs if not (SITES_DIR / s / "bugs.yaml").exists()]
        if missing:
            print(f"unknown sites: {missing}", file=sys.stderr)
            return 2
    elif args.site:
        slugs = [args.site]
    else:
        print("--site SLUG or --sites a,b,c or --all required", file=sys.stderr)
        return 2

    RESULTS_DIR.mkdir(parents=True, exist_ok=True)
    reports: list[dict] = []

    def _execute(slug: str) -> dict:
        try:
            return run_one(slug, api_url=args.api_url)
        except QabotError as exc:
            return {
                "site_id": slug,
                "error": str(exc),
                "precision": 0.0,
                "recall": 0.0,
                "f1": 0.0,
            }

    parallel = (not args.sequential) and len(slugs) > 1
    if parallel:
        # Each site is independent — different qabot task, different cell
        # pod. Run them concurrently to shrink wall-clock. The qabot
        # orchestrator has a maxConcurrentJobs=50 cap so 8-10 in flight
        # is well within budget.
        with ThreadPoolExecutor(max_workers=len(slugs)) as pool:
            futures = {pool.submit(_execute, s): s for s in slugs}
            for fut in as_completed(futures):
                rep = fut.result()
                reports.append(rep)
                out = RESULTS_DIR / f"{rep['site_id']}-{int(time.time())}.json"
                out.write_text(json.dumps(rep, indent=2, ensure_ascii=False))
                print(f"[run] saved {out}\n", flush=True)
    else:
        for slug in slugs:
            rep = _execute(slug)
            reports.append(rep)
            out = RESULTS_DIR / f"{slug}-{int(time.time())}.json"
            out.write_text(json.dumps(rep, indent=2, ensure_ascii=False))
            print(f"[run] saved {out}\n", flush=True)

    # Aggregate
    n = len(reports)
    if n > 0:
        agg = {
            "sites": n,
            "mean_precision": round(sum(r.get("precision", 0) for r in reports) / n, 4),
            "mean_recall": round(sum(r.get("recall", 0) for r in reports) / n, 4),
            "mean_f1": round(sum(r.get("f1", 0) for r in reports) / n, 4),
            "per_site": reports,
        }
        agg_path = RESULTS_DIR / f"aggregate-{int(time.time())}.json"
        agg_path.write_text(json.dumps(agg, indent=2, ensure_ascii=False))
        print(
            f"\n[agg] sites={n} mean_f1={agg['mean_f1']} mean_p={agg['mean_precision']} "
            f"mean_r={agg['mean_recall']}",
            flush=True,
        )
        print(f"[agg] saved {agg_path}", flush=True)
    return 0


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(prog="wbb-eval")
    sub = p.add_subparsers(dest="cmd", required=True)

    run = sub.add_parser("run", help="submit a site (or all) to qabot and score")
    run.add_argument("--site", help="single site slug under sites/")
    run.add_argument("--sites", help="comma-separated slugs: --sites store-filters,auth-portal")
    run.add_argument("--all", action="store_true", help="run every site with bugs.yaml")
    run.add_argument(
        "--sequential",
        action="store_true",
        help="force sequential execution (default: parallel when multiple sites)",
    )
    run.add_argument("--api-url", default=DEFAULT_API_URL)
    run.set_defaults(func=cmd_run)

    return p


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    return args.func(args)


if __name__ == "__main__":
    raise SystemExit(main())
