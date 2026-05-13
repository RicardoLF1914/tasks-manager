// ── Camada de API ────────────────────────────────────────
const api = {
  fetchTasks: async () => {
    const response = await fetch('/tasks');
    return response.json();
  },

  createTask: async (title, priority = 'medium') => {
    const response = await fetch('/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, priority }),
    });
    return response.json();
  },

  updateTask: async (id, changes) => {
    const response = await fetch(`/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(changes),
    });
    return response.json();
  },

  deleteTask: async (id) => {
    const response = await fetch(`/tasks/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },
};

// ── Estado ───────────────────────────────────────────────
let tasks = [];

// ── Referências DOM ──────────────────────────────────────
const taskList   = document.querySelector('#task-list');
const emptyState = document.querySelector('#empty-state');
const form       = document.querySelector('#task-form');
const input      = document.querySelector('#task-input');

// ── Renderização ─────────────────────────────────────────
const render = () => {
  taskList.innerHTML = '';

  if (tasks.length === 0) {
    emptyState.style.display = 'block';
    return;
  }

  emptyState.style.display = 'none';

  for (const task of tasks) {
    const li = document.createElement('li');
    li.className = `task-item${task.completed ? ' completed' : ''}`;
    li.dataset.id = task.id;

    li.innerHTML = `
      <input type="checkbox" ${task.completed ? 'checked' : ''} />
      <span class="task-title">${task.title}</span>
      <button class="btn btn-danger btn-delete">✕</button>
    `;

    taskList.appendChild(li);
  }
};

// ── Handlers ─────────────────────────────────────────────
const handleDelete = async (id) => {
  await api.deleteTask(id);
  tasks = tasks.filter(task => task.id !== id);
  render();
};

const handleToggle = async (id) => {
  const task = tasks.find(task => task.id === id);
  const updated = await api.updateTask(id, { completed: !task.completed });
  tasks = tasks.map(t => t.id === id ? updated : t);
  render();
};

// ── Formulário ───────────────────────────────────────────
form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const title = input.value.trim();
  if (!title) return;

  const newTask = await api.createTask(title);
  tasks.push(newTask);
  input.value = '';
  render();
});

// ── Delegação de eventos na lista ────────────────────────
taskList.addEventListener('click', (event) => {
  const deleteBtn = event.target.closest('.btn-delete');
  if (deleteBtn) {
    const id = Number(deleteBtn.closest('.task-item').dataset.id);
    handleDelete(id);
    return;
  }

  const checkbox = event.target.closest('input[type="checkbox"]');
  if (checkbox) {
    const id = Number(checkbox.closest('.task-item').dataset.id);
    handleToggle(id);
  }
});

// ── Inicialização ────────────────────────────────────────
const init = async () => {
  tasks = await api.fetchTasks();
  render();
};

init();