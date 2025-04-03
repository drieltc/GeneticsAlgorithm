const { readCSV, verifyCSV, Parse } = require('./utils/readFile');
const { createInitialPopulation } = require('./algorithms/population-creator');
const { geneticAlgorithm } = require('./algorithms/genetic-algorithm');

const filepath = '../Dados/1MB.csv';
const data = readCSV(filepath);
verifyCSV(data);
Parse(data);

const chromosomeLength = Object.keys(data[0]).length -2;

//parameters
const QTD_ONUS = chromosomeLength;
const POPULATION_SIZE = 100;
const MUTATION_RATE = 0.01;
const GENERATIONS = 100;
const TOURNAMENT_SIZE = 3;

const initialPopulation = createInitialPopulation(POPULATION_SIZE, data, chromosomeLength, QTD_ONUS);

if (initialPopulation.length > 0) {
    console.log("Initial population created successfully.");
} else {
    console.error("Failed to create initial population.");
}

const bestSolution = geneticAlgorithm(MUTATION_RATE, GENERATIONS, initialPopulation, data, QTD_ONUS, TOURNAMENT_SIZE);
if (!bestSolution) {
    console.error("Failed to find a solution.");
}
else {
    console.log("Best solution found successfully.");
    console.log("Best solution:", bestSolution);
}