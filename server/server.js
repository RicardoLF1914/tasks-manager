const http = require('http');
const fs   = require('fs');
const path = require('path');
const { handleRoutes } = require('./routes');

// ── Diretório público ────────────────────────────────────
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

// ── Mapa de tipos MIME ───────────────────────────────────
const MIME_TYPES = {
  '.html': 'text/html',
  '.css':  'text/css',
  '.js':   'text/javascript',
};

// ── Servidor ─────────────────────────────────────────────
const server = http.createServer(async (req, res) => {

  // Requisições da API — delega ao roteador
  if (req.url.startsWith('/tasks')) {
    handleRoutes(req, res);
    return;
  }

  // Arquivos estáticos
  const urlPath = req.url === '/' ? '/index.html' : req.url;
  const filePath = path.join(PUBLIC_DIR, urlPath);
  const ext = path.extname(filePath);
  const contentType = MIME_TYPES[ext] || 'text/plain';

  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('404 — Não encontrado');
});

server.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});