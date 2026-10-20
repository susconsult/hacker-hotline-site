// Bestelformulier: keuze ophalen/opsturen en versturen naar /api/aanvraag.
(function () {
  var form = document.getElementById('order-form');
  if (!form) return;

  var msg = {};
  try { msg = JSON.parse(form.getAttribute('data-msg') || '{}'); } catch (e) {}

  var deliveryInput = form.querySelector('input[name="delivery"]');
  var addressWrap = document.getElementById('address-wrap');
  var addrFields = form.querySelectorAll('[data-addr-required]');
  var status = document.getElementById('form-status');
  var submit = form.querySelector('button[type="submit"]');
  var buttons = form.querySelectorAll('[data-delivery]');
  var ON = ['bg-ink', 'text-ink-foreground'];
  var OFF = ['bg-card'];

  function setDelivery(value) {
    deliveryInput.value = value;
    buttons.forEach(function (b) {
      var active = b.getAttribute('data-delivery') === value;
      b.setAttribute('aria-pressed', active ? 'true' : 'false');
      ON.forEach(function (c) { b.classList.toggle(c, active); });
      OFF.forEach(function (c) { b.classList.toggle(c, !active); });
    });
    var ship = value === 'ship';
    addressWrap.hidden = !ship;
    addrFields.forEach(function (el) { el.required = ship; });
  }
  buttons.forEach(function (b) {
    b.addEventListener('click', function () { setDelivery(b.getAttribute('data-delivery')); });
  });

  function show(state, text) {
    status.hidden = false;
    status.setAttribute('data-state', state);
    status.textContent = text;
  }

  // Een ID per aanvraag: opnieuw proberen maakt geen dubbele rij.
  var requestId = null;
  function newId() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
  }

  form.addEventListener('input', function (e) {
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
