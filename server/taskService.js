const fs   = require('fs');
const path = require('path');

// ── Caminhos ─────────────────────────────────────────────
const DATA_DIR  = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'tasks.json');

// ── Garantir que o diretório e arquivo existem ───────────
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

// ── Funções de leitura e escrita ─────────────────────────
const readTasks = () => {
  try {
    const content = fs.readFileSync(DATA_FILE, 'utf8');
    const tasks = JSON.parse(content);

    // Migração defensiva — garante campos novos em tarefas antigas
    return tasks.map(task => ({
      priority:    'medium',
      description: '',
      createdAt:   new Date().toISOString(),
      ...task,
    }));
  } catch {
    return [];
  }
};

const writeTasks = (tasks) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2));
  } catch (error) {
    console.error('Erro ao escrever tasks.json:', error.message);
    throw error; // propaga para o chamador tratar
  }
};

// ── CRUD ─────────────────────────────────────────────────
// Retorna todas as tarefas do arquivo, com migração defensiva para campos novos
const getAllTasks = () => {
  return readTasks();
};

// Retorna uma tarefa específica pelo id — retorna null se não encontrada
const getTaskById = (id) => {
  const tasks = readTasks();
  return tasks.find(task => task.id === id) || null;
};

// Cria uma nova tarefa com id único, priority padrão e createdAt automático
const addTask = ({ title, priority = 'medium', description = '' }) => {
  const tasks = readTasks();
  const newTask = {
    id: Date.now(),
    title,
    description,
    priority,
    completed: false,
    createdAt: new Date().toISOString(),
  };
  tasks.push(newTask);
  writeTasks(tasks);
  return newTask;
};

// Atualiza campos específicos de uma tarefa — retorna null se não encontrada
const updateTask = (id, changes) => {
  const tasks = readTasks();
  const index = tasks.findIndex(task => task.id === id);
  if (index === -1) return null;
  tasks[index] = { ...tasks[index], ...changes };
  writeTasks(tasks);
  return tasks[index];
};

// Remove uma tarefa pelo id — retorna false se não encontrada
const deleteTask = (id) => {
  const tasks = readTasks();
  const index = tasks.findIndex(task => task.id === id);
  if (index === -1) return false;
  tasks.splice(index, 1);
  writeTasks(tasks);
  return true;
};

module.exports = { getAllTasks, getTaskById, addTask, updateTask, deleteTask };