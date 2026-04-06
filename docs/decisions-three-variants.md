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
| **Niewielki koszt** | „Mini” / małe modele z quotami w workflow | Sensowna jakość copy przy kontrolowanym koszcie | |
| **Drogi** | Flagowe modele, duże konteksty | Najwyższa jakość — po pomiarze w I2–I3 | |

**Notatki:**

---

## Historia zmian

| Data | Zmiana |
|------|--------|
| 2026-04-04 | Utworzenie szablonu z roadmapy |
