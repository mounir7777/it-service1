// api/server.js  — Docker-Version (serves api/public + send mail via Nodemailer)
require('dotenv').config();
const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

// ---- Static Frontend (liegt in api/public) ----
const PUBLIC_DIR = path.join(__dirname, 'public'); // <— WICHTIG bei Docker
console.log('Serving static from:', PUBLIC_DIR);

app.use(express.json({ limit: '100kb' }));
app.use(express.static(PUBLIC_DIR));

app.get('/', (_req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

// ---- Mail Transport (ENV) ----
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,                      // z.B. smtp.gmail.com
  port: Number(process.env.SMTP_PORT || 465),       // 465 = SSL, 587 = STARTTLS
  secure: String(process.env.SMTP_SECURE).toLowerCase() === 'true',
  auth: {
    user: process.env.SMTP_USER,                    // z.B. dein Gmail-Account
    pass: process.env.SMTP_PASS                     // 16-stelliges App-Passwort
  }
});

// Optional: SMTP prüfen (nicht blockierend)
transporter.verify()
  .then(() => console.log('SMTP ready'))
  .catch(err => console.warn('SMTP verify failed:', err.message));

// ---- Kontakt-Endpoint ----
app.post('/contact', async (req, res) => {
  try {
    const { name, email, msg } = req.body || {};
    if (!name || !email || !msg) {
      return res.status(400).json({ ok: false, message: 'Bitte alle Felder ausfüllen.' });
    }

    // leichte Säuberung gegen Header-Injection
    const clean = s => String(s).replace(/[\r\n]/g, ' ').trim();

    await transporter.sendMail({
      from: process.env.FROM_EMAIL || 'IT Service Level1 <no-reply@itservice1.com>',
      to: process.env.TO_EMAIL || 'ccappitcho7@gmail.com',
      replyTo: clean(email),
      subject: `Kontakt – ${clean(name)}`,
      text: `Name: ${clean(name)}\nE-Mail: ${clean(email)}\n\nNachricht:\n${msg}`,
      html: `<p><b>Name:</b> ${clean(name)}</p>
             <p><b>E-Mail:</b> ${clean(email)}</p>
             <p><b>Nachricht:</b><br>${String(msg).replace(/\n/g,'<br>')}</p>`
    });

    return res.json({ ok: true, message: 'Danke! Ihre Nachricht wurde gesendet.' });
  } catch (err) {
    console.error('MAIL_ERROR:', err);
    return res.status(502).json({ ok: false, message: 'Senden fehlgeschlagen – bitte später erneut.' });
  }
});

// ---- Healthcheck für Render ----
app.get('/healthz', (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => console.log(`Server läuft auf :${PORT}`));

