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

# Parse and export with node (cross-platform)
export N8N_EXPORT_API_URL="$API_URL"
export N8N_EXPORT_API_KEY="$API_KEY"
export N8N_EXPORT_WORKFLOWS_DIR="$WORKFLOWS_DIR"

echo "$response" | node -e "
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const apiUrl = process.env.N8N_EXPORT_API_URL;
const apiKey = process.env.N8N_EXPORT_API_KEY;
const workflowsDir = path.resolve(process.env.N8N_EXPORT_WORKFLOWS_DIR);

function resolveDir(name) {
  const n = name.toLowerCase();
  if (n.includes('ingest')) return 'ingest';
  if (n.includes('orchestrat')) return 'orchestrator';
  if (n.includes('hitl') || n.includes('human')) return 'hitl';
  if (n.includes('gen') && (n.includes('content') || n.includes('prompt'))) return 'generate';
  if (n.includes('distribut')) return 'distribute';
  if (n.includes('store') || n.includes('asset')) return 'store';
  if (n.includes('memory')) return 'memory';
  if (n.includes('schedul')) return 'scheduler';
  if (n.includes('analyt')) return 'analytics';
  return '.';
}

function fetchWorkflow(id) {
  return new Promise((resolve, reject) => {
    const url = new URL(apiUrl + '/api/v1/workflows/' + id);
    const mod = url.protocol === 'https:' ? https : http;
    mod.get(url, { headers: { 'X-N8N-API-KEY': apiKey } }, res => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => resolve(JSON.parse(body)));
    }).on('error', reject);
  });
}

(async () => {
  let input = '';
  for await (const chunk of process.stdin) input += chunk;
  const data = JSON.parse(input);
  const workflows = data.data || data;
  let count = 0;

  for (const wf of workflows) {
    const full = await fetchWorkflow(wf.id);
    // Strip credential secrets
    for (const node of (full.nodes || [])) {
      if (node.credentials) {
        for (const [type, cred] of Object.entries(node.credentials)) {
          if (typeof cred === 'object' && cred !== null) {
            node.credentials[type] = { id: cred.id, name: cred.name };
          }
        }
      }
    }
    const slug = wf.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const subdir = resolveDir(wf.name);
    const outDir = path.join(workflowsDir, subdir);
    fs.mkdirSync(outDir, { recursive: true });
    const outPath = path.join(outDir, slug + '.json');
    fs.writeFileSync(outPath, JSON.stringify(full, null, 2), 'utf-8');
    count++;
    console.log('  exported: ' + subdir + '/' + slug + '.json');
  }
  console.log(count + ' workflow(s) exported.');
})();
"

echo "Done."
