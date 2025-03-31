const { readCSVAndCreatePopulation } = require('./utils/fileReader');
const { runGeneticAlgorithm } = require('./ga/geneticAlgorithm');

async function main() {
    try {
        const initialPopulation = await readCSVAndCreatePopulation('../Dados/dataset_amostra.csv');
        await runGeneticAlgorithm(initialPopulation);
    } catch (error) {
        console.error('An error occurred:', error);
    }
}

main();
