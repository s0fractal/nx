
// Living Gene Bundle: Pure Functional DNA
// This is REAL, WORKING code that lives!

(function(global, factory) {
  'use strict';
  
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define(factory);
  } else {
    global.PureGenes = factory();
  }
}(typeof self !== 'undefined' ? self : this, function() {
  'use strict';
  
  // The living genes
  
    function map(array, iteratee) {
      const length = array?.length || 0;
      const result = Array(length);
      for (let i = 0; i < length; i++) {
        result[i] = iteratee(array[i], i, array);
      }
      return result;
    }
  
  
    function filter(array, predicate) {
      const result = [];
      for (let i = 0; i < (array?.length || 0); i++) {
        if (predicate(array[i], i, array)) {
          result.push(array[i]);
        }
      }
      return result;
    }
  
  
    function reduce(array, iteratee, accumulator) {
      let index = 0;
      let result = accumulator;
      
      if (arguments.length < 3 && array?.length) {
        result = array[0];
        index = 1;
      }
      
      for (; index < (array?.length || 0); index++) {
        result = iteratee(result, array[index], index, array);
      }
      return result;
    }
  
  
    function compose(...fns) {
      return function(x) {
        return fns.reduceRight((v, f) => f(v), x);
      };
    }
  
  
    function pipe(...fns) {
      return function(x) {
        return fns.reduce((v, f) => f(v), x);
      };
    }
  
  
  // Additional utility genes
  function forEach(array, iteratee) {
    for (let i = 0; i < (array?.length || 0); i++) {
      iteratee(array[i], i, array);
    }
  }
  
  function find(array, predicate) {
    for (let i = 0; i < (array?.length || 0); i++) {
      if (predicate(array[i], i, array)) {
        return array[i];
      }
    }
  }
  
  function some(array, predicate) {
    for (let i = 0; i < (array?.length || 0); i++) {
      if (predicate(array[i], i, array)) {
        return true;
      }
    }
    return false;
  }
  
  function every(array, predicate) {
    for (let i = 0; i < (array?.length || 0); i++) {
      if (!predicate(array[i], i, array)) {
        return false;
      }
    }
    return true;
  }
  
  // Gene metadata (the soul)
  const __genomeMetadata = {
    soul: 'p' + Date.now().toString(36),
    genes: ['map', 'filter', 'reduce', 'compose', 'pipe', 'forEach', 'find', 'some', 'every'],
    level: 'universal',
    origin: 'pure-synthesis',
    born: new Date().toISOString()
  };
  
  // Export the living genes
  const exports = {
    map,
    filter,
    reduce,
    compose,
    pipe,
    forEach,
    find,
    some,
    every,
    __genomeMetadata
  };
  
  // Make genes aware of each other (symbiosis)
  exports.chain = function(array) {
    return {
      map: (fn) => exports.chain(map(array, fn)),
      filter: (fn) => exports.chain(filter(array, fn)),
      reduce: (fn, init) => reduce(array, fn, init),
      value: () => array
    };
  };
  
  return exports;
}));
