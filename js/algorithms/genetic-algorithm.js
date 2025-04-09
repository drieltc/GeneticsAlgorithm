/**
 * @fileoverview Implements the core genetic algorithm logic.
 * This module orchestrates the evolution process over multiple generations, including selection, crossover, mutation, and fitness evaluation.
 * It utilizes worker threads for parallelizing fitness calculations and SharedArrayBuffer for efficient gene data sharing.
 * @module algorithms/genetic-algorithm
 */

const { Worker } = require('worker_threads');
const path = require('path');
const os = require('os');
const { Individual } = require('../models/individual'); // Assuming Individual class is defined here

/**
 * @typedef {import('../models/individual').Individual} Individual Represents an individual in the population.
 */

/**
 * Selects a parent from the population using tournament selection.
 * Randomly picks individuals for a tournament and returns the fittest one.
 * @param {Array<Individual>} population - The current population.
 * @param {number} [tournamentSize=3] - The number of individuals participating in each tournament.
 * @returns {Individual|null} The selected parent individual, or null if population is empty.
 * @private
 */
function selectParent(population, tournamentSize = 3) {
    const tournament = [];
    for (let i = 0; i < tournamentSize; i++) {
        const randomIndex = Math.floor(Math.random() * population.length);
        tournament.push(population[randomIndex]);
    }
    // Handle cases where population might be smaller than tournament size or empty
    if (tournament.length === 0 && population.length > 0) return population[0];
    if (tournament.length === 0) return null;
    // Find the best in the tournament
    return tournament.reduce((best, current) => (current.fitness > best.fitness ? current : best));
}

/**
 * Performs uniform crossover between two parent individuals.
 * Creates a child chromosome by randomly selecting genes from either parent.
 * @param {Individual|null} parent1 - The first parent.
 * @param {Individual|null} parent2 - The second parent.
 * @returns {Individual} A new individual representing the child. Returns an individual with an empty chromosome if parents are invalid.
 * @private
 */
function crossover(parent1, parent2) {
    // Handle null parents if population was empty during selection
    if (!parent1 || !parent2 || !parent1.chromosome || !parent2.chromosome || parent1.chromosome.length === 0) {
        // Attempt to get length from parent2 if parent1 is bad
        const len = (parent2 && parent2.chromosome) ? parent2.chromosome.length : 0;
        return new Individual(new Array(len).fill(0)); // Return default/empty individual
    }

    const childChromosome = [];
    const len = parent1.chromosome.length;
    for (let i = 0; i < len; i++) {
        // Ensure parent2 has the gene if lengths differ (shouldn't happen ideally)
        const geneP2 = (i < parent2.chromosome.length) ? parent2.chromosome[i] : 0;
        childChromosome.push(Math.random() < 0.5 ? parent1.chromosome[i] : geneP2);
    }
    return new Individual(childChromosome);
}

/**
 * Mutates an individual's chromosome by flipping bits based on the mutation rate.
 * @param {Individual} individual - The individual to mutate.
 * @param {number} mutationRate - The probability (0 to 1) of each gene mutating.
 * @returns {Individual} The mutated individual (modified in place).
 * @private
 */
function mutate(individual, mutationRate) {
    if (!individual || !individual.chromosome) return individual; // Safety check
    for (let i = 0; i < individual.chromosome.length; i++) {
        if (Math.random() < mutationRate) {
            individual.chromosome[i] = 1 - individual.chromosome[i]; // Toggle 0/1
        }
    }
    return individual;
}

/**
 * Sorts the population array in place based on fitness (descending order).
 * @param {Array<Individual>} population - The population array to sort.
 * @returns {Array<Individual>} The sorted population array.
 * @private
 */
function sortPopulation(population) {
    population.sort((a, b) => b.fitness - a.fitness);
    return population;
}

/**
 * Executes the genetic algorithm.
 * Evolves a population over a number of generations using selection, crossover, mutation, and parallel fitness evaluation via worker threads.
 *
 * @async
 * @param {number} [mutationRate=0.01] - The probability of mutation for each gene.
 * @param {number} [generations=100] - The number of generations to run the algorithm.
 * @param {Array<Individual>} initialPopulation - The starting population of individuals.
 * @param {SharedArrayBuffer} sab - SharedArrayBuffer containing the gene data (Bonus/Onus).
 * @param {number} numGenes - The total number of genes (chromosome length).
 * @param {number} numOnus - The number of 'Onus' categories per gene.
 * @param {number} stride - The number of elements per gene in the SAB.
 * @param {number} tournamentSize - The size of the selection tournament.
 * @param {number} limit - The maximum limit for any 'Onus' category sum.
 * @returns {Promise<Individual|null>} A promise that resolves to the best individual found after all generations, or null if the population becomes empty or an error occurs.
 */
