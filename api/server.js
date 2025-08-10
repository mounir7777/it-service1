// Serve Frontend + E-Mail-Versand (Nodemailer) unter EINER Render-URL
require('dotenv').config();
const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

// Frontend ausliefern
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Startseite
app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Nodemailer-Transport (ENV)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,                      // z.B. smtp.gmail.com
  port: Number(process.env.SMTP_PORT || 465),       // 465 = SSL, 587 = STARTTLS
  secure: process.env.SMTP_SECURE === 'true',       // "true" -> 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Kontakt-Endpoint
app.post('/contact', async (req, res) => {
  try {
    const { name, email, msg } = req.body || {};
    if (!name || !email || !msg) {
      return res.status(400).json({ ok: false, message: 'Bitte alle Felder ausfüllen.' });
    }

    const clean = s => String(s).replace(/[\r\n]/g, ' ').trim();

    await transporter.sendMail({
      from: process.env.FROM_EMAIL || 'IT Service Level1 <no-reply@example.com>',
      to: process.env.TO_EMAIL || 'ccappitcho7@gmail.com', // Fallback: deine Mail
      replyTo: clean(email),
      subject: `Kontakt – ${clean(name)}`,
      text: `Name: ${clean(name)}\nE-Mail: ${clean(email)}\n\nNachricht:\n${msg}`,
      html: `<p><b>Name:</b> ${clean(name)}</p>
             <p><b>E-Mail:</b> ${clean(email)}</p>
             <p><b>Nachricht:</b><br>${String(msg).replace(/\n/g, '<br>')}</p>`
    });

    res.json({ ok: true, message: 'Danke! Ihre Nachricht wurde gesendet.' });
  } catch (e) {
    console.error('MAIL_ERROR:', e.message);
    res.status(502).json({ ok: false, message: 'Senden fehlgeschlagen – bitte später erneut.' });
  }
});

// Healthcheck (für Render)
app.get('/healthz', (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => console.log(`Server läuft auf :${PORT}`));
