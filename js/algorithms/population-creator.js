/**
 * @fileoverview Creates the initial population for the genetic algorithm.
 * Generates individuals with random chromosomes and calculates their initial fitness.
 * @module algorithms/population-creator
 */

const { calculateFitness } = require('./fitness');
const { Individual } = require('../models/individual');

/**
 * @typedef {import('../models/individual').Individual} Individual Represents an individual in the population.
 */
/**
 * @typedef {import('./fitness').IndividualData} IndividualData Represents the core data of an individual.
 */


/**
 * Creates a random binary chromosome (array of 0s and 1s).
 * @param {number} length - The desired length of the chromosome.
 * @returns {Array<number>} The generated chromosome.
 * @private
 */
function createRandomChromosome(length) {
    const chromosome = [];
    // Initialize with roughly 50% '1's
    const selectionProbability = 0.5;
    for (let i = 0; i < length; i++) {
        chromosome.push(Math.random() < selectionProbability ? 1 : 0);
    }
    return chromosome;
}

/**
 * Creates an initial population of individuals.
 * Each individual is generated with a random chromosome, and its initial fitness is calculated using the provided SharedArrayBuffer gene data.
 *
 * @param {number} populationSize - The desired number of individuals in the population.
 * @param {SharedArrayBuffer} sab - SharedArrayBuffer containing the gene data (Bonus/Onus).
 * @param {number} numGenes - The total number of genes, which determines the chromosome length.
 * @param {number} numOnus - The number of 'Onus' categories to be considered.
 * @param {number} stride - The number of elements per gene in the SAB.
 * @param {number} limit - The maximum limit for any 'Onus' category sum during fitness calculation.
 * @returns {Array<Individual>} An array containing the generated initial population.
 */
function createInitialPopulation(populationSize, sab, numGenes, numOnus, stride, limit) {
    const population = [];
    const chromosomeLength = numGenes; // Chromosome length corresponds to the number of genes (rows)

    for (let i = 0; i < populationSize; i++) {
        const chromosome = createRandomChromosome(chromosomeLength);
        const individual = new Individual(chromosome);

        // Calculate initial fitness using the SAB and relevant parameters
        individual.fitness = calculateFitness(individual, sab, numGenes, numOnus, stride, limit);

        population.push(individual);
    }

    return population;
}

module.exports = { createInitialPopulation };