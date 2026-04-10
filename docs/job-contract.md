# Kontrakt danych `job` (szkic)

Źródło kierunkowe: [roadmap.md — Faza 2](roadmap.md). Ten plik to **szkic do iteracji** — pola można dodawać albo oznaczać jako „później”, by nie blokować I1.

## Cel

Jednolity payload między workflowami (`Execute Workflow`, webhooki): orchestrator i pod-workflowy operują na tym samym kształcie danych (lub jego podzbiorze).

## Przykładowy JSON

```json
{
  "job_id": "uuid-v4-lub-inny-stabilny-id",
  "created_at": "2026-04-04T12:00:00+02:00",
  "updated_at": "2026-04-04T12:05:00+02:00",
  "source": "discord",
  "content_type": "post",
  "channels": ["linkedin"],
  "assets": [
    {
      "id": "asset-1",
      "kind": "image",
      "drive_file_id": null,
      "url": null
    }
  ],
  "channel_specs": [
    {
      "channel": "linkedin",
      "tone": "professional",
      "max_length": 3000
    }
  ],
  "approval_status": "pending",
  "publish_at": null,
  "prompt_context": {},
  "status": "ingested"
}
```

## Pola (minimalna lista)

| Pole | Typ | Opis |
|------|-----|------|
| `job_id` | string | Identyfikator idempotentności i powiązań (Kalendarz, logi). |
| `created_at` | string (ISO 8601) | Czas utworzenia rekordu `job`. |
| `updated_at` | string (ISO 8601) | Ostatnia zmiana (opcjonalnie w I1). |
| `source` | string | Skrót wejścia: `discord`, `mail`, … |
| `content_type` | string | Np. `post`, `story`, `video_script` — doprecyzowanie w kolejnych iteracjach. |
| `channels` | string[] | Docelowe kanały wyjścia (w I1 często jeden element). |
| `assets` | array | Odniesienia do plików (Drive, URL); struktura wewnętrzna może się rozrosnąć. |
| `channel_specs` | array | Ustawienia per kanał (ton, limity, format). |
| `approval_status` | string | Np. `pending`, `approved`, `rejected` — pod HITL. |
| `publish_at` | string \| null | Zaplanowany czas publikacji (scheduler / Faza 5). |
| `prompt_context` | object | Zaggregowany kontekst pod jeden zaawansowany prompt (Faza 4). |
| `status` | string | Stan maszyny stanów workflowu: `ingested`, `generating`, … |

## Uwagi implementacyjne

### Źródło prawdy: Seatable

Główny magazyn `job` to **Seatable** (free tier, REST API, relacje między tabelami) — nie Google Sheets. Sheets pozostaje jedynie do rejestru kosztów i raportów analitycznych.

#### Aktualna struktura w Seatable (baza: „CG Marketing Agent")

**Tabela `jobs`** — główna tabela z rekordami job:

| Kolumna | Typ | Opcje / uwagi |
|---|---|---|
| `job_id` | Text | UUID, klucz główny |
| `crated_at` | Date | ⚠️ literówka w nazwie (powinno być `created_at`) |
| `updated_at` | Date | |
| `source` | Single Select | `discord` |
| `content_type` | Single Select | `post`, `story`, `video_script`, `image` |
| `channels` | Multiple Select | `facebook`, `linkedin`, `instagram`, `x`, `youtube`, `tiktok` — ingest Discord zapisuje domyślnie JSON tablicy `["linkedin","facebook","instagram"]`; jeśli węzeł SeaTable wymaga innego formatu, popraw `columnValue` w `cg-ingest-discord` |
| `approval_status` | Single Select | `pending`, `approved`, `rejected` |
| `publish_at` | Date | Scheduler (Faza 5) |
| `status` | Single Select | `ingested`, `revision_needed`, `generating`, `awaiting_approval`, `approved`, `rejected`, `publishing`, `published`, `failed`, `retracted`, `approved_notified`, `rejected_notified` |
| `assets` | Long Text | JSON array |
| `prompt_context` | Long Text | JSON object |
| `discord_msg_id` | Text | Powiązanie z wiadomością Discord (HITL) |
| `raw_text` | Long Text | Surowy tekst z wejścia |
| `author` | Text | Autor wiadomości źródłowej |
| `generated_text` | Long Text | Wynik generacji (orchestrator → `cg-gen-content`) — skonsolidowany tekst lub JSON slajdów (nagłówki per kanał) |
| `revision_feedback` | Long Text | Feedback z HITL (ścieżka poprawki) |
| `final_slides` | Long Text | **Nowe (2026-04):** JSON tablicy po zatwierdzeniu: `[{ "channel", "drive_file_id", "drive_web_view_link" }]` — finalne PNG na Google Drive w folderze **generated** (ID folderu ustawiony w węźle **Upload Approved Slide** w `cg-orchestrator-main`) |

