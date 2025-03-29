import java.util.List;

class Individual {
    public List<Integer> genes;
    public double fitness;

    public Individual(List<Integer> genes) {
        this.genes = genes; // Remove the unnecessary stream and parseInt
        this.fitness = 0;
    }

    @Override
    public String toString() {
        return "Individual{" +
                "genes=" + genes +
                ", fitness=" + fitness +
                '}';
    }
}
