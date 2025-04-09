/**
 * @fileoverview Utility functions for reading and processing CSV files.
 * Provides functions to synchronously read a CSV file, parse its content into objects, perform basic validation, and convert numeric string values within the data to floats.
 * @module utils/readFile
 */

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

/**
 * Reads a CSV file synchronously and parses it into an array of objects.
 * Uses the first row as headers for the object keys. Skips empty lines.
 *
 * @param {string} fileName - The path to the CSV file to read.
 * @returns {Array<object>|null} An array of objects representing the CSV rows, or null if an error occurs during reading or parsing. Errors are logged to the console.
 */
function readCSV(fileName) {
  try {
    // Read the entire file content as a UTF-8 string
    const content = fs.readFileSync(fileName, 'utf-8');
    // Parse the CSV content using csv-parse/sync
    const response = parse(content, {
      columns: true,          // Use the first row as header keys
      skip_empty_lines: true  // Ignore lines that are empty
    });
    return response;
  } catch (error) {
    // Log any errors encountered during file reading or parsing
    console.error(`Error reading or parsing ${fileName}:`, error);
    // Return null to indicate failure
    return null;
  }
}

/**
 * Performs a basic validation check on the data loaded from a CSV.
 * Checks if the data is null, undefined, or an empty array.
 * Logs an error message if the data is invalid.
 *
 * @param {Array<object>|null} data - The data potentially loaded from `readCSV`.
 * @returns {Array<object>|null} Returns the original data if it's considered valid (not null/empty), otherwise logs an error and returns the invalid data (null or empty array).
 */
function verifyCSV(data){
  // Check if data is falsy (null, undefined) or an empty array
  if (!data || data.length === 0) {
      console.error("Error: Could not read CSV or CSV is empty.");
      // Returns the problematic data (null or [])
      // Caller should handle this return value appropriately.
  }
  // Returns the original data regardless of validity after logging potential error.
  return data;
}

/**
 * Parses the string values within each object of the data array into floating-point numbers.
 * This function modifies the input data array **in-place**. It iterates through each row (object) and each key (column) within that row, attempting to convert the value using `parseFloat`. If a value cannot be parsed as a float (e.g., non-numeric text), `parseFloat` will result in `NaN`.
 *
 * @param {Array<object>} data - The array of data objects (presumably from `readCSV`) to parse. This array will be modified directly.
 * @returns {void} This function does not return a value; it modifies the input array in place.
 */
function Parse(data) {
  // Check if data is valid before proceeding
  if (!data || !Array.isArray(data)) {
    console.warn("Parse function received invalid data. Skipping parsing.");
    return;
  }
  // Iterate through each row (object) in the data array
  for (let i = 0; i < data.length; i++) {
      // Iterate through each key (column header) in the current row object
      for (const key in data[i]) {
          // Check if the property belongs to the object itself (not inherited)
          if (Object.hasOwnProperty.call(data[i], key)) {
            // Attempt to parse the value as a float and update the object in place
            data[i][key] = parseFloat(data[i][key]);
          }
      }
  }
}

module.exports = { readCSV , verifyCSV, Parse };