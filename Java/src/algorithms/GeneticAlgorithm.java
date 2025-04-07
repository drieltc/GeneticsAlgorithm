package algorithms;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Random;

import models.Individual;

import static algorithms.Fitness.calculateFitness;

public class GeneticAlgorithm {
    public static Individual selectParent(List<Individual> population, int tournamentSize) {
        List<Individual> tournament = new ArrayList<>();
        Random random = new Random();

        for (int i = 0; i < tournamentSize; i++) {
            int randomIndex = random.nextInt(population.size());
            tournament.add(population.get(randomIndex));
        }

        return tournament.stream()
                .max((a, b) -> Double.compare(a.getFitness(), b.getFitness()))
                .orElse(null); // Return the best individual in the tournament
    }

    public static Individual crossover(List<Integer> parentChromossome1, List<Integer> parentChromossome2) {
        Random random = new Random();
        int crossoverPoint = random.nextInt(parentChromossome1.size());
        List<Integer> childChromosome = new ArrayList<>();

        for (int i = 0; i < parentChromossome1.size(); i++) {
            if (i < crossoverPoint) {
                childChromosome.add(parentChromossome1.get(i));
            } else {
                childChromosome.add(parentChromossome2.get(i));
            }
        }
        Individual child = new Individual(childChromosome);
        return child;
    }

    public static void mutate(Individual individual, double mutationRate) {
        Random random = new Random();
        for (int i = 0; i < individual.getChromosome().size(); i++) {
            if (random.nextDouble() < mutationRate) {
                individual.getChromosome().set(i, 1 - individual.getChromosome().get(i));
            }
        }
    }

    public static List<Individual> sortPopulation(List<Individual> population) {
        population.sort((a, b) -> Double.compare(b.getFitness(), a.getFitness()));
        return population;
    }

    public static Individual geneticAlgorithm(double mutationRate, int generations, List<Individual> initialPopulation, List<String[]> data, int qtdOnus, int tournamentSize, int limit) {
        if (initialPopulation == null || initialPopulation.isEmpty()) {
            System.err.println("Error: Initial population is null or empty.");
            return null;
        }

        List<Individual> population = new ArrayList<>(initialPopulation);
        for (int generation = 0; generation < generations; generation++) {
            List<Individual> sortedPopulation = new ArrayList<>(sortPopulation(population));
            List<Individual> newPopulation = new ArrayList<>();

            newPopulation.add(population.get(0));
            while (newPopulation.size() < population.size()) {
                Individual parent1 = selectParent(sortedPopulation, tournamentSize);
                Individual parent2 = selectParent(sortedPopulation, tournamentSize);

                Individual child = crossover(parent1.getChromosome(), parent2.getChromosome());
                mutate(child, mutationRate);
                child.setFitness(calculateFitness(child, data, qtdOnus, limit));
                newPopulation.add(child);
            }

            population = newPopulation;
        }

        List<Individual> lastPopulation = new ArrayList<>(sortPopulation(population));
        return lastPopulation.get(0);
    }
}
