# wbb-eval

Submit a WBB site to qabot, wait for completion, score reported bugs against the site's `bugs.yaml`.

## Setup

```bash
cd cli
python -m venv .venv && source .venv/bin/activate
pip install -e .
```

## Env

| Var | Required | Default | Purpose |
|---|---|---|---|
| `QABOT_API_URL` | no | `https://qa.vibecrew.space/api` | Backend base URL |
| `QABOT_INTERNAL_SECRET` | **yes** | — | `X-Internal-Secret` header, same as orchestrator uses |
| `WBB_DOMAIN_BASE` | no | `test.vibecrew.space` | Subdomain base for site URLs |

## Run

```bash
wbb-eval run --site ecom-mini       # one site
wbb-eval run --all                  # every site/ folder that has bugs.yaml
```

Results land in `eval/runs/<slug>-<ts>.json` plus an `aggregate-<ts>.json` with mean P/R/F1.
