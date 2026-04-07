# Decyzje — trzy warianty (szablon)

Zasada z [roadmap.md](roadmap.md): przy większych wyborach zapisać **darmowy**, **niewielki koszt**, **drogi** oraz **jaki efekt** daje każdy — nie tylko cenę.

Edytuj ten plik w miarę ustaleń; wersje można datować na końcu.

---

## 1. Publiczny URL / hosting webhooków (OAuth, boty, webhooki zewnętrzne)

| Wariant | Typowo | Efekt (realistycznie) | Wybór / data |
|---------|--------|------------------------|--------------|
| **Darmowy** | Tunel (np. Cloudflare Tunnel, ngrok), lokalny n8n | Publiczny URL bez VPS; limity tunelu, czasem niestabilność | |
| **Niewielki koszt** | Tunel płatny / mały VPS później | Stabilniejszy URL lub przygotowanie pod produkcję | |
| **Drogi** | Większy VPS + backup, stały SLA | Najmniej tarcia operacyjnego — na końcu cyklu (Faza 8) | |

**Notatki:**

---

## 2. Magazyn `job` (źródło prawdy)

| Wariant | Typowo | Efekt (realistycznie) | Wybór / data |
|---------|--------|------------------------|--------------|
| **Darmowy** | Google Sheets + Drive (tiery darmowe w sensownym zakresie) | Proste tabele, JSON w komórkach; mniej relacji | |
| **Niewielki koszt** | Seatable free tier (10k wierszy/bazę, czyścić stare rekordy) | Prawdziwe relacje, widoki, REST API — bez JSON w komórkach | **wybrano 2026-04-06** |
| **Drogi** | Seatable płatne / dedykowana baza | SQL, relacje, raporty — gdy ROI uzasadnia | |

**Notatki:** Seatable free tier wystarczy przy typowym wolumenie postów na wiele miesięcy; stare joby można archiwizować/usuwać. Google Sheets zostaje tylko jako rejestr kosztów i raportowanie analityczne.

---

## 3. Pierwszy model AI (tekst / agent)

| Wariant | Typowo | Efekt (realistycznie) | Wybór / data |
|---------|--------|------------------------|--------------|
| **Darmowy** | Lokalny Ollama / bardzo tani model API z twardym limitem | Niska jakość lub wolniej; do eksperymentów | |
| **Niewielki koszt** | Gemini 3 Flash (gen treści) + Gemini 3.1 Flash-Lite (parsing) | Flash: szybki, dobra jakość copy; Lite: najtańszy, niski latency | **wybrano 2026-04-07** |
| **Drogi** | Gemini 3.1 Pro / Claude Sonnet + Thinking | Najwyższa jakość — po pomiarze w I2–I3 | fallback jeśli Flash nie wystarczy |

**Notatki:** Start od Gemini 3 Flash (generacja treści) + Gemini 3.1 Flash-Lite (parsowanie feedbacku, proste zadania). Natywny węzeł n8n: `Google Gemini Chat Model`. Ścieżka upgrade: Gemini 3.1 Pro lub Claude. Credential w n8n: `CG Google Gemini — dev`.

---

## 4. Discord — rozdzielenie **nowego wejścia (job)** i **feedbacku (HITL)**

**Kontekst:** ingest i orchestrator (`sendAndWait` na preview) mogą dzielić ten sam kanał; wiadomość-feedback jest wtedy ryzykiem **podwójnego** wpisu (nowy job + zgubiony HITL). Decyzja **otwarta** (2026-04-07).

| Wariant | Typowo | Efekt (realistycznie) | Wybór / data |
|---------|--------|------------------------|--------------|
| **Darmowy / prosty** | Drugi kanał Discord: tylko ingest vs tylko preview/odpowiedzi | Zero kolizji po stronie treści wiadomości; wymiana z adminem serwera | |
| **Niewielki koszt (reguły)** | Jeden kanał + filtr w ingestcie: reply pod botem, wątek preview, prefiks lub slash command | Bez opłat; trzeba utrzymać zgodność z zachowaniem węzła Discord w n8n | |
| **Droższy / elastyczny** | Mały model lub prompt klasyfikujący intencję przed routingiem | Naturalna mowa użytkownika; koszt tokenów i ryzyko błędnej klasy — zawsze z regułami awaryjnymi | |

**Notatki:** Pełny opis problemu i linki: [roadmap.md — Stan implementacji i otwarte problemy](roadmap.md). Nie wymaga zastąpienia n8n „AI orchestratorem” — opcjonalnie tylko warstwa klasyfikacji przed istniejącymi workflowami.

---

## Historia zmian

| Data | Zmiana |
|------|--------|
| 2026-04-04 | Utworzenie szablonu z roadmapy |
| 2026-04-07 | § 4 — Discord input vs feedback (warianty; decyzja otwarta) |
