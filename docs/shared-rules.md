# Wspolne zasady projektu — CG Marketing Agent

> Ten plik jest jedynym zrodlem prawdy dla zasad projektu.
> Wszystkie IDE (Cursor, Claude Code, Windsurf) musza go stosowac.
> Aktualizuj ten plik ZAWSZE gdy zmieniaja sie zasady projektu.

## 1. Architektura

- Projekt automatyzacji marketingowej oparty na n8n workflows
- Roadmap (fazy, iteracje, koszt, kontrakt `job`): `docs/roadmap.md`; szkic kontraktu `job`: `docs/job-contract.md`
- Diagramy architektury: `docs/agent.excalidraw`
- Konfiguracja MCP n8n dostepna we wszystkich IDE (patrz sekcja MCP ponizej)
- **Węzły w workflowach:** w pierwszej kolejności używaj **natywnych** węzłów n8n (built-in / app nodes dla danej usługi lub operacji). Węzły **Code** lub **HTTP Request** stosuj dopiero gdy odpowiedniego natywnego węzła nie ma albo nie spełnia on wymagań (np. brak operacji w integracji, nietypowy kontrakt API).

## 2. Jezyk i styl

- Dokumentacja projektu: polski
- Kod i komentarze w kodzie: angielski
- Nazwy plikow: kebab-case
- Wiadomosci commitow i nazwy branchy: patrz **sekcja 8** (Git)

## 3. MCP: n8n

### Zrodla wiedzy (Context7)

Gdy temat dotyczy n8n — ZAWSZE sprawdzaj dokumentacje przez MCP zanim podasz szczegoly techniczne:

1. `resolve-library-id` z `libraryName`: `n8n`
2. `query-docs` z uzyskanym `libraryId`

Preferowane biblioteki (w kolejnosci priorytetu):
- `/websites/n8n_io` — ogolne docs, integracje
- `/n8n-io/n8n-docs` — repo docs, core/trigger/app nodes
- `/llmstxt/n8n_io_llms-full_txt` — szerokie zapytania, fallback

### Serwer n8n-mcp

- Bez `N8N_API_*`: tryb dokumentacji
- Z `N8N_API_URL` + `N8N_API_KEY`: zarzadzanie instancja
- NIGDY nie commituj kluczy API

### Konfiguracja per IDE

| IDE | Plik MCP | Typ |
|-----|----------|-----|
| Cursor | `.cursor/mcp.json` | project-level |
| Claude Code | `.mcp.json` | project-level |
| Windsurf | `~/.codeium/windsurf/mcp_config.json` | user-level (globalny) |

Instrukcja Windsurf: `docs/windsurf-mcp-setup.md`

## 4. Bezpieczenstwo

- `.env`, `.env.local`, `.env.*.local` — NIGDY nie commituj
- Klucze API trzymaj w zmiennych srodowiskowych lub `.env` (gitignored)
- Przed kazdy push sprawdz `git diff --cached` pod katem sekretow
- **Claude Code:** `.claude/settings.json` jest w repo — **bez tokenów, haseł i literałów kluczy API** (np. nie wklejaj `curl ... X-N8N-API-KEY: eyJ...`). Używaj `scripts/n8n/delete-execution.mjs` i `.env`. Osobiste / jednorazowe reguły `permissions` (np. Bash z konkretnym `row_id`) trzymaj w **`.claude/settings.local.json`** (plik **gitignored**).

## 5. Workflow: przed push

**OBOWIAZKOWE** przed kazdym `git push`:

1. `git diff --stat` — sprawdz spójność zmian
2. Jesli zmienily sie zasady projektu — zaktualizuj `docs/shared-rules.md`
3. Zsynchronizuj reguly IDE:
   - `.cursor/rules/n8n-mcp-docs.mdc`
   - `CLAUDE.md`
   - `.windsurf/rules/n8n-mcp-docs.md`
4. Sprawdz czy `.env` / klucze API NIE sa w staged files (`git diff --cached --name-only | grep -i env`)
5. Jesli zmieniasz `.claude/settings.json` — upewnij sie, ze w staged diff **nie ma** JWT, dlugich losowych kluczy ani `Authorization: Bearer` z wartoscia
6. Upewnij sie ze `.gitignore` jest aktualny

