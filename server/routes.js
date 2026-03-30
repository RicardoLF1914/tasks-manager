// Exemplo de módulo que importa de outro

const { getTasks, addTask } = require('./taskService');

const tasks = getTasks();
console.log('Tarefas:', tasks);

const newTask = addTask('Aprender CommonJS');
console.log('Nova tarefa:', newTask);