**Uwaga:** kolumnę `final_slides` należy **dodać ręcznie** w Seatable (typ Long Text), jeśli jeszcze nie istnieje.

Widoki: `Default View`, **`to-process`** — używany przez `cg-orchestrator-main` (lista z limitem 1). **Zalecane filtry:** tylko stany kolejki roboczej, np. `status` = `ingested` **lub** `status` = `revision_needed`; **wykluczyć** `generating` i `awaiting_approval`, żeby ten sam job nie wracał do kolejki przy kolejnym ticku schedulera (por. [roadmap.md — Stan implementacji](roadmap.md)). `approved-pending` (filtr: approved + ingested), `reject-pending` (filtr: rejected + ingested).

**Tabela `config`** — key-value store na ustawienia:

| Kolumna | Typ |
|---|---|
| `key` | Text |
| `value` | Text |

#### Tabela `channel_specs` — szablony treści per kanał social

| Kolumna | Typ | Opis |
|---|---|---|
| `channel` | Text | Nazwa kanału: `facebook`, `linkedin`, `instagram`, `x`, `youtube`, `tiktok` |
| `language` | Single Select | Język treści: `pl`, `en`, `pl+en` |
| `tone` | Text | Ton i styl komunikacji |
| `max_length` | Number | Max długość tekstu (znaki) |
| `post_structure` | Long Text | Struktura posta (hook → rozwinięcie → CTA → hashtagi) |
| `hashtag_count` | Text | Zakres liczby hashtagów (np. `3-5`) |
| `emoji_style` | Single Select | Użycie emoji: `tak`, `umiarkowanie`, `opcjonalnie` |
| `cta_style` | Text | Typ wezwania do działania |
| `media_required` | Checkbox | Czy media są wymagane |
| `media_types` | Text | Akceptowane typy mediów |
| `visual_template_id` | Text | ID szablonu wizualnego (HCTI) — do wypełnienia później |
| `notes` | Long Text | Uwagi dot. algorytmu / best practices |

Workflow `cg-gen-content` powinien pobierać spec dla danego kanału z tej tabeli i budować prompt z uwzględnieniem tonu, struktury i limitów.

#### Planowana data publikacji (`publish_at`) z Discorda

Opcjonalnie w treści zgłoszenia (wiadomość tworząca job) można podać datę publikacji, którą ingest próbuje wyciągnąć do kolumny **`publish_at`**:

- `publikacja: 15.04.2026 18:00` lub `publikacja: 15.04.2026`
- `2026-04-15` lub `2026-04-15 18:00`

Jeśli ingest nie wykryje daty, orchestrator po zatwierdzeniu (**ok**) wysyła **drugie** pytanie HITL z prośbą o podanie daty/czasu (format `YYYY-MM-DD` lub `YYYY-MM-DD HH:mm`, strefa: `GENERIC_TIMEZONE` w Dockerze). Wartość trafia do **`publish_at`** przy tym samym update co `final_slides`.

#### Discord: rozdzielenie wejścia (nowy job) i feedbacku (HITL)

Ingest Discord tworzy job z każdej nowej wiadomości spełniającej reguły (por. workflow `cg-ingest-discord`). Orchestrator może jednocześnie oczekiwać odpowiedzi na preview (**`sendAndWait`**). Przy **jednym kanale** wiadomość z intencją feedbacku mogła zostać błędnie zinterpretowana jako **nowe zlecenie**.

**Zaimplementowane w `cg-ingest-discord` (2026-04-08):** wiadomości z **`message_reference`** (reply w Discordzie) **nie** tworzą joba; kursor `discord_last_message_id` jest **zawsze** przesuwany do najwyższego ID spośród nowych wiadomości nie-botów (również gdy wszystkie to reply — brak zapętlenia ingestu). **Nadal otwarte:** zwykły post na kanale (bez reply) jako feedback — wtedy dalej rozważać drugi kanał, prefiks `[JOB]`, slash command lub router AI ([roadmap.md](roadmap.md), [decisions-three-variants.md § 4](decisions-three-variants.md)).

### Inne

- **Kalendarz:** wydarzenia powiązane z `job_id` (roadmapa).
- **Google Drive:** assety binarne (obrazy, wideo) — `drive_file_id` w rekordzie job/asset.
- Zmiany kontraktu: wpis w [decisions-three-variants.md](decisions-three-variants.md) lub krótka notka w historii `roadmap.md`.
