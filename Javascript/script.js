class Individual{
    constructor(id, age, condition, expressivity, genes){
        this.id = id;
        this.age = age;
        this.condition = condition;
        this.expressivity = expressivity;
        this.genes = genes.map(gene => parseInt(gene));
        this.fitness = 0;
    }
}

// Function to create an Individual from a CSV row
function createIndividualFromRow(row) {
    const values = row.split(',');
    const id = values[0];
    const age = values[1];
    const condition = values[2];
    const expressivity = values[3];
    const genes = values.slice(4); // Genes start from the 5th column
    return new Individual(id, age, condition, expressivity, genes);
  }
  
// Fetch the CSV file and create the initial population
fetch('/Dados/dataset_amostra.csv')
.then(response => {
    if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.text();
})
.then(data => {
    const lines = data.trim().split('\n');
    const header = lines.shift().split(','); // Remove the header line and get the header
    const initialPopulation = lines.map(createIndividualFromRow); // Create individuals from the remaining lines

    console.log('Initial Population:', initialPopulation);
    runGeneticAlgorithm(initialPopulation); //to be continued
})
.catch(error => {
    console.error('Error fetching or processing the CSV file:', error);
});
  