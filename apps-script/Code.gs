/**
 * Hacker Hotline – bestelaanvragen naar Google Sheet + meldingsmail.
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

var SHEET_NAME = 'Aanvragen';
var HEADERS = ['ID', 'Ontvangen', 'Pagina', 'Naam', 'School / organisatie', 'E-mail', 'Telefoon',
  'Taal spel', 'Aantal', 'Levering', 'Leveradres', 'Bericht', 'Opgevolgd'];

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    var d = JSON.parse(e.postData.contents);
    if (!d || !d.id || !d.name || !d.email) return out_({ ok: false, error: 'missing_fields' });

    var sheet = getSheet_();
    if (isDuplicate_(sheet, d.id)) return out_({ ok: true, duplicate: true });

    var lastRow = sheet.getLastRow() + 1;
    sheet.getRange(lastRow, 1, 1, HEADERS.length - 1).setValues([[
      safe_(d.id),
      new Date(d.timestamp || new Date()),
      safe_(d.page_lang),
      safe_(d.name),
      safe_(d.org),
      safe_(d.email),
      safe_(d.phone),
      d.lang === 'fr' ? 'Frans' : 'Nederlands',
      Number(d.qty) || 1,
      d.delivery === 'ship' ? 'Opsturen' : 'Ophalen',
      safe_(d.address),
      safe_(d.msg)
    ]]);
    // Selectievakje alleen in de nieuwe rij (niet in de hele kolom).
    sheet.getRange(lastRow, HEADERS.length).insertCheckboxes();

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
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
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

function notify_(d) {
  var to = PropertiesService.getScriptProperties().getProperty('NOTIFY_EMAIL');
  if (!to) return;
  var body = [
    'Nieuwe aanvraag voor Hacker Hotline',
    '',
    'Naam: ' + d.name,
    'School / organisatie: ' + d.org,
    'E-mail: ' + d.email,
    'Telefoon: ' + (d.phone || '-'),
    'Taal spel: ' + (d.lang === 'fr' ? 'Frans' : 'Nederlands'),
    'Aantal: ' + d.qty,
    'Levering: ' + (d.delivery === 'ship' ? 'Opsturen' : 'Ophalen'),
    d.delivery === 'ship' ? 'Leveradres: ' + d.address : '',
    '',
    'Bericht:',
    d.msg || '-',
    '',
    'Sheet: ' + SpreadsheetApp.getActiveSpreadsheet().getUrl()
  ].join('\n');
  MailApp.sendEmail({
    to: to,
    replyTo: d.email,
    subject: 'Hacker Hotline – aanvraag van ' + d.org + ' (' + d.qty + 'x)',
    body: body
  });
}

function out_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
