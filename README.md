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
    initFunction,
    geneticFunctions: {
        seed,
        mutate,
        crossover,
        fitness,
        notification
    },
    config: {
        size: 100,
        mutationIterations: 2,
        skip: 5,
        optimise: 'min',
        initialFitness: 1000,
        numberOfFittestToSelect: 4,
        pauseElm: document.getElementById('pause'),
        stopElm: document.getElementById('stop')
    },
    isFinished,
    onFinished
};

const genetic = new Genetic(settings);
```

## Example projects using this library
* #### Genetic Fly in Maze:
  * Repo: https://github.com/liranh85/genetic-fly-in-maze
  * Demo: http://www.liran.co.uk/ga/genetic-fly-in-maze
* #### Genetic String Solver:
  * Repo: https://github.com/liranh85/genetic-string-solver
  * Demo: http://www.liran.co.uk/ga/genetic-string-solver

*This README.md will be completed soon.*