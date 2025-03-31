const fs = require('fs');
const path = require('path');

class Individual {
    constructor(genes) {
        this.genes = genes.map(gene => parseInt(gene));
        this.fitness = 0;
    }
}

// Function to create an Individual from a CSV row
function createIndividualFromRow(row) {
    const values = row.split(',');
    const genes = values.slice(4).map(gene => parseInt(gene)); // Genes start from the 5th column
    return {
        genes: genes,
        condition: values[2]
    };
}

// Function to calculate the probability of having condition "A" based on the genes that are present
function calculateProbability(population, geneSubset) {
    let countA = 0;
    let countTotal = 0;

    for (const individual of population) {
        let match = true;
        for (let i = 0; i < geneSubset.length; i++) {
            if (geneSubset[i] === 1 && individual.genes[i] !== 1) {
                match = false;
                break;
            }
        }
        if (match) {
            countTotal++;
            if (individual.condition === "A") {
                countA++;
            }
        }
    }

    if (countTotal === 0) {
        return 0; // Avoid division by zero
    }
    return countA / countTotal;
}

// New Fitness Function
function calculateFitness(individual, population) {
    const probability = calculateProbability(population, individual.genes);
    const subsetSize = individual.genes.reduce((sum, gene) => sum + gene, 0);

    // Reward for high probability of condition "A"
    let fitness = probability;

    // Penalty for large subset size
    fitness -= subsetSize * 0.01; // Adjust the penalty factor (0.01) as needed

    // Penalty for not reaching 50% probability
    if (probability < 0.5) {
        fitness -= 1; // Adjust the penalty as needed
    }

    individual.fitness = fitness;
}

function selectParent(population, tournamentSize = 3) {
    const tournament = [];
    for (let i = 0; i < tournamentSize; i++) {
        const randomIndex = Math.floor(Math.random() * population.length);
        tournament.push(population[randomIndex]);
    }
    return tournament.reduce((best, current) => (current.fitness > best.fitness ? current : best));
}

function crossover(parent1, parent2) {
    const childGenes = [];
    for (let i = 0; i < parent1.genes.length; i++) {
        childGenes.push(Math.random() < 0.5 ? parent1.genes[i] : parent2.genes[i]);
    }
    return new Individual(childGenes);
}

function mutate(individual, mutationRate = 0.01) {
    for (let i = 0; i < individual.genes.length; i++) {
        if (Math.random() < mutationRate) {
            individual.genes[i] = 1 - individual.genes[i]; // Flip the gene (0 to 1, or 1 to 0)
        }
    }
}

function runGeneticAlgorithm(initialPopulation, populationSize = 100, generations = 100, mutationRate = 0.01, tournamentSize = 3) {
    let cpInitialPopulation = [...initialPopulation]; // Copy of the initial population to avoid modifying it

    // Create a new population with random subsets of genes
    let population = Array.from({ length: populationSize }, () => {
        const genes = Array(cpInitialPopulation[0].genes.length).fill(0).map(() => Math.random() < 0.5 ? 1 : 0);
        return new Individual(genes);
    });

    // Calculate fitness for each individual in the initial population
    population.forEach(individual => calculateFitness(individual, cpInitialPopulation));
    population.sort((a, b) => b.fitness - a.fitness); // Sort by fitness in descending order

    let bestIndividual = null;
    let bestFitness = -Infinity;

    for (let generation = 0; generation < generations; generation++) {
        const newPopulation = [];

        // Elitism: Keep the best individual from the previous generation
        newPopulation.push(population[0]);

        // Keep the top 10% of the population
        const top10Percent = Math.floor(population.length * 0.1);
        for (let i = 1; i < top10Percent; i++) {
            newPopulation.push(population[i]);
        }

        // Create the rest of the new generation
        while (newPopulation.length < population.length) {
            // Selection
            const parent1 = selectParent(population, tournamentSize);
            const parent2 = selectParent(population, tournamentSize);

            const child = crossover(parent1, parent2);

            // Mutation
            mutate(child, mutationRate);

            calculateFitness(child, cpInitialPopulation);

            newPopulation.push(child);
        }
        population = newPopulation;
        population.sort((a, b) => b.fitness - a.fitness);
        console.log(`Generation ${generation + 1} - Best Fitness: ${population[0].fitness}`);

        // Update best individual
        if (population[0].fitness > bestFitness) {
            bestFitness = population[0].fitness;
            bestIndividual = population[0];
        }
    }

    console.log("Smallest subset found:", bestIndividual.genes);
    return bestIndividual;
}

// Function to read the CSV file and create the initial population
function readCSVAndRunGA(filePath) {
    try {
        const absolutePath = path.resolve(__dirname, filePath);
        const data = fs.readFileSync(absolutePath, 'utf-8');
        const lines = data.trim().split('\n');
        const header = lines.shift().split(','); // Remove the header line and get the header
        const initialPopulation = lines.map(createIndividualFromRow); // Create individuals from the remaining lines

        runGeneticAlgorithm(initialPopulation);
    } catch (error) {
        console.error('Error reading or processing the CSV file:', error);
    }
}

// Call the function to read the CSV and run the genetic algorithm
readCSVAndRunGA('../Dados/dataset_amostra.csv');
