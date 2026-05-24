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

## Endpointy

- `GET /` strona główna (HTML, podstawiany `SITE_URL` i `LAST_MODIFIED`)
- `GET /robots.txt` generowany dynamicznie, z bezwzględnym `Sitemap:`
- `GET /sitemap.xml` generowany dynamicznie z `lastmod` ustawionym na bieżący czas
- `GET /sitemap-index.xml`
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
└── public/
    ├── index.html
    ├── styles.css
    ├── script.js
    ├── 404.html
    ├── favicon.svg
    ├── apple-touch-icon.svg
    ├── og-image.svg
    ├── manifest.json
    ├── humans.txt
    └── .well-known/
        └── security.txt
```

## Licencja

Strona prywatna, prawa zastrzeżone. Treści, zdjęcia i layout należą do właściciela działalności.
