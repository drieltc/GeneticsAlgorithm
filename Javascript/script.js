// Fetch the CSV file and log its content
fetch('/Dados/dataset_amostra.csv')
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.text();
  })
  .then(data => {
    console.log('CSV File Content:\n', data);

    // Process the CSV data
    const lines = data.trim().split('\n');
    console.log("\nCSV File Lines:");
    lines.forEach((line, index) => {
      console.log(`Line ${index + 1}: ${line}`);
    });

    // Example of parsing the first line (assuming it's a header)
    if (lines.length > 0) {
      const header = lines[0].split(',');
      console.log("\nCSV Header:", header);
    }
  })
  .catch(error => {
    console.error('Error fetching the CSV file:', error);
  });