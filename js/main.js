/**
 * @fileoverview Main entry point for the Genetic Algorithm application.
 * This script handles:
 * 1. Loading and parsing CSV data.
 * 2. Calculating necessary parameters (gene count, onus count).
 * 3. Setting up limits based on data size.
 * 4. Preparing a SharedArrayBuffer for efficient gene data access in workers.
 * 5. Creating the initial population.
 * 6. Executing the core genetic algorithm using worker threads.
 * 7. Logging the final results and performance metrics.
 * @module main
 */

// Import performance for high-resolution timing
const { performance } = require('perf_hooks');

// Import utility and algorithm modules
// Assuming utils/readFile exports these functions
const { readCSV, verifyCSV, Parse } = require('./utils/readFile');
// Assuming algorithms/population-creator exports createInitialPopulation
const { createInitialPopulation } = require('./algorithms/population-creator');
// Assuming algorithms/genetic-algorithm exports the async geneticAlgorithm function
const { geneticAlgorithm } = require('./algorithms/genetic-algorithm');

/**
 * @typedef {import('./models/individual').Individual} Individual Represents an individual in the population.
 */

/**
 * Main asynchronous function to run the complete genetic algorithm process.
 * Orchestrates data loading, preparation, population creation, evolution, and result logging.
 * @async
 * @returns {Promise<void>} A promise that resolves when the process completes or rejects on error.
 */
