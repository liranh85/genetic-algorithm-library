class Genetic {
  constructor (settings = {}) {
    this.settings = settings
    this.population = []
    this.currentGeneration = 0
    this.fittestEntityEver = null
    this.paused = false
    this._init()
  }

  _init () {
    const { init } = this.settings
    if (!this._isSettingsValid()) {
      throw new Error(
        'genetic-lib: some of the mandatory functions are not functions. Cannot proceed.'
      )
    }
    this._initNumFittestToSelect()
    this._setDefaults()
    if (typeof init === 'function') {
      init()
    }
  }

  _isSettingsValid () {
    const {
      seed,
      mutate,
      crossover,
      fitness,
      notification,
      isFinished
    } = this.settings
    return [seed, mutate, crossover, fitness, notification, isFinished].every(
      func => typeof func === 'function'
    )
  }

  _initNumFittestToSelect () {
    const { settings } = this
    if (!settings.numberOfFittestToSelect) {
      // Default value is 2 if falsy
      settings.numberOfFittestToSelect = 2
    } else if (settings.numberOfFittestToSelect % 2 !== 0) {
      // Must be an even number
      settings.numberOfFittestToSelect++
    }
  }

  _setDefaults () {
    const { settings } = this
    settings.populationSize =
      typeof settings.populationSize !== 'number' ||
      this.numberOfFittestToSelect > settings.populationSize
        ? 20
        : settings.populationSize
    settings.mutationIterations =
      typeof settings.mutationIterations !== 'number' ||
      settings.mutationIterations < 0
        ? 1
        : settings.mutationIterations
    settings.skip =
      typeof settings.skip !== 'number' || settings.mutationIterations < 1
        ? 1
        : settings.skip
    settings.optimise = settings.optimise !== 'min' ? 'max' : settings.optimise
    settings.initialFitness =
      typeof settings.initialFitness !== 'number' ? 0 : settings.initialFitness
  }

  async _createFirstGeneration () {
    try {
      for (let i = 0; i < this.settings.populationSize; i++) {
        this.population.push({
          DNA: await this.settings.seed(),
          fitness: this.settings.initialFitness
        })
      }
    } catch (error) {
      console.error(
        'genetic-lib: error occurred, most likely to do with the user-supplied seed function.',
        error
      )
      this._simulationComplete()
    }
  }

  async _evolve () {
    try {
      await this._computePopulationFitness()
    } catch (error) {
      console.error(
        'genetic-lib: error occurred while computing population fitness.',
        error
      )
      this._simulationComplete()
    }

    this._sortEntitiesByFittest()
    this._updateFitnessRecord()
    const isNotificationDue = this.currentGeneration % this.settings.skip === 0
    if (isNotificationDue) {
      try {
        await this.settings.notification(this._stats())
      } catch (error) {
        console.error(
          'genetic-lib: error occurred while awaiting the user-supplied notification function.',
          error
        )
        this._simulationComplete()
      }
    }
    this._next()
  }

  _next = () => {
    const { isFinished, notification } = this.settings
    if (!this.paused) {
      if (isFinished(this._stats())) {
        notification({
          ...this._stats(),
          isFinished: true
        })
        this._simulationComplete()
      } else {
        this._createNewGeneration()
        this.currentGeneration++
        this._evolve()
      }
    }
  }

  _computePopulationFitness () {
    const {
      fitness,
      numberOfFittestToSelect,
      shouldKillTheWeak
    } = this.settings
    let resolvedPromisesNum = 0
    return new Promise((resolve, reject) => {
      this.population.forEach((entity, i) => {
        Promise.resolve(fitness(entity.DNA, `entity${i}`)).then(response => {
          entity.fitness = response
          resolvedPromisesNum++
          if (
            (shouldKillTheWeak &&
              resolvedPromisesNum === numberOfFittestToSelect) ||
            resolvedPromisesNum === this.population.length
          ) {
            resolve()
          }
        })
      })
    })
  }

  _sortEntitiesByFittest () {
    this.population.sort((a, b) => {
      let sort = b.fitness - a.fitness
      if (this.settings.optimise === 'min') {
        sort *= -1
      }
      return sort
    })
  }

  _updateFitnessRecord () {
    const aIsFitterThanB = (a, b) => {
      return this.settings.optimise === 'min' ? a < b : a > b
    }

    const fittestEntityInThisGeneration = this.population[0]
    if (
      this.fittestEntityEver === null ||
      aIsFitterThanB(
        fittestEntityInThisGeneration.fitness,
        this.fittestEntityEver.fitness
      )
    ) {
      this.fittestEntityEver = this._clone(fittestEntityInThisGeneration)
      this.fittestEntityEver.generation = this.currentGeneration
    }
  }

  _createNewGeneration () {
    const {
      crossover,
      initialFitness,
      mutate,
      mutationIterations,
      numberOfFittestToSelect,
      populationSize
    } = this.settings

    const createMutateAndAddNewborns = (DNA1, DNA2) => {
      const newbornsDNAs = crossover(DNA1, DNA2)
      for (let i = 0; i < mutationIterations; i++) {
        newbornsDNAs[0] = mutate(newbornsDNAs[0])
        newbornsDNAs[1] = mutate(newbornsDNAs[1])
      }
      this.population = this.population.concat(
        newbornsDNAs.map(newbornDNA => {
          return {
            DNA: this._clone(newbornDNA),
            fitness: initialFitness
          }
        })
      )
    }

    this.oldGeneration = this._clone(this.population)
    this.population = []
    for (let i = 0; i < populationSize / numberOfFittestToSelect; i++) {
      for (let j = 0; j < numberOfFittestToSelect; j += 2) {
        createMutateAndAddNewborns(
          this.oldGeneration[j].DNA,
          this.oldGeneration[j + 1].DNA
        )
      }
    }
  }

  _clone (obj) {
    return JSON.parse(JSON.stringify(obj))
  }

  _stats () {
    return {
      population: this._clone(this.population),
      generation: this.currentGeneration,
      mean: this.getMeanFitness(),
      fittestEver: this.fittestEntityEver,
      isFinished: false
    }
  }

  _simulationComplete () {
    const { onFinished } = this.settings
    if (typeof onFinished === 'function') {
      onFinished(this._stats())
    }
  }

  async solve () {
    try {
      await this._createFirstGeneration()
    } catch (error) {
      console.error(
        'genetic-lib: error occurred while trying to create first generation',
        error
      )
      this._simulationComplete()
    }
    this._evolve()
  }

  getMeanFitness () {
    const fittest = this.population.slice(
      0,
      this.settings.numberOfFittestToSelect
    )
    return (
      fittest.reduce((accumulator, currentValue) => {
        return accumulator + currentValue.fitness
      }, 0) / fittest.length
    )
  }

  setFittestEver ({ DNA, fitness, generation }) {
    if (DNA && fitness && generation) {
      this.fittestEntityEver = {
        DNA,
        fitness,
        generation
      }
    }
  }

  stop () {
    this.settings.isFinished = () => true
    if (this.paused) {
      this.paused = false
      this._next()
    }
  }

  togglePaused () {
    this.paused = !this.paused
    if (!this.paused) {
      this._next()
    }
  }
}

export default Genetic
