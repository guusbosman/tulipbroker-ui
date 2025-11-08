#!/usr/bin/env bash
set -euo pipefail

# Basic identifiers (override via env vars if needed)
STACK_NAME=${STACK_NAME:-tulipbroker-ui-qa}
PROJECT=${PROJECT:-tulipbroker-ui}
ENVIRONMENT=${ENVIRONMENT:-qa}
REGION=${REGION:-us-east-2}
ASSET_BUCKET=${ASSET_BUCKET:-paperbroker-ui-qa-assets}
DISTRIBUTION_ID=${DISTRIBUTION_ID:-}
DISTRIBUTION_DOMAIN=${DISTRIBUTION_DOMAIN:-tulips-qa.guusbosman.com}

ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
cd "${ROOT_DIR}"

echo "==> Building UI bundle"
if [ ! -d node_modules ]; then
  echo "   - Installing dependencies (npm install)"
  npm install >/dev/null
fi

# Stamp build with UTC timestamp if not already provided
if [ -z "${VITE_UI_BUILD_TIME:-}" ]; then
  export VITE_UI_BUILD_TIME
  VITE_UI_BUILD_TIME=$(date -u +%Y-%m-%dT%H:%M:%SZ)
  echo "   - VITE_UI_BUILD_TIME=${VITE_UI_BUILD_TIME}"
fi

npm run build

if [ ! -d dist ]; then
  echo "Build directory not found (dist/)." >&2
  exit 1
fi

SYNC_PATH="s3://${ASSET_BUCKET}"

echo "==> Syncing dist/ to ${SYNC_PATH}"
aws s3 sync dist/ "${SYNC_PATH}" --delete

echo "==> Sync complete"

if [ -z "${DISTRIBUTION_ID}" ] && [ -n "${DISTRIBUTION_DOMAIN}" ]; then
  echo "==> Resolving CloudFront distribution for ${DISTRIBUTION_DOMAIN}"
  QUERY="DistributionList.Items[?Aliases.Items && contains(@.Aliases.Items, '${DISTRIBUTION_DOMAIN}')].Id | [0]"
  RESOLVED_ID=$(aws cloudfront list-distributions --query "${QUERY}" --output text)
  if [ -n "${RESOLVED_ID}" ] && [ "${RESOLVED_ID}" != "None" ]; then
    DISTRIBUTION_ID="${RESOLVED_ID}"
    echo "   - Found distribution ID ${DISTRIBUTION_ID}"
  else
    echo "   - No distribution found for ${DISTRIBUTION_DOMAIN}; skipping invalidation"
  fi
fi

if [ -n "${DISTRIBUTION_ID}" ]; then
  echo "==> Creating CloudFront invalidation on ${DISTRIBUTION_ID}"
  aws cloudfront create-invalidation \
    --distribution-id "${DISTRIBUTION_ID}" \
    --paths "/*"
else
  echo "==> Skipping CloudFront invalidation (set DISTRIBUTION_ID to enable)"
fi

cat <<SUMMARY

Deployment summary:
  Stack:          ${STACK_NAME}
  Region:         ${REGION}
  Asset bucket:   ${ASSET_BUCKET}
  Distribution:   ${DISTRIBUTION_ID:-<none>}
SUMMARY

echo "==> UI deployment complete ✅"
