# genetic-lib

#### General-purpose Genetic Algorithm library.
> Define your genetic functions, and I will do the rest.

**genetic-lib** allows you to focus on the implementation of your genetic algorithm, without having to worry about running and controlling the simulation.

## Installation
```
npm install genetic-lib
```

## Highlights
  * Written in ES6, transpiled to ES5.
  * Supports asynchronous seed, fitness and notification functions.
  * Supports pausing and stopping the simulation.
  * Configurable, e.g. number of mutation iterations, number of fittest entities to select for reproduction.
  * Passes data to the notification function after each generation.

## Usage
```js
import Genetic from 'genetic-lib';

// (Define relevant functions to be used in the settings object)

const settings = {
  seed, // [Function, required] Genetic function to create an entity
  mutate, // [Function, required] Genetic function to apply mutation to an entity
  crossover, // [Function, required] Genetic function to apply crossover to an entity
  fitness, // [Function, required] Genetic function to calculate the fitness of an entity
  notification, // [function, required] Called after every generation (unless specified otherwise in the `skip` setting) with the stats
  isFinished, // [Function, required] Called with the stats. Should return a Boolean, which is the result of the condition to end the simulation, e.g, `return stats.generation >= 500`
  init, // [Function, optional] Will be called when genetic-lib has initialised and ready to start the simulation. Use this if you need to do some initialisation before starting the simulation
  onFinished, // [Function, optional] Will be called with the stats when the simulation has completed
  populationSize: 100 // [Number, optional, default: 20]
  mutationIterations: 1, // [Number, optional, default: 1] How many times to run the mutation function on each entity
  skip: 5, // [Number - 1 or more, optional, default: 1] Number of generations to skip in calling the notification function, e.g. `5` means the notification function would be called every 5 generations
  optimise: 'min', // [String - 'min'/'max', optional, default: 'max'] Whether the fittest entity is defined as the one with the lowest score (min) or highest score (max)
  initialFitness: 1111, // [Number, optional, default: 0] Initial fitness to assign to entity, before measuring its fitness
  numberOfFittestToSelect: 4, // [Number, optional, default: 2] The number of fittest entities to select for reproduction from each generation
  shouldKillTheWeak: true // [Boolean, optional, default: false] Whether or not to kill the weak entities after the fittest have been identified. This will only work if your method to identify the fittest entities is based on shortest-time-based, meaning the entities that completed the task the most quickly are the fittest, and thus there is no need to measure the fitness of the rest of the entities in the generation, as they won't be selected and are thus irrelevant.
}

const genetic = new Genetic(settings)
genetic.solve()
```

### Stats
The stats is an object passed to the `notification`, `isFinished` and `onFinished` settings functions. It contains the following data:
- `population`: [Array] the entities in the current generation
- `generation`: [Number] generation number, 0-based
- `mean`: [Number] mean fitness
- `fittestEver`: [Object] the fittest entity so far
- `isFinished`: [Boolean] is simulation finished

## Example projects using this library
* ### Genetic Fly in Maze:
  * Repo: https://github.com/liranh85/genetic-fly-in-maze
  * Demo: http://www.liran.co.uk/ga/genetic-fly-in-maze
* ### Genetic String Solver:
  * Repo: https://github.com/liranh85/genetic-string-solver
  * Demo: http://www.liran.co.uk/ga/genetic-string-solver
