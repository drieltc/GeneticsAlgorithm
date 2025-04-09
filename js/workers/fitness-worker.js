/**
 * @fileoverview Worker thread script for calculating fitness values in parallel.
 * This worker receives batches of chromosomes and SharedArrayBuffer data from the main thread, calculates the fitness for each chromosome using the shared data, and sends the results back.
 * @module workers/fitness-worker
 */

const { parentPort } = require('worker_threads');
const { calculateFitness } = require('../algorithms/fitness');

/**
 * Handles incoming messages from the main thread.
 * Expected message `taskData` structure:
 * {
 *   batchChromosomes: Array<Array<number>>, // Array of chromosomes to evaluate
 *   sab: SharedArrayBuffer,               // Shared buffer with gene data
 *   numGenes: number,                     // Total number of genes (chromosome length)
 *   numOnus: number,                      // Number of Onus categories per gene
 *   stride: number,                       // Elements per gene in SAB
 *   limit: number                         // Onus limit
 * }
 *
 * Sends back a message structure:
 * - On success: `{ status: 'ok', fitnessBatch: Array<number> }`
 * - On error:   `{ status: 'error', error: string }`
 */
parentPort.on('message', (taskData) => {
    try {
        // Destructure and validate incoming data
        const { batchChromosomes, sab, numGenes, numOnus, stride, limit } = taskData;

        if (!batchChromosomes || !sab || numGenes === undefined || numOnus === undefined || stride === undefined || limit === undefined) {
             throw new Error("Worker received incomplete task data (missing SAB parameters).");
        }

        const fitnessResults = []; // Array to store results for the batch

        // Iterate over the batch of chromosomes received
        for (const chromosome of batchChromosomes) {
            // Create the minimal structure expected by calculateFitness
            const individual = { chromosome: chromosome };
            // Call calculateFitness using the SAB path and parameters
            const fitness = calculateFitness(individual, sab, numGenes, numOnus, stride, limit);
            fitnessResults.push(fitness);
        }

        // Send the array of calculated fitness values back to the main thread
        parentPort.postMessage({ status: 'ok', fitnessBatch: fitnessResults });

    } catch (error) {
        // Log the error within the worker for debugging
        console.error("Error in fitness worker:", error);
        // Send an error message back to the main thread
        parentPort.postMessage({ status: 'error', error: error.message });
    }
});
