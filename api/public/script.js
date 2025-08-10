(() => {
  const $ = (s, p = document) => p.querySelector(s);
  const $$ = (s, p = document) => [...p.querySelectorAll(s)];

  // ----- Mobile-Menü -----
  const burger = $('#burger');
  const menu = $('#navMenu');
  if (burger && menu) {
    burger.addEventListener('click', () => {
      const open = menu.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
    });
    $$('#navMenu a').forEach(a =>
      a.addEventListener('click', () => {
        menu.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
      })
    );
  }

  // ----- Footer-Jahr -----
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // ----- Kontaktformular -----
  const form = $('#contactForm');
  const msgEl = $('#formMsg');
  const submitBtn = form ? form.querySelector('button[type="submit"]') : null;

  // Spam-Schutz: Timestamp-Feld beim Laden setzen
  const tsField = $('#ts');
  if (tsField) tsField.value = String(Date.now());

  const setMsg = (text, ok = false) => {
    if (!msgEl) return;
    msgEl.textContent = text || '';
    msgEl.className = 'form-msg ' + (ok ? 'ok' : 'err');
  };

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      setMsg('', false);

      const data = {
        name: form.name.value.trim(),
        email: form.email.value.trim(),
        msg: form.message.value.trim(),
        // Spam-Schutz:
        hp: form.hp ? form.hp.value.trim() : '',          // Honeypot (muss leer sein)
        ts: tsField ? Number(tsField.value) : 0           // Timestamp vom Seitenaufruf
      };

      // Basische Checks im Browser
      if (!data.name || !data.email || !data.msg) {
        return setMsg('Bitte füllen Sie alle Felder aus.');
      }
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email)) {
        return setMsg('Bitte geben Sie eine gültige E-Mail ein.');
      }

      // Button sperren, Doppel-Submit verhindern
      submitBtn && (submitBtn.disabled = true);

      try {
        const res = await fetch('/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        const json = await res.json().catch(() => ({}));
        if (res.ok && json.ok) {
          form.reset();
          // neuen Timestamp für nächsten Submit setzen
          if (tsField) tsField.value = String(Date.now());
          setMsg('Danke! Ihre Nachricht wurde gesendet.', true);
        } else {
          setMsg(json.message || 'Senden fehlgeschlagen – bitte später erneut.');
        }
      } catch (err) {
        setMsg('Keine Verbindung zum Server.');
      } finally {
        submitBtn && (submitBtn.disabled = false);
      }
    });
  }
})();
