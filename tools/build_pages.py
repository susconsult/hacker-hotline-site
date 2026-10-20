"""Bouwt de NL- en FR-pagina van Hacker Hotline uit één sjabloon.

Alle teksten staan hieronder in T["nl"] en T["fr"]. Wijzig ze hier, niet in de HTML,
en draai daarna vanuit de map van de repository:

    python3 tools/build_pages.py

Schrijft public/index.html (NL), public/fr/index.html (FR) en public/404.html."""
import sys, os, html, json

ROOT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
HERO_IMG = "https://febelfin.be/media/pages/pers/fraude-veiligheid/hacker-hotline-2-0-bordspel-maakt-jongeren-cyberweerbaar/a3546e9629-1759734640/hacker-hotline-game.jpg"

T = {
 "nl": dict(
  path="/", other_path="/fr/", other_label="FR", other_name="Français",
  title="Hacker Hotline – Bordspel over online veiligheid voor scholen",
  desc="Hacker Hotline is een bordspel van Febelfin dat jongeren vanaf 10 jaar leert online fraude te herkennen. Bestel het voor je klas, €&nbsp;39 per spel.",
  nav_game="Het spel", nav_order="Bestellen",
  tag="&gt; inkomende_oproep: 404 — hulp gevraagd_",
  lead="Welkom op de noodcentrale voor slachtoffers van online oplichters!",
  intro="In Hacker Hotline nemen spelers de rol op van Helpers en Hackers die het tegen elkaar opnemen. Verander wachtwoorden, update software of lok mensen in de val met valse beloftes en verdachte links om zo veel mogelijk digitale profielen aan jouw kant te krijgen. Welk team beschermt er de meeste mensen… of steelt net hun persoonlijke data?",
  cta="Bestel het spel — €&nbsp;39",
  st_players="Spelers", st_age="Leeftijd", st_time="Speeltijd",
  alt1="Profielkaart van een Hacker", alt2="Profielkaart van een Helper", alt3="Spelkaart: onrealistisch aanbod", alt4="Spelkaart",
  hacked="GEHACKT", safe="VEILIG",
  h2_game='Speel het spel.<br/>Word <span class="text-hacker">geen</span> slachtoffer.',
  f1t="Herken de oplichting", f1="Phishing, valse webshops, geldezels, verdachte pop-ups: leer welke vormen van online fraude er bestaan.",
  f2t="Zie de rode vlaggen", f2="Onrealistische aanbiedingen en dringende berichten — leer leerlingen verdachte situaties zien aankomen.",
  f3t="Bouw aan cyberhygiëne", f3="Sterke wachtwoorden, updates en tweestapsverificatie. Helpers beschermen profielen, Hackers proberen ze te stelen.",
  photo_alt="Het bordspel Hacker Hotline op tafel",
  box="In de doos", box_items=["1 spelbord","6 profielpionnen","6 profielkaarten","110 spelkaarten","1 handleiding"],
  video_title="Zo speel je het", video_text="Bekijk in 6 minuten hoe je Hacker Hotline opzet en speelt.", video_alt="Instructievideo Hacker Hotline", video_src="/assets/video/hh-instructievideo-nl.mp4", video_poster="/assets/video/hh-instructievideo-nl.jpg", video_duration="6:25",
  pl_play="Afspelen", pl_pause="Pauzeren", pl_big="Speel de uitleg", pl_again="Opnieuw bekijken", pl_mute="Geluid uit", pl_unmute="Geluid aan", pl_fs="Volledig scherm", pl_fs_exit="Volledig scherm sluiten", pl_speed="Afspeelsnelheid", pl_seek="Voortgang van de video", pl_loading="Laden…",
  h2_order="Bestel het spel", order_free="€&nbsp;39 per spel, btw inbegrepen.",
  order_how="Haal het op bij de kantoren van Febelfin, of laat het opsturen voor €&nbsp;7,50 verzendkosten. Je betaalt achteraf, na ontvangst van de factuur.",
  order_mail="&gt; of mail rechtstreeks:",
  l_name="Naam *", l_org="School / organisatie *", l_email="E-mail *", l_phone="Telefoon",
  l_lang="Taal van het spel", o_nl="Nederlands", o_fr="Frans",
  l_qty="Aantal spellen", l_delivery="Levering", d_pickup="Ophalen", d_ship="Opsturen",
  l_billing="Facturatiegegevens", l_bname="Naam op de factuur *", l_vat="Ondernemingsnr. / btw-nr.", ph_vat="BE 0123.456.789", l_bemail="E-mail voor de factuur", ph_bemail="Leeg = je e-mailadres hierboven", l_same="Leveren op het facturatieadres", l_total="Totaal", ship_word="verzending", vat_word="btw inbegrepen", accept="Ik bevestig deze bestelling en betaal na ontvangst van de factuur. *", privacy="We gebruiken je gegevens alleen om je bestelling af te handelen.",
  l_address="Leveradres", l_street="Straat *", l_number="Nr. *", l_box="Bus", l_postcode="Postcode *", l_city="Gemeente *",
  l_msg="Bericht", submit="Plaats bestelling", sending="Bezig met versturen…",
  ok="Bedankt! Je bestelling is goed ontvangen. Je krijgt achteraf een factuur.",
  err="Er ging iets mis bij het versturen. Probeer het opnieuw of mail naar info@hurae.com.",
  hp="Laat dit veld leeg",
  faq=[
   ("Wat kost het spel?","Het spel kost €&nbsp;39 per stuk, btw inbegrepen. Laat je het opsturen, dan komt er €&nbsp;7,50 verzendkosten bij. Ophalen bij de kantoren van Febelfin kost niets extra."),
   ("Hoe betaal ik?","Je krijgt na je bestelling een factuur. Vul daarvoor de facturatiegegevens van je school of organisatie in."),
   ("Wie kan het bestellen?","Leerkrachten, scholen, jeugdorganisaties en andere organisaties die met jongeren werken."),
   ("Voor welke leeftijd is het?","Hacker Hotline is gemaakt voor jongeren vanaf 10 jaar — ideaal voor klassen in het secundair onderwijs."),
   ("Met hoeveel spelers?","2 tot 8 spelers, verdeeld in Helpers en Hackers. Een spel duurt ongeveer 20 minuten."),
   ("Wat zit er in de doos?","Een spelbord, 6 profielpionnen, 6 profielkaarten, 110 spelkaarten en een handleiding."),
   ("In welke talen bestaat het?","Het spel bestaat in het Nederlands en het Frans. Ook het lesmateriaal over online fraude en geldezels is in beide talen beschikbaar."),
   ("Wat leren de leerlingen?","Welke vormen van online fraude er bestaan, hoe ze verdachte situaties herkennen en hoe ze zich beschermen met een goede cyberhygiëne."),
  ],
  legal="Uitgever van deze site: Hurae · Adolphe Maxlaan 30, 1000 Brussel · BE 0662.479.613",
  footer="&lt;HACKER HOTLINE/&gt; — een initiatief van Febelfin × Hurae",
  nf_title="Pagina niet gevonden", nf_text="Deze lijn is dood. De pagina die je zoekt bestaat niet (meer).", nf_back="Naar de homepagina",
 ),
 "fr": dict(
  path="/fr/", other_path="/", other_label="NL", other_name="Nederlands",
  title="Hacker Hotline – Jeu de société sur la sécurité en ligne pour les écoles",
  desc="Hacker Hotline est un jeu de société de Febelfin qui apprend aux jeunes dès 10 ans à repérer la fraude en ligne. Commandez-le pour votre classe, 39&nbsp;€ par jeu.",
  nav_game="Le jeu", nav_order="Commander",
  tag="&gt; appel_entrant : 404 — besoin d’aide_",
  lead="Bienvenue à la centrale d’urgence pour les victimes de fraude en ligne.",
  intro="Dans Hacker Hotline, tu feras partie des Helpers ou Hackers qui s’affrontent pour rallier le plus grand nombre de profils numériques à leur cause. Quelle équipe va arriver à protéger le plus de profils – ou au contraire leur voler leurs données personnelles ?",
  cta="Commander le jeu — 39&nbsp;€",
  st_players="Joueurs", st_age="Âge", st_time="Durée",
  alt1="Carte profil d’un Hacker", alt2="Carte profil d’un Helper", alt3="Carte de jeu : offre irréaliste", alt4="Carte de jeu",
  hacked="PIRATÉ", safe="PROTÉGÉ",
  h2_game='Jouez le jeu.<br/>Ne vous faites <span class="text-hacker">pas</span> avoir.',
  f1t="Repérer l’arnaque", f1="Phishing, fausses boutiques en ligne, mules financières, pop-ups douteux : découvrez les différentes formes de fraude en ligne.",
  f2t="Reconnaître les signaux d’alerte", f2="Offres irréalistes et messages urgents : apprenez aux élèves à voir venir les situations suspectes.",
  f3t="Adopter une bonne cyberhygiène", f3="Mots de passe forts, mises à jour et double authentification. Les Helpers protègent les profils, les Hackers tentent de les voler.",
  photo_alt="Le jeu de société Hacker Hotline sur une table",
  box="Dans la boîte", box_items=["1 plateau de jeu","6 pions profil","6 cartes profil","110 cartes de jeu","1 mode d’emploi"],
  h2_order="Commander le jeu", order_free="39&nbsp;€ par jeu, TVA comprise.",
  order_how="Venez le chercher dans les bureaux de Febelfin, ou faites-le envoyer pour 7,50&nbsp;€ de frais d’envoi. Vous payez après réception de la facture.",
  order_mail="&gt; ou écrivez directement à :",
  l_name="Nom *", l_org="École / organisation *", l_email="E-mail *", l_phone="Téléphone",
  l_lang="Langue du jeu", o_nl="Néerlandais", o_fr="Français",
  l_qty="Nombre de jeux", l_delivery="Livraison", d_pickup="Retrait", d_ship="Envoi",
  l_billing="Données de facturation", l_bname="Nom sur la facture *", l_vat="N° d’entreprise / TVA", ph_vat="BE 0123.456.789", l_bemail="E-mail pour la facture", ph_bemail="Vide = votre e-mail ci-dessus", l_same="Livrer à l’adresse de facturation", l_total="Total", ship_word="frais d’envoi", vat_word="TVA comprise", accept="Je confirme cette commande et je paierai à réception de la facture. *", privacy="Vos données sont uniquement utilisées pour traiter votre commande.",
  l_address="Adresse de livraison", l_street="Rue *", l_number="N° *", l_box="Boîte", l_postcode="Code postal *", l_city="Commune *",
  l_msg="Message", submit="Passer la commande", sending="Envoi en cours…",
  ok="Merci ! Votre commande a bien été reçue. Vous recevrez ensuite une facture.",
  err="Un problème est survenu lors de l’envoi. Réessayez ou écrivez à info@hurae.com.",
  hp="Laissez ce champ vide",
  faq=[
   ("Combien coûte le jeu ?","Le jeu coûte 39&nbsp;€ pièce, TVA comprise. Si vous le faites envoyer, 7,50&nbsp;€ de frais d’envoi s’ajoutent. Le retrait dans les bureaux de Febelfin est sans frais supplémentaires."),
   ("Comment payer ?","Après votre commande, vous recevez une facture. Indiquez pour cela les données de facturation de votre école ou organisation."),
   ("Qui peut le commander ?","Les enseignants, les écoles, les organisations de jeunesse et les autres organisations qui travaillent avec des jeunes."),
   ("Pour quel âge ?","Hacker Hotline est conçu pour les jeunes à partir de 10 ans — idéal pour les classes de l’enseignement secondaire."),
   ("Combien de joueurs ?","De 2 à 8 joueurs, répartis entre Helpers et Hackers. Une partie dure environ 20 minutes."),
   ("Que contient la boîte ?","Un plateau de jeu, 6 pions profil, 6 cartes profil, 110 cartes de jeu et un mode d’emploi."),
   ("Dans quelles langues existe-t-il ?","Le jeu existe en néerlandais et en français. Le matériel pédagogique sur la fraude en ligne et les mules financières est lui aussi disponible dans les deux langues."),
   ("Qu’apprennent les élèves ?","Quelles formes de fraude en ligne existent, comment reconnaître les situations suspectes et comment se protéger grâce à une bonne cyberhygiène."),
  ],
  legal="Éditeur de ce site : Hurae · Boulevard Adolphe Max 30, 1000 Bruxelles · BE 0662.479.613",
  footer="&lt;HACKER HOTLINE/&gt; — une initiative de Febelfin × Hurae",
  nf_title="Page introuvable", nf_text="Cette ligne est coupée. La page que vous cherchez n’existe pas (ou plus).", nf_back="Vers la page d’accueil",
 ),
}

