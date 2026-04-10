const http = require('http');
const fs   = require('fs');
const path = require('path');

// ── Diretório público ────────────────────────────────────
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

// ── Mapa de tipos MIME ───────────────────────────────────
const MIME_TYPES = {
  '.html': 'text/html',
  '.css':  'text/css',
  '.js':   'text/javascript',
};

// ── Servidor ─────────────────────────────────────────────
const server = http.createServer((req, res) => {
  // Normaliza a URL: '/' vira '/index.html'
  const urlPath = req.url === '/' ? '/index.html' : req.url;
  const filePath = path.join(PUBLIC_DIR, urlPath);
  const ext = path.extname(filePath);
  const contentType = MIME_TYPES[ext] || 'text/plain';

  // Lê e serve o arquivo estático
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
    return;
  }

  // Arquivo não encontrado
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('404 — Não encontrado');
});

server.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});