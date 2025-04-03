function calculateFitness(individual, geneSubset, qtdOnus = 2) {
    let fitness = 0;
    let onus = [];
    for (let i = 0; i < qtdOnus; i++) {
        onus.push(0);
    }

    for (let i = 0; i < individual.chromosome.length; i++) {
        if (individual.chromosome[i] === 1) {
            fitness += geneSubset[i]['Bonus'];

            for (let j = 0; j < qtdOnus; j++) {
                const onusKey = `Onus_${j}`;

                if (geneSubset[i].hasOwnProperty(onusKey)) {
                  onus[j] += geneSubset[i][onusKey];
                }

                if (onus[j] > 35000) {
                    fitness = 0;
                    return fitness;
                }
            }
        }
    }
    return fitness;
}

module.exports = { calculateFitness };
