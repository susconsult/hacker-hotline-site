/**
 * Hacker Hotline – bestellingen naar Google Sheet + meldingsmail.
 *
 * Installatie (eenmalig):
 * 1. Maak een nieuwe Google Sheet aan (in het juiste Google-account).
 * 2. Extensies -> Apps Script. Plak dit hele bestand in Code.gs en sla op.
 * 3. Projectinstellingen (tandwiel) -> Scripteigenschappen -> toevoegen:
 *      NOTIFY_EMAIL = het adres (of adressen, gescheiden door komma's) dat een melding krijgt
 * 4. Implementeren -> Nieuwe implementatie -> type "Web-app"
 *      Uitvoeren als: Ik
 *      Wie heeft toegang: Iedereen
 *    Geef de gevraagde toestemmingen.
 * 5. Kopieer het adres van de web-app (eindigt op /exec) en zet het in Cloudflare
 *    als Secret met de naam SHEET_URL.
 *
 * Na elke wijziging aan dit script: Implementeren -> Implementaties beheren ->
 * potlood -> Versie: "Nieuwe versie" -> Implementeren. Alleen opslaan is niet genoeg.
 */

var SHEET_NAME = 'Bestellingen';
var COLUMNS = [
  ['ID', 'id'],
  ['Ontvangen', 'timestamp'],
  ['Pagina', 'page_lang'],
  ['Contactpersoon', 'name'],
  ['School / organisatie', 'org'],
  ['E-mail', 'email'],
  ['Telefoon', 'phone'],
  ['Taal spel', 'lang'],
  ['Aantal', 'qty'],
  ['Levering', 'delivery'],
  ['Totaal (€, incl. btw)', 'total'],
  ['Naam op factuur', 'bill_name'],
  ['Ondernemingsnr. / btw', 'vat'],
  ['Fact. straat', 'bill_street'],
  ['Fact. nr', 'bill_number'],
  ['Fact. bus', 'bill_box'],
  ['Fact. postcode', 'bill_postcode'],
  ['Fact. gemeente', 'bill_city'],
  ['Factuur-e-mail', 'bill_email'],
  ['Lever. straat', 'ship_street'],
  ['Lever. nr', 'ship_number'],
  ['Lever. bus', 'ship_box'],
  ['Lever. postcode', 'ship_postcode'],
  ['Lever. gemeente', 'ship_city'],
  ['Bericht', 'msg'],
  ['Akkoord bestelling', 'accepted'],
  ['Gefactureerd', null],
  ['Betaald', null],
  ['Verstuurd / opgehaald', null]
];
var CHECKBOX_COLS = 3; // de laatste drie kolommen zijn vinkjes voor de opvolging

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    var d = JSON.parse(e.postData.contents);
    if (!d || !d.id || !d.name || !d.email) return out_({ ok: false, error: 'missing_fields' });

    var sheet = getSheet_();
    if (isDuplicate_(sheet, d.id)) return out_({ ok: true, duplicate: true });

    var values = COLUMNS.filter(function (c) { return c[1]; }).map(function (c) {
      var k = c[1], v = d[k];
      if (k === 'timestamp') return new Date(v || new Date());
      if (k === 'lang') return v === 'fr' ? 'Frans' : 'Nederlands';
      if (k === 'delivery') return v === 'ship' ? 'Opsturen' : 'Ophalen';
      if (k === 'accepted') return v === true ? 'Ja' : 'Nee';
      if (k === 'qty' || k === 'total') return Number(v) || 0;
      return safe_(v);
    });

    var row = sheet.getLastRow() + 1;
    sheet.getRange(row, 1, 1, values.length).setValues([values]);
    // Vinkjes alleen in de nieuwe rij (niet in de hele kolom).
    sheet.getRange(row, values.length + 1, 1, CHECKBOX_COLS).insertCheckboxes();

    notify_(d);
    return out_({ ok: true });
  } catch (err) {
    return out_({ ok: false, error: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
}

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    var headers = COLUMNS.map(function (c) { return c[0]; });
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  }
  return sheet;
}

function isDuplicate_(sheet, id) {
  if (sheet.getLastRow() < 2) return false;
  return !!sheet.getRange(2, 1, sheet.getLastRow() - 1, 1)
    .createTextFinder(String(id)).matchEntireCell(true).findNext();
}

// Voorkomt dat tekst als formule in de sheet terechtkomt.
function safe_(v) {
  var s = String(v == null ? '' : v);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function euro_(n) {
  return '€ ' + Number(n || 0).toFixed(2).replace('.', ',');
}

function adres_(street, number, box, postcode, city) {
  return street + ' ' + number + (box ? ' bus ' + box : '') + ', ' + postcode + ' ' + city;
}

function notify_(d) {
  var to = PropertiesService.getScriptProperties().getProperty('NOTIFY_EMAIL');
  if (!to) return;
  var lines = [
    'Nieuwe bestelling voor Hacker Hotline',
    '',
    d.qty + ' x ' + euro_(d.price) + (d.shipping ? ' + ' + euro_(d.shipping) + ' verzending' : '') + ' = ' + euro_(d.total) + ' (incl. btw)',
    'Levering: ' + (d.delivery === 'ship' ? 'Opsturen' : 'Ophalen bij Febelfin'),
    'Taal spel: ' + (d.lang === 'fr' ? 'Frans' : 'Nederlands'),
    '',
    'Contact: ' + d.name + ' – ' + d.org,
    'E-mail: ' + d.email,
    'Telefoon: ' + (d.phone || '-'),
    '',
    'Factuur: ' + d.bill_name + (d.vat ? ' (' + d.vat + ')' : ''),
    'Facturatieadres: ' + adres_(d.bill_street, d.bill_number, d.bill_box, d.bill_postcode, d.bill_city),
    'Factuur-e-mail: ' + (d.bill_email || d.email)
  ];
  if (d.delivery === 'ship') {
    lines.push('Leveradres: ' + adres_(d.ship_street, d.ship_number, d.ship_box, d.ship_postcode, d.ship_city));
  }
  lines.push('', 'Bericht:', d.msg || '-', '', 'Akkoord met bestelling: ' + (d.accepted ? 'ja' : 'nee'),
    '', 'Sheet: ' + SpreadsheetApp.getActiveSpreadsheet().getUrl());
  MailApp.sendEmail({
    to: to,
    replyTo: d.email,
    subject: 'Hacker Hotline – bestelling van ' + d.org + ' (' + d.qty + 'x, ' + euro_(d.total) + ')',
    body: lines.join('\n')
  });
}

function out_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
