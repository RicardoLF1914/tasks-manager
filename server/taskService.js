const Database = require('better-sqlite3');
const path     = require('path');
const fs       = require('fs');

// ── Banco de dados ───────────────────────────────────────
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE  = path.join(DATA_DIR, 'tasks.db');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const db = new Database(DB_FILE);

// Cria a tabela se não existir
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id          INTEGER PRIMARY KEY,
    title       TEXT    NOT NULL,
    description TEXT    DEFAULT '',
    priority    TEXT    DEFAULT 'medium',
    completed   INTEGER DEFAULT 0,
    createdAt   TEXT    NOT NULL
  )
`);

// ── CRUD ─────────────────────────────────────────────────

// Retorna todas as tarefas do banco
const getAllTasks = () => {
  const rows = db.prepare('SELECT * FROM tasks ORDER BY createdAt DESC').all();
  return rows.map(row => ({
    ...row,
    completed: row.completed === 1,
  }));
};

// Retorna uma tarefa específica pelo id — retorna null se não encontrada
const getTaskById = (id) => {
  const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  if (!row) return null;
  return { ...row, completed: row.completed === 1 };
};

// Cria uma nova tarefa com id único e createdAt automático
const addTask = ({ title, priority = 'medium', description = '' }) => {
  const id        = Date.now();
  const createdAt = new Date().toISOString();

  db.prepare(`
    INSERT INTO tasks (id, title, description, priority, completed, createdAt)
    VALUES (?, ?, ?, ?, 0, ?)
  `).run(id, title, description, priority, createdAt);

  return getTaskById(id);
};

// Atualiza campos específicos de uma tarefa — retorna null se não encontrada
const updateTask = (id, changes) => {
  const task = getTaskById(id);
  if (!task) return null;

  const updated = { ...task, ...changes };

  db.prepare(`
    UPDATE tasks
    SET title = ?, description = ?, priority = ?, completed = ?
    WHERE id = ?
  `).run(
    updated.title,
    updated.description,
    updated.priority,
    updated.completed ? 1 : 0,
    id
  );

  return getTaskById(id);
};

// Remove uma tarefa pelo id — retorna false se não encontrada
const deleteTask = (id) => {
  const result = db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
  return result.changes > 0;
};

module.exports = { getAllTasks, getTaskById, addTask, updateTask, deleteTask };