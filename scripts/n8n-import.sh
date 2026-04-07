#!/usr/bin/env bash
# Import a workflow JSON into n8n.
# Usage: bash scripts/n8n-import.sh <path-to-workflow.json>
# Requires N8N_API_KEY and N8N_API_URL in .env (or environment).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <workflow.json>"
  exit 1
fi

WORKFLOW_FILE="$1"

if [[ ! -f "$WORKFLOW_FILE" ]]; then
  echo "Error: file not found: $WORKFLOW_FILE"
  exit 1
fi

# Load .env if present
if [[ -f "$ROOT_DIR/.env" ]]; then
  set -a; source "$ROOT_DIR/.env"; set +a
fi

API_URL="${N8N_API_URL:-http://127.0.0.1:5679}"
API_KEY="${N8N_API_KEY:?Set N8N_API_KEY in .env or environment}"

echo "Importing $WORKFLOW_FILE into $API_URL ..."

response=$(curl -sf -X POST \
  -H "X-N8N-API-KEY: $API_KEY" \
  -H "Content-Type: application/json" \
  -d @"$WORKFLOW_FILE" \
  "$API_URL/api/v1/workflows")

echo "$response" | python3 -c "
import json, sys
wf = json.load(sys.stdin)
print(f\"Imported: {wf.get('name', '?')} (id: {wf.get('id', '?')})\")" 2>/dev/null \
|| echo "$response" | python -c "
import json, sys
wf = json.load(sys.stdin)
print('Imported: %s (id: %s)' % (wf.get('name', '?'), wf.get('id', '?')))"

echo "Done."
