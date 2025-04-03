const { calculateFitness } = require('./fitness');
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
    const childChromosome = [];
    for (let i = 0; i < parent1.chromosome.length; i++) {
        childChromosome.push(Math.random() < 0.5 ? parent1.chromosome[i] : parent2.chromosome[i]);
    }
    return new Individual(childChromosome);
}

function mutate(individual, mutationRate) {
    for (let i = 0; i < individual.chromosome.length; i++) {
        if (Math.random() < mutationRate) {
            individual.chromosome[i] = individual.chromosome[i] === 0 ? 1 : 0;
        }
    }
    return individual;
}

function sortPopulation(population) {
    population.sort((a, b) => b.fitness - a.fitness);
    return population;
}

function geneticAlgorithm(mutationRate = 0.01, generations = 100, initialPopulation, geneSubset, qtdOnus, tournamentSize) {

    let population = [...initialPopulation];
    const populationSize = population.length;
    for (let generation = 0; generation < generations; generation++) {
        population = sortPopulation(population);
        const newPopulation = [];
        // Keep the best individual
        newPopulation.push(population[0]);
        for (let i = 0; i < populationSize; i++) {
            const parent1 = selectParent(population, tournamentSize);
            const parent2 = selectParent(population, tournamentSize);

            let child = crossover(parent1, parent2);
            child = mutate(child, mutationRate);
            child.fitness = calculateFitness(child, geneSubset, qtdOnus);
            newPopulation.push(child);
        }
        population = newPopulation;
    }

    population = sortPopulation(population);
    const bestSolution = population[0];
    return bestSolution
}

module.exports = { geneticAlgorithm };