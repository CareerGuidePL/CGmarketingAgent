# Rejestr credentiali (nazwy w n8n)

**Bez wartości sekretów** — tylko spójne nazewnictwo w instancji n8n i w dokumentacji.

Uzupełniaj wraz z Fazą 1 ([roadmap.md](roadmap.md)). Opcjonalnie: osobny arkusz Google „koszty / decyzje” z linkiem w kolumnie „credential w n8n”.

## Konwencja

- Prefiks `CG ` lub `cg-` w opisie workflowu — patrz nazwy workflowów w roadmapie (`cg-orchestrator-*`, …).
- Jedna nazwa credentiala na integrację i środowisko (np. `CG Google Sheets — dev`).

## Tabela

| Obszar | Serwis | Nazwa credentiala w n8n (propozycja) | Uwagi / status |
|--------|--------|--------------------------------------|----------------|
| Orchestracja | n8n API | `CG n8n API — local` | `N8N_API_KEY` z Settings → API |
| Wejścia | Discord | `CG Discord Bot — dev` | Bot token; serwer TEAM CG, kanał `cg-agent` |
| Wejścia | Mail | | IMAP/SMTP lub usługa |
| Dane | Google Drive | | OAuth |
| Dane | Google Sheets | | OAuth |
| Dane | Google Calendar | | OAuth |
| Dane | Seatable | `CG Seatable — dev` | Główny magazyn `job`; API key z ustawień konta |
| AI | (dostawca LLM) | | API key — po wyborze w [decisions-three-variants.md](decisions-three-variants.md) |
| Obrazy / wideo | (API HTCI) | | Po wyborze |
| Social | Meta / LinkedIn / X / … | | OAuth; osobne appy, często App Review |
| Powiadomienia | Discord | `CG Discord Bot — dev` | Ten sam bot; odpowiedzi statusowe w wątkach |

## Rejestr kosztów / log decyzji

**Gdzie:** np. arkusz Google „CG — koszty i decyzje” (link tutaj: _do uzupełnienia_).

**Minimalne kolumny:** data, temat, wariant (darmowy / niewielki / drogi), kwota szac./faktyczna, notatka.
