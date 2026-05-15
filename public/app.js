// ── Camada de API ────────────────────────────────────────
// Centraliza todas as comunicações com o backend.
// Se a URL ou o formato mudar, só este objeto precisa ser atualizado.
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
    const response = await fetch(`/tasks/${id}`, { method: 'DELETE' });
    return response.json();
  },
};

// ── Estado ───────────────────────────────────────────────
// tasks: fonte da verdade — todos os dados vêm do servidor via init()
// currentFilter: estado de UI — não é persistido
let tasks         = [];
let currentFilter = 'all';

// ── Referências DOM ──────────────────────────────────────
// Capturadas uma única vez para evitar buscas repetidas no DOM
const taskList      = document.querySelector('#task-list');
const emptyState    = document.querySelector('#empty-state');
const form          = document.querySelector('#task-form');
const input         = document.querySelector('#task-input');
const prioritySelect = document.querySelector('#priority-select');
const summaryText   = document.querySelector('#summary-text');
const filterBtns    = document.querySelectorAll('.btn-filter');
const progressBar   = document.querySelector('#progress-bar');

// ── Renderização ─────────────────────────────────────────
// render() é a única função que escreve no DOM.
// Sempre chamada após qualquer mudança de estado.
const render = () => {
  taskList.innerHTML = '';

  // Filtragem — não modifica o array original
  const filtered = tasks.filter(task => {
    if (currentFilter === 'pending')   return !task.completed;
    if (currentFilter === 'completed') return  task.completed;
    return true;
  });

  // Resumo
  const total         = tasks.length;
  const completedCount = tasks.filter(task => task.completed).length;
  const pendingCount   = total - completedCount;

  summaryText.textContent =
    `${pendingCount} pendente${pendingCount !== 1 ? 's' : ''} · ` +
    `${completedCount} concluída${completedCount !== 1 ? 's' : ''}`;

  // Botão ativo — toggle adiciona 'active' se a condição for true
  filterBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === currentFilter);
  });

  // Barra de progresso
  // Proteção contra divisão por zero quando não há tarefas
  const percentage = total === 0 ? 0 : Math.round((completedCount / total) * 100);
  progressBar.style.width = `${percentage}%`;

  // Estado vazio
  if (filtered.length === 0) {
    emptyState.style.display = 'block';
    return;
  }

  emptyState.style.display = 'none';

  // Rótulos de prioridade — mapeamento de valor técnico para label de UI
  const priorityLabels = { high: 'Alta', medium: 'Média', low: 'Baixa' };

  for (const task of filtered) {
    const li = document.createElement('li');
    li.className        = `task-item${task.completed ? ' completed' : ''}`;
    li.dataset.id       = task.id;
    li.dataset.priority = task.priority;

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
  const task    = tasks.find(task => task.id === id);
  const updated = await api.updateTask(id, { completed: !task.completed });
  tasks = tasks.map(t => t.id === id ? updated : t);
  render();
};

const handleEdit = (id, spanEl) => {
  const li = spanEl.closest('.task-item');

  // Evitar dupla edição — verifica se já existe um input de edição no item
  if (li.querySelector('.edit-input')) return;

  const task      = tasks.find(task => task.id === id);
  const editInput = document.createElement('input');
  editInput.type      = 'text';
  editInput.value     = task.title;
  editInput.className = 'task-input edit-input';

  li.replaceChild(editInput, spanEl);
  editInput.focus();
  editInput.select();

  let cancelled = false;

  const saveEdit = async () => {
    // Flag garante que blur não salva quando Escape foi pressionado
    if (cancelled) return;

    const newTitle = editInput.value.trim();

    if (newTitle && newTitle !== task.title) {
      const updated = await api.updateTask(id, { title: newTitle });
      tasks = tasks.map(t => t.id === id ? updated : t);
    }

    render();
  };

  editInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter')  { saveEdit(); }
    if (event.key === 'Escape') { cancelled = true; render(); }
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
  const newTask  = await api.createTask(title, priority);

  tasks.push(newTask);
  input.value          = '';
  prioritySelect.value = 'medium';
  render();
});

// ── Eventos na lista ─────────────────────────────────────
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
// Carrega as tarefas do servidor e renderiza o estado inicial
const init = async () => {
  tasks = await api.fetchTasks();
  render();
};

init();