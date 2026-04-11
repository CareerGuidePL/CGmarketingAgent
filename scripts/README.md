# Skrypty CLI

Uruchamiaj z **korzenia repozytorium** (`CG-agent/`), żeby ścieżki względne do `workflows/` i `.env` były poprawne.

## `scripts/n8n/` — workflowy

| Plik | Opis |
|------|------|
| `export.sh` | Eksport wszystkich workflowów z instancji do `workflows/` (`N8N_API_*`). |
| `import.sh` | `POST` jednego pliku JSON jako nowy workflow. |
| `push-workflows.mjs` | `PUT` — aktualizacja istniejących workflowów po `id` w JSON (domyślnie orchestrator, gen-content, ingest). |
| `create-workflows-remote.mjs` | `POST` — **nowa** instancja (pusta baza): tworzy 4 workflowy + mapuje ID subworkflowu w orchestratorze. |
| `delete-execution.mjs` | Usunięcie pojedynczego execution po ID. |

Przykłady:

```bash
bash scripts/n8n/export.sh
bash scripts/n8n/import.sh workflows/ingest/cg-ingest-discord.json
node scripts/n8n/push-workflows.mjs
node scripts/n8n/create-workflows-remote.mjs
node scripts/n8n/delete-execution.mjs <executionId>
```

## `scripts/seatable/` — baza

| Plik | Opis |
|------|------|
| `api.sh` | Helper REST (token z `.env`: `SEATABLE_API_TOKEN`). |

```bash
bash scripts/seatable/api.sh help
bash scripts/seatable/api.sh sql "SELECT job_id, status FROM jobs LIMIT 5"
```

## `scripts/dev/` — łatki i debug

| Plik | Opis |
|------|------|
| `patch-cg-gen-channels.mjs` | Jednorazowa łatka kodu w `cg-gen-content.json` (kanały). |
| `check-n8n-executions.mjs` | Ostatnie wykonania z API. |
| `check-n8n-execution-detail.mjs` | Szczegóły jednego execution. |

```bash
node scripts/dev/patch-cg-gen-channels.mjs
node scripts/dev/check-n8n-executions.mjs
node scripts/dev/check-n8n-execution-detail.mjs <executionId>
```

Pełniejsze zasady eksportu / snapshotów: `docs/shared-rules.md` (sekcja 9).
