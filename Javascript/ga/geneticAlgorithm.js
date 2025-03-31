const { calculateFitness } = require('../utils/fitness');
const { Individual } = require('../models/individual');

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

async function runGeneticAlgorithm(initialPopulation, populationSize = 100, generations = 100, mutationRate = 0.01, tournamentSize = 3) {
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

module.exports = { runGeneticAlgorithm };
