class Genetic {
    constructor(settings) {
        this.initFunction = settings.initFunction;
        this.seed = settings.geneticFunctions.seed;
        this.mutate = settings.geneticFunctions.mutate;
        this.crossover = settings.geneticFunctions.crossover;
        this.fitness = settings.geneticFunctions.fitness;
        this.notification = settings.geneticFunctions.notification;
        this.config = settings.config;
        this.isFinished = settings.isFinished;
        this.onFinished = settings.onFinished;
        this.userData = settings.userData;
        this.population = [];
        this.currentGeneration = 0;
        this.fittestEntityEver = null;
        this.paused = false;
        this._next = this._next.bind(this);
        this._init();
    }

    _init() {
        this._initNumFittestToSelect();
        if (this.initFunction) {
            this.initFunction();
        }
        if (this.config.pauseElm) {
            this._onPauseClicked = this._onPauseClicked.bind(this);
            this.config.pauseElm.addEventListener('click', this._onPauseClicked);
        }
        if (this.config.stopElm) {
            this._onStopClicked = this._onStopClicked.bind(this);
            this.config.stopElm.addEventListener('click', this._onStopClicked);
        }
    }

    _initNumFittestToSelect() {
        if (!this.config.numberOfFittestToSelect) {
            // Default value is 2 if not set
            this.config.numberOfFittestToSelect = 2;
        } else if (this.config.numberOfFittestToSelect % 2 !== 0) {
            // Must be an even number
            this.config.numberOfFittestToSelect++;
        }
    }

    _onPauseClicked() {
        this.paused = !this.paused;
        if (!this.paused) {
            this._next();
        }
    }

    _onStopClicked() {
        this.isFinished = () => true;
        if (this.paused) {
            this.paused = false;
            this._next();
        }
    }

    async solve() {
        try {
            await this._createFirstGeneration();
            this._evolve();
        }
        catch (e) {
            console.error(e);
            this._onStopClicked();
        }
    }

    async _createFirstGeneration() {
        try {
            for (let i = 0; i < this.config.size; i++) {
                this.population.push({
                    DNA: await this.seed(),
                    fitness: this.config.initialFitness
                });
            }
        }
        catch (e) {
            console.error(e);
            this._simulationComplete();
        }
    }

    async _evolve() {
        try {
            await this._computePopulationFitness();
            this._sortEntitiesByFittest();
            this._updateFitnessRecord();
            // If notification is due
            if (this.config.skip === 0 || this.currentGeneration % this.config.skip === 0) {
                await this.notification(this._stats());
            }
            this._next();
        }
        catch (e) {
            console.error(e);
            this._onStopClicked();
        }
    }

    _next() {
        if (!this.paused) {
            if (this.isFinished(this._stats())) {
                this.notification({
                    ...this._stats(),
                    isFinished: true
                });
                this._simulationComplete();
            } else {
                this._createNewGeneration();
                this.currentGeneration++;
                this._evolve();
            }
        }
    }

    _computePopulationFitness() {
        let resolvedPromisesNum = 0;
        return new Promise((resolve, reject) => {
            this.population.forEach((entity, i) => {
                Promise.resolve(this.fitness(entity.DNA, `entity${i}`)).then((response) => {
                    entity.fitness = response;
                    resolvedPromisesNum++;
                    if ((this.config.killTheWeak && resolvedPromisesNum === this.config.numberOfFittestToSelect) || resolvedPromisesNum === this.population.length) {
                        resolve();
                    }
                });
            });
        });
    }

    _sortEntitiesByFittest() {
        this.population.sort((a, b) => {
            let sort = b.fitness - a.fitness;
            if (this.config.optimise === 'min') {
                sort *= -1;
            }
            return sort;
        });
    }

    _updateFitnessRecord() {
        const aIsFitterThanB = (a, b) => {
            return this.config.optimise === 'max' ?
                a > b :
                a < b;
        };

        const fittestEntityInThisGeneration = this.population[0];
        if (this.fittestEntityEver === null || aIsFitterThanB(fittestEntityInThisGeneration.fitness, this.fittestEntityEver.fitness) ) {
            this.fittestEntityEver = this._clone(fittestEntityInThisGeneration);
            this.fittestEntityEver.generation = this.currentGeneration;
        }
    }

    _createNewGeneration() {
        const createMutateAndAddNewborns = (DNA1, DNA2) => {
            const newbornsDNAs = this.crossover(DNA1, DNA2);
            for (let i = 0; i < this.config.mutationIterations; i++) {
                newbornsDNAs[0] = this.mutate(newbornsDNAs[0]);
                newbornsDNAs[1] = this.mutate(newbornsDNAs[1]);
            }
            this.population = this.population.concat(newbornsDNAs.map((newbornDNA) => {
                return {
                    DNA: this._clone(newbornDNA),
                    fitness: this.config.initialFitness
                }
            }));
        };

        this.oldGeneration = this._clone(this.population);
        this.population = [];
        for (let i = 0; i < this.config.size / this.config.numberOfFittestToSelect; i++) {
            for (let j = 0; j < this.config.numberOfFittestToSelect; j += 2) {
                createMutateAndAddNewborns(this.oldGeneration[j].DNA, this.oldGeneration[j + 1].DNA);
            }
        }
    }

    _clone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    getMeanFitness() {
        const fittest = this.population.slice(0, this.config.numberOfFittestToSelect);
        return fittest.reduce((accumulator, currentValue) => {
            return accumulator + currentValue.fitness;
        }, 0) / fittest.length;
    }

    _stats() {
        return {
            population: this._clone(this.population),
            generation: this.currentGeneration,
            mean: this.getMeanFitness(),
            fittestEver: this.fittestEntityEver,
            isFinished: false
        }
    }

    _simulationComplete() {
        if (this.config.pauseElm) {
            this.config.pauseElm.removeEventListener('click', this._onPauseClicked);
        }
        if (this.config.stopElm) {
            this.config.stopElm.removeEventListener('click', this._onStopClicked);
        }
        this.onFinished(this._stats());
    }
}

export default Genetic;