INPUT = "w-full rounded border-[3px] border-ink bg-card px-3 py-2.5 outline-none focus:bg-warn/30"
LABEL = "mb-1 block font-mono text-xs uppercase"


def head(t, lang, title, desc, index=True):
    robots = "" if index else '<meta name="robots" content="noindex"/>\n'
    return f'''<!DOCTYPE html>
<html lang="{lang}">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>{title}</title>
<meta name="description" content="{desc}"/>
{robots}<meta property="og:title" content="{title}"/>
<meta property="og:description" content="{desc}"/>
<meta property="og:type" content="website"/>
<meta property="og:image" content="{HERO_IMG}"/>
<meta name="twitter:card" content="summary_large_image"/>
<link rel="alternate" hreflang="nl" href="/"/>
<link rel="alternate" hreflang="fr" href="/fr/"/>
<link rel="icon" href="/favicon.svg" type="image/svg+xml"/>
<link rel="icon" href="/favicon.ico" sizes="48x48"/>
<link rel="apple-touch-icon" href="/apple-touch-icon.png"/>
<meta name="theme-color" content="#0b1320"/>
<link rel="preload" as="image" href="/assets/img/card1.png"/>
<link rel="stylesheet" href="/assets/fonts/fonts.css"/>
<link rel="stylesheet" href="/assets/styles.css"/>
<link rel="stylesheet" href="/assets/site.css"/>
</head>'''


