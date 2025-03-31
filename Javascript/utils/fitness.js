// Function to calculate the probability of having condition "A" based on the genes that are present
function calculateProbability(population, geneSubset) {
    let countA = 0;
    let countTotal = 0;

    for (const individual of population) {
        let match = true;
        for (let i = 0; i < geneSubset.length; i++) {
            if (geneSubset[i] === 1 && individual.genes[i] !== 1) {
                match = false;
                break;
            }
        }
        if (match) {
            countTotal++;
            if (individual.condition === "A") {
                countA++;
            }
        }
    }

    if (countTotal === 0) {
        return 0; // Avoid division by zero
    }
    return countA / countTotal;
}

// New Fitness Function
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
