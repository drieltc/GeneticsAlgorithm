const fs = require('fs');
const path = require('path');

// Construct the absolute path to the CSV file.
const csvFilePath = path.join(__dirname, '..', '..', '..', 'Dados', 'dataset_amostra.csv');

// Read the CSV file asynchronously.
fs.readFile(csvFilePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading the CSV file:', err);
    return;
  }

  // Log the entire content of the CSV file.
  console.log('CSV File Content:\n', data);

  // Optionally, you can process the CSV data here.
  // For example, you can split it into lines and then into fields.
  const lines = data.trim().split('\n');
  console.log("\nCSV File Lines:")
  lines.forEach((line, index) => {
    console.log(`Line ${index + 1}: ${line}`);
  });

  // Example of parsing the first line (assuming it's a header)
  if (lines.length > 0) {
    const header = lines[0].split(',');
    console.log("\nCSV Header:", header);
  }
});
