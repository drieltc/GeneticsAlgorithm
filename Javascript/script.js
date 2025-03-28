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

function crossover(parent1, parent2){
    // Determines if the child will have the same condition as one of the parents or both
    let condition = "";
    if (parent1.condition === parent2.condition){
        condition = parent1.condition;
    } else{
        condition = Math.random() < 0.5 ? parent1.condition : parent2.condition;
    }

    // Determines the expressivity of the child
    // If the condition is "S", the expressivity is set to 0
    // Otherwise, it is the average of the parents' expressivity
    let expressivity = 0;
    if (condition !== "S"){
        expressivity = Math.floor((parent1.expressivity + parent2.expressivity) / 2);
    }

    // Create a new child individual
    const child = new Individual(parent1.id, parent1.age, condition, expressivity, []);

    // Crossover logic
    for (let i = 0; i < parent1.genes.length; i++){
        if (Math.random() < 0.5){
            child.genes[i] = parent1.genes[i];
        } else {
            child.genes[i] = parent2.genes[i];
        }
    }

    return child;
}

function mutate(individual){
    for (let i = 0; i < individual.genes.length; i++){
        if (Math.random() < 0.01){ // 1% mutation chance
            individual.genes[i] = Math.floor(Math.random() * 2);
            if (individual.condition !== "S"){
                individual.expressivity = Math.floor(Math.random() * 100); // Random expressivity
            }
        }
    }
}

function runGeneticAlgorithm(initialPopulation, generations = 1){
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
            
            const child = crossover(parent1, parent2);

            // Mutation
            mutate(child);

            //calculateFitness(child);

            //newPopulation.push(child);
        }
    }

}  
// Fetch the CSV file and create the initial population
fetch('/Dados/dataset_pamostra.csv')
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
  