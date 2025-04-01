// utils/fileReader.js
const fs = require('fs');
const path = require('path');
const { Individual } = require('../models/individual');

/**
 * Creates an Individual object from a CSV row.
 *
 * @param {string} row - A row from the CSV file.
 * @returns {object} An object representing an individual.
 */
function createIndividualFromRow(row) {
    const values = row.split(',');
    const genes = values.slice(4).map(gene => parseInt(gene)); // Genes start from the 5th column
    return {
        genes: genes,
        condition: values[2]
    };
}

/**
 * Reads a CSV file and creates the initial population.
 *
 * @param {string} filePath - The path to the CSV file.
 * @returns {Promise<Array<object>>} A promise that resolves with the initial population.
 */
async function readCSVAndCreatePopulation(filePath) {
    try {
        const absolutePath = path.resolve(__dirname, '../', filePath);
        const data = fs.readFileSync(absolutePath, 'utf-8');
        const lines = data.trim().split('\n');
        lines.shift(); // Remove the header line
        const initialPopulation = lines.map(createIndividualFromRow);
        return initialPopulation;
    } catch (error) {
        console.error('Error reading or processing the CSV file:', error);
        throw error; // Re-throw the error to be handled in main.js
    }
}

module.exports = { readCSVAndCreatePopulation };