## 6. Synchronizacja regul miedzy IDE

Gdy zmienisz zasady w jednym IDE:
1. Zaktualizuj NAJPIERW `docs/shared-rules.md`
2. Nastepnie zaktualizuj reguly w KAZDYM IDE:
   - **Cursor**: `.cursor/rules/n8n-mcp-docs.mdc`
   - **Claude Code**: `CLAUDE.md` oraz wspoldzielone uprawnienia w `.claude/settings.json` (bez sekretow)
   - **Windsurf**: `.windsurf/rules/n8n-mcp-docs.md`
3. Dodaj zmiany do jednego commita

## 7. Struktura plikow konfiguracyjnych

```
.cursor/
  mcp.json                    # MCP config (Cursor) — gitignored, skopiuj z mcp.json.example
  mcp.json.example            # Szablon MCP config (bez sekretow)
  rules/
    n8n-mcp-docs.mdc          # Reguly Cursor
.claude/
  settings.json               # Claude Code — uprawnienia wspoldzielone (bez sekretow)
  settings.local.json         # Opcjonalne nadpisania lokalne — gitignored
.windsurf/
  rules/
    n8n-mcp-docs.md           # Reguly Windsurf
.mcp.json                     # MCP config (Claude Code) — gitignored, skopiuj z .mcp.json.example
.mcp.json.example             # Szablon MCP config (bez sekretow)
CLAUDE.md                     # Reguly Claude Code
docs/
  shared-rules.md             # ZRODLO PRAWDY — wspolne zasady
  roadmap.md                  # Roadmap projektu (fazy, iteracje)
  windsurf-mcp-setup.md       # Instrukcja MCP dla Windsurf
  agent.excalidraw            # Diagram architektury
.env.example                  # Szablon zmiennych srodowiskowych
docker-compose.yml            # Lokalny n8n (Docker)
.gitignore                    # Ignorowane pliki
scripts/
  README.md                   # Indeks skryptow CLI
  n8n/                        # export, import, push-workflows, delete-execution
  seatable/                   # api.sh (REST)
  dev/                        # patch, debug n8n API
workflows/                    # Eksporty workflow JSON (git + snapshoty w versions/)
  ingest/                     # cg-ingest-* (+ opcjonalnie versions/<slug>/)
  orchestrator/               # cg-orchestrator-*
  hitl/                       # cg-hitl-*
  generate/                   # cg-gen-*
  distribute/                 # cg-distribute-*
  store/                      # cg-store-*
  memory/                     # cg-memory-*
  scheduler/                  # cg-scheduler-*
  analytics/                  # cg-analytics-*
  _archive/                   # Porzucone linie / bardzo stare (opcjonalnie)
```

## 9. Wersjonowanie workflow n8n

### 9.1 Plik biezacy (eksport)

- Jeden workflow = **jeden plik** w katalogu typu: `workflows/<typ>/<nazwa-workflow-z-n8n>.json` (kebab-case), np. `workflows/ingest/cg-ingest-discord.json`.
- To jest **biezaca wersja** — `scripts/n8n/export.sh` **nadpisuje** ten plik przy eksporcie z instancji.
- Historia drobnych zmian: **Git** (diff, revert).

### 9.2 Snapshoty w katalogu typu (`versions/`)

Gdy wersja jest **zatwierdzona** (review, dziala na stagingu / produkcji) i zaczynasz **nowa funkcjonalnosc albo duza przebudowe**:

1. Upewnij sie, ze `workflows/<typ>/<slug>.json` odzwierciedla te zatwierdzona wersje (eksport z n8n jesli trzeba).
2. Skopiuj ten plik do:
   `workflows/<typ>/versions/<slug>/<etykieta>.json`
   — `<slug>` = ta sama baza nazwy co plik bez `.json` (np. `cg-ingest-discord`).
3. **Commit** snapshotu (np. `chore: snapshot cg-ingest-discord approved 2026-04-09`).
4. Potem pracuj w n8n dalej; kolejne eksporty znowu aktualizuja wylacznie **glowny** `<slug>.json` w `workflows/<typ>/`.

**Etykiety** (jeden spojny styl w zespole):

