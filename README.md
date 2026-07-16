# Asperion

Dwujęzyczna strona typu one-page dla pośrednictwa ubezpieczeniowego.

## Pliki

- `index.html` — struktura i treść strony,
- `styles.css` — wygląd, szkło, animacje i responsywność,
- `app.js` — tłumaczenia PL/EN, menu i obsługa formularza,
- `api/contact.js` — bezpieczna wysyłka formularza przez SMTP,
- `vercel.json` — konfiguracja statycznego wdrożenia na Vercelu.

## Konfiguracja formularza na Vercelu

W ustawieniach projektu Vercel dodaj zmienne środowiskowe: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_TO` oraz `SITE_ORIGIN`. Hasła SMTP nie wolno dodawać do repozytorium.

## Przed publikacją

Należy podłączyć formularz do docelowej skrzynki lub systemu CRM oraz uzupełnić finalne dane firmy, politykę prywatności i politykę cookies.
