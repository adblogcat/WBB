#!/usr/bin/env bash
# Create the ghcr-pull image-pull secret in the webbugbench namespace.
# Reads GHCR_USER and GHCR_TOKEN from env (or first two args) so we don't
# bake the PAT into the repo.
set -euo pipefail

USER="${1:-${GHCR_USER:-${GITHUB_ACTOR:-adblogcat}}}"
TOKEN="${2:-${GHCR_TOKEN:?ghcr pull token required (read:packages scope)}}"

# Ensure namespace exists first; idempotent.
kubectl apply -f "$(dirname "$0")/../infra/namespace.yaml"

# Drop and recreate so token rotations actually take effect.
kubectl -n webbugbench delete secret ghcr-pull --ignore-not-found
kubectl -n webbugbench create secret docker-registry ghcr-pull \
  --docker-server=ghcr.io \
  --docker-username="${USER}" \
  --docker-password="${TOKEN}" \
  --docker-email="${USER}@users.noreply.github.com"
echo "[ghcr-secret] ok (user=${USER})"
