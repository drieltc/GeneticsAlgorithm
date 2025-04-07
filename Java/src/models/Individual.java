package models;

import java.util.List;

public class Individual {
    private List<Integer> chromosome;
    private double fitness;

    public Individual(List<Integer> chromosome) {
        this.chromosome = chromosome;
        this.fitness = 0;
    }

    public List<Integer> getChromosome() {
        return chromosome;
    }

    public double getFitness() {
        return fitness;
    }

    public void setFitness(double fitness) {
        this.fitness = fitness;
    }

    @Override
    public String toString() {
        return "Individual{" +
                "chromosome=" + chromosome +
                ", fitness=" + fitness +
                '}';
    }
}
