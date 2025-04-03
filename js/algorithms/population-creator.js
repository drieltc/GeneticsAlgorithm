const { calculateFitness } = require('./fitness');
const { Individual } = require('../models/individual');

function createRandomChromosome(length) {
    const chromosome = [];
    for (let i = 0; i < length; i++) {
        chromosome.push(Math.random() < 0.5 ? 0 : 1);
    }
    return chromosome;
}

function createInitialPopulation(populationSize, data, chromosomeLength, qtdOnus) {
    // 2. Create the population
    const population = [];
    for (let i = 0; i < populationSize; i++) {
        // Create a random chromosome
        const chromosome = createRandomChromosome(chromosomeLength);
        const individual = new Individual(chromosome);
        individual.fitness = calculateFitness(individual, data, qtdOnus);
        population.push(individual);

        //console.log(`Individual ${i}: Fitness: ${individual.fitness}`);
    }

    return population;
}

module.exports = { createInitialPopulation };
