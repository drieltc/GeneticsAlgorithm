// Import performance for high-resolution timing
const { performance } = require('perf_hooks');

// Start total execution timer
const totalStartTime = performance.now();

const { readCSV, verifyCSV, Parse } = require('./utils/readFile');
const { createInitialPopulation } = require('./algorithms/population-creator');
const { geneticAlgorithm } = require('./algorithms/genetic-algorithm');

const size = "1MB"
const filepath = `../Dados/${size}.csv`;

// --- Data Loading ---
const dataLoadStartTime = performance.now();
const data = readCSV(filepath);
verifyCSV(data);
Parse(data);
const dataLoadEndTime = performance.now();
const dataLoadDuration = (dataLoadEndTime - dataLoadStartTime) / 1000; // Convert ms to s
console.log(`Data Loading: ${dataLoadDuration.toFixed(3)}s`);
// --- End Data Loading ---

const chromosomeLength = Object.keys(data[0]).length -2;
let limit = 0;
if (size === "1MB" || size === "10MB") {
    limit = 35000;
}else if (size === "100MB" || size === "1GB") {
    limit = 350000;
}

//parameters
const QTD_ONUS = chromosomeLength;
const POPULATION_SIZE = 10;
const MUTATION_RATE = 0.01;
const GENERATIONS = 100;
const TOURNAMENT_SIZE = 3;

// --- Initial Population Creation ---
console.log(`Creating initial population of size ${POPULATION_SIZE} without using threads...`);
const popCreateStartTime = performance.now();
const initialPopulation = createInitialPopulation(POPULATION_SIZE, data, chromosomeLength, QTD_ONUS, limit);
const popCreateEndTime = performance.now();
const popCreateDuration = popCreateEndTime - popCreateStartTime; // Keep in ms
console.log("Initial population created.");
console.log(`Initial Population Creation: ${popCreateDuration.toFixed(3)}ms`);
// --- End Initial Population Creation ---


// --- Genetic Algorithm Execution ---
const gaStartTime = performance.now();
const bestSolution = geneticAlgorithm(MUTATION_RATE, GENERATIONS, initialPopulation, data, QTD_ONUS, TOURNAMENT_SIZE, limit);
const gaEndTime = performance.now();
const gaDuration = gaEndTime - gaStartTime; // Keep in ms
console.log(`Genetic Algorithm Execution: ${gaDuration.toFixed(3)}ms`);
// --- End Genetic Algorithm Execution ---


if (!bestSolution) {
    console.error("Failed to find a solution.");
}
else {
    console.log("Best solution found successfully.");
    // Assuming bestSolution has a 'fitness' property. Adjust if needed.
    if (bestSolution.fitness !== undefined) {
        console.log(`Best solution Fitness: ${bestSolution.fitness.toFixed(5)}`);
    } else {
        console.warn("Best solution object does not have a 'fitness' property. Logging the whole object.");
        console.log("Best solution:", bestSolution);
    }
}

// End total execution timer
const totalEndTime = performance.now();
const totalDuration = (totalEndTime - totalStartTime) / 1000; // Convert ms to s
console.log(`Total Execution: ${totalDuration.toFixed(3)}s`);