async function geneticAlgorithm(
    mutationRate = 0.01,
    generations = 100,
    initialPopulation,
    sab,
    numGenes,
    numOnus,
    stride,
    tournamentSize,
    limit
) {

    let population = [...initialPopulation];
    const populationSize = population.length;

    // --- Determine number of workers ---
    const numWorkers = Math.max(1, os.cpus().length - 1);
    console.log(`Initializing ${numWorkers} fitness workers...`);

    // --- Create Worker Pool ---
    const workers = [];
    // Resolve worker path relative to the current file's directory
    const workerPath = path.resolve(__dirname, '../workers/fitness-worker.js');
    for (let i = 0; i < numWorkers; i++) {
        const worker = new Worker(workerPath);
        worker.on('error', (error) => console.error(`Worker ${i} Error:`, error));
        worker.on('exit', (code) => {
            // Exit code 1 on terminate is often normal, log others as potential issues
            if (code !== 0 && code !== 1) console.error(`Worker ${i} stopped unexpectedly with exit code ${code}`);
        });
        workers.push(worker);
    }
    // --- End Worker Pool Setup ---


    for (let generation = 0; generation < generations; generation++) {
        sortPopulation(population); // Sort by fitness

        const newPopulation = [];
        // Elitism: Keep the best individual
        if (population.length > 0) {
            newPopulation.push(population[0]);
        } else {
            console.warn(`Generation ${generation}: Population is empty! Stopping.`);
            break; // Stop if population dies out
        }

        // --- Generate Children ---
        const childrenToEvaluate = [];
        const numChildrenToCreate = populationSize - 1; // Need N-1 new children
        for (let i = 0; i < numChildrenToCreate; i++) {
            const parent1 = selectParent(population, tournamentSize);
            const parent2 = selectParent(population, tournamentSize);
            let child = crossover(parent1, parent2);
             // Ensure crossover didn't return an empty individual and handle potential errors
             if (!child || child.chromosome.length === 0) {
                 const parentLength = (parent1 && parent1.chromosome) ? parent1.chromosome.length : ((parent2 && parent2.chromosome) ? parent2.chromosome.length : numGenes); // Fallback length
                 if (parentLength > 0) {
                    child = new Individual(new Array(parentLength).fill(0));
                    console.warn("Crossover resulted in empty chromosome, creating default.");
                 } else {
                    console.error("Cannot determine chromosome length for mutation after crossover.");
                    continue; // Skip this child if we can't process it
                 }
             }
            child = mutate(child, mutationRate);
            childrenToEvaluate.push(child);
        }

        // --- Distribute Fitness Calculation to Workers ---
        const promises = [];
        const chromosomesToEvaluate = childrenToEvaluate.map(child => child.chromosome);
        const baseBatchSize = Math.floor(chromosomesToEvaluate.length / numWorkers);
        let remainder = chromosomesToEvaluate.length % numWorkers;
        let startIndex = 0;

        for (let i = 0; i < numWorkers; i++) {
            const batchSize = baseBatchSize + (remainder > 0 ? 1 : 0);
            if (batchSize === 0) continue; // No work for this worker

            remainder--;
            const endIndex = startIndex + batchSize;
            const batch = chromosomesToEvaluate.slice(startIndex, endIndex); // Get the batch of chromosomes

            // Create a promise for this worker's batch calculation
            promises.push(new Promise((resolve, reject) => {
                const worker = workers[i]; // Get the specific worker

                const messageListener = (response) => {
                    worker.removeListener('message', messageListener); // Clean up listener immediately
                    if (response.status === 'ok') {
                        resolve(response.fitnessBatch); // Resolve with the array of fitness values
                    } else { // status === 'error' or unknown
                        console.error(`Error from worker ${i}:`, response.error || 'Unknown error');
                        // Resolve with an array of 0s of the expected length on error
                        resolve(new Array(batch.length).fill(0));
                        // Alternatively reject(new Error(response.error));
                    }
                };
                 // Add listener *before* posting message
                worker.on('message', messageListener);

                // Send the batch task to the worker
                // SAB is transferred efficiently by reference
                worker.postMessage({
                    batchChromosomes: batch,
                    sab: sab,
                    numGenes: numGenes,
                    numOnus: numOnus,
                    stride: stride,
                    limit: limit
                });
            }));

            startIndex = endIndex; // Move start index for next batch
        } // End loop distributing work

        // --- Wait for all workers to finish their batches ---
        const fitnessResultsBatches = await Promise.all(promises);

        // --- Assign Fitness back to Children ---
        // Flatten the results array (batches of fitness values into one array)
        const allFitnessResults = fitnessResultsBatches.flat();

        // Assign the calculated fitness to each child object
        for (let i = 0; i < childrenToEvaluate.length; i++) {
            // Check if we have a result (in case of errors or length mismatch)
            childrenToEvaluate[i].fitness = (i < allFitnessResults.length) ? allFitnessResults[i] : 0;
        }

        // Add the evaluated children to the new population
        newPopulation.push(...childrenToEvaluate);

        // Update the population for the next generation
        population = newPopulation;

        // Optional: Log progress
        if ((generation + 1) % 10 === 0 || generation === generations - 1) {
            sortPopulation(population); // Sort to show the best
            if (population.length > 0) {
                console.log(`Generation ${generation + 1}/${generations} complete. Best fitness: ${population[0].fitness.toFixed(5)}`);
            } else {
                 console.log(`Generation ${generation + 1}/${generations} complete. Population empty.`);
            }
        }

    } // End of generation loop

    // --- Terminate Worker Pool ---
    console.log("Terminating fitness workers...");
    // Use Promise.allSettled to wait for all terminations even if some fail
    const terminationResults = await Promise.allSettled(workers.map(worker => worker.terminate()));
    terminationResults.forEach((result, index) => {
        if (result.status === 'rejected') {
            console.warn(`Failed to terminate worker ${index}:`, result.reason);
        }
    });
    console.log("Fitness workers terminated.");

    // Final sort and return
    sortPopulation(population);
    const bestSolution = population.length > 0 ? population[0] : null;
    return bestSolution;
}

module.exports = { geneticAlgorithm };