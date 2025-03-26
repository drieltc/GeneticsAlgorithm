const items = [
    { nome: "Laptop", peso: 2.0, tamanho: 3000, apreco: 9 },
    { nome: "Livro", peso: 0.5, tamanho: 500, apreco: 7 },
    { nome: "Fones de ouvido", peso: 0.2, tamanho: 100, apreco: 8 },
    { nome: "Câmera", peso: 1.0, tamanho: 800, apreco: 9 },
    { nome: "Carregador de celular", peso: 0.3, tamanho: 200, apreco: 8 },
    { nome: "Power bank", peso: 0.4, tamanho: 300, apreco: 7 },
    { nome: "Kit de higiene pessoal", peso: 0.8, tamanho: 600, apreco: 6 },
    { nome: "Remédios", peso: 0.2, tamanho: 100, apreco: 10 },
    { nome: "Documentos importantes", peso: 0.1, tamanho: 50, apreco: 10 },
    { nome: "Lanches", peso: 0.5, tamanho: 400, apreco: 5 },
    { nome: "Garrafa de água reutilizável", peso: 0.6, tamanho: 700, apreco: 6 },
    { nome: "Blusa extra", peso: 0.7, tamanho: 900, apreco: 7 },
    { nome: "Meias extras", peso: 0.2, tamanho: 200, apreco: 5 },
    { nome: "Cachecol", peso: 0.3, tamanho: 300, apreco: 6 },
    { nome: "Óculos de sol", peso: 0.1, tamanho: 100, apreco: 7 },
    { nome: "Chapéu", peso: 0.2, tamanho: 200, apreco: 6 },
    { nome: "Travesseiro de viagem", peso: 0.4, tamanho: 500, apreco: 8 },
    { nome: "Máscara de dormir", peso: 0.1, tamanho: 50, apreco: 7 },
    { nome: "Livro de colorir e lápis de cor", peso: 0.6, tamanho: 600, apreco: 5 },
    { nome: "Pequeno kit de costura", peso: 0.2, tamanho: 100, apreco: 4 },
  ];
  
function generateInitialPopulation(popSize){
    const population = [];
    const numItems = items.length;
    
    for (let i = 0; i < popSize; i++) {
        const individual = [];
        for (let j = 0; j < numItems; j++) {
            individual.push(Math.round(Math.random()));
        }
        population.push(individual);
        }
    
    return population;
}

const population = generateInitialPopulation(5);
console.log(population);