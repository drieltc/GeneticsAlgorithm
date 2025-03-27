const itens = [
    { name: "Laptop", weight: 2.0, size: 3000, value: 9 },
    { name: "Livro", weight: 0.5, size: 500, value: 7 },
    { name: "Fones de ouvido", weight: 0.2, size: 100, value: 8 },
    { name: "Câmera", weight: 1.0, size: 800, value: 9 },
    { name: "Carregador de celular", weight: 0.3, size: 200, value: 8 },
    { name: "Power bank", weight: 0.4, size: 300, value: 7 },
    { name: "Kit de higiene pessoal", weight: 0.8, size: 600, value: 6 },
    { name: "Remédios", weight: 0.2, size: 100, value: 10 },
    { name: "Documentos importantes", weight: 0.1, size: 50, value: 10 },
    { name: "Lanches", weight: 0.5, size: 400, value: 5 },
    { name: "Garrafa de água reutilizável", weight: 0.6, size: 700, value: 6 },
    { name: "Blusa extra", weight: 0.7, size: 900, value: 7 },
    { name: "Meias extras", weight: 0.2, size: 200, value: 5 },
    { name: "Cachecol", weight: 0.3, size: 300, value: 6 },
    { name: "Óculos de sol", weight: 0.1, size: 100, value: 7 },
    { name: "Chapéu", weight: 0.2, size: 200, value: 6 },
    { name: "Travesseiro de viagem", weight: 0.4, size: 500, value: 8 },
    { name: "Máscara de dormir", weight: 0.1, size: 50, value: 7 },
    { name: "Livro de colorir e lápis de cor", weight: 0.6, size: 600, value: 5 },
    { name: "Pequeno kit de costura", weight: 0.2, size: 100, value: 4 },
  ];

const MAX_WEIGHT = 5.0;
/**
 * Generates the initial population for the Genetic Algorithm.
 *
 * @param {number} populationSize - The size of the population to generate.
 * @returns {Array<Array<number>>} An array of individuals, each represented as a binary array.
*/
function generateInitialPopulation(popSize){
    const population = [];
    const numitens = itens.length;
    
    for (let i = 0; i < popSize; i++) {
        const individual = [];
        for (let j = 0; j < numitens; j++) {
            individual.push(Math.round(Math.random()));
        }
        population.push(individual);
        }
    
    return population;
}

/**
 * Calculates the total weight of the itens an individual carries.
 *
 * @param {Array<number>} individual - A binary array representing the carried itens.
 * @returns {number} The total weight of the carried itens.
 */
function calculateTotalWeight(individual){
    let totalWeight = 0;
    for (let i = 0; i < individual.length; i++) {
        totalWeight += individual[i] * itens[i].weight;
    }
    return totalWeight;
}

/**
 * Calculates the total size of the itens an individual carries.
 * 
 * @param {Array<number>} individual 
 * @returns {number} The total size of the carried itens.
 */
function calculateTotalSize(individual){
    let totalSize = 0;
    for (let i = 0; i < individual.length; i++) {
        totalSize += individual[i] * itens[i].size;
    }
    return totalSize;
}


/**
 * Calculates the total value of an individual's carried itens.
 * 
 * @param {Array<number>} individual 
 * @returns {number} The total value of the carried itens. 0 if the total weight exceeds the maximum allowed.
 */
function calculateTotalValue(individual){
    let totalValue = 0;
    let weight = calculateTotalWeight(individual);
    if (weight > MAX_WEIGHT) {
        return 0;
    }

    for (let i = 0; i < individual.length; i++) {
        totalValue += individual[i] * itens[i].value;
    }
    return totalValue;
}

const population = generateInitialPopulation(5);

population.forEach((individual) => {
    console.log(calculateTotalValue(individual));
});