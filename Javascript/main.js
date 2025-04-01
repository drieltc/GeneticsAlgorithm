// main.js
const { readCSVAndCreatePopulation } = require('./utils/fileReader');
const { runGeneticAlgorithm } = require('./ga/geneticAlgorithm');

/**
 * Main function to run the genetic algorithm.
 */
async function main() {
    try {
        const initialPopulation = await readCSVAndCreatePopulation('../Dados/dataset_pamostra.csv');
        const bestIndividual = await runGeneticAlgorithm(initialPopulation);
        console.log("Best individual found:", bestIndividual);
    } catch (error) {
        console.error('An error occurred:', error);
    }
}

main();
