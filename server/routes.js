const { getAllTasks, addTask, updateTask, deleteTask } = require('./taskService');

// ── Helper: ler o body da requisição ────────────────────
// Acumula os chunks do body da requisição e resolve com o conteúdo completo
const readBody = (req) => {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => { body += chunk.toString(); });
    req.on('end', () => { resolve(body); });
  });
};

// ── Helper: enviar resposta JSON ─────────────────────────
// Serializa os dados para JSON e envia a resposta com o status code correto
const sendJSON = (res, statusCode, data) => {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
};

// ── Roteador principal ───────────────────────────────────
const handleRoutes = async (req, res) => {
  const { method, url } = req;

  // GET /tasks — retorna todas as tarefas
  if (method === 'GET' && url === '/tasks') {
    const tasks = getAllTasks();
    sendJSON(res, 200, tasks);
    return;
  }

  // POST /tasks — cria uma nova tarefa
  if (method === 'POST' && url === '/tasks') {
    const body = await readBody(req);
    const { title, priority } = JSON.parse(body);

    // Validação — title é obrigatório
    if (!title || !title.trim()) {
      sendJSON(res, 400, { error: 'O campo title é obrigatório' });
      return;
    }

    const newTask = addTask({ title: title.trim(), priority });
    sendJSON(res, 201, newTask);
    return;
  }

  // PUT /tasks/:id — atualiza uma tarefa
  if (method === 'PUT' && url.startsWith('/tasks/')) {
    const id = Number(url.split('/')[2]);
    const body = await readBody(req);
    const changes = JSON.parse(body);
    const updated = updateTask(id, changes);
    if (!updated) {
      sendJSON(res, 404, { error: 'Tarefa não encontrada' });
      return;
    }
    sendJSON(res, 200, updated);
    return;
  }

  // DELETE /tasks/:id — remove uma tarefa
  if (method === 'DELETE' && url.startsWith('/tasks/')) {
    const id = Number(url.split('/')[2]);
    const success = deleteTask(id);
    if (!success) {
      sendJSON(res, 404, { error: 'Tarefa não encontrada' });
      return;
    }
    sendJSON(res, 200, { success: true });
    return;
  }

  // Rota não encontrada
  sendJSON(res, 404, { error: 'Rota não encontrada' });
};

module.exports = { handleRoutes };