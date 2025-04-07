package algorithms;

import models.Individual;

import java.util.ArrayList;
import java.util.List;

public class Fitness {
    public static float calculateFitness(Individual individual, List<String[]> geneSubset, int qtdOnus, int limit) {
        float fitness = 0;
        List<Double> onus = new ArrayList<>();
        for (int i = 0; i < qtdOnus; i++) {
            onus.add(0.0);
        }

        for (int i = 1; i < individual.getChromosome().size(); i++) {
            if (individual.getChromosome().get(i) == 1) {
                fitness += Double.parseDouble(geneSubset.get(i)[1]);
            }
            for (int j = 0; j < qtdOnus; j++) {
                Double currentValue = onus.get(j);
                Double newValue = currentValue + Double.parseDouble(geneSubset.get(i)[j]);
                if (newValue > limit) {
                    fitness = 0;
                    return fitness;
                }
                onus.set(j, newValue);
            }
        }
        return fitness;
    }
}
