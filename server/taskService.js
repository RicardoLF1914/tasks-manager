// Exemplo de módulo que exporta múltiplas funções

const getTasks = () => {
  return [
    { id: 1, title: 'Estudar Node.js', completed: false },
    { id: 2, title: 'Criar o servidor', completed: false },
  ];
};

const addTask = (title) => {
  return { id: Date.now(), title, completed: false };
};

module.exports = { getTasks, addTask };