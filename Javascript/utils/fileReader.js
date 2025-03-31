const fs = require('fs');
const path = require('path');
const { Individual } = require('../models/individual');

// Function to create an Individual from a CSV row
function createIndividualFromRow(row) {
    const values = row.split(',');
    const genes = values.slice(4).map(gene => parseInt(gene)); // Genes start from the 5th column
    return {
        genes: genes,
        condition: values[2]
    };
}

// Function to read the CSV file and create the initial population
async function readCSVAndCreatePopulation(filePath) {
    try {
        const absolutePath = path.resolve(__dirname, '../', filePath);
        const data = fs.readFileSync(absolutePath, 'utf-8');
        const lines = data.trim().split('\n');
        const header = lines.shift().split(','); // Remove the header line and get the header
        const initialPopulation = lines.map(createIndividualFromRow); // Create individuals from the remaining lines
        return initialPopulation;
    } catch (error) {
        console.error('Error reading or processing the CSV file:', error);
        throw error; // Re-throw the error to be handled in main.js
    }
}

module.exports = { readCSVAndCreatePopulation };
