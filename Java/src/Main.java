import java.util.List;

import static algorithms.GeneticAlgorithm.geneticAlgorithm;
import static algorithms.PopulationCreator.createInitialPopulation;
import static utils.ReadFile.readFile;
import algorithms.*;
import models.Individual;

public class Main {
    public static void main(String[] args) {
        String size = "10MB";
        String filepath = "../Dados/" + size + ".csv";
        List<String[]> data = readFile(filepath);

        if (!data.isEmpty()) {
            int chromosomeLength = data.get(0).length -2;
            int limit = 0;
            if (size.equals("1MB") || size.equals("10MB")) {
                limit = 350000;
            } else if (size.equals("100MB") || size.equals("1GB")) {
                limit = 3500000;
            }
            //parameters
            int QTD_ONUS = chromosomeLength;
            int POPULATION_SIZE = 100;
            float MUTATION_RATE = 0.01f;
            int GENERATIONS = 100;
            int TOURNAMENT_SIZE = 3;

            List<Individual> initialPopulation = createInitialPopulation(POPULATION_SIZE, data, chromosomeLength, QTD_ONUS, limit);
            Individual bestSolution = geneticAlgorithm(MUTATION_RATE, GENERATIONS, initialPopulation, data, QTD_ONUS, TOURNAMENT_SIZE, limit);
            System.out.println("Best solution: " + bestSolution);
        } else {
            System.out.println("No data found in the CSV file.");
        }
    }
}