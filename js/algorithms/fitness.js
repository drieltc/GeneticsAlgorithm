/**
 * @fileoverview Calculates the fitness of genetic algorithm individuals.
 * Provides functions to calculate fitness based on gene data stored either in a standard JavaScript array of objects or efficiently in a SharedArrayBuffer.
 * Fitness is determined by summing 'Bonus' values for selected genes, while ensuring that the sum of 'Onus' values for various categories does not exceed a given limit.
 * @module algorithms/fitness
 */

/**
 * @typedef {object} IndividualData An object representing the core data of an individual.
 * @property {Array<number>} chromosome An array of 0s and 1s representing the selected genes.
 */

/**
 * Calculates fitness using data efficiently stored in a SharedArrayBuffer.
 * Iterates through the selected genes in the chromosome, sums 'Bonus' values, and checks if accumulated 'Onus' values exceed the limit for any category.
 *
 * @param {IndividualData} individual - An object containing the individual's chromosome.
 * @param {SharedArrayBuffer} sab - The SharedArrayBuffer containing gene data (Bonus and Onus values).
 * @param {number} numGenes - The total number of genes, which must match the chromosome length.
 * @param {number} numOnus - The number of different 'Onus' categories stored per gene in the SAB.
 * @param {number} stride - The number of elements (Floats) used per gene in the SAB (1 for Bonus + numOnus).
 * @param {number} limit - The maximum allowed cumulative value for any single 'Onus' category.
 * @returns {number} The calculated fitness score. Returns 0 if the chromosome length is incorrect,
 *                   SAB access goes out of bounds, or if any Onus limit is exceeded.
 */
function calculateFitnessSAB(individual, sab, numGenes, numOnus, stride, limit) {
    // Create a view within the function scope
    const sabView = new Float64Array(sab);
    let fitness = 0;
    let onusSums = new Array(numOnus).fill(0); // Track onus sums locally

    const chromosome = individual.chromosome;
    const chromosomeLen = chromosome.length;

    // Safety check: ensure chromosome length matches expected number of genes
    if (chromosomeLen !== numGenes) {
        console.error(`Fitness Error: Chromosome length (${chromosomeLen}) does not match number of genes (${numGenes}).`);
        return 0; // Return 0 fitness for invalid chromosome
    }

    for (let i = 0; i < chromosomeLen; i++) {
        if (chromosome[i] === 1) {
            const baseIndex = i * stride; // Calculate starting index in SAB for this gene

            // Safety check for SAB bounds
            if (baseIndex + stride > sabView.length) {
                console.error(`Fitness Error: SAB index out of bounds for gene ${i}.`);
                return 0; // Invalid state
            }

            // Add Bonus (at offset 0)
            fitness += sabView[baseIndex];

            // Add Onus values
            for (let j = 0; j < numOnus; j++) {
                onusSums[j] += sabView[baseIndex + 1 + j];
                if (onusSums[j] > limit) {
                    // console.log(`Limit Exceeded: Gene ${i}, Onus Index ${j}, Sum ${onusSums[j].toFixed(3)}, Limit ${limit}`); // Optional debug log
                    return 0;
                }
            }
        }
    }
    return fitness;
}

/**
 * Calculates fitness, acting as a dispatcher based on the type of gene data provided.
 * It can handle gene data stored as an array of objects (legacy) or a SharedArrayBuffer (optimized).
 *
 * @param {IndividualData} individual - An object containing the individual's chromosome.
 * @param {Array<object>|SharedArrayBuffer} geneSubsetOrSab - Either the original array of gene data objects or the SharedArrayBuffer containing the data.
 * @param {...any} args - Additional arguments required depending on the type of `geneSubsetOrSab`:
 * - If `geneSubsetOrSab` is SAB: `numGenes`, `numOnus`, `stride`, `limit`.
 * - If `geneSubsetOrSab` is Array: `qtdOnus`, `limit`.
 * @returns {number} The calculated fitness score.
 * @throws {Error} If required arguments are missing based on the type of `geneSubsetOrSab`.
 * @throws {Error} If `geneSubsetOrSab` is not an Array or SharedArrayBuffer.
 */
function calculateFitness(individual, geneSubsetOrSab, ...args) {
     if (geneSubsetOrSab instanceof SharedArrayBuffer) {
         // --- SAB Path ---
         if (args.length < 4) {
             throw new Error("calculateFitness (SAB): Missing required arguments (numGenes, numOnus, stride, limit).");
         }
         const [numGenes, numOnus, stride, limit] = args;
         return calculateFitnessSAB(individual, geneSubsetOrSab, numGenes, numOnus, stride, limit);

     } else if (Array.isArray(geneSubsetOrSab)) {
         // --- Original Array Path ---
         if (args.length < 2) {
              throw new Error("calculateFitness (Array): Missing required arguments (qtdOnus, limit).");
         }
         const [qtdOnus, limit] = args;
         const geneSubset = geneSubsetOrSab; // Rename for clarity
         let fitness = 0;
         let onus = new Array(qtdOnus).fill(0);

         // Ensure chromosome length matches geneSubset length if using array mode
         if (individual.chromosome.length !== geneSubset.length) {
             console.error(`Fitness Error (Array): Chromosome length (${individual.chromosome.length}) != geneSubset length (${geneSubset.length}).`);
             return 0;
         }

         for (let i = 0; i < individual.chromosome.length; i++) {
             if (individual.chromosome[i] === 1) {
                 // Check if geneSubset[i] exists and has 'Bonus'
                 if (!geneSubset[i] || geneSubset[i]['Bonus'] === undefined) {
                     console.warn(`Warning: Missing data or Bonus for gene index ${i} in geneSubset array.`);
                     continue; // Skip this gene if data is missing
                 }
                 fitness += geneSubset[i]['Bonus'];

                 for (let j = 0; j < qtdOnus; j++) {
                     const onusKey = `Onus_${j}`;
                     // Check if the property exists before adding
                     if (geneSubset[i].hasOwnProperty(onusKey) && typeof geneSubset[i][onusKey] === 'number') {
                         onus[j] += geneSubset[i][onusKey];
                     }
                     if (onus[j] > limit) {
                         return 0; // Exceeded limit
                     }
                 }
             }
         }
         return fitness;
     } else {
         // --- Error Path ---
         throw new Error("calculateFitness: Unexpected data type for geneSubsetOrSab. Expected Array or SharedArrayBuffer.");
     }
}

module.exports = { calculateFitness, calculateFitnessSAB };