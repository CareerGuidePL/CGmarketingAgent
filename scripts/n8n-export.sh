#!/usr/bin/env bash
# Export all n8n workflows to workflows/ directory.
# Requires N8N_API_KEY and N8N_API_URL in .env (or environment).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

# Load .env if present
if [[ -f "$ROOT_DIR/.env" ]]; then
  set -a; source "$ROOT_DIR/.env"; set +a
fi

API_URL="${N8N_API_URL:-http://127.0.0.1:5679}"
API_KEY="${N8N_API_KEY:?Set N8N_API_KEY in .env or environment}"

WORKFLOWS_DIR="$ROOT_DIR/workflows"

# Map n8n workflow name prefix -> subdirectory
resolve_dir() {
  local name="$1"
  case "$name" in
    cg-ingest-*|*ingest*)       echo "ingest" ;;
    cg-orchestrator-*|*orchest*) echo "orchestrator" ;;
    cg-hitl-*|*hitl*|*human*)   echo "hitl" ;;
    cg-gen-*|*generat*)         echo "generate" ;;
    cg-distribute-*|*distrib*)  echo "distribute" ;;
    cg-store-*|*store*|*asset*) echo "store" ;;
    cg-memory-*|*memory*)       echo "memory" ;;
    cg-scheduler-*|*schedul*)   echo "scheduler" ;;
    cg-analytics-*|*analyt*)    echo "analytics" ;;
    *)                          echo "." ;;
  esac
}

echo "Fetching workflow list from $API_URL ..."
response=$(curl -sf -H "X-N8N-API-KEY: $API_KEY" "$API_URL/api/v1/workflows?limit=250")

# Parse with python (available on most systems)
echo "$response" | python3 -c "
import json, sys, subprocess, os, re

data = json.load(sys.stdin)
workflows = data.get('data', data) if isinstance(data, dict) else data

api_url = '$API_URL'
api_key = '$API_KEY'
workflows_dir = '$WORKFLOWS_DIR'
count = 0

for wf in workflows:
    wf_id = wf['id']
    wf_name = wf.get('name', f'workflow-{wf_id}')

    # Fetch full workflow
    import urllib.request
    req = urllib.request.Request(
        f'{api_url}/api/v1/workflows/{wf_id}',
        headers={'X-N8N-API-KEY': api_key}
    )
    with urllib.request.urlopen(req) as resp:
        full_wf = json.loads(resp.read())

    # Remove credential values (keep references only)
    for node in full_wf.get('nodes', []):
        if 'credentials' in node:
            for cred_type, cred_data in node['credentials'].items():
                if isinstance(cred_data, dict):
                    # Keep only id and name, remove any sensitive fields
                    node['credentials'][cred_type] = {
                        k: v for k, v in cred_data.items()
                        if k in ('id', 'name')
                    }

    # Determine subdirectory
    slug = re.sub(r'[^a-z0-9]+', '-', wf_name.lower()).strip('-')
" 2>/dev/null || python -c "
import json, sys, re, os
try:
    from urllib.request import Request, urlopen
except ImportError:
    from urllib2 import Request, urlopen

data = json.load(sys.stdin)
workflows = data.get('data', data) if isinstance(data, dict) else data

api_url = '$API_URL'
api_key = '$API_KEY'
workflows_dir = '$WORKFLOWS_DIR'
count = 0

for wf in workflows:
    wf_id = str(wf['id'])
    wf_name = wf.get('name', 'workflow-' + wf_id)

    req = Request(
        api_url + '/api/v1/workflows/' + wf_id,
        headers={'X-N8N-API-KEY': api_key}
    )
    resp = urlopen(req)
    full_wf = json.loads(resp.read())

    # Strip credential secrets
    for node in full_wf.get('nodes', []):
        if 'credentials' in node:
            for cred_type in list(node['credentials'].keys()):
                cred_data = node['credentials'][cred_type]
                if isinstance(cred_data, dict):
                    node['credentials'][cred_type] = {
                        k: v for k, v in cred_data.items()
                        if k in ('id', 'name')
                    }

    slug = re.sub(r'[^a-z0-9]+', '-', wf_name.lower()).strip('-')

    # Resolve directory
    name_lower = wf_name.lower()
    if 'ingest' in name_lower:
        subdir = 'ingest'
    elif 'orchestrat' in name_lower:
        subdir = 'orchestrator'
    elif 'hitl' in name_lower or 'human' in name_lower:
        subdir = 'hitl'
    elif 'gen' in name_lower and ('content' in name_lower or 'prompt' in name_lower):
        subdir = 'generate'
    elif 'distribut' in name_lower:
        subdir = 'distribute'
    elif 'store' in name_lower or 'asset' in name_lower:
        subdir = 'store'
    elif 'memory' in name_lower:
        subdir = 'memory'
    elif 'schedul' in name_lower:
        subdir = 'scheduler'
    elif 'analyt' in name_lower:
        subdir = 'analytics'
    else:
        subdir = '.'

    out_dir = os.path.join(workflows_dir, subdir)
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, slug + '.json')

    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(full_wf, f, indent=2, ensure_ascii=False)

    count += 1
    print('  exported: ' + subdir + '/' + slug + '.json')

print(str(count) + ' workflow(s) exported.')
" <<< "$response"

echo "Done."