async function run() {
    // Start total execution timer
    const totalStartTime = performance.now();

    // --- Configuration ---
    const size = "100MB" // Example: "1MB", "10MB", "100MB", "1GB"
    const filepath = `../Dados/${size}.csv`; // Path relative to main.js location

    // --- Data Loading ---
    console.log(`Loading data from ${filepath}...`);
    const dataLoadStartTime = performance.now();
    const data = readCSV(filepath);
    verifyCSV(data); // Basic validation
    Parse(data); // Ensure numeric fields are converted to numbers
    const dataLoadEndTime = performance.now();
    const dataLoadDuration = (dataLoadEndTime - dataLoadStartTime) / 1000; // Convert ms to s
    console.log(`Data Loading: ${dataLoadDuration.toFixed(3)}s`);
    // --- End Data Loading ---

    // --- Validate Loaded Data ---
    if (!data || data.length === 0) {
        console.error("Error: Data could not be loaded or is empty.");
        return; // Exit if data is invalid
    }

    // --- Calculate Parameters ---
    // numGenes: Number of rows in the CSV, corresponds to chromosome length
    const numGenes = data.length;
    // Get column headers from the first row to determine Onus count
    const sampleGeneKeys = data[0] ? Object.keys(data[0]) : [];
    // numOnus: Count of columns starting with "Onus_"
    const numOnus = sampleGeneKeys.filter(key => key.startsWith('Onus_')).length;
    //const numOnus = 1

    // Validate calculated parameters
    if (numGenes === 0) {
         console.error("Error: Number of genes (data rows) is zero.");
         return;
    }
     if (numOnus === 0) {
         // This might be valid depending on the problem, but issue a warning.
         console.warn("Warning: Number of Onus columns detected is zero.");
     }
    console.log(`Parameters: numGenes (chromosome length)=${numGenes}, numOnus=${numOnus}`);
    // --- End Parameter Calculation ---

    // --- Set Fitness Limit based on Data Size ---
    let limit = 0;
    if (size === "1MB") { // ~1,000 genes
        limit = 350000; // Example limit
    } else if (size === "10MB"){ // ~10,000 genes
        limit = 3500000; // Example limit
    } else if (size === "100MB") { // ~100,000 genes
        limit = 35000000; // Example limit
    } else if (size === "1GB"){ // ~1,000,000 genes
        limit = 350000000; // Example limit
    } else {
        limit = 5000; // Default limit for unknown/small sizes
        console.warn(`Using default limit of ${limit} for size ${size}`);
    }
    console.log(`Fitness Onus Limit set to: ${limit}`);
    // --- End Limit Setting ---

    // --- Prepare SharedArrayBuffer for Gene Data ---
    console.log("Preparing SharedArrayBuffer for gene data...");
    const sabPrepStartTime = performance.now();
    // Stride: Number of data points per gene (1 Bonus + numOnus Onus values)
    const stride = 1 + numOnus;
    // Calculate total size needed in bytes (using 64-bit floats)
    const sabSizeBytes = numGenes * stride * Float64Array.BYTES_PER_ELEMENT;

    console.log(`Allocating SharedArrayBuffer: ${numGenes} genes, ${stride} values/gene, ${(sabSizeBytes / 1024 / 1024).toFixed(2)} MB`);

    // Create the SharedArrayBuffer
    const sab = new SharedArrayBuffer(sabSizeBytes);
    // Create a view to easily write data into the buffer
    const sabView = new Float64Array(sab);

    // Populate the SharedArrayBuffer with Bonus and Onus values from the loaded data
    for (let i = 0; i < numGenes; i++) {
        const geneData = data[i]; // Get data for the current gene (row)
        const baseIndex = i * stride; // Calculate the starting index in the buffer for this gene

        // Store Bonus value (ensure it's a valid number)
        const bonusValue = geneData['Bonus'];
        sabView[baseIndex] = (typeof bonusValue === 'number' && !isNaN(bonusValue)) ? bonusValue : 0;

        // Store Onus values
        for (let j = 0; j < numOnus; j++) {
            const onusKey = `Onus_${j}`; // Construct the key e.g., 'Onus_0'
            const onusValue = geneData[onusKey];
            // Store Onus value (ensure it's a valid number)
            sabView[baseIndex + 1 + j] = (typeof onusValue === 'number' && !isNaN(onusValue)) ? onusValue : 0;
        }
    }
    const sabPrepEndTime = performance.now();
    console.log(`SharedArrayBuffer Preparation: ${(sabPrepEndTime - sabPrepStartTime).toFixed(3)}ms`);
    // --- End SAB Preparation ---


    // --- Genetic Algorithm Configuration ---
    const POPULATION_SIZE = 100; // Number of individuals per generation
    const MUTATION_RATE = 0.01; // Probability of a gene mutating
    const GENERATIONS = 100; // Number of generations to run
    const TOURNAMENT_SIZE = 3; // Size of selection tournaments
    // --- End GA Configuration ---

    // --- Initial Population Creation ---
    console.log(`Creating initial population of size ${POPULATION_SIZE} (using SAB for fitness)...`);
    const popCreateStartTime = performance.now();
    // Call the population creator, passing SAB and related parameters
    const initialPopulation = createInitialPopulation(
        POPULATION_SIZE,
        sab,
        numGenes,
        numOnus,
        stride,
        limit
    );
    const popCreateEndTime = performance.now();
    const popCreateDuration = popCreateEndTime - popCreateStartTime;
    console.log("Initial population created.");
    console.log(`Initial Population Creation: ${popCreateDuration.toFixed(3)}ms`);
    // --- End Initial Population Creation ---


    // --- Genetic Algorithm Execution ---
    console.log("Starting Genetic Algorithm Execution...");
    const gaStartTime = performance.now();
    // Execute the main GA function, awaiting its result
    const bestSolution = await geneticAlgorithm(
        MUTATION_RATE,
        GENERATIONS,
        initialPopulation,
        sab,
        numGenes,
        numOnus,
        stride,
        TOURNAMENT_SIZE,
        limit
    );
    const gaEndTime = performance.now();
    const gaDuration = gaEndTime - gaStartTime;
    console.log(`Genetic Algorithm Execution finished.`);
    console.log(`Genetic Algorithm Execution Duration: ${gaDuration.toFixed(3)}ms`);
    // --- End Genetic Algorithm Execution ---

    // --- Log Final Results ---
    if (!bestSolution) {
        console.error("Failed to find a solution (GA returned null/undefined).");
    } else {
        console.log("Best solution found successfully.");
        // Check if the solution object has the expected fitness property
        if (bestSolution.fitness !== undefined) {
            console.log(`Best solution Fitness: ${bestSolution.fitness.toFixed(5)}`);
        } else {
            console.warn("Best solution object does not have a 'fitness' property after GA execution. Logging the whole object.");
            console.log("Best solution:", bestSolution);
        }
    }
    // --- End Final Results ---

    // Log total execution time
    const totalEndTime = performance.now();
    const totalDuration = (totalEndTime - totalStartTime) / 1000; // Convert ms to s
    console.log(`Total Execution: ${totalDuration.toFixed(3)}s`);

} // --- End of async run function ---

// --- Execute the main function and handle potential errors ---
run().catch(error => {
    console.error("An critical error occurred during the main execution:", error);
    process.exit(1); // Exit with a non-zero code to indicate failure
});