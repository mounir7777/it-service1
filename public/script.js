// Kleine, zugängliche Enhancements für die Landingpage
(() => {
  const $ = (sel, parent = document) => parent.querySelector(sel);
  const $$ = (sel, parent = document) => [...parent.querySelectorAll(sel)];

  // 1) Mobile nav (Burger-Menü)
  const burger = $('#burger');
  const menu = $('#navMenu');
  if (burger && menu) {
    burger.addEventListener('click', () => {
      const open = menu.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
    });
    // schließen, wenn ein Link angeklickt wird
    $$('#navMenu a').forEach(a => a.addEventListener('click', () => {
      menu.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
    }));
  }

  // 2) Smooth Scrolling (respektiert reduced motion)
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReduced) {
    $$('.nav__menu a[href^="#"], a.btn[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const id = a.getAttribute('href');
        const target = id && id.startsWith('#') ? $(id) : null;
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  // 3) Jahr im Footer setzen
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // 4) Kontaktformular: leichte Validierung + optionaler Fetch
  const form = $('#contactForm');
  const msg = $('#formMsg');
  if (form && msg) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      msg.textContent = '';
      msg.className = 'form-msg';

      const formData = new FormData(form);
      const name = (formData.get('name') || '').toString().trim();
      const email = (formData.get('email') || '').toString().trim();
      const message = (formData.get('message') || '').toString().trim();

      if (!name || !email || !message) {
        msg.textContent = 'Bitte füllen Sie alle Pflichtfelder aus.';
        msg.classList.add('err');
        return;
      }
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        msg.textContent = 'Bitte geben Sie eine gültige E-Mail-Adresse ein.';
        msg.classList.add('err');
        return;
      }

      // Falls du ein Backend hast, passe den Endpoint an:
      // Beispiel Express: POST /contact  (siehe dein API-Code)
      const endpoint = '/contact';

      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, msg: message })
        });

        if (res.ok) {
          form.reset();
          msg.textContent = 'Danke! Ihre Nachricht wurde gesendet.';
          msg.classList.add('ok');
        } else {
          throw new Error('Serverantwort nicht OK');
        }
      } catch {
        // Fallback: Mailprogramm mit vorbefüllten Daten öffnen
        // HINWEIS: Ersetze die Adresse unten mit deiner echten E-Mail
        const to = 'info@example.com';
        const subject = encodeURIComponent('Kontaktanfrage – IT Service Level1');
        const body = encodeURIComponent(`Name: ${name}\nE-Mail: ${email}\n\nNachricht:\n${message}`);
        window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
        msg.textContent = 'Es wurde Ihr E-Mail-Programm geöffnet. Sie können die Nachricht dort senden.';
        msg.classList.add('ok');
      }
    });
  }
})();