- `YYYY-MM-DD-approved` — data zatwierdzenia
- `v1`, `v2` — kamienie milowe
- `pre-<krotki-opis>` — np. `pre-orchestrator-split`

**Nie** trzymaj rownoleglych wersji jako wielu plikow **w rootcie** `workflows/<typ>/` (np. `foo-v1.json`, `foo-v2.json`) — koliduje z eksportem skryptem i z konwencja jeden workflow = jeden glowny plik.

Opcjonalnie bardzo stare lub porzucone linie rozwoju przenos do `workflows/_archive/`.

### 9.3 n8n: kopia robocza

- Domyslnie edytujesz **ten sam** workflow w n8n; przywrocenie = Git albo import z `versions/<slug>/...`.
- Gdy musisz **rownolegle** trzymac stara aktywna wersje w n8n: **Duplicate workflow** z tymczasowa nazwa (np. suffix `-wip`), po ustabilizowaniu scal nazewnictwo z powrotem do jednego workflowu i jednego pliku glownego w repo.

### 9.4 Eksport credentiali i import

- **Nie eksportuj wartosci credentiali** — `scripts/n8n/export.sh` usuwa sekrety (zostaja referencje).
- Import na nowej instancji: `scripts/n8n/import.sh <plik.json>` lub reczny import w n8n UI.
- Po kazdej istotnej zmianie workflow: eksport + commit glownego pliku; snapshot w `versions/` tylko przy **kamieniach milowych** (jak wyzej).

## 8. Git: branchy i commity

Zasady spojne z dobrymi praktykami: **jeden branch = jedna spojna funkcjonalnosc** (albo jeden logiczny fix/refactor), **inicjaly osoby odpowiedzialnej** widoczne w nazwie brancha i w pierwszej linii commita.

### 8.1 Nazewnictwo branchy

Format:

`<typ>/<krotki-opis-kebab-case>-<INICJALY>`

- **typ** — zakres zmian (Conventional Commits):
  - `feat` — nowa funkcjonalnosc
  - `fix` — naprawa bledu
  - `docs` — tylko dokumentacja
  - `chore` — narzedzia, konfiguracja, zaleznosci bez zmiany logiki biznesowej
  - `refactor` — przebudowa kodu bez zmiany zachowania
  - `test` — testy
- **opis** — jedno zdanie w kebab-case; konkretny, bez ogolnikow
- **INICJALY** — na **koncu** nazwy brancha, **2–4 wielkie litery** (np. `MS`, `AB`), ta sama osoba co w commitach na tym branchu

Przyklady: `feat/add-discord-ingest-MS`, `fix/n8n-credential-timeout-AB`, `docs/roadmap-phase-2-MS`.

Zasady:

- Nie lacz na jednym branchu niepowiazanych tematow (np. nowy workflow + poprawka README w tym samym PR — rozdziel).
- Bazuj na aktualnym `main` (lub ustalonej galezi deweloperskiej); przed merge zdejmij konflikty lokalnie.
- Nie commituj na `main` bezposrednio — praca na branchu + merge (PR lub lokalny merge po review zespolu).

### 8.2 Wiadomosci commitow

- Jezyk: **angielski**, forma rozkazujaca (np. `add`, `fix`, `update`, `remove`).
- Pierwsza linia (subject): **`[INICJALY] typ: krotki opis`** — te same inicjaly co w nazwie brancha (**wielkie litery** w nawiasach kwadratowych).
- `typ` jak w sekcji 8.1 (feat, fix, docs, chore, refactor, test).
- Maks. ok. 72 znaki w pierwszej linii; opcjonalnie druga linia pusta, potem body z uzasadnieniem / linkiem do zadania.

Przyklady:

- `[MS] feat: add Slack notification on workflow error`
- `[AB] fix: handle empty payload in webhook trigger`

Wiele commitow na jednym branchu: kazdy commit powinien byc **atomowy** (jedna logiczna zmiana), zeby sensownie dalo sie robic `revert` i czytac historie.

### 8.3 Przed push (uzupełnienie sekcji 5)

- Upewnij sie, ze nazwa brancha (inicjaly na koncu, wielkie litery) i prefiksy `[INICJALY]` w commitach sa spojne z osoba odpowiedzialna za zmiane.
