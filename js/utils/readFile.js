const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

function readCSV(fileName) {
  try {
    const content = fs.readFileSync(fileName, 'utf-8');
    const response = parse(content, {
      columns: true,
      skip_empty_lines: true
    });
    return response;
  } catch (error) {
    console.error(`Error reading ${fileName}:`, error);
    return null;
  }
}

function verifyCSV(data){
  if (!data || data.length === 0) {
      console.error("Error: Could not read CSV or CSV is empty.");
      return [];
  }
  return data;
}

function Parse(data) {
  for (let i = 0; i < data.length; i++) {
      for (const key in data[i]) {
          data[i][key] = parseFloat(data[i][key]);
      }
  }
}

module.exports = { readCSV , verifyCSV, Parse };
