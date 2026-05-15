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
let currentFilter = 'all';

// ── Referências DOM ──────────────────────────────────────
const taskList   = document.querySelector('#task-list');
const emptyState = document.querySelector('#empty-state');
const form       = document.querySelector('#task-form');
const input      = document.querySelector('#task-input');
const summaryText = document.querySelector('#summary-text');
const filterBtns  = document.querySelectorAll('.btn-filter');
const prioritySelect = document.querySelector('#priority-select');

// ── Renderização ─────────────────────────────────────────
const render = () => {
  taskList.innerHTML = '';

  // Aplicar filtro
  const filtered = tasks.filter(task => {
    if (currentFilter === 'pending')   return !task.completed;
    if (currentFilter === 'completed') return  task.completed;
    return true; // 'all'
  });

  // Atualizar resumo
  const total     = tasks.length;
  const completed = tasks.filter(task => task.completed).length;
  const pending   = total - completed;
  summaryText.textContent = `${pending} pendente${pending !== 1 ? 's' : ''} · ${completed} concluída${completed !== 1 ? 's' : ''}`;

  // Atualizar botão ativo
  filterBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === currentFilter);
  });

  // Estado vazio
  if (filtered.length === 0) {
    emptyState.style.display = 'block';
    return;
  }

  emptyState.style.display = 'none';

  for (const task of filtered) {
    const li = document.createElement('li');
    li.className = `task-item${task.completed ? ' completed' : ''}`;
    li.dataset.id = task.id;
    li.dataset.priority = task.priority;

    const priorityLabels = { high: 'Alta', medium: 'Média', low: 'Baixa' };

    li.innerHTML = `
      <input type="checkbox" ${task.completed ? 'checked' : ''} />
      <span class="task-title">${task.title}</span>
      <span class="priority-badge ${task.priority}">${priorityLabels[task.priority]}</span>
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

const handleEdit = (id, spanEl) => {
  const li = spanEl.closest('.task-item');

  // Evitar dupla edição
  if (li.querySelector('.edit-input')) return;

  const task = tasks.find(task => task.id === id);

  // Criar input de edição
  const editInput = document.createElement('input');
  editInput.type      = 'text';
  editInput.value     = task.title;
  editInput.className = 'task-input edit-input';

  // Substituir span pelo input
  li.replaceChild(editInput, spanEl);
  editInput.focus();
  editInput.select(); // seleciona o texto para facilitar a edição
  
  let cancelled = false; // flag de cancelamento

  // Salvar edição
  const saveEdit = async () => {
    if (cancelled) return; // cancelado — não salva

    const newTitle = editInput.value.trim();

    if (newTitle && newTitle !== task.title) {
      const updated = await api.updateTask(id, { title: newTitle });
      tasks = tasks.map(t => t.id === id ? updated : t);
    }

    render();
  };

  // Confirmar com Enter, cancelar com Escape, salvar com blur
  editInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter')  { saveEdit(); }
    if (event.key === 'Escape') {
      cancelled = true; // marca como cancelado
      render();         // remove o input do DOM — dispara blur
    }
  });

  editInput.addEventListener('blur', saveEdit);
};

// ── Filtros ──────────────────────────────────────────────
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    currentFilter = btn.dataset.filter;
    render();
  });
});

// ── Formulário ───────────────────────────────────────────
form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const title = input.value.trim();
  if (!title) return;

  const priority = prioritySelect.value;
  const newTask = await api.createTask(title, priority);
  tasks.push(newTask);
  input.value = '';
  prioritySelect.value = 'medium'; // reseta o select
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

taskList.addEventListener('dblclick', (event) => {
  const span = event.target.closest('.task-title');
  if (!span) return;

  const id = Number(span.closest('.task-item').dataset.id);
  handleEdit(id, span);
});

// ── Inicialização ────────────────────────────────────────
const init = async () => {
  tasks = await api.fetchTasks();
  render();
};

init();