#!/usr/bin/env bash
# Deploy / update one WBB site to the cluster.
# Usage: scripts/deploy-site.sh <slug> [image-tag]
set -euo pipefail

SITE_SLUG="${1:?slug required (e.g. ecom-mini)}"
IMAGE_TAG="${2:-latest}"
DOMAIN_BASE="${DOMAIN_BASE:-test.vibecrew.space}"
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

export SITE_SLUG IMAGE_TAG DOMAIN_BASE

echo "[deploy] site=${SITE_SLUG} tag=${IMAGE_TAG} domain=${SITE_SLUG}.${DOMAIN_BASE}"
envsubst < "${REPO_ROOT}/infra/site-template.yaml" | kubectl apply -f -

# Wait for rollout to settle so the caller can immediately point an agent at it.
kubectl -n webbugbench rollout status "deploy/${SITE_SLUG}" --timeout=120s

echo "[deploy] ready: https://${SITE_SLUG}.${DOMAIN_BASE}"
