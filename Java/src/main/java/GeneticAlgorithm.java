import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

public class GeneticAlgorithm {

    private static class DataRow {
        public List<Integer> genes;
        public String condition;

        public DataRow(List<Integer> genes, String condition) {
            this.genes = genes;
            this.condition = condition;
        }
    }

    // Function to create an Individual from a CSV row
    private static DataRow createIndividualFromRow(String row) {
        String[] values = row.split(",");
        List<Integer> genes = Arrays.stream(values, 4, values.length)
                .map(Integer::parseInt)
                .collect(Collectors.toList());
        return new DataRow(genes, values[2]);
    }

    // Function to calculate the probability of having condition "A" based on the genes that are present
    private static double calculateProbability(List<DataRow> population, List<Integer> geneSubset) {
        int countA = 0;
        int countTotal = 0;

        for (DataRow individual : population) {
            boolean match = true;
            for (int i = 0; i < geneSubset.size(); i++) {
                if (geneSubset.get(i) == 1 && individual.genes.get(i) != 1) {
                    match = false;
                    break;
                }
            }
            if (match) {
                countTotal++;
                if (individual.condition.equals("A")) {
                    countA++;
                }
            }
        }

        if (countTotal == 0) {
            return 0; // Avoid division by zero
        }
        return (double) countA / countTotal;
    }

    // New Fitness Function
    private static void calculateFitness(Individual individual, List<DataRow> population) {
        double probability = calculateProbability(population, individual.genes);
        int subsetSize = individual.genes.stream().mapToInt(Integer::intValue).sum();

        // Reward for high probability of condition "A"
        double fitness = probability;

        // Penalty for large subset size
        fitness -= subsetSize * 0.01; // Adjust the penalty factor (0.01) as needed

        // Penalty for not reaching 50% probability
        if (probability < 0.5) {
            fitness -= 1; // Adjust the penalty as needed
        }

        individual.fitness = fitness;
    }

    private static Individual selectParent(List<Individual> population, int tournamentSize) {
        Random random = new Random();
        List<Individual> tournament = new ArrayList<>();
        for (int i = 0; i < tournamentSize; i++) {
            int randomIndex = random.nextInt(population.size());
            tournament.add(population.get(randomIndex));
        }
        return Collections.max(tournament, (a, b) -> Double.compare(a.fitness, b.fitness));
    }

    private static Individual crossover(Individual parent1, Individual parent2) {
        Random random = new Random();
        List<Integer> childGenes = new ArrayList<>();
        for (int i = 0; i < parent1.genes.size(); i++) {
            childGenes.add(random.nextDouble() < 0.5 ? parent1.genes.get(i) : parent2.genes.get(i));
        }
        return new Individual(childGenes);
    }

    private static void mutate(Individual individual, double mutationRate) {
        Random random = new Random();
        for (int i = 0; i < individual.genes.size(); i++) {
            if (random.nextDouble() < mutationRate) {
                individual.genes.set(i, 1 - individual.genes.get(i)); // Flip the gene (0 to 1, or 1 to 0)
            }
        }
    }

    private static Individual runGeneticAlgorithm(List<DataRow> initialPopulation, int populationSize, int generations, double mutationRate, int tournamentSize) {
        List<DataRow> cpInitialPopulation = new ArrayList<>(initialPopulation); // Copy of the initial population

        // Create a new population with random subsets of genes
        Random random = new Random();
        List<Individual> population = new ArrayList<>();
        for (int i = 0; i < populationSize; i++) {
            List<Integer> genes = new ArrayList<>();
            for (int j = 0; j < cpInitialPopulation.get(0).genes.size(); j++) {
                genes.add(random.nextDouble() < 0.5 ? 1 : 0);
            }
            population.add(new Individual(genes));
        }

        // Calculate fitness for each individual in the initial population
        for (Individual individual : population) {
            calculateFitness(individual, cpInitialPopulation);
        }
        population.sort((a, b) -> Double.compare(b.fitness, a.fitness)); // Sort by fitness in descending order

        Individual bestIndividual = null;
        double bestFitness = Double.NEGATIVE_INFINITY;

        for (int generation = 0; generation < generations; generation++) {
            List<Individual> newPopulation = new ArrayList<>();

            // Elitism: Keep the best individual from the previous generation
            newPopulation.add(population.get(0));

            // Keep the top 10% of the population
            int top10Percent = (int) Math.floor(population.size() * 0.1);
            for (int i = 1; i < top10Percent; i++) {
                newPopulation.add(population.get(i));
            }

            // Create the rest of the new generation
            while (newPopulation.size() < population.size()) {
                // Selection
                Individual parent1 = selectParent(population, tournamentSize);
                Individual parent2 = selectParent(population, tournamentSize);

                Individual child = crossover(parent1, parent2);

                // Mutation
                mutate(child, mutationRate);

                calculateFitness(child, cpInitialPopulation);

                newPopulation.add(child);
            }
            population = newPopulation;
            population.sort((a, b) -> Double.compare(b.fitness, a.fitness));
            System.out.println("Generation " + (generation + 1) + " - Best Fitness: " + population.get(0).fitness);

            // Update best individual
            if (population.get(0).fitness > bestFitness) {
                bestFitness = population.get(0).fitness;
                bestIndividual = population.get(0);
            }
        }

        System.out.println("Smallest subset found: " + bestIndividual.genes);
        return bestIndividual;
    }

    public static void main(String[] args) {
        String csvFile = "/home/adriel/Documents/Faculdade/2025.1/PC/UnidadeII/GeneticsAlgorithm/Dados/dataset_amostra.csv"; // Replace with your CSV file path
        List<DataRow> initialPopulation = new ArrayList<>();

        try (BufferedReader br = new BufferedReader(new FileReader(csvFile))) {
            String line;
            br.readLine(); // Skip the header line
            while ((line = br.readLine()) != null) {
                initialPopulation.add(createIndividualFromRow(line));
            }
        } catch (IOException e) {
            System.err.println("Error reading or processing the CSV file: " + e.getMessage());
            return;
        }

        runGeneticAlgorithm(initialPopulation, 100, 100, 0.01, 3);
    }
}