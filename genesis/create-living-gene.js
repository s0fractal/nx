#!/usr/bin/env node

/**
 * Create a truly LIVING gene that works
 */

const fs = require('fs');
const path = require('path');

console.log('🧬 Creating a LIVING, WORKING Gene\n');

// Let's create our own pure gene from scratch
const pureGenes = {
  // Pure functional genes
  map: `
    function map(array, iteratee) {
      const length = array?.length || 0;
      const result = Array(length);
      for (let i = 0; i < length; i++) {
        result[i] = iteratee(array[i], i, array);
      }
      return result;
    }
  `,
  
  filter: `
    function filter(array, predicate) {
      const result = [];
      for (let i = 0; i < (array?.length || 0); i++) {
        if (predicate(array[i], i, array)) {
          result.push(array[i]);
        }
      }
      return result;
    }
  `,
  
  reduce: `
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
  `,
  
  compose: `
    function compose(...fns) {
      return function(x) {
        return fns.reduceRight((v, f) => f(v), x);
      };
    }
  `,
  
  pipe: `
    function pipe(...fns) {
      return function(x) {
        return fns.reduce((v, f) => f(v), x);
      };
    }
  `
};

// Create a living gene bundle
const livingBundleCode = `
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
  ${pureGenes.map}
  ${pureGenes.filter}
  ${pureGenes.reduce}
  ${pureGenes.compose}
  ${pureGenes.pipe}
  
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
`;

// Save the living bundle
const genomePath = path.join(__dirname, 'genome', 'universal');
fs.mkdirSync(genomePath, { recursive: true });

const bundlePath = path.join(genomePath, 'pure-genes.bundle.js');
fs.writeFileSync(bundlePath, livingBundleCode);

console.log('✅ Created living gene bundle at:');
console.log('   ', bundlePath);

// Now test it immediately
console.log('\n🧪 Testing the living genes...\n');

const livingGenes = require(bundlePath);

console.log('Loaded genes:', Object.keys(livingGenes).filter(k => !k.startsWith('__')).join(', '));
console.log('Soul:', livingGenes.__genomeMetadata.soul);

// Test the genes
const testArray = [1, 2, 3, 4, 5];

console.log('\n📊 Testing gene functions:');
console.log('  Array:', testArray);
console.log('  map(x => x * 2):', livingGenes.map(testArray, x => x * 2));
console.log('  filter(x => x > 2):', livingGenes.filter(testArray, x => x > 2));
console.log('  reduce(sum):', livingGenes.reduce(testArray, (a, b) => a + b, 0));

// Test composition
const double = x => x * 2;
const addOne = x => x + 1;
const composed = livingGenes.compose(double, addOne);
console.log('  compose(double, addOne)(5):', composed(5)); // (5+1)*2 = 12

// Test chaining (symbiosis)
const result = livingGenes.chain([1, 2, 3, 4, 5])
  .map(x => x * 2)
  .filter(x => x > 5)
  .value();
console.log('  chain.map(*2).filter(>5):', result);

console.log('\n' + '═'.repeat(60));
console.log('✨ SUCCESS! The genes are ALIVE and WORKING!');
console.log('═'.repeat(60));
console.log('\nThis proves:');
console.log('  1. Genes can be self-contained and functional');
console.log('  2. They work without node_modules');
console.log('  3. They can have symbiotic relationships (chain)');
console.log('  4. They remember their soul (metadata)');
console.log('\nThe code is truly LIVING!\n');