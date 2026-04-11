# Onboarding — CG Marketing Agent

Krok po kroku dla nowego dewelopera. Czas: ~30 min.

## 1. Sklonuj repo i skopiuj szablony

> Po sklonowaniu Git tworzy katalog o nazwie repozytorium (domyślnie `CGmarketingAgent`). Jeśli klonujesz do innej ścieżki (`git clone … mój-folder`), użyj `cd` do tego folderu.

```bash
git clone https://github.com/CareerGuidePL/CGmarketingAgent.git
cd CGmarketingAgent
cp .env.example .env
cp .mcp.json.example .mcp.json
cp .cursor/mcp.json.example .cursor/mcp.json
```

## 2. Uzupelnij `.env`

| Zmienna | Skad | Uwagi |
|---------|------|-------|
| `N8N_ENCRYPTION_KEY` | `openssl rand -base64 32` | Wygeneruj raz, nie zmieniaj potem |
| `DISCORD_BOT_TOKEN` | Discord Developer Portal → aplikacja CG Agent → Bot → Token | Poproś admina o dostep |
| `DISCORD_SERVER_ID` | Discord → TEAM CG → prawym na ikone serwera → Copy Server ID | Wymaga Developer Mode |
| `DISCORD_CHANNEL_ID` | Discord → kanal `cg-agent` → prawym → Copy Channel ID | Text channel, nie forum |
| `SEATABLE_API_TOKEN` | SeaTable → baza `CG Marketing Agent` → `...` → API Token (read-write) | Base API Token, **nie** Account Token |
| `N8N_API_KEY` | n8n UI → Settings → API → Create API Key | Po pierwszym logowaniu do n8n (krok 3) |
| `N8N_API_URL`, `N8N_HOST`, `WEBHOOK_URL`, `N8N_PROTOCOL` | Dopasuj do instancji | **Zespół (VPS):** HTTPS + domena (szablon w [.env.example](../.env.example)). **Dev lokalny:** `http://127.0.0.1:5679` |

## 3. Dostep do n8n

**Wariant A — korzystasz z instancji zespołu na VPS (typowe):** otwórz **`https://cg-agent.n8n.crait.pro`** (konto masz od admina). W `.env` ustaw `N8N_API_URL=https://cg-agent.n8n.crait.pro` (bez końcowego `/`), `N8N_HOST`, `WEBHOOK_URL`, `N8N_PROTOCOL=https` zgodnie z [.env.example](../.env.example). **Nie musisz** uruchamiać `docker compose` u siebie, żeby edytować workflowy — wystarczy API key i/lub UI.

**Wariant B — lokalny n8n (development):**

```bash
docker compose up -d
```

UI: **http://127.0.0.1:5679** — pierwszy start: załóż konto admin, potem wygeneruj API key i wpisz do `.env`.

## 4. Uzupelnij `.mcp.json` i `.cursor/mcp.json`

Wpisz `N8N_API_KEY` w polu `env` w obu plikach (skopiuj z `.env`).

## 5. Skonfiguruj credentials w n8n

Utworz w n8n (Settings → Credentials):

| Nazwa | Typ | Dane |
|-------|-----|------|
| `CG Marketing Agent` | SeaTable API | Environment: Cloud-Hosted, API Token: z `.env` |
| `Discord Bot account` | Discord Bot Token | Token: z `.env` |

## 6. Tabele SeaTable

Baza `CG Marketing Agent` powinna miec:

**Tabela `jobs`:**
- `job_id` (Text), `crated_at` (Date), `updated_at` (Date), `source` (Single Select), `content_type` (Single Select), `channels` (Link), `approval_status` (Single Select: pending/approved/rejected), `publish_at` (Date), `status` (Single Select: ingested/approved_notified/rejected_notified), `assets` (Long Text), `prompt_context` (Long Text), `discord_msg_id` (Text), `raw_text` (Long Text), `author` (Text)

**Widoki w `jobs`:**
- `approved-pending` — filtr: `approval_status = approved AND status = ingested`
- `reject-pending` — filtr: `approval_status = rejected AND status = ingested`

**Tabela `config`:**
- `key` (Text), `value` (Text)
- Wiersz startowy: `key = discord_last_message_id`, `value = 0`

## 7. Workflow w n8n

Workflow sa tworzone przez MCP (Claude Code) lub recznie. Aktualnie:

- **`cg-ingest-discord`** — polling Discord co 5 min → zapis do SeaTable
- **`cg-hitl-discord-reply`** — polling SeaTable co 2 min → odpowiedz na Discord

Jesli workflow nie istnieja — poproś Claude Code o ich utworzenie (ma narzedzia MCP do tego).

## 8. Discord Bot

Bot `CG Agent` musi byc na serwerze TEAM CG z uprawnieniami:
- **View Channel**, **Read Message History**, **Send Messages** na kanale `cg-agent`
- **Message Content Intent** wlaczony w Developer Portal → Bot → Privileged Gateway Intents

Jesli bot nie ma dostepu do kanalu: Edit Channel → Permissions → dodaj role `CG Agent` → View Channel na zielono.
