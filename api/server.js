const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public'))); // <-- public Ordner bereitstellen

// Route für Startseite
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Kontaktformular-Route
app.post('/contact', (req, res) => {
  const { name, email, msg } = req.body;
  console.log('Neue Nachricht:', name, email, msg);

  // TODO: Hier E-Mail-Versand mit SMTP einbauen
  res.json({ status: 'success', message: 'Nachricht empfangen' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});
