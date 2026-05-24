# Marcin Kowalski, wycinka drzew

Strona firmowa dla działalności jednoosobowej Marcina Kowalskiego (wycinka drzew, frezowanie pni, podcinanie gałęzi, Warszawa i Mazowsze).

## Stack

- Node.js 20+
- Express 4 z kompresją gzip
- Vanilla HTML, CSS, JS (bez frameworków po stronie klienta)
- Hosting: Railway (NIXPACKS)
- Font: Fraunces (display) + Manrope (body) z Google Fonts

## Uruchomienie lokalnie

```bash
npm install
node server.js
```

Domyślnie serwer słucha na porcie 3000. Otwórz `http://localhost:3000`.

## Google Search Console

Wszystkie strony (`/`, `/polityka-prywatnosci`, `/regulamin`) mają w `<head>` metatag:

```html
<meta name="google-site-verification" content="GOOGLE_SEARCH_CONSOLE_VERIFICATION_PLACEHOLDER">
```

Aby zweryfikować domenę w GSC:

1. Wejdź na [search.google.com/search-console](https://search.google.com/search-console), dodaj zasób typu "URL prefix" z pełnym adresem (np. `https://marcin-wycinka-drzew-production.up.railway.app/` albo własną domeną po wykupieniu).
2. Wybierz metodę weryfikacji "Tag HTML", skopiuj wartość `content="..."` z proponowanego metatagu.
3. W trzech plikach (`public/index.html`, `public/polityka-prywatnosci.html`, `public/regulamin.html`) zamień `GOOGLE_SEARCH_CONSOLE_VERIFICATION_PLACEHOLDER` na skopiowaną wartość. Najprościej Ctrl+H przez cały projekt.
4. Commit, push, deploy. Wróć do GSC i kliknij "Zweryfikuj".
5. Po weryfikacji zgłoś sitemap w GSC: Sitemaps → wklej `sitemap.xml` → Wyślij. Sitemap zawiera wszystkie ważne URL-e.

## Formularz kontaktowy (web3forms)

Formularz `#zgloszenie` w sekcji Kontakt wysyła zgłoszenia przez [web3forms.com](https://web3forms.com), bez własnego backendu. Wystarczy darmowe konto z podpiętym mailem, dostaniesz access key, wklejasz go w `public/index.html`:

```html
<input type="hidden" name="access_key" value="WEB3FORMS_ACCESS_KEY_PLACEHOLDER">
```

Każde poprawne zgłoszenie spada na podpięty mail z polami `Imie`, `Telefon`, `Miejscowosc`, `Opis sprawy`. JS w `public/script.js` wysyła zgłoszenie AJAX-em i pokazuje status (sukces/błąd) pod przyciskiem. Jeśli klient nie ma JavaScriptu, formularz wysyła się natywnie do tego samego endpointu, web3forms pokaże standardową stronę podziękowania.

Pole `botcheck` jest ukrytą pułapką (honeypot), boty zaznaczą i zgłoszenie zostanie odrzucone po stronie web3forms. Nie usuwaj.

## Generowanie obrazka OG

PNG i JPG dla podglądu Facebooka, LinkedIna, Slacka, Discorda są budowane z pliku źródłowego `public/og-image.svg`:

```bash
npm install        # raz, zainstaluje sharp z devDependencies
npm run build:og   # wygeneruje public/og-image.png i public/og-image.jpg
```

Sharp jest tylko devDependency, więc nie ląduje w produkcyjnym buildzie Railway. Wygenerowane PNG i JPG są commitowane do repo i serwowane jako pliki statyczne.

## Zmienne środowiskowe

| Zmienna     | Opis                                                                                       | Domyślnie       |
|-------------|--------------------------------------------------------------------------------------------|-----------------|
| `PORT`      | Port HTTP, na którym słucha Express.                                                       | 3000            |
| `SITE_URL`  | Pełny URL kanoniczny, podstawiany do meta tagów, OG, JSON-LD, sitemap, robots, security.   | wyliczany z nagłówków `x-forwarded-*` |

Na Railway zwykle nie trzeba ustawiać `SITE_URL`, bo serwer odczyta domenę z proxy. Ustaw go ręcznie tylko jeśli podpniesz własną domenę i nie korzystasz z proxy Railway.

## Co podmienić przed publikacją

| Plik                                | Co podmienić                                                                                       |
|-------------------------------------|----------------------------------------------------------------------------------------------------|
| `public/index.html`                 | `+48XXXXXXXXX` (3 miejsca, header CTA, hero CTA, kontakt, footer) oraz `kontakt@example.pl`        |
| `public/index.html` (JSON-LD)       | `telephone`, `email` w bloku `LocalBusiness`, ewentualnie współrzędne `geo` jeśli inna lokalizacja  |
| `public/404.html`                   | nic wymaganego, ale można dopasować ton                                                            |
| `server.js`                         | `kontakt@example.pl` w handlerze `/.well-known/security.txt`                                       |
| `public/humans.txt`                 | uzupełnić, kiedy będzie domena                                                                     |
| `public/index.html`, sekcja Opinie  | wstawić prawdziwe opinie po uzyskaniu zgody klientów                                               |
| `public/index.html`, sekcja Realizacje | podmienić kafelki `.tile` na `<img loading="lazy" alt="...">` z prawdziwymi fotografiami         |
| `public/index.html`, formularz `#zgloszenie` | wartość `value="WEB3FORMS_ACCESS_KEY_PLACEHOLDER"` w polu `input[name="access_key"]`, podmienić na prawdziwy klucz z [web3forms.com](https://web3forms.com) (zakładka Get Access Key, kilka sekund, podpinasz mail, na który mają lecieć zgłoszenia) |
| `public/polityka-prywatnosci.html` | `NIP: XXXXXXXXXX` (dwa miejsca) oraz `[ulica, kod pocztowy, miejscowość]` na prawdziwe dane działalności gospodarczej |
| `public/regulamin.html`            | te same placeholdery `NIP: XXXXXXXXXX` oraz `[ulica, kod pocztowy, miejscowość]` w §1                                  |
| stopka wszystkich stron (`index.html`, `polityka-prywatnosci.html`, `regulamin.html`) | `NIP: XXXXXXXXXX` i `REGON: XXXXXXXXX` w bloku `.footer-business-id`, podmienić na prawdziwe identyfikatory działalności. Link "Sprawdź wpis w CEIDG" zostaje, kieruje na publiczną wyszukiwarkę CEIDG, klient wpisuje NIP i widzi wpis na żywo |
| `public/index.html`, `polityka-prywatnosci.html`, `regulamin.html` | wartość `content="GOOGLE_SEARCH_CONSOLE_VERIFICATION_PLACEHOLDER"` w metatagu `google-site-verification`, podmienić na prawdziwy kod z [Google Search Console](https://search.google.com/search-console) (replace_all przez 3 pliki, jeden kod w trzech miejscach) |

## Endpointy

- `GET /` strona główna (HTML, podstawiany `SITE_URL` i `LAST_MODIFIED`)
- `GET /robots.txt` generowany dynamicznie, z bezwzględnym `Sitemap:`
- `GET /sitemap.xml` generowany dynamicznie z `lastmod` ustawionym na bieżący czas
- `GET /sitemap-index.xml`
- `GET /polityka-prywatnosci` strona prywatności (HTML z podstawianiem `SITE_URL` i `LAST_MODIFIED`)
- `GET /regulamin` regulamin świadczenia usług (HTML z podstawianiem)
- `GET /healthz` JSON 200, używany przez Railway healthcheck
- `GET /.well-known/security.txt` generowany dynamicznie
- `GET /manifest.json`, `/favicon.svg`, `/apple-touch-icon.svg`, `/og-image.svg`
- 404 dla nieznanych ścieżek (`public/404.html`)

## Deploy na Railway

Workflow: GitHub jest źródłem prawdy, Railway pull'uje z GitHuba.

1. Push na GitHub (główna gałąź `main`).
2. W Railway: New Service, Deploy from GitHub repo, wskazać to repo.
3. Railway uruchomi build z `nixpacks.toml` i start z `node server.js`.
4. Healthcheck `/healthz` musi zwracać 200, inaczej deploy się cofa.
5. Wygenerować domenę: Settings, Networking, Generate Domain.

Jeżeli serwis został utworzony przez `railway up` (upload bezpośredni, bez GitHuba), warto podpiąć repo w panelu Railway: Settings, Source, Connect Repo. Dzięki temu kolejne `git push` automatycznie wywołają nowy deploy.

## Struktura projektu

```
.
├── server.js
├── package.json
├── package-lock.json
├── railway.json
├── nixpacks.toml
├── .nvmrc
├── .gitignore
├── README.md
├── tools/
│   └── build-og.js
└── public/
    ├── index.html
    ├── polityka-prywatnosci.html
    ├── regulamin.html
    ├── styles.css
    ├── script.js
    ├── 404.html
    ├── favicon.svg
    ├── apple-touch-icon.svg
    ├── og-image.svg
    ├── og-image.png
    ├── og-image.jpg
    ├── manifest.json
    ├── humans.txt
    └── .well-known/
        └── security.txt
```

## Licencja

Strona prywatna, prawa zastrzeżone. Treści, zdjęcia i layout należą do właściciela działalności.
