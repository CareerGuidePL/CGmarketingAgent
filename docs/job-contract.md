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

- W **Google Sheets** pierwszy wiersz może mapować płaskie kolumny; zagnieżdżone pola (`assets`, `channel_specs`) trzymać jako JSON w jednej komórce albo rozbić na osobne arkusze później.
- **Kalendarz:** wydarzenia powiązane z `job_id` (roadmapa).
- Zmiany kontraktu: wpis w [decisions-three-variants.md](decisions-three-variants.md) lub krótka notka w historii `roadmap.md`.
