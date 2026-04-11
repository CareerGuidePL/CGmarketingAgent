# Onboarding: lokalne n8n — CG Marketing Agent

Instrukcja dla każdej osoby z zespołu, która chce uruchomić lokalną instancję n8n.

**Wymagania wstępne:** Docker Desktop zainstalowany i uruchomiony, dostęp do repozytorium na GitHub.

---

## 1. Sklonuj repozytorium

```bash
git clone https://github.com/CareerGuidePL/CGmarketingAgent.git
cd CGmarketingAgent
```

> Katalog po klonowaniu ma domyślnie nazwę repozytorium (`CGmarketingAgent`). Przy `git clone … inna-nazwa` wykonaj `cd` do wybranego folderu.

> Jeśli repo już masz — zaktualizuj: `git pull origin main`

---

## 2. Utwórz plik `.env`

Skopiuj szablon:

**Windows (PowerShell):**
```powershell
Copy-Item .env.example .env
```

**Mac / Linux:**
```bash
cp .env.example .env
```

---

## 3. Wygeneruj klucz szyfrowania

Każda osoba generuje **swój własny** klucz — nie udostępniaj go innym ani nie commituj.

**Windows (PowerShell):**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }) -as [byte[]])
```

**Mac / Linux:**
```bash
openssl rand -base64 32
```

Wygenerowany ciąg wklej do `.env` jako wartość `N8N_ENCRYPTION_KEY`:

```
N8N_ENCRYPTION_KEY=tutaj_wklej_wygenerowany_klucz
```

> **Ważne:** po pierwszym uruchomieniu n8n **nie zmieniaj** tego klucza — dane credentiali są nim zaszyfrowane. Zmiana klucza = utrata wszystkich zapisanych credentiali.

---

## 4. Uruchom n8n

```bash
docker compose up -d
```

Otwórz przeglądarkę: [http://localhost:5679](http://localhost:5679)

Przy pierwszym uruchomieniu n8n poprosi o założenie konta właściciela — podaj e-mail i hasło (lokalne, nie muszą być prawdziwe).

---

## 5. Zatrzymanie i restart

```bash
# Zatrzymaj
docker compose down

# Restart (np. po zmianie .env)
docker compose down && docker compose up -d

# Logi (przydatne przy błędach)
docker compose logs -f n8n
```

---

## 6. Dane są trwałe

Workflowy i credentiale są przechowywane w wolumenie Docker `n8n_data`. Przetrwają restart i aktualizację obrazu. **Nie usuwaj wolumenu** (`docker volume rm`) bez potrzeby — to kasuje wszystkie dane.

---

## 7. Aktualizacja n8n

```bash
docker compose pull
docker compose up -d
```

---

## Najczęstsze problemy

| Problem | Rozwiązanie |
|---------|-------------|
| Port 5679 zajęty | Zamknij inną aplikację na tym porcie lub zmień port w `docker-compose.yml` |
| `N8N_ENCRYPTION_KEY` błąd przy starcie | Upewnij się, że `.env` istnieje i klucz jest wypełniony |
| Kontener startuje i od razu się zatrzymuje | Sprawdź logi: `docker compose logs n8n` |
| Nie pamiętam hasła do n8n | `docker compose down -v` (uwaga: **kasuje dane**) i zacznij od nowa — lub skontaktuj się z prowadzącym projekt |

---

## Co dalej

Workflowy są wersjonowane w repozytorium w katalogu [`workflows/`](../workflows/) (eksport: `bash scripts/n8n/export.sh` przy ustawionym `N8N_API_KEY`). Aktualny stan i otwarte tematy (np. Discord: input vs feedback): [`docs/roadmap.md`](roadmap.md).

Import pojedynczego pliku: `n8n → górne menu → Import from file`.
