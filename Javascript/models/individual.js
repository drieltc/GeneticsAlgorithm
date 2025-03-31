class Individual {
    constructor(genes) {
        this.genes = genes.map(gene => parseInt(gene));
        this.fitness = 0;
    }
}

module.exports = { Individual };
