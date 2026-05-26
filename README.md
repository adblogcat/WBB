# WebBugBench

Reproducible benchmark for AI QA agents. Each site has a known bug catalog with machine-checkable acceptance criteria, so agent runs can be scored with Precision / Recall / F1 against ground truth.

## Layout

```
sites/        one folder per site, each a self-contained Next.js app with intentionally planted bugs
infra/        k8s manifests (namespace, ingress, cert-manager issuer, per-site deployment template)
cli/          wbb-eval — Python CLI to submit a site to qabot and fetch the bug report
eval/         scorer that matches agent-found bugs to ground-truth via acceptance predicates
docs/         site briefs (the natural-language scenarios fed to agents)
scripts/      build, deploy, dev helpers
```

## Domain

All sites are reachable at `<slug>.test.vibecrew.space` (wildcard A-record points at the cluster ingress LB).

## Ground truth format

Each site ships a `bugs.yaml` next to its source. Schema:

```yaml
- id: ECOM-001
  category: function | visual | usability | data | edge
  severity: low | medium | high | critical
  trigger: "click Buy Now with empty cart"
  expected: "error 'Add items to cart' shown"
  actual: "page reloads silently"
  match_predicate:
    keywords_any: ["empty cart", "пустая корзина", "add items"]
    page_url_regex: "/cart"            # optional
    max_severity_required: low         # accept any bug of this severity or higher
```

The evaluator considers an agent-reported bug to "cover" a ground-truth bug when **any** of the keyword aliases appears in the bug title or description AND the page URL matches the regex (if set) AND the reported severity is >= `max_severity_required`.

## Running an eval

```bash
cli/wbb-eval run --site ecom-mini
cli/wbb-eval run --all
```

See `cli/README.md` for full options.
