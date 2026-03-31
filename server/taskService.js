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
    return JSON.parse(content);
  } catch {
    return [];
  }
};

const writeTasks = (tasks) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2));
};

// ── CRUD ─────────────────────────────────────────────────
const getAllTasks = () => {
  return readTasks();
};

const addTask = ({ title, priority = 'medium' }) => {
  const tasks = readTasks();
  const newTask = {
    id: Date.now(),
    title,
    priority,
    completed: false,
    createdAt: new Date().toISOString(),
  };
  tasks.push(newTask);
  writeTasks(tasks);
  return newTask;
};

const updateTask = (id, changes) => {
  const tasks = readTasks();
  const index = tasks.findIndex(task => task.id === id);
  if (index === -1) return null;
  tasks[index] = { ...tasks[index], ...changes };
  writeTasks(tasks);
  return tasks[index];
};

const deleteTask = (id) => {
  const tasks = readTasks();
  const index = tasks.findIndex(task => task.id === id);
  if (index === -1) return false;
  tasks.splice(index, 1);
  writeTasks(tasks);
  return true;
};

module.exports = { getAllTasks, addTask, updateTask, deleteTask };

// ── Teste (remover depois) ───────────────────────────────
console.log('--- getAllTasks ---');
console.log(getAllTasks());

console.log('--- addTask ---');
const t1 = addTask({ title: 'Estudar Node.js', priority: 'high' });
const t2 = addTask({ title: 'Construir o servidor' }); // priority padrão: medium
console.log(getAllTasks());

console.log('--- updateTask ---');
updateTask(t1.id, { completed: true });
console.log(getAllTasks());

console.log('--- deleteTask ---');
deleteTask(t2.id);
console.log(getAllTasks());