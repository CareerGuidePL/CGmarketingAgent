# n8n — zrodlo wiedzy (MCP)

Gdy temat dotyczy n8n (workflow, wezly, wyrazenia, API, self-host, community nodes) albo pracujesz nad plikami typu workflow JSON / diagramy automatyzacji w tym projekcie:

## 1. MCP Context7 (priorytet)

Zanim podasz szczegoly techniczne (nazwy pol wezlow, type/typeVersion, API, migracje):

1. Wywolaj `resolve-library-id` z `libraryName`: `n8n` i `query` dopasowanym do zadania.
2. Wywolaj `query-docs` z uzyskanym `libraryId` i konkretnym `query`.

Preferowane ID bibliotek:

| Priorytet | Library ID | Kiedy |
|-----------|------------|--------|
| 1 | `/websites/n8n_io` | Ogolne docs z docs.n8n.io, integracje, przewodniki |
| 2 | `/n8n-io/n8n-docs` | Struktura repo docs, core/trigger/app nodes, odniesienia do plikow |
| 3 | `/llmstxt/n8n_io_llms-full_txt` | Bardzo szerokie zapytanie lub brak wyniku w 1-2 |

Nie ufaj wylacznie pamieci treningowej dla wersji wezlow i nazw pol — potwierdz w query-docs.

## 2. Serwer n8n-mcp

Serwer MCP `n8n-mcp` wymaga konfiguracji globalnej w Windsurf.
Instrukcja: `docs/windsurf-mcp-setup.md`

- Bez danych instancji (domyslnie): tryb dokumentacji/narzedzi.
- Z N8N_API_URL + N8N_API_KEY: zarzadzanie instancja.
- Nie commituj kluczy API.

## 3. Wybor wezlow w workflowach

Preferuj natywne wezly n8n; Code i HTTP Request gdy nie ma odpowiedniego wezla albo integracja natywna nie wystarcza. Pelna zasada: `docs/shared-rules.md` — sekcja 1 (Architektura).

## 4. Wspolne zasady projektu

Stosuj zawsze zasady z `docs/shared-rules.md` — to zrodlo prawdy dla wszystkich IDE.
