// utils/fitness.js
/**
 * Calculates the probability of having condition "A" based on the presence of specific genes.
 *
 * @param {Array<object>} population - The population of individuals.
 * @param {Array<number>} geneSubset - The gene subset to check against.
 * @returns {number} The probability of condition "A" given the gene subset.
 */
function calculateProbability(population, geneSubset) {
    let countA = 0;
    let countTotal = 0;

    for (const individual of population) {
        if (isSubsetPresent(individual.genes, geneSubset)) {
            countTotal++;
            if (individual.condition === "A") {
                countA++;
            }
        }
    }

    return countTotal === 0 ? 0 : countA / countTotal;
}

/**
 * Checks if a given gene subset is present in an individual's genes.
 *
 * @param {Array<number>} individualGenes - The genes of an individual.
 * @param {Array<number>} geneSubset - The gene subset to check.
 * @returns {boolean} True if the subset is present, false otherwise.
 */
function isSubsetPresent(individualGenes, geneSubset) {
    for (let i = 0; i < geneSubset.length; i++) {
        if (geneSubset[i] === 1 && individualGenes[i] !== 1) {
            return false;
        }
    }
    return true;
}

/**
 * Calculates the fitness of an individual based on the probability of condition "A" and the size of the gene subset.
 *
 * @param {object} individual - The individual to calculate fitness for.
 * @param {Array<object>} population - The population of individuals.
 */
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

module.exports = { calculateFitness };