def header(t):
    return f'''<header class="sticky top-0 z-30 border-b-[3px] border-ink bg-ink text-ink-foreground"><div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-3"><a href="{t['path']}#top" class="font-display text-lg uppercase">Hacker Hotline</a><nav class="flex items-center gap-5 font-mono text-sm"><a href="{t['path']}#game" class="hidden sm:inline hover:text-warn">{t['nav_game']}</a><a href="{t['path']}#faq" class="hidden sm:inline hover:text-warn">FAQ</a><a href="{t['path']}#order" class="rounded border-2 border-ink-foreground px-3 py-1 hover:bg-warn hover:text-ink">{t['nav_order']}</a><a href="{t['other_path']}" hreflang="{'fr' if t['other_label']=='FR' else 'nl'}" lang="{'fr' if t['other_label']=='FR' else 'nl'}" title="{t['other_name']}" class="hover:text-warn">{t['other_label']}</a></nav></div></header>'''


def footer(t):
    return f'''<footer class="bg-ink px-6 py-10 text-ink-foreground"><div class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 font-mono text-sm"><span>{t['footer']}</span><span class="flex flex-wrap items-center gap-4"><a href="mailto:info@hurae.com" class="underline">info@hurae.com</a></span></div><div class="mx-auto mt-4 max-w-6xl font-mono text-xs opacity-70">{t['legal']}</div></footer>'''


