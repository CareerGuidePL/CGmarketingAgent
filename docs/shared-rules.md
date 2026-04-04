# Wspolne zasady projektu — CG Marketing Agent

> Ten plik jest jedynym zrodlem prawdy dla zasad projektu.
> Wszystkie IDE (Cursor, Claude Code, Windsurf) musza go stosowac.
> Aktualizuj ten plik ZAWSZE gdy zmieniaja sie zasady projektu.

## 1. Architektura

- Projekt automatyzacji marketingowej oparty na n8n workflows
- Roadmap (fazy, iteracje, koszt, kontrakt `job`): `docs/roadmap.md`
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

## 5. Workflow: przed push

**OBOWIAZKOWE** przed kazdym `git push`:

1. `git diff --stat` — sprawdz spójność zmian
2. Jesli zmienily sie zasady projektu — zaktualizuj `docs/shared-rules.md`
3. Zsynchronizuj reguly IDE:
   - `.cursor/rules/n8n-mcp-docs.mdc`
   - `CLAUDE.md`
   - `.windsurf/rules/n8n-mcp-docs.md`
4. Sprawdz czy `.env` / klucze API NIE sa w staged files (`git diff --cached --name-only | grep -i env`)
5. Upewnij sie ze `.gitignore` jest aktualny

## 6. Synchronizacja regul miedzy IDE

Gdy zmienisz zasady w jednym IDE:
1. Zaktualizuj NAJPIERW `docs/shared-rules.md`
2. Nastepnie zaktualizuj reguly w KAZDYM IDE:
   - **Cursor**: `.cursor/rules/n8n-mcp-docs.mdc`
   - **Claude Code**: `CLAUDE.md`
   - **Windsurf**: `.windsurf/rules/n8n-mcp-docs.md`
3. Dodaj zmiany do jednego commita

## 7. Struktura plikow konfiguracyjnych

```
.cursor/
  mcp.json                    # MCP config (Cursor)
  rules/
    n8n-mcp-docs.mdc          # Reguly Cursor
.windsurf/
  rules/
    n8n-mcp-docs.md           # Reguly Windsurf
.mcp.json                     # MCP config (Claude Code)
CLAUDE.md                     # Reguly Claude Code
docs/
  shared-rules.md             # ZRODLO PRAWDY — wspolne zasady
  roadmap.md                  # Roadmap projektu (fazy, iteracje)
  windsurf-mcp-setup.md       # Instrukcja MCP dla Windsurf
  agent.excalidraw            # Diagram architektury
.env.example                  # Szablon zmiennych srodowiskowych
.gitignore                    # Ignorowane pliki
```

## 8. Git: branchy i commity

Zasady spojne z dobrymi praktykami: **jeden branch = jedna spojna funkcjonalnosc** (albo jeden logiczny fix/refactor), **inicjaly osoby odpowiedzialnej** widoczne w nazwie brancha i w pierwszej linii commita.

### 8.1 Nazewnictwo branchy

Format:

`<typ>/<inicjaly>-<krotki-opis-kebab-case>`

- **typ** — zakres zmian (Conventional Commits):
  - `feat` — nowa funkcjonalnosc
  - `fix` — naprawa bledu
  - `docs` — tylko dokumentacja
  - `chore` — narzedzia, konfiguracja, zaleznosci bez zmiany logiki biznesowej
  - `refactor` — przebudowa kodu bez zmiany zachowania
  - `test` — testy
- **inicjaly** — 2–4 litery **male** (np. `ms`, `ab`), ta sama osoba co w commitach na tym branchu
- **opis** — jedno zdanie w kebab-case; konkretny, bez ogolnikow

Przyklady: `feat/ms-add-telegram-webhook`, `fix/ab-n8n-credential-timeout`, `docs/ms-roadmap-phase-2`.

Zasady:

- Nie lacz na jednym branchu niepowiazanych tematow (np. nowy workflow + poprawka README w tym samym PR — rozdziel).
- Bazuj na aktualnym `main` (lub ustalonej galezi deweloperskiej); przed merge zdejmij konflikty lokalnie.
- Nie commituj na `main` bezposrednio — praca na branchu + merge (PR lub lokalny merge po review zespolu).

### 8.2 Wiadomosci commitow

- Jezyk: **angielski**, forma rozkazujaca (np. `add`, `fix`, `update`, `remove`).
- Pierwsza linia (subject): **`[inicjaly] typ: krotki opis`** — `inicjaly` te same co w nazwie brancha (male litery w nawiasach kwadratowych).
- `typ` jak w sekcji 8.1 (feat, fix, docs, chore, refactor, test).
- Maks. ok. 72 znaki w pierwszej linii; opcjonalnie druga linia pusta, potem body z uzasadnieniem / linkiem do zadania.

Przyklady:

- `[ms] feat: add Slack notification on workflow error`
- `[ab] fix: handle empty payload in webhook trigger`

Wiele commitow na jednym branchu: kazdy commit powinien byc **atomowy** (jedna logiczna zmiana), zeby sensownie dalo sie robic `revert` i czytac historie.

### 8.3 Przed push (uzupełnienie sekcji 5)

- Upewnij sie, ze nazwa brancha i prefiksy `[inicjaly]` w commitach sa spojne z osoba odpowiedzialna za zmiane.
