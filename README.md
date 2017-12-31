# genetic-lib

General-purpose Genetic Algorithm library.

This README.md will be completed soon.

## Installation
```
npm install genetic-lib
```

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
#### - Genetic Fly in Maze: https://github.com/liranh85/genetic-fly-in-maze
#### - Genetic String Solver: https://github.com/liranh85/genetic-string-solver