def addr(t, prefix, req):
    """Adresblok. req='always' = altijd verplicht, 'toggle' = verplicht via JS."""
    r = ' required' if req == 'always' else ' data-addr-required'
    ac = 'billing' if prefix == 'bill' else 'shipping'
    return f'''<div class="addr-grid">
<div class="addr-street"><label for="f-{prefix}-street" class="{LABEL}">{t['l_street']}</label><input id="f-{prefix}-street" name="{prefix}_street"{r} maxlength="120" autocomplete="{ac} address-line1" class="{INPUT}"/></div>
<div class="addr-number"><label for="f-{prefix}-number" class="{LABEL}">{t['l_number']}</label><input id="f-{prefix}-number" name="{prefix}_number"{r} maxlength="10" class="{INPUT}"/></div>
<div class="addr-box"><label for="f-{prefix}-box" class="{LABEL}">{t['l_box']}</label><input id="f-{prefix}-box" name="{prefix}_box" maxlength="10" class="{INPUT}"/></div>
<div class="addr-postcode"><label for="f-{prefix}-postcode" class="{LABEL}">{t['l_postcode']}</label><input id="f-{prefix}-postcode" name="{prefix}_postcode"{r} inputmode="numeric" pattern="[0-9]{{4}}" maxlength="4" autocomplete="{ac} postal-code" class="{INPUT}"/></div>
<div class="addr-city"><label for="f-{prefix}-city" class="{LABEL}">{t['l_city']}</label><input id="f-{prefix}-city" name="{prefix}_city"{r} maxlength="80" autocomplete="{ac} address-level2" class="{INPUT}"/></div>
</div>'''


