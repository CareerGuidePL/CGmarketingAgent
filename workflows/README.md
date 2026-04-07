# Workflows — n8n exports

Eksporty workflow z n8n przechowywane w repozytorium (wersjonowanie przez git).

## Struktura katalogów

| Katalog | Zakres | Prefiks nazw w n8n |
|---------|--------|--------------------|
| `ingest/` | Wejscia: Discord, Mail -> job | `cg-ingest-*` |
| `orchestrator/` | Routing, glowna logika | `cg-orchestrator-*` |
| `hitl/` | Human in the Loop — zatwierdzenia | `cg-hitl-*` |
| `generate/` | Generacja tresci (AI, HTCI) | `cg-gen-*` |
| `distribute/` | Publikacja na kanaly social | `cg-distribute-*` |
| `store/` | Assety, Drive, Seatable | `cg-store-*` |
| `memory/` | Pamiec operacyjna | `cg-memory-*` |
| `scheduler/` | Planowanie, kalendarz | `cg-scheduler-*` |
| `analytics/` | Statystyki, raporty | `cg-analytics-*` |
| `_archive/` | Stare wersje (opcjonalnie) | — |

## Konwencje

- Nazwy plikow: `<nazwa-workflow-z-n8n>.json` (kebab-case)
- Wersjonowanie: przez git — kazdy eksport = commit z opisem zmian
- Nie numeruj wersji w nazwach plikow (historia git wystarczy)
- **Nie eksportuj credentiali** — workflow JSON nie powinien zawierac sekretow

## Eksport / import

### Eksport wszystkich workflow (wymaga N8N_API_KEY w .env)

```bash
bash scripts/n8n-export.sh
```

### Eksport reczny (pojedynczy workflow)

W n8n: workflow -> menu (...) -> Download

Zapisz plik w odpowiednim katalogu wg typu.

### Import

W n8n: gorny pasek -> Import from file -> wybierz JSON z odpowiedniego katalogu.

Lub przez API:

```bash
bash scripts/n8n-import.sh workflows/ingest/cg-ingest-discord.json
```
