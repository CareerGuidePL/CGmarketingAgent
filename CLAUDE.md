# CG Marketing Agent

Projekt automatyzacji marketingowej oparty na n8n workflows.

Roadmap (fazy, iteracje, koszt, **aktualny stan n8n i otwarte problemy**): `docs/roadmap.md`; szkic kontraktu `job`: `docs/job-contract.md`; warianty decyzji (m.in. Discord input vs feedback): `docs/decisions-three-variants.md`.

## Zasady projektu

Wszystkie IDE (Cursor, Claude Code, Windsurf) muszą stosować te same zasady.
Wspólne reguły znajdują się w `docs/shared-rules.md` — **zawsze** stosuj je jako źródło prawdy.

Projektowanie workflowów: **najpierw natywne węzły n8n**, dopiero potem Code / HTTP Request — pełna zasada w `docs/shared-rules.md` (sekcja 1 Architektura).

Eksporty JSON do `workflows/` i snapshoty w `versions/`: **sekcja 9** w `docs/shared-rules.md`.

@docs/shared-rules.md

## MCP: n8n

Serwer MCP `n8n-mcp` jest skonfigurowany w `.mcp.json` (Claude Code), `.cursor/mcp.json` (Cursor) i opisany w `docs/windsurf-mcp-setup.md` (Windsurf — wymaga ręcznej konfiguracji globalnej).

### Źródła wiedzy o n8n (MCP Context7)

Gdy temat dotyczy n8n (workflow, węzły, wyrażenia, API, self-host, community nodes):

1. Wywołaj `resolve-library-id` z `libraryName`: `n8n`
2. Wywołaj `query-docs` z uzyskanym `libraryId` i konkretnym `query`

Preferowane ID bibliotek:

| Priorytet | Library ID | Kiedy |
|-----------|------------|--------|
| 1 | `/websites/n8n_io` | Ogólne docs, integracje, przewodniki |
| 2 | `/n8n-io/n8n-docs` | Struktura repo docs, core/trigger/app nodes |
| 3 | `/llmstxt/n8n_io_llms-full_txt` | Szerokie zapytanie lub brak wyniku w 1-2 |

Nie ufaj wyłącznie pamięci treningowej — **potwierdź w query-docs**.

### n8n-mcp (lokalny serwer)

- Bez `N8N_API_*`: tryb dokumentacji/narzędzi
- Z `N8N_API_URL` + `N8N_API_KEY`: zarządzanie instancją
- Nie commituj kluczy API

### Ustawienia projektu (`.claude/`)

- **`settings.json`** — w repozytorium, wspólne dla zespołu. **Nie umieszczaj tu sekretów** (tokenów API, haseł, `curl` z kluczem w ścieżce). Wywołania z kluczem: `.env` + skrypty w `scripts/n8n/`.
- **`settings.local.json`** — opcjonalne nadpisania tylko u Ciebie (np. dodatkowe `permissions.allow` z konkretnymi ID wierszy SeaTable). Plik jest w **`.gitignore`** — nie trafia na push. Szczegóły: `docs/shared-rules.md` (sekcja 4).

## Workflow: przed push

**ZAWSZE** przed `git push`:
1. Sprawdź spójność zmian (`git diff --stat`)
2. Upewnij się, że `docs/shared-rules.md` jest aktualny jeśli zmieniły się zasady
3. Zsynchronizuj reguły IDE — zaktualizuj `.cursor/rules/`, `CLAUDE.md`, `.windsurf/rules/` oraz ewentualnie `.claude/settings.json` (bez sekretów) jeśli zmieniły się wspólne zasady
4. Sprawdź czy `.env` / klucze API nie są w staged files ani w `.claude/settings.json`

Nazewnictwo branchy i format commitów (inicjały, typy `feat`/`fix`/…): **sekcja 8** w `docs/shared-rules.md`.
