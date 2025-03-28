class Individual{
    constructor(id, age, condition, expressivity, genes){
        this.id = id;
        this.age = age;
        this.condition = condition;
        this.expressivity = expressivity;
        this.genes = genes.map(gene => parseInt(gene));
        this.fitness = 0;
    }
}

// Function to create an Individual from a CSV row
function createIndividualFromRow(row) {
    const values = row.split(',');
    const id = values[0];
    const age = values[1];
    const condition = values[2];
    const expressivity = values[3];
    const genes = values.slice(4); // Genes start from the 5th column
    return new Individual(id, age, condition, expressivity, genes);
  }

function calculateFitness(individual){
    individual.fitness = individual.expressivity;
}

function selectParent(population){
    const randomIndex = Math.floor(Math.random() * population.length);
    return population[randomIndex];
}


function runGeneticAlgorithm(initialPopulation, generations = 100){
    let cpInitialPopulation = [...initialPopulation]; // Copy of the initial population to avoid modifying it
    
    // Calculate fitness for each individual in the initial population
    cpInitialPopulation.forEach(calculateFitness);
    cpInitialPopulation.sort((a, b) => b.fitness - a.fitness); // Sort by fitness in descending order

    let population = [...cpInitialPopulation]

    for (let generation = 0; generation < generations; generation++){
        const newPopulation = [];

        // Keep the top 10% of the population
        const top10Percent = Math.floor(population.length * 0.1);
        for (let i = 0; i < top10Percent; i++){
            newPopulation.push(population[i]);
        }

        // Create the rest of the new generation
        while (newPopulation.length < population.length){
            // Selection
            const parent1 = selectParent(population);
            const parent2 = selectParent(population);        
        }
    }

}  
// Fetch the CSV file and create the initial population
fetch('/Dados/dataset_amostra.csv')
.then(response => {
    if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.text();
})
.then(data => {
    const lines = data.trim().split('\n');
    const header = lines.shift().split(','); // Remove the header line and get the header
    const initialPopulation = lines.map(createIndividualFromRow); // Create individuals from the remaining lines

    runGeneticAlgorithm(initialPopulation);
})
.catch(error => {
    console.error('Error fetching or processing the CSV file:', error);
});
  