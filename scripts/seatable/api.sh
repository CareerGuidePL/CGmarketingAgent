#!/usr/bin/env bash
# Seatable API helper — reusable functions for CG Marketing Agent base.
# Usage: bash scripts/seatable/api.sh <command> [args]
#
# Requirements: .env with SEATABLE_API_TOKEN (base API token, not account token)
# Docs: https://api.seatable.io/reference
#
# Auth flow (Seatable two-step):
#   1. GET /api/v2.1/dtable/app-access-token/  (Header: Token <BASE_API_TOKEN>)
#      → returns { access_token, dtable_uuid, dtable_server }
#   2. All data ops use: Bearer <access_token>
#      Base URL: <dtable_server>api/v2/dtables/<dtable_uuid>/

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Load .env
if [[ -f "$PROJECT_DIR/.env" ]]; then
  set -a; source "$PROJECT_DIR/.env"; set +a
fi

SEATABLE_SERVER_URL="${SEATABLE_SERVER_URL:-https://cloud.seatable.io}"

# --- Auth ---
_get_access_token() {
  local resp
  resp=$(curl -sf "${SEATABLE_SERVER_URL}/api/v2.1/dtable/app-access-token/" \
    -H "Authorization: Token ${SEATABLE_API_TOKEN}")

  # Parse with node (Windows-compatible: no /dev/stdin)
  eval "$(node -e "
    const r = JSON.parse(process.argv[1]);
    console.log('DTABLE_UUID=' + JSON.stringify(r.dtable_uuid));
    console.log('ACCESS_TOKEN=' + JSON.stringify(r.access_token));
    console.log('DTABLE_SERVER=' + JSON.stringify(r.dtable_server));
  " "$resp")"

  API_BASE="${DTABLE_SERVER}api/v2/dtables/${DTABLE_UUID}"
}

_ensure_auth() {
  if [[ -z "${ACCESS_TOKEN:-}" ]]; then
    _get_access_token
  fi
}

_api() {
  local method="$1" endpoint="$2"
  shift 2
  curl -sf "${API_BASE}${endpoint}" \
    -X "$method" \
    -H "Authorization: Bearer ${ACCESS_TOKEN}" \
    -H "Content-Type: application/json" \
    "$@"
}

# Pretty-print JSON (node, Windows-safe)
_pretty() {
  node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>console.log(JSON.stringify(JSON.parse(d),null,2)))"
}

# --- Commands ---

# List all tables and columns
cmd_tables() {
  _ensure_auth
  _api GET "/metadata/" | node -e "
    let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{
      const m=JSON.parse(d);
      m.metadata.tables.forEach(t=>{
        console.log('\n=== '+t.name+' ===');
        t.columns.forEach(c=>console.log('  '+c.key+'  '+c.type.padEnd(15)+c.name));
      });
    });
  "
}

# List columns for a table (JSON)
cmd_columns() {
  _ensure_auth
  _api GET "/columns/?table_name=$1" | _pretty
}

# List rows from a table (optionally from a view)
# Usage: rows <table> [view]
cmd_rows() {
  local table="$1" view="${2:-}"
  _ensure_auth
  local url="/rows/?table_name=${table}"
  [[ -n "$view" ]] && url="${url}&view_name=${view}"
  _api GET "$url" | _pretty
}

# Insert one row from inline JSON
# Usage: insert <table> '{"col":"val"}'
cmd_insert() {
  local table="$1" row_json="$2"
  _ensure_auth
  _api POST "/rows/" -d "{\"table_name\":\"${table}\",\"rows\":[${row_json}]}" | _pretty
}

# Insert rows from a JSON file (array of row objects)
# Usage: insert-file <table> <path.json>
cmd_insert_file() {
  local table="$1" file="$2"
  _ensure_auth
  local rows
  rows=$(cat "$file")
  _api POST "/rows/" -d "{\"table_name\":\"${table}\",\"rows\":${rows}}" | _pretty
}

# Update a row
# Usage: update <table> <row_id> '{"col":"val"}'
cmd_update() {
  local table="$1" row_id="$2" updates="$3"
  _ensure_auth
  _api PUT "/rows/" -d "{\"table_name\":\"${table}\",\"rows\":[{\"row_id\":\"${row_id}\",\"row\":${updates}}]}" | _pretty
}

# Delete a row
# Usage: delete <table> <row_id>
cmd_delete() {
  local table="$1" row_id="$2"
  _ensure_auth
  _api DELETE "/rows/" -d "{\"table_name\":\"${table}\",\"row_ids\":[\"${row_id}\"]}" | _pretty
}

# Run SQL query
# Usage: sql "SELECT * FROM jobs WHERE status='ingested' LIMIT 5"
cmd_sql() {
  _ensure_auth
  _api POST "/sql/" -d "{\"sql\":\"$1\"}" | _pretty
}

# Create a table
# Usage: create-table <name> '<columns_json>'
# Example: create-table my_table '[{"column_name":"name","column_type":"text"}]'
cmd_create_table() {
  local name="$1" cols="$2"
  _ensure_auth
  _api POST "/tables/" -d "{\"table_name\":\"${name}\",\"columns\":${cols}}" | _pretty
}

# Get auth info (for debugging)
cmd_auth() {
  _ensure_auth
  echo "DTABLE_UUID=$DTABLE_UUID"
  echo "API_BASE=$API_BASE"
  echo "TOKEN=${ACCESS_TOKEN:0:20}..."
}

# --- Main ---
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  cmd="${1:-help}"
  shift || true
  case "$cmd" in
    tables)       cmd_tables "$@" ;;
    columns)      cmd_columns "$@" ;;
    rows)         cmd_rows "$@" ;;
    insert)       cmd_insert "$@" ;;
    insert-file)  cmd_insert_file "$@" ;;
    update)       cmd_update "$@" ;;
    delete)       cmd_delete "$@" ;;
    sql)          cmd_sql "$@" ;;
    create-table) cmd_create_table "$@" ;;
    auth)         cmd_auth "$@" ;;
    help|*)
      echo "Seatable API helper for CG Marketing Agent"
      echo ""
      echo "Usage: bash scripts/seatable/api.sh <command> [args]"
      echo ""
      echo "Commands:"
      echo "  auth                              Show auth info (debug)"
      echo "  tables                            List all tables and columns"
      echo "  columns <table>                   List columns (JSON)"
      echo "  rows <table> [view]               List rows (optionally from view)"
      echo "  insert <table> '<json>'           Insert one row"
      echo "  insert-file <table> <file.json>   Insert rows from JSON array file"
      echo "  update <table> <row_id> '<json>'  Update a row"
      echo "  delete <table> <row_id>           Delete a row"
      echo "  sql '<query>'                     Run SQL query"
      echo "  create-table <name> '<cols_json>' Create a new table"
      ;;
  esac
fi