def page(lang):
    t = T[lang]
    box = "".join(f'<li class="flex items-center gap-3"><span class="h-3 w-3 bg-helper"></span>{i}</li>' for i in t['box_items'])
    faq = "".join(f'<details class="panel group p-5"><summary class="flex cursor-pointer list-none items-center justify-between gap-4 font-display uppercase">{q}<span class="font-mono text-hacker group-open:rotate-45 transition-transform">+</span></summary><p class="mt-3 text-muted-foreground">{a}</p></details>' for q, a in t['faq'])
    feats = "".join(f'<div class="panel p-6"><div class="font-mono text-sm text-hacker">[0{n}]</div><h3 class="mt-3 text-2xl">{t[f"f{n}t"]}</h3><p class="mt-3 text-muted-foreground">{t[f"f{n}"]}</p></div>' for n in (1, 2, 3))
    video = ""
    if t.get("video_title"):
        pl = {k[3:]: t[k] for k in t if k.startswith('pl_')}
        pl_json = html.escape(json.dumps(pl, ensure_ascii=False), quote=True)
        video = f'''<section id="video" class="px-6 py-24"><div class="mx-auto max-w-4xl"><h2 class="text-5xl sm:text-6xl">{t['video_title']}</h2><p class="mt-4 text-lg text-muted-foreground">{t['video_text']}</p>
<div class="hh-player mt-10" data-player data-labels="{pl_json}">
<video controls playsinline preload="metadata" poster="{t['video_poster']}" width="1280" height="720" aria-label="{t['video_alt']}"><source src="{t['video_src']}" type="video/mp4"/></video>
<button type="button" class="hh-big" data-act="big" hidden><span class="hh-big-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z"/></svg></span><span class="hh-big-text"><span class="hh-big-label">{t['pl_big']}</span><span class="hh-big-time">&gt; {t['video_duration']} min_</span></span></button>
<div class="hh-spinner" aria-hidden="true"></div>
<div class="hh-bar" hidden>
<button type="button" class="hh-btn" data-act="play" aria-label="{t['pl_play']}"><svg class="i-play" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z"/></svg><svg class="i-pause" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"/></svg></button>
<span class="hh-time" data-cur>0:00</span>
<div class="hh-track" data-track role="slider" tabindex="0" aria-label="{t['pl_seek']}" aria-valuemin="0" aria-valuemax="0" aria-valuenow="0" aria-valuetext="0:00"><div class="hh-buffer" data-buffer></div><div class="hh-rest" data-rest></div><div class="hh-thumb" data-thumb></div></div>
<span class="hh-time" data-dur>{t['video_duration']}</span>
<button type="button" class="hh-btn hh-speed" data-act="speed" aria-label="{t['pl_speed']}">1×</button>
<button type="button" class="hh-btn" data-act="mute" aria-label="{t['pl_mute']}"><svg class="i-vol" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg><svg class="i-muted" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M16 9.5l5 5M21 9.5l-5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
<button type="button" class="hh-btn" data-act="fs" aria-label="{t['pl_fs']}"><svg class="i-fs" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="square"/></svg><svg class="i-fs-exit" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4v5H4M20 9h-5V4M15 20v-5h5M4 15h5v5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="square"/></svg></button>
</div>
</div></div></section>'''
    msgs = html.escape(f'{{"sending":"{t["sending"]}","ok":"{t["ok"]}","err":"{t["err"]}"}}', quote=True)
    return f'''{head(t, lang, t['title'], t['desc'])}
<body>
<main class="overflow-x-hidden">
{header(t)}
<section id="top" class="bg-game relative px-6 pb-24 pt-16"><div class="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.1fr_1fr]"><div><p class="mb-5 inline-block rounded bg-ink px-3 py-1 font-mono text-xs text-warn">{t['tag']}</p><h1 class="animate-glitch text-6xl text-ink sm:text-8xl">Hacker<br/>Hotline</h1><p class="mt-6 max-w-lg text-xl font-bold text-ink">{t['lead']}</p><p class="mt-3 max-w-lg text-ink">{t['intro']}</p><div class="mt-8 flex flex-wrap gap-4"><a href="#order" class="btn-block bg-ink text-ink-foreground">{t['cta']}</a><a href="#faq" class="btn-block bg-paper text-ink">FAQ</a></div><div class="mt-10 flex gap-3"><div class="panel px-4 py-2 text-center"><div class="font-mono text-[10px] uppercase text-muted-foreground">{t['st_players']}</div><div class="font-display text-2xl">2–8</div></div><div class="panel px-4 py-2 text-center"><div class="font-mono text-[10px] uppercase text-muted-foreground">{t['st_age']}</div><div class="font-display text-2xl">10+</div></div><div class="panel px-4 py-2 text-center"><div class="font-mono text-[10px] uppercase text-muted-foreground">{t['st_time']}</div><div class="font-display text-2xl">20&#x27;</div></div></div></div><div class="relative h-[460px]"><img src="/assets/img/card1.png" alt="{t['alt1']}" width="501" height="760" class="animate-floaty absolute left-[4%] top-6 w-48 rounded-lg border-[3px] border-ink shadow-block [--r:-8deg] sm:w-56"/><img src="/assets/img/card2.png" alt="{t['alt2']}" width="501" height="760" class="animate-floaty absolute right-[4%] top-0 w-48 rounded-lg border-[3px] border-ink shadow-block [--r:7deg] [animation-delay:1.2s] sm:w-56"/><img src="/assets/img/card3.png" alt="{t['alt3']}" width="501" height="760" class="animate-floaty absolute bottom-0 left-1/2 w-44 -translate-x-1/2 rounded-lg border-[3px] border-ink shadow-block [--r:2deg] [animation-delay:2.4s] sm:w-48"/></div></div></section>
<div class="border-y-[3px] border-ink bg-ink px-6 py-5"><div class="mx-auto flex max-w-6xl items-center gap-4 font-mono text-xs text-ink-foreground"><span class="text-hacker">{t['hacked']}</span><div class="bg-meter h-4 flex-1 rounded border-2 border-ink-foreground"></div><span class="text-helper">{t['safe']}</span></div></div>
<section id="game" class="px-6 py-24"><div class="mx-auto max-w-6xl"><h2 class="text-5xl sm:text-6xl">{t['h2_game']}</h2><div class="mt-12 grid gap-6 md:grid-cols-3">{feats}</div><div class="mt-16 grid items-center gap-10 md:grid-cols-2"><img src="{HERO_IMG}" alt="{t['photo_alt']}" loading="lazy" class="w-full rounded-lg border-[3px] border-ink shadow-block"/><div><h3 class="text-3xl">{t['box']}</h3><ul class="mt-5 space-y-2 font-mono">{box}</ul><img src="/assets/img/card4.png" alt="{t['alt4']}" width="501" height="760" loading="lazy" class="mt-8 w-36 rotate-3 rounded-lg border-[3px] border-ink shadow-block"/></div></div></div></section>
{video}
<section id="order" class="bg-game px-6 py-24"><div class="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_1.3fr]"><div class="text-ink"><h2 class="text-5xl sm:text-6xl">{t['h2_order']}</h2><p class="mt-6 text-lg font-bold">{t['order_free']}</p><p class="mt-3">{t['order_how']}</p><p class="mt-6 font-mono text-sm">{t['order_mail']} <a href="mailto:info@hurae.com" class="underline">info@hurae.com</a></p></div>
<form id="order-form" class="panel grid gap-4 p-6 sm:grid-cols-2 sm:p-8" data-page-lang="{lang}" data-msg="{msgs}" data-price="39" data-ship="7.5" data-locale="{lang}-BE" data-ship-word="{t['ship_word']}" data-vat-word="{t['vat_word']}" novalidate>
<div><label for="f-name" class="{LABEL}">{t['l_name']}</label><input id="f-name" required maxlength="120" autocomplete="name" class="{INPUT}" name="name"/></div>
<div><label for="f-org" class="{LABEL}">{t['l_org']}</label><input id="f-org" required maxlength="160" autocomplete="organization" class="{INPUT}" name="org"/></div>
<div><label for="f-email" class="{LABEL}">{t['l_email']}</label><input id="f-email" required type="email" maxlength="160" autocomplete="email" class="{INPUT}" name="email"/></div>
<div><label for="f-phone" class="{LABEL}">{t['l_phone']}</label><input id="f-phone" type="tel" maxlength="40" autocomplete="tel" class="{INPUT}" name="phone"/></div>
<div><label for="f-lang" class="{LABEL}">{t['l_lang']}</label><select id="f-lang" name="lang" class="{INPUT}"><option value="nl"{' selected' if lang=='nl' else ''}>{t['o_nl']}</option><option value="fr"{' selected' if lang=='fr' else ''}>{t['o_fr']}</option></select></div>
<div><label for="f-qty" class="{LABEL}">{t['l_qty']}</label><input id="f-qty" type="number" min="1" max="20" required class="{INPUT}" name="qty" value="1"/></div>
<fieldset class="form-block sm:col-span-2"><legend class="{LABEL}">{t['l_billing']}</legend>
<div class="addr-grid mb-4"><div class="addr-half"><label for="f-bill-name" class="{LABEL}">{t['l_bname']}</label><input id="f-bill-name" name="bill_name" required maxlength="160" autocomplete="billing organization" class="{INPUT}"/></div>
<div class="addr-half"><label for="f-vat" class="{LABEL}">{t['l_vat']}</label><input id="f-vat" name="vat" maxlength="20" placeholder="{t['ph_vat']}" class="{INPUT}"/></div></div>
{addr(t, 'bill', 'always')}
<div class="mt-4"><label for="f-bill-email" class="{LABEL}">{t['l_bemail']}</label><input id="f-bill-email" name="bill_email" type="email" maxlength="160" placeholder="{t['ph_bemail']}" class="{INPUT}"/></div>
</fieldset>
<div class="sm:col-span-2"><span class="{LABEL}">{t['l_delivery']}</span><input type="hidden" name="delivery" value="pickup"/><div class="grid grid-cols-2 gap-3" role="group" aria-label="{t['l_delivery']}"><button type="button" data-delivery="pickup" aria-pressed="true" class="rounded border-[3px] border-ink px-3 py-3 font-display text-sm uppercase bg-ink text-ink-foreground">{t['d_pickup']}</button><button type="button" data-delivery="ship" aria-pressed="false" class="rounded border-[3px] border-ink px-3 py-3 font-display text-sm uppercase bg-card">{t['d_ship']} +&nbsp;{'€&nbsp;7,50' if lang=='nl' else '7,50&nbsp;€'}</button></div></div>
<div class="sm:col-span-2" id="ship-wrap" hidden><label class="check-row"><input type="checkbox" id="f-same" name="same_address" value="1" checked/> <span>{t['l_same']}</span></label>
<fieldset id="address-wrap" class="form-block mt-4" hidden><legend class="{LABEL}">{t['l_address']}</legend>{addr(t, 'ship', 'toggle')}</fieldset></div>
<div class="sm:col-span-2"><label for="f-msg" class="{LABEL}">{t['l_msg']}</label><textarea id="f-msg" name="msg" rows="3" maxlength="2000" class="{INPUT}"></textarea></div>
<div class="hp-field" aria-hidden="true"><label for="f-website">{t['hp']}</label><input id="f-website" name="website" tabindex="-1" autocomplete="off"/></div>
<div class="order-total sm:col-span-2"><span class="font-mono text-xs uppercase">{t['l_total']}</span><strong id="total-amount" class="font-display text-2xl"></strong><span id="total-detail" class="font-mono text-xs"></span></div>
<label class="check-row sm:col-span-2"><input type="checkbox" id="f-accept" name="accept" value="1" required/> <span>{t['accept']}</span></label>
<button type="submit" class="btn-block bg-hacker text-ink-foreground sm:col-span-2">{t['submit']}</button>
<p class="sm:col-span-2 font-mono text-xs text-muted-foreground">{t['privacy']}</p>
<p id="form-status" class="form-status sm:col-span-2 font-mono text-sm" role="status" aria-live="polite" hidden></p>
</form></div></section>
<section id="faq" class="px-6 py-24"><div class="mx-auto max-w-3xl"><h2 class="text-5xl sm:text-6xl">FAQ</h2><div class="mt-10 space-y-4">{faq}</div></div></section>
{footer(t)}
</main>
<script src="/assets/site.js" defer></script>
{'<script src="/assets/player.js" defer></script>' if video else ''}
</body>
</html>
'''


