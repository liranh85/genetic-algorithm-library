(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Genetic = function () {
    function Genetic(settings) {
        _classCallCheck(this, Genetic);

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
        this.paused = false, this._init();
    }

    _createClass(Genetic, [{
        key: '_init',
        value: function _init() {
            this._initNumFittestToSelect();
            if (this.initFunction) {
                this.initFunction();
            }
            this._createFirstGeneration();
            if (this.config.pauseElm) {
                this._onPauseClicked = this._onPauseClicked.bind(this);
                this.config.pauseElm.addEventListener('click', this._onPauseClicked);
            }
            if (this.config.stopElm) {
                this._onStopClicked = this._onStopClicked.bind(this);
                this.config.stopElm.addEventListener('click', this._onStopClicked);
            }
        }
    }, {
        key: '_onPauseClicked',
        value: function _onPauseClicked() {
            this.paused = !this.paused;
            if (!this.paused) {
                this._next();
            }
        }
    }, {
        key: '_onStopClicked',
        value: function _onStopClicked() {
            this.isFinished = function () {
                return true;
            };
            if (this.paused) {
                this.paused = false;
                this._next();
            }
        }
    }, {
        key: '_initNumFittestToSelect',
        value: function _initNumFittestToSelect() {
            if (!this.config.numberOfFittestToSelect) {
                // Default value is 2 if not set
                this.config.numberOfFittestToSelect = 2;
            } else if (this.config.numberOfFittestToSelect % 2 !== 0) {
                // Must be an even number
                this.config.numberOfFittestToSelect++;
            }
        }
    }, {
        key: '_createFirstGeneration',
        value: function _createFirstGeneration() {
            for (var i = 0; i < this.config.size; i++) {
                this.population.push({
                    DNA: this.seed(),
                    fitness: this.config.initialFitness
                });
            }
        }
    }, {
        key: 'evolve',
        value: async function evolve() {
            try {
                await this._computePopulationFitness();
            } catch (e) {
                console.error(e);
                return;
            }
            if (this.config.killTheWeak) {
                this._killTheWeak();
            }
            this._sortEntitiesByFittest();
            this._updateFitnessRecord();
            if (this.config.skip === 0 || this.currentGeneration % this.config.skip === 0) {
                this.notification(this._stats());
            }
            this._next();
        }
    }, {
        key: '_next',
        value: function _next() {
            if (!this.paused) {
                if (this.isFinished(this._stats())) {
                    this._SimulationComplete();
                } else {
                    this._createNewGeneration();
                    this.currentGeneration++;
                    this.evolve();
                }
            }
        }
    }, {
        key: '_computePopulationFitness',
        value: function _computePopulationFitness() {
            var _this = this;

            var resolvedPromisesNum = 0;
            return new Promise(function (resolve, reject) {
                _this.population.forEach(function (entity, i) {
                    _this.fitness(entity.DNA, 'entity' + i).then(function (response) {
                        entity.fitness = response;
                        resolvedPromisesNum++;
                        if (_this.config.killTheWeak && resolvedPromisesNum === _this.config.numberOfFittestToSelect || resolvedPromisesNum === _this.population.length) {
                            resolve();
                        }
                    });
                });
            });
        }
    }, {
        key: '_killTheWeak',
        value: function _killTheWeak() {
            for (var i = 0; i < this.population.length; i++) {
                document.getElementById('entity' + i) && document.getElementById('entity' + i).dispatchEvent(new CustomEvent('fittest-found'));
            }
        }
    }, {
        key: '_sortEntitiesByFittest',
        value: function _sortEntitiesByFittest() {
            var _this2 = this;

            this.population.sort(function (a, b) {
                var sort = b.fitness - a.fitness;
                if (_this2.config.optimise === 'min') {
                    sort *= -1;
                }
                return sort;
            });
        }
    }, {
        key: '_updateFitnessRecord',
        value: function _updateFitnessRecord() {
            var _this3 = this;

            var aIsFitterThanB = function aIsFitterThanB(a, b) {
                return _this3.config.optimise === 'max' ? a > b : a < b;
            };

            var fittestEntityInThisGeneration = this.population[0];
            if (this.fittestEntityEver === null || aIsFitterThanB(fittestEntityInThisGeneration.fitness, this.fittestEntityEver.fitness)) {
                this.fittestEntityEver = this._clone(fittestEntityInThisGeneration);
                this.fittestEntityEver.generation = this.currentGeneration;
            }
        }
    }, {
        key: '_createNewGeneration',
        value: function _createNewGeneration() {
            var _this4 = this;

            var createMutateAndAddNewborns = function createMutateAndAddNewborns(DNA1, DNA2) {
                var newbornsDNAs = _this4.crossover(DNA1, DNA2);
                newbornsDNAs[0] = _this4.mutate(newbornsDNAs[0], _this4.config.mutationIterations);
                newbornsDNAs[1] = _this4.mutate(newbornsDNAs[1], _this4.config.mutationIterations);
                _this4.population = _this4.population.concat(newbornsDNAs.map(function (newbornDNA) {
                    return {
                        DNA: _this4._clone(newbornDNA),
                        fitness: _this4.config.initialFitness
                    };
                }));
            };

            this.oldGeneration = this._clone(this.population);
            this.population = [];
            for (var i = 0; i < this.config.size / this.config.numberOfFittestToSelect; i++) {
                for (var j = 0; j < this.config.numberOfFittestToSelect; j += 2) {
                    createMutateAndAddNewborns(this.oldGeneration[j].DNA, this.oldGeneration[j + 1].DNA);
                }
            }
        }
    }, {
        key: '_clone',
        value: function _clone(obj) {
            return JSON.parse(JSON.stringify(obj));
        }
    }, {
        key: 'getMeanFitness',
        value: function getMeanFitness() {
            var fittest = this.population.slice(0, this.config.numberOfFittestToSelect);
            return fittest.reduce(function (accumulator, currentValue) {
                return accumulator + currentValue.fitness;
            }, 0) / fittest.length;
        }
    }, {
        key: '_stats',
        value: function _stats() {
            return {
                population: this._clone(this.population),
                generation: this.currentGeneration,
                mean: this.getMeanFitness(),
                fittestEver: this.fittestEntityEver
            };
        }
    }, {
        key: '_SimulationComplete',
        value: function _SimulationComplete() {
            if (this.config.pauseElm) {
                this.config.pauseElm.removeEventListener('click', this._onPauseClicked);
            }
            if (this.config.stopElm) {
                this.config.stopElm.removeEventListener('click', this._onStopClicked);
            }
            this.onFinished(this._stats());
        }
    }]);

    return Genetic;
}();

exports.default = Genetic;

},{}]},{},[1]);
