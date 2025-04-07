package algorithms;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Random;

import models.Individual;

import static algorithms.Fitness.calculateFitness;

public class PopulationCreator {
    public static List<Individual> createInitialPopulation(int populationSize, List<String[]> data, int chromosomeLength, int qtdOnus, int limit) {
        List<Individual> population = new ArrayList<>();
        Random random = new Random();

        if (data == null || data.isEmpty()) {
            System.err.println("Error: Data is null or empty. Cannot create initial population.");
            return population;
        }

        for (int i = 0; i < populationSize; i++) {
            List<Integer> chromosome = new ArrayList<>();
            for (int j = 0; j < chromosomeLength; j++) {
                chromosome.add(random.nextInt(2)); // Assuming binary chromosome (0 or 1)
            }
            Individual individual = new Individual(chromosome);
            individual.setFitness(calculateFitness(individual, data, qtdOnus, limit));
            population.add(individual);
        }

        return population;
    }
}
