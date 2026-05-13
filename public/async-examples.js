// ── EXEMPLO 1: Call Stack e ordem síncrona ───────────────

const somar = (a, b) => a + b;
const calcular = () => somar(2, 3);

console.log('1 — antes de calcular');
calcular();
console.log('2 — depois de calcular');

// Saída:
// 1 — antes de calcular
// 2 — depois de calcular
// (síncrono — executa em ordem, linha por linha)


// ── EXEMPLO 2: setTimeout e a Callback Queue ─────────────

console.log('A — início');

setTimeout(() => {
  console.log('B — dentro do setTimeout');
}, 0); // 0ms — mas ainda assim vai para a Callback Queue

console.log('C — fim');

// Saída:
// A — início
// C — fim
// B — dentro do setTimeout
//
// Por que? Mesmo com 0ms, o setTimeout vai para as Web APIs
// e o callback só volta para a Call Stack depois que ela
// estiver completamente vazia — após o 'C' ser executado.


// ── EXEMPLO 3: Promise e a Microtask Queue ───────────────

console.log('1 — início');

setTimeout(() => {
  console.log('2 — setTimeout (Callback Queue)');
}, 0);

Promise.resolve('resolvida').then(valor => {
  console.log('3 — Promise (Microtask Queue):', valor);
});

console.log('4 — fim');

// Saída:
// 1 — início
// 4 — fim
// 3 — Promise (Microtask Queue): resolvida
// 2 — setTimeout (Callback Queue)
//
// Por que? Ordem de prioridade:
// 1º código síncrono (Call Stack)
// 2º Microtask Queue (Promises) — prioridade maior
// 3º Callback Queue (setTimeout) — prioridade menor

// ── PROMISES ─────────────────────────────────────────────

// Criando uma Promise manualmente
const buscarTarefa = (id) => {
  return new Promise((resolve, reject) => {
    const tarefas = [
      { id: 1, title: 'Estudar JS' },
      { id: 2, title: 'Construir o Tasks' },
    ];

    const tarefa = tarefas.find(t => t.id === id);

    if (tarefa) {
      resolve(tarefa);
    } else {
      reject(new Error(`Tarefa ${id} não encontrada`));
    }
  });
};

// .then() e .catch()
buscarTarefa(1)
  .then(tarefa => {
    console.log('Encontrada:', tarefa.title);
    return tarefa.title.toUpperCase(); // passa para o próximo .then()
  })
  .then(titulo => console.log('Título em maiúsculas:', titulo))
  .catch(erro => console.log('Erro:', erro.message))
  .finally(() => console.log('Busca finalizada'));

// Testando o caminho de erro
buscarTarefa(99)
  .then(tarefa => console.log('nunca executa'))
  .catch(erro => console.log('Erro esperado:', erro.message));

// Promise.all — em paralelo
Promise.all([buscarTarefa(1), buscarTarefa(2)])
  .then(tarefas => console.log('Todas encontradas:', tarefas));