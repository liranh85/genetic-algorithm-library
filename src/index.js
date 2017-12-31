class Genetic {
    constructor(settings = {}) {
        this.initFunction = settings.initFunction;
        const geneticFunctions = typeof settings.geneticFunctions === 'undefined' ? {} : settings.geneticFunctions;
        this.seed = geneticFunctions.seed;
        this.mutate = geneticFunctions.mutate;
        this.crossover = geneticFunctions.crossover;
        this.fitness = geneticFunctions.fitness;
        this.notification = geneticFunctions.notification;
        this.config = typeof settings.config === 'undefined' ? {} : settings.config;
        this.isFinished = settings.isFinished;
        this.onFinished = settings.onFinished;
        this.userData = settings.userData;
        this.isSettingsValid = this.checkSettingsValid(settings);
        this.population = [];
        this.currentGeneration = 0;
        this.fittestEntityEver = null;
        this.paused = false;
        this._next = this._next.bind(this);
        this._init();
    }

    checkSettingsValid(settings) {
        return settings.geneticFunctions && [
            settings.geneticFunctions.seed,
            settings.geneticFunctions.mutate,
            settings.geneticFunctions.crossover,
            settings.geneticFunctions.fitness,
            settings.geneticFunctions.notification,
            settings.isFinished
        ].every(func => typeof func === 'function');
    }

    _init() {
        if (!this.isSettingsValid) {
            return;
        }
        this._initNumFittestToSelect();
        this._setDefaults();
        if (typeof this.initFunction === 'function') {
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

    _setDefaults() {
        this.config.size = typeof this.config.size !== 'number' || this.numberOfFittestToSelect > this.config.size ? 20 : this.config.size;
        this.config.mutationIterations = typeof this.config.mutationIterations !== 'number' || this.config.mutationIterations < 0 ? 1 : this.config.mutationIterations;
        this.config.skip = typeof this.config.skip !== 'number' || this.config.mutationIterations < 1 ? 1 : this.config.skip;
        this.config.optimise = this.config.optimise !== 'min' ? 'max' : this.config.optimise;
        this.config.initialFitness = typeof this.config.initialFitness !== 'number' ? 0 : this.config.initialFitness;
    }

    _initNumFittestToSelect() {
        if (!this.config.numberOfFittestToSelect) {
            // Default value is 2 if falsy
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
        if (!this.isSettingsValid) {
            console.error('genetic-lib: some of the mandatory functions are not functions. Cannot proceed.');
            return;
        }
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
            if (this.currentGeneration % this.config.skip === 0) {
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
            return this.config.optimise === 'min' ?
                a < b :
                a > b;
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
        if (typeof this.onFinished === 'function') {
            this.onFinished(this._stats());
        }
    }
}

export default Genetic;