def notfound():
    t = T['nl']; f = T['fr']
    return f'''{head(t, 'nl', 'Pagina niet gevonden – Hacker Hotline', t['nf_text'], index=False)}
<body>
<main class="overflow-x-hidden">
{header(t)}
<section class="bg-game px-6 py-24"><div class="mx-auto max-w-3xl text-ink"><p class="mb-5 inline-block rounded bg-ink px-3 py-1 font-mono text-xs text-warn">&gt; error: 404_</p><h1 class="animate-glitch text-6xl sm:text-8xl">404</h1><p class="mt-6 text-xl font-bold">{t['nf_title']}</p><p class="mt-3">{t['nf_text']}</p><p class="mt-3" lang="fr">{f['nf_text']}</p><div class="mt-8 flex flex-wrap gap-4"><a href="/" class="btn-block bg-ink text-ink-foreground">{t['nf_back']}</a><a href="/fr/" lang="fr" class="btn-block bg-paper text-ink">{f['nf_back']}</a></div></div></section>
{footer(t)}
</main>
</body>
</html>
'''


os.makedirs(os.path.join(ROOT, 'public/fr'), exist_ok=True)
open(os.path.join(ROOT, 'public/index.html'), 'w').write(page('nl'))
open(os.path.join(ROOT, 'public/fr/index.html'), 'w').write(page('fr'))
open(os.path.join(ROOT, 'public/404.html'), 'w').write(notfound())
print('ok')
