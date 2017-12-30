# genetic-algorithm-library

General-purpose Genetic Algorithm library.

README.md will be updated soon.

## Installation
```
npm install genetic-lib
```

## Usage
```js
import Genetic from 'genetic-lib';

var settings = {
    initFunction: initFunction,
    geneticFunctions: {
        seed: seed,
        mutate: mutate,
        crossover: crossover,
        fitness: fitness,
        notification: notification
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
    isFinished: isFinished,
    onFinished: onFinished
};

const genetic = new Genetic(settings);
```
