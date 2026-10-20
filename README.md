# hacker-hotline-site

Landingspagina voor **Hacker Hotline**, het gratis bordspel over online fraude voor jongeren (vanaf 10 jaar).
Een initiatief van Febelfin × Hurae. Gebouwd en beheerd door SUS Consult als wolfpakket, in opdracht van **Hurae**.

Oorspronkelijk voorbeeld: https://hacker-hotline-game-hub.lovable.app (Engels, Lovable). Deze site is daar een eigen, tweetalige versie van.

## Pagina's

| Adres | Inhoud |
|---|---|
| `/` | Nederlandse pagina |
| `/fr/` | Franse pagina |
| `/api/aanvraag` | Ontvangt het bestelformulier (geen pagina) |
| alles anders | `404.html` (NL + FR) |

Beide pagina's hebben dezelfde secties: intro, "Het spel", "In de doos", bestelformulier, FAQ.
Een tekstwijziging doe je dus **altijd in beide bestanden** (`public/index.html` en `public/fr/index.html`).

## Onderdelen van dit project

- **Statische pagina's** in `public/`. De opmaak (`assets/styles.css`) is overgenomen van het Lovable-voorbeeld. Aanvullingen staan in `assets/site.css`.
- **Lettertypes** (Archivo Black, JetBrains Mono, Rubik) staan in de site zelf (`assets/fonts/`), niet bij Google. Daardoor is er geen cookiebanner nodig.
- **Bestelformulier** (`assets/site.js` → `src/index.js` → Google Sheet):
  1. De bezoeker vult het formulier in. Bij "Opsturen" verschijnt een verplicht veld leveradres.
  2. De Worker controleert de aanvraag en stuurt ze door naar een Apps Script in een Google Sheet.
  3. Het script zet de aanvraag als rij in het tabblad **Aanvragen** en stuurt een meldingsmail.
  4. De bezoeker krijgt pas "Bedankt" als het script expliciet bevestigt dat de rij bewaard is.
  - Elke aanvraag heeft een ID; dubbels worden geweigerd, dus opnieuw proberen is veilig.
  - Onzichtbaar spam-veld (`website`): ingevuld = stil genegeerd.
  - De code van het script staat in `apps-script/Code.gs`, met de installatiestappen bovenaan.
- **Geen meting, geen advertenties** (voorlopig). Komt er later Analytics of een pixel, dan is een cookiebanner nodig.

## Variabelen in Cloudflare

Worker `hacker-hotline-site` → Settings → Runtime variables and secrets:

| Naam | Type | Wat |
|---|---|---|
| `SHEET_URL` | Secret | Adres van de Apps Script web-app (eindigt op `/exec`) |

Zolang `SHEET_URL` ontbreekt, toont het formulier een foutmelding met het mailadres.

In het Apps Script (Projectinstellingen → Scripteigenschappen):

| Naam | Wat |
|---|---|
| `NOTIFY_EMAIL` | Wie een mail krijgt bij een nieuwe aanvraag (meerdere: komma's) |

## Wat staat waar

| Wat | Waar | Login |
|---|---|---|
| Code | github.com/susconsult/hacker-hotline-site | GitHub `susconsult` |
| Hosting | Cloudflare Worker `hacker-hotline-site` | pieter@susconsult.be |
| Aanvragen | Google Sheet (nog aan te maken) | nog te bepalen |
| Domein | nog te bepalen | – |

## Publiceren

Elke push naar `main` wordt na 2 à 4 minuten automatisch gepubliceerd door Cloudflare.

Lokaal testen: `npx wrangler dev --var SHEET_URL:<test-url>` en open http://localhost:8787.

## Openstaand

- [ ] Cloudflare Worker koppelen aan deze repository
- [ ] Google Sheet + Apps Script aanmaken, `SHEET_URL` en `NOTIFY_EMAIL` invullen, testaanvraag doen
- [ ] Domein kiezen en koppelen; daarna `sitemap.xml`, `canonical` en volledige `hreflang`-adressen toevoegen
- [ ] Wettelijke vermelding: officiële naam, adres en ondernemingsnummer van de uitgever (Hurae en/of Febelfin) in de voettekst
- [ ] Nakijken: schrijfwijze "Hurae", correct contactadres (info@febelfin.be?), wie de aanvragen opvolgt
- [ ] Leeftijd: overal 10+ gezet (het voorbeeld zei op één plek 12+). Bevestigen bij de klant
- [ ] Franse spelkaarten: de kaartjes op de site zijn Nederlandstalig. Franse versies aanvragen voor `/fr/`
- [ ] Namen van de teams in het Frans nakijken ("Helpers" en "Hackers" nu onvertaald)
- [ ] Grote foto wordt nog van febelfin.be geladen. Origineel bestand vragen en in `public/assets/img/` zetten
- [ ] Franse teksten laten nalezen door een Franstalige
