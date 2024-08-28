const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const https = require('body-parser');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

//CSRF orchrana
app.use((req, res, next) => {
  if (!req.session) {
    req.session = {};
  }
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString('hex');
  }
  res.locals.csrfToken = req.session.csrfToken;
  next();
});

//Middleware pro kontrolu CSRF tokenu
const csrfProtection = (req, res, next) => {
  if (req.method === 'POST') {
    if (req.body._csrf !== req.session.csrfToken) {
      return res.status(403).json({ status: 'error', message: 'Neplatný CSRF token'});
    }
  }
  next();
};

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/process-payment', (req, res) => {
  const { cardNumber, expiryDate, cvv, amount } = req.body;
  
  // Zde by byla logika pro zpracování platby
  console.log('Přijata platba:', { cardNumber, expiryDate, cvv, amount });
  
  // Simulace zpracování platby
  const success = Math.random() < 0.8; // 80% šance na úspěch
  
  if (success) {
    res.json({ status: 'success', message: 'Platba byla úspěšně zpracována' });
  } else {
    res.status(400).json({ status: 'error', message: 'Platba se nezdařila' });
  }
});

// Konfigurace HTTPS
const httpsOptions = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

https.createServer(httpsOptions,app).listen(port, () => {
  console.log(`Server běží na https://localhost:${port}`);
});