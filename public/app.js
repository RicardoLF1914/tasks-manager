// ── Camada de API ────────────────────────────────────────
// Centraliza todas as comunicações com o backend.
// Se a URL ou o formato mudar, só este objeto precisa ser atualizado.
const api = {
  fetchTasks: async () => {
    const response = await fetch('/tasks');
    if (!response.ok) throw new Error('Erro ao buscar tarefas');
    return response.json();
  },

  createTask: async (title, priority = 'medium', description = '') => {
    const response = await fetch('/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, priority, description }),
    });
    if (!response.ok) throw new Error('Erro ao criar tarefa');
    return response.json();
  },

  updateTask: async (id, changes) => {
    const response = await fetch(`/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(changes),
    });
    if (!response.ok) throw new Error('Erro ao atualizar tarefa');
    return response.json();
  },

  deleteTask: async (id) => {
    const response = await fetch(`/tasks/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Erro ao excluir tarefa');
    return response.json();
  },
};

// Exibe uma mensagem de erro temporária ao usuário
const showError = (message) => {
  const existing = document.querySelector('.error-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className   = 'error-toast';
  toast.textContent = message;
  document.querySelector('.container').prepend(toast);

  setTimeout(() => toast.remove(), 4000);
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
const descriptionInput = document.querySelector('#task-description');
const prioritySelect = document.querySelector('#priority-select');
const summaryText   = document.querySelector('#summary-text');
const filterBtns    = document.querySelectorAll('.btn-filter');
const progressBar   = document.querySelector('#progress-bar');

// ── Tema ─────────────────────────────────────────────────
// Persiste a preferência do usuário no localStorage
const themeToggle = document.querySelector('#theme-toggle');

const applyTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme);
  themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
};

const savedTheme = localStorage.getItem('theme') || 'light';
applyTheme(savedTheme);

themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  const next    = current === 'dark' ? 'light' : 'dark';
  localStorage.setItem('theme', next);
  applyTheme(next);
});

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
      <div class="task-body">
        <span class="task-title">${task.title}</span>
        ${task.description ? `<p class="task-description">${task.description}</p>` : ''}
      </div>
      <span class="priority-badge ${task.priority}">${priorityLabels[task.priority]}</span>
      <button class="btn btn-danger btn-delete">✕</button>
    `;

    taskList.appendChild(li);
  }
};

// ── Handlers ─────────────────────────────────────────────
const handleDelete = async (id) => {
  try {
    await api.deleteTask(id);
    tasks = tasks.filter(task => task.id !== id);
    render();
  } catch (error) {
    showError('Não foi possível excluir a tarefa. Tente novamente.');
  }
};

const handleToggle = async (id) => {
  try {
    const task    = tasks.find(task => task.id === id);
    const updated = await api.updateTask(id, { completed: !task.completed });
    tasks = tasks.map(t => t.id === id ? updated : t);
    render();
  } catch (error) {
    showError('Não foi possível atualizar a tarefa. Tente novamente.');
  }
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
    if (cancelled) return;
    const newTitle = editInput.value.trim();
    try {
      if (newTitle && newTitle !== task.title) {
        const updated = await api.updateTask(id, { title: newTitle });
        tasks = tasks.map(t => t.id === id ? updated : t);
      }
      render();
    } catch (error) {
      showError('Não foi possível salvar a edição. Tente novamente.');
      render();
    }
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

  try {
    const priority    = prioritySelect.value;
    const description = descriptionInput.value.trim();
    const newTask     = await api.createTask(title, priority, description);
    tasks.push(newTask);
    input.value             = '';
    descriptionInput.value  = '';
    prioritySelect.value    = 'medium';
    render();
  } catch (error) {
    showError('Não foi possível criar a tarefa. Tente novamente.');
  }
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
  try {
    tasks = await api.fetchTasks();
    render();
  } catch (error) {
    showError('Não foi possível carregar as tarefas. Verifique se o servidor está rodando.');
  }
};

init();