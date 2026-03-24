// ── Estado ──────────────────────────────────────────────
let tasks = [
  { id: 1, title: 'Estudar JavaScript', completed: false },
  { id: 2, title: 'Construir o Tasks', completed: false },
];

// ── Referências DOM ─────────────────────────────────────
const taskList   = document.querySelector('#task-list');
const emptyState = document.querySelector('#empty-state');

// ── Renderização ────────────────────────────────────────
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

render();

// ── Formulário ──────────────────────────────────────────
const form  = document.querySelector('#task-form');
const input = document.querySelector('#task-input');

form.addEventListener('submit', (event) => {
  event.preventDefault(); // impede o recarregamento da página

  const title = input.value.trim();
  if (!title) return; // ignora envio com campo vazio

  const newTask = {
    id: Date.now(),
    title,
    completed: false,
  };

  tasks.push(newTask);
  input.value = '';
  render();
});

// ── Handlers ────────────────────────────────────────────
const handleDelete = (id) => {
  tasks = tasks.filter(task => task.id !== id);
  render();
};

const handleToggle = (id) => {
  tasks = tasks.map(task =>
    task.id === id ? { ...task, completed: !task.completed } : task
  );
  render();
};

// ── Delegação de eventos na lista ───────────────────────
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