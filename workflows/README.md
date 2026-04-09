# Workflows — n8n exports

Eksporty workflow z n8n przechowywane w repozytorium: **git** + opcjonalne **snapshoty** w `versions/` (szczegoly: [shared-rules.md sekcja 9](../docs/shared-rules.md)).

**Stan na 2026-04-07:** w repo cztery workflowy zsynchronizowane z lokalną instancją: `cg-ingest-discord`, `cg-hitl-discord-reply`, `cg-orchestrator-main`, `cg-gen-content` (katalogi `ingest/`, `hitl/`, `orchestrator/`, `generate/`). Szczegóły przepływu i otwarte tematy (m.in. Discord input vs feedback): [roadmap.md](../docs/roadmap.md).

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
| `_archive/` | Porzucone / bardzo stare (opcjonalnie) | — |

W kazdym katalogu typu (np. `ingest/`) **glowny** plik `<nazwa>.json` to biezaca wersja (nadpisywana przez `n8n-export.sh`). **Snapshoty** zatwierdzonych wersji przed wiekszymi zmianami: `ingest/versions/<nazwa>/<etykieta>.json` (np. `2026-04-09-approved.json`). Pelna procedura: [shared-rules.md § 9](../docs/shared-rules.md).

## Konwencje

- Nazwy plikow (glowne): `<nazwa-workflow-z-n8n>.json` (kebab-case), jeden na workflow w danym katalogu typu
- Historia: git na glownym pliku; kamienie milowe jako kopie w `versions/<slug>/`
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
