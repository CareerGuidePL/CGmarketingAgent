# Meta — pytania do zespołu

Potrzebujemy sprawdzić stan konfiguracji po stronie Meta zanim złożymy App Review lub zaczniemy integrację w n8n.

---

## 1. Meta Developer App

- [ ] Czy macie aplikację w developers.facebook.com?
- [ ] Jeśli tak — jaka jest jej nazwa i App ID?
- [ ] Jaki typ aplikacji (`Business`, `Consumer`, inny)?
- [ ] Czy app jest w trybie Live czy Development? (Development = tylko testerzy z listy)

---

## 2. Facebook — Strona i Business Manager

- [ ] Czy macie Stronę Facebook (nie profil osobisty)?
- [ ] Czy Strona jest podpięta do Facebook Business Manager / Meta Business Suite?
- [ ] Kto jest administratorem Strony i Business Managera? (potrzebne do OAuth i App Review)

---

## 3. Instagram

- [ ] Czy konto IG jest typu Business lub Creator? (profil osobisty nie ma API publikacji)
- [ ] Czy konto IG jest powiązane ze Stroną Facebook?

---

## 4. App Review — uprawnienia

- [ ] Czy był kiedyś składany App Review dla tej aplikacji?
- [ ] Jeśli tak — jakie uprawnienia zostały przyznane? Szczególnie:
  - `pages_manage_posts`
  - `instagram_basic`
  - `instagram_content_publish`
  - `pages_read_engagement`

---

## 5. Dostępy techniczne

- [ ] Kto może wygenerować Page Access Token (długotrwały)?
- [ ] Czy jest osoba, która może dodać nas jako testerów do aplikacji w Development mode na czas budowy?

---

## Co robimy z odpowiedzią

| Stan | Następny krok |
|------|---------------|
| Mają App + Stronę + IG Business | Składamy App Review na brakujące uprawnienia |
| Mają App, brak IG Business | Zmiana typu konta IG (ustawienia w aplikacji mobilnej) |
| Brak App | Zakładamy nową w developers.facebook.com (1–2 dni) |
| App w Development, brak Review | Dodajemy testerów + składamy Review jak najszybciej |

App Review trwa 2–6 tygodni — im wcześniej złożony, tym lepiej.
