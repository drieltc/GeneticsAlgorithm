const { calculateFitness } = require('../utils/fitness');
const { Individual } = require('../models/individual');

/**
 * Selects a parent from the population using tournament selection.
 *
 * @param {Array<object>} population - The population of individuals.
 * @param {number} [tournamentSize=3] - The size of the tournament.
 * @returns {object} The selected parent.
 */
function selectParent(population, tournamentSize = 3) {
    const tournament = [];
    for (let i = 0; i < tournamentSize; i++) {
        const randomIndex = Math.floor(Math.random() * population.length);
        tournament.push(population[randomIndex]);
    }
    return tournament.reduce((best, current) => (current.fitness > best.fitness ? current : best));
}

/**
 * Creates a child individual by performing crossover between two parents.
 *
 * @param {object} parent1 - The first parent.
 * @param {object} parent2 - The second parent.
 * @returns {object} The child individual.
 */
function crossover(parent1, parent2) {
    const childGenes = [];
    for (let i = 0; i < parent1.genes.length; i++) {
        childGenes.push(Math.random() < 0.5 ? parent1.genes[i] : parent2.genes[i]);
    }
    return new Individual(childGenes);
}

/**
 * Mutates an individual's genes based on the mutation rate.
 *
 * @param {object} individual - The individual to mutate.
 * @param {number} [mutationRate=0.01] - The mutation rate.
 */
function mutate(individual, mutationRate = 0.01) {
    for (let i = 0; i < individual.genes.length; i++) {
        if (Math.random() < mutationRate) {
            individual.genes[i] = 1 - individual.genes[i]; // Flip the gene (0 to 1, or 1 to 0)
        }
    }
}

/**
 * Runs the genetic algorithm.
 *
 * @param {Array<object>} initialPopulation - The initial population.
 * @param {number} [populationSize=100] - The size of the population.
 * @param {number} [generations=100] - The number of generations to run.
 * @param {number} [mutationRate=0.01] - The mutation rate.
 * @param {number} [tournamentSize=3] - The tournament size for parent selection.
 * @returns {Promise<object>} A promise that resolves with the best individual found.
 */

async function runGeneticAlgorithm(initialPopulation, populationSize = 10, generations = 100, mutationRate = 0.01, tournamentSize = 3) {
    const cpInitialPopulation = [...initialPopulation]; // Copy of the initial population to avoid modifying it

    // Use initialPopulation as the first generation
    let population = initialPopulation.map(individualData => new Individual(individualData.genes));
    
    // If the initial population is smaller than populationSize, fill the rest with random individuals
    while (population.length < populationSize) {
        const genes = Array(cpInitialPopulation[0].genes.length).fill(0).map(() => Math.random() < 0.5 ? 1 : 0);
        population.push(new Individual(genes));
    }

    // Calculate fitness for each individual in the initial population
    population.forEach(individual => calculateFitness(individual, cpInitialPopulation));

    console.log("Code doesnt get here!!");

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
        while (newPopulation.length < populationSize) {
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

module.exports = { runGeneticAlgorithm };