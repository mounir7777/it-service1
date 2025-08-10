(() => {
  const $ = (s, p=document) => p.querySelector(s);
  const $$ = (s, p=document) => [...p.querySelectorAll(s)];

  // Mobile Menü
  const burger = $('#burger');
  const menu = $('#navMenu');
  if (burger && menu) {
    burger.addEventListener('click', () => {
      const open = menu.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
    });
    $$('#navMenu a').forEach(a => a.addEventListener('click', () => {
      menu.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false');
    }));
  }

  // Footer-Jahr
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Kontaktformular
  const form = document.getElementById('contactForm');
  const msgEl = document.getElementById('formMsg');

  const setMsg = (text, ok=false) => {
    if (!msgEl) return;
    msgEl.textContent = text || '';
    msgEl.className = 'form-msg ' + (ok ? 'ok' : 'err');
  };

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (msgEl) { msgEl.textContent = ''; msgEl.className = 'form-msg'; }

      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const message = form.message.value.trim();

      if (!name || !email || !message) {
        return setMsg('Bitte füllen Sie alle Felder aus.');
      }
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        return setMsg('Bitte geben Sie eine gültige E-Mail ein.');
      }

      try {
        const res = await fetch('/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, msg: message })
        });

        const data = await res.json().catch(() => ({}));
        if (res.ok && data.ok) {
          form.reset();
          setMsg('Danke! Ihre Nachricht wurde gesendet.', true);
        } else {
          setMsg(data.message || 'Senden fehlgeschlagen – bitte später erneut.');
        }
      } catch {
        setMsg('Keine Verbindung zum Server.');
      }
    });
  }
})();
