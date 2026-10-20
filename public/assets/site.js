// Bestelformulier: ophalen/opsturen, leveradres, totaal en versturen naar /api/aanvraag.
(function () {
  var form = document.getElementById('order-form');
  if (!form) return;

  var msg = {};
  try { msg = JSON.parse(form.getAttribute('data-msg') || '{}'); } catch (e) {}

  var PRICE = parseFloat(form.getAttribute('data-price')) || 39;
  var SHIP = parseFloat(form.getAttribute('data-ship')) || 0;
  var locale = form.getAttribute('data-locale') || 'nl-BE';
  var shipWord = form.getAttribute('data-ship-word') || '';
  var vatWord = form.getAttribute('data-vat-word') || '';

  var deliveryInput = form.querySelector('input[name="delivery"]');
  var shipWrap = document.getElementById('ship-wrap');
  var addressWrap = document.getElementById('address-wrap');
  var same = document.getElementById('f-same');
  var shipFields = form.querySelectorAll('[data-addr-required]');
  var qty = document.getElementById('f-qty');
  var totalAmount = document.getElementById('total-amount');
  var totalDetail = document.getElementById('total-detail');
  var status = document.getElementById('form-status');
  var submit = form.querySelector('button[type="submit"]');
  var buttons = form.querySelectorAll('[data-delivery]');
  var ON = ['bg-ink', 'text-ink-foreground'];
  var OFF = ['bg-card'];

  var fmt;
  try { fmt = new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR' }); }
  catch (e) { fmt = { format: function (n) { return '€ ' + n.toFixed(2).replace('.', ','); } }; }

  function count() {
    var n = parseInt(qty.value, 10);
    return isNaN(n) ? 1 : Math.min(20, Math.max(1, n));
  }

  function updateTotal() {
    var n = count();
    var ship = deliveryInput.value === 'ship' ? SHIP : 0;
    totalAmount.textContent = fmt.format(n * PRICE + ship);
    var detail = n + ' × ' + fmt.format(PRICE);
    if (ship) detail += ' + ' + fmt.format(ship) + ' ' + shipWord;
    totalDetail.textContent = detail + ', ' + vatWord;
  }

  function updateAddress() {
    var ship = deliveryInput.value === 'ship';
    shipWrap.hidden = !ship;
    var own = ship && !same.checked;
    addressWrap.hidden = !own;
    shipFields.forEach(function (el) { el.required = own; });
  }

  function setDelivery(value) {
    deliveryInput.value = value;
    buttons.forEach(function (b) {
      var active = b.getAttribute('data-delivery') === value;
      b.setAttribute('aria-pressed', active ? 'true' : 'false');
      ON.forEach(function (c) { b.classList.toggle(c, active); });
      OFF.forEach(function (c) { b.classList.toggle(c, !active); });
    });
    updateAddress();
    updateTotal();
  }

  buttons.forEach(function (b) {
    b.addEventListener('click', function () { setDelivery(b.getAttribute('data-delivery')); });
  });
  same.addEventListener('change', updateAddress);
  qty.addEventListener('input', updateTotal);

  function show(state, text) {
    status.hidden = false;
    status.setAttribute('data-state', state);
    status.textContent = text;
  }

  // Een ID per bestelling: opnieuw proberen maakt geen dubbele rij.
  var requestId = null;
  function newId() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
  }

  form.addEventListener('input', function (e) {
    if (e.target.classList) e.target.classList.remove('field-error');
  });
  form.addEventListener('change', function (e) {
    if (e.target.classList) e.target.classList.remove('field-error');
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var invalid = Array.prototype.filter.call(form.elements, function (el) {
      return el.willValidate && !el.checkValidity();
    });
    invalid.forEach(function (el) { el.classList.add('field-error'); });
    if (invalid.length) { invalid[0].reportValidity(); return; }

    var data = {};
    new FormData(form).forEach(function (v, k) { data[k] = String(v).trim(); });
    data.same_address = same.checked ? '1' : '0';
    data.accept = document.getElementById('f-accept').checked ? '1' : '0';
    if (!requestId) requestId = newId();
    data.id = requestId;
    data.page_lang = form.getAttribute('data-page-lang') || 'nl';

    submit.disabled = true;
    show('busy', msg.sending || '…');

    fetch('/api/aanvraag', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(data)
    })
      .then(function (r) { return r.json().catch(function () { return {}; }); })
      .then(function (res) {
        if (res && res.ok === true) {
          show('ok', msg.ok);
          form.reset();
          setDelivery('pickup');
          requestId = null;
        } else {
          show('err', msg.err);
        }
      })
      .catch(function () { show('err', msg.err); })
      .then(function () { submit.disabled = false; });
  });

  setDelivery('pickup');
})();
