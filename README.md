# hacker-hotline-site

Landingspagina voor **Hacker Hotline**, het bordspel over online fraude voor jongeren (vanaf 10 jaar).
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
De drie HTML-pagina's worden **gebouwd** door `tools/build_pages.py`: daar staan alle NL- en FR-teksten samen.
Wijzig teksten daar en draai `python3 tools/build_pages.py`. Pas de HTML in `public/` niet rechtstreeks aan, anders gaat het bij de volgende build verloren.

## Onderdelen van dit project

- **Statische pagina's** in `public/`. De opmaak (`assets/styles.css`) is overgenomen van het Lovable-voorbeeld. Aanvullingen staan in `assets/site.css`.
- **Instructievideo** (alleen NL-pagina, sectie "Zo speel je het"): `assets/video/hh-instructievideo-nl.mp4` (720p, 6:25, 23 MB, verkleind uit `HH_INSTRUCTIEVIDEO_NL_V1`), stilstaand beeld `hh-instructievideo-nl.jpg`. Eigen speler (`assets/player.js`): grote startknop, voortgangsbalk in de stijl van de HACKED→SAFE-meter, snelheid, geluid, volledig scherm, toetsen (spatie/K, M, F, pijltjes). Zonder JavaScript valt hij terug op de gewone browserspeler. Cloudflare aanvaardt max. 25 MB per bestand. Een Franse versie krijgt dezelfde behandeling en een `video_title` in `T["fr"]`.
- **Favicon**: eigen hackerkopje (`favicon.svg`, met `favicon.ico` en `apple-touch-icon.png` als afgeleiden).
- **Lettertypes** (Archivo Black, JetBrains Mono, Rubik) staan in de site zelf (`assets/fonts/`), niet bij Google. Daardoor is er geen cookiebanner nodig.
- **Bestelformulier** (`assets/site.js` → `src/index.js` → Google Sheet):
  1. Velden: contactpersoon, school/organisatie, e-mail, telefoon, taal van het spel, aantal (1–20).
  2. **Facturatiegegevens** (verplicht): naam op de factuur, ondernemingsnr./btw (optioneel), adres (straat, nr., bus, postcode, gemeente), factuur-e-mail (optioneel).
  3. **Levering**: ophalen bij Febelfin, of opsturen (+ € 7,50). Bij opsturen staat "Leveren op het facturatieadres" standaard aan; uitvinken toont een apart leveradres.
  4. **Totaal** telt live mee: aantal × € 39 + eventueel € 7,50, btw inbegrepen. De Worker rekent het totaal zelf opnieuw uit (prijzen bovenaan `src/index.js`).
  5. **Akkoord-vinkje** verplicht: "Ik bevestig deze bestelling en betaal na ontvangst van de factuur."
  6. De Worker controleert alles en stuurt de bestelling door naar het Apps Script. Dat zet ze als rij in tabblad **Bestellingen** (met vinkjes Gefactureerd / Betaald / Verstuurd) en stuurt een meldingsmail.
  7. De bezoeker krijgt pas "Bedankt" als het script expliciet bevestigt dat de rij bewaard is.
  - Elke bestelling heeft een ID; dubbels worden geweigerd, dus opnieuw proberen is veilig.
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
| Hosting | Cloudflare Worker `hacker-hotline-site` (tijdelijk adres: hacker-hotline-site.pieter-2d7.workers.dev) | pieter@susconsult.be |
| Bestellingen | Google Sheet "Hacker Hotline aanvragen" + Apps Script met dezelfde naam | pieter@susconsult.be |
| Domein | nog te bepalen | – |

## Publiceren

Elke push naar `main` wordt na 2 à 4 minuten automatisch gepubliceerd door Cloudflare.

Lokaal testen: `npx wrangler dev --var SHEET_URL:<test-url>` en open http://localhost:8787.

## Bronnen voor inhoud

- Intro, spelinhoud, aantal spelers (2–8), leeftijd (10+) en duur (20') komen van de doosbodem (`HH_Doos_bodem_NL.pdf` en `_FR.pdf`). Het Lovable-voorbeeld zei 2–6 spelers; de doos is leidend.
- Kaartjes in `public/assets/img/` zijn uit `Speelkaarten.pdf` gehaald (pagina 1–4), bijgesneden op de snijlijn (TrimBox), 501 × 760 px.
- Prijs: € 39 per spel, btw inbegrepen; verzending € 7,50; betaling via factuur achteraf (bevestigd door Hurae, 20/10/2026). Het Lovable-voorbeeld zei "gratis"; dat is fout.
- "Helpers" en "Hackers" blijven ook in het Frans zo (staat zo op de Franse doos).

## Openstaand

- [x] Cloudflare Worker gekoppeld (20/10/2026): https://hacker-hotline-site.pieter-2d7.workers.dev
- [x] Google Sheet + Apps Script, `SHEET_URL` en `NOTIFY_EMAIL` ingesteld, testbestelling gelukt (20/10/2026)
- [ ] Franse instructievideo
- [ ] Domein kiezen en koppelen; daarna `sitemap.xml`, `canonical` en volledige `hreflang`-adressen toevoegen
- [ ] Rechtsvorm van Hurae nakijken (nu: "Hurae", Adolphe Maxlaan 30, 1000 Brussel, BE 0662.479.613, overgenomen van hurae.be)
- [ ] Contactadres: info@hurae.com (zo vermeld op hurae.be). Bevestigen
- [ ] Franse spelkaarten: de kaarten-PDF is enkel Nederlandstalig. Franse versie aanvragen voor `/fr/`
- [ ] Grote foto wordt nog van febelfin.be geladen. Origineel bestand vragen en in `public/assets/img/` zetten
- [ ] Franse teksten laten nalezen door een Franstalige
- [ ] Verzending € 7,50: per zending of per spel? Nu: per zending, ongeacht het aantal
- [ ] Algemene voorwaarden: bestaan die? Dan link bij het akkoord-vinkje
- [ ] Ophalen bij Febelfin: blijft dat mogelijk?
