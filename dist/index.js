'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Genetic = function () {
    function Genetic() {
        var settings = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        (0, _classCallCheck3.default)(this, Genetic);

        this.initFunction = settings.initFunction;
        var geneticFunctions = typeof settings.geneticFunctions === 'undefined' ? {} : settings.geneticFunctions;
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

    (0, _createClass3.default)(Genetic, [{
        key: 'checkSettingsValid',
        value: function checkSettingsValid(settings) {
            return settings.geneticFunctions && [settings.geneticFunctions.seed, settings.geneticFunctions.mutate, settings.geneticFunctions.crossover, settings.geneticFunctions.fitness, settings.geneticFunctions.notification, settings.isFinished].every(function (func) {
                return typeof func === 'function';
            });
        }
    }, {
        key: '_init',
        value: function _init() {
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
    }, {
        key: '_setDefaults',
        value: function _setDefaults() {
            this.config.size = typeof this.config.size !== 'number' || this.numberOfFittestToSelect > this.config.size ? 20 : this.config.size;
            this.config.mutationIterations = typeof this.config.mutationIterations !== 'number' || this.config.mutationIterations < 0 ? 1 : this.config.mutationIterations;
            this.config.skip = typeof this.config.skip !== 'number' || this.config.mutationIterations < 1 ? 1 : this.config.skip;
            this.config.optimise = this.config.optimise !== 'min' ? 'max' : this.config.optimise;
            this.config.initialFitness = typeof this.config.initialFitness !== 'number' ? 0 : this.config.initialFitness;
        }
    }, {
        key: '_initNumFittestToSelect',
        value: function _initNumFittestToSelect() {
            if (!this.config.numberOfFittestToSelect) {
                // Default value is 2 if falsy
                this.config.numberOfFittestToSelect = 2;
            } else if (this.config.numberOfFittestToSelect % 2 !== 0) {
                // Must be an even number
                this.config.numberOfFittestToSelect++;
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
        key: 'solve',
        value: function solve() {
            return _regenerator2.default.async(function solve$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            if (this.isSettingsValid) {
                                _context.next = 3;
                                break;
                            }

                            console.error('genetic-lib: some of the mandatory functions are not functions. Cannot proceed.');
                            return _context.abrupt('return');

                        case 3:
                            _context.prev = 3;
                            _context.next = 6;
                            return _regenerator2.default.awrap(this._createFirstGeneration());

                        case 6:
                            this._evolve();
                            _context.next = 13;
                            break;

                        case 9:
                            _context.prev = 9;
                            _context.t0 = _context['catch'](3);

                            console.error(_context.t0);
                            this._onStopClicked();

                        case 13:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, null, this, [[3, 9]]);
        }
    }, {
        key: '_createFirstGeneration',
        value: function _createFirstGeneration() {
            var i;
            return _regenerator2.default.async(function _createFirstGeneration$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            _context2.prev = 0;
                            i = 0;

                        case 2:
                            if (!(i < this.config.size)) {
                                _context2.next = 13;
                                break;
                            }

                            _context2.t0 = this.population;
                            _context2.next = 6;
                            return _regenerator2.default.awrap(this.seed());

                        case 6:
                            _context2.t1 = _context2.sent;
                            _context2.t2 = this.config.initialFitness;
                            _context2.t3 = {
                                DNA: _context2.t1,
                                fitness: _context2.t2
                            };

                            _context2.t0.push.call(_context2.t0, _context2.t3);

                        case 10:
                            i++;
                            _context2.next = 2;
                            break;

                        case 13:
                            _context2.next = 19;
                            break;

                        case 15:
                            _context2.prev = 15;
                            _context2.t4 = _context2['catch'](0);

                            console.error(_context2.t4);
                            this._simulationComplete();

                        case 19:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, null, this, [[0, 15]]);
        }
    }, {
        key: '_evolve',
        value: function _evolve() {
            return _regenerator2.default.async(function _evolve$(_context3) {
                while (1) {
                    switch (_context3.prev = _context3.next) {
                        case 0:
                            _context3.prev = 0;
                            _context3.next = 3;
                            return _regenerator2.default.awrap(this._computePopulationFitness());

                        case 3:
                            this._sortEntitiesByFittest();
                            this._updateFitnessRecord();
                            // If notification is due

                            if (!(this.currentGeneration % this.config.skip === 0)) {
                                _context3.next = 8;
                                break;
                            }

                            _context3.next = 8;
                            return _regenerator2.default.awrap(this.notification(this._stats()));

                        case 8:
                            this._next();
                            _context3.next = 15;
                            break;

                        case 11:
                            _context3.prev = 11;
                            _context3.t0 = _context3['catch'](0);

                            console.error(_context3.t0);
                            this._onStopClicked();

                        case 15:
                        case 'end':
                            return _context3.stop();
                    }
                }
            }, null, this, [[0, 11]]);
        }
    }, {
        key: '_next',
        value: function _next() {
            if (!this.paused) {
                if (this.isFinished(this._stats())) {
                    this.notification((0, _extends3.default)({}, this._stats(), {
                        isFinished: true
                    }));
                    this._simulationComplete();
                } else {
                    this._createNewGeneration();
                    this.currentGeneration++;
                    this._evolve();
                }
            }
        }
    }, {
        key: '_computePopulationFitness',
        value: function _computePopulationFitness() {
            var _this = this;

            var resolvedPromisesNum = 0;
            return new _promise2.default(function (resolve, reject) {
                _this.population.forEach(function (entity, i) {
                    _promise2.default.resolve(_this.fitness(entity.DNA, 'entity' + i)).then(function (response) {
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
                return _this3.config.optimise === 'min' ? a < b : a > b;
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
                for (var i = 0; i < _this4.config.mutationIterations; i++) {
                    newbornsDNAs[0] = _this4.mutate(newbornsDNAs[0]);
                    newbornsDNAs[1] = _this4.mutate(newbornsDNAs[1]);
                }
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
            return JSON.parse((0, _stringify2.default)(obj));
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
                fittestEver: this.fittestEntityEver,
                isFinished: false
            };
        }
    }, {
        key: '_simulationComplete',
        value: function _simulationComplete() {
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
    }]);
    return Genetic;
}();

exports.default = Genetic;