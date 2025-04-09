/**
 * @fileoverview Defines the Individual class, representing a single entity (solution candidate) within the genetic algorithm's population.
 * @module models/individual
 */

/**
 * Represents an individual in the genetic algorithm population.
 * Each individual carries a chromosome (its genetic code) and a fitness score indicating its quality as a potential solution.
 *
 * @class Individual
 * @property {Array<number>} chromosome - An array of binary values (0s and 1s) representing the individual's genetic makeup. The length corresponds to the number of genes.
 * @property {number} fitness - A numerical score indicating how well the individual solves the problem according to the fitness function. Initialized to 0.
 */
class Individual {
    /**
     * Creates an instance of an Individual.
     * Initializes the individual with its genetic code (chromosome) and sets the initial fitness score to 0.
     *
     * @param {Array<number>} chromosome - The chromosome representing the individual's genetic code.
     */
    constructor(chromosome) {
        /**
         * The genetic code of the individual, represented as an array of 0s and 1s.
         * @type {Array<number>}
         */
        this.chromosome = chromosome;

        /**
         * The fitness score of the individual. Higher values typically indicate a better solution.
         * This value is calculated externally by a fitness function.
         * @type {number}
         */
        this.fitness = 0;
    }
}

module.exports = { Individual };