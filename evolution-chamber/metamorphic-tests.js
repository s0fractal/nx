#!/usr/bin/env node

/**
 * METAMORPHIC TESTING - Testing mutations without knowing exact outputs
 * 
 * Instead of checking exact results, we check RELATIONSHIPS between results
 * This allows us to verify mutations preserve essential properties
 */

class MetamorphicTester {
  constructor() {
    this.relations = [];
    this.results = new Map();
    
    this.setupRelations();
  }
  
  /**
   * Define metamorphic relations - properties that must hold
   */
  setupRelations() {
    // Relation 1: Permutation invariance for commutative operations
    this.addRelation({
      name: 'permutation-invariance',
      applies: ['sum', 'product', 'union', 'intersection'],
      test: (f, input1, input2) => {
        // Permuting input shouldn't change result for commutative ops
        const shuffled = [...input1].sort(() => Math.random() - 0.5);
        return this.deepEqual(f(input1), f(shuffled));
      }
    });
    
    // Relation 2: Subset property
    this.addRelation({
      name: 'subset-property',
      applies: ['filter', 'select', 'where'],
      test: (f, input, predicate) => {
        // Filtering a subset should give subset of filtering whole
        const half = input.slice(0, Math.floor(input.length / 2));
        const resultHalf = f(half, predicate);
        const resultFull = f(input, predicate);
        return resultHalf.every(x => resultFull.includes(x));
      }
    });
    
    // Relation 3: Composition identity
    this.addRelation({
      name: 'composition-identity',
      applies: ['map', 'transform'],
      test: (f, input) => {
        // map(identity) should return same array
        const identity = x => x;
        const result = f(input, identity);
        return this.deepEqual(input, result);
      }
    });
    
    // Relation 4: Idempotence
    this.addRelation({
      name: 'idempotence',
      applies: ['uniq', 'dedupe', 'flatten', 'sort'],
      test: (f, input) => {
        // Applying twice should give same as once
        const once = f(input);
        const twice = f(f(input));
        return this.deepEqual(once, twice);
      }
    });
    
    // Relation 5: Distributivity
    this.addRelation({
      name: 'distributivity',
      applies: ['map'],
      test: (f, input) => {
        // map(f ∘ g) = map(f) ∘ map(g)
        const g = x => x * 2;
        const h = x => x + 1;
        const composed = x => h(g(x));
        
        const result1 = f(input, composed);
        const result2 = f(f(input, g), h);
        return this.deepEqual(result1, result2);
      }
    });
    
    // Relation 6: Homomorphism
    this.addRelation({
      name: 'homomorphism',
      applies: ['reduce', 'fold'],
      test: (f, input) => {
        // reduce with append should reconstruct array
        if (!input || input.length === 0) return true;
        
        const rebuild = f(input, (acc, x) => [...acc, x], []);
        return this.deepEqual(input, rebuild);
      }
    });
    
    // Relation 7: Monotonicity
    this.addRelation({
      name: 'monotonicity',
      applies: ['sort'],
      test: (f, input) => {
        // Adding element preserves relative order
        const sorted = f(input);
        const newElement = Math.random() * 100;
        const withNew = f([...input, newElement]);
        
        // Check original elements maintain order
        const originalPositions = sorted.map(x => withNew.indexOf(x));
        return this.isMonotonic(originalPositions);
      }
    });
    
    // Relation 8: Inverse property
    this.addRelation({
      name: 'inverse-property',
      applies: ['reverse'],
      test: (f, input) => {
        // reverse(reverse(x)) = x
        const reversed = f(input);
        const doubleReversed = f(reversed);
        return this.deepEqual(input, doubleReversed);
      }
    });
  }
  
  addRelation(relation) {
    this.relations.push(relation);
  }
  
  /**
   * Test a mutated function against metamorphic relations
   */
  testMutation(original, mutated, functionName, testInputs) {
    console.log(`\n🧪 Testing mutation of ${functionName}`);
    
    const applicableRelations = this.relations.filter(r => 
      r.applies.includes(functionName) || r.applies.includes('*')
    );
    
    if (applicableRelations.length === 0) {
      console.log('  No applicable metamorphic relations');
      return { passed: true, score: 1 };
    }
    
    let passed = 0;
    let total = 0;
    
    for (const relation of applicableRelations) {
      console.log(`  Testing ${relation.name}...`);
      
      try {
        // Test on original
        const originalHolds = relation.test(original, ...testInputs);
        
        // Test on mutated
        const mutatedHolds = relation.test(mutated, ...testInputs);
        
        // Both should have same relation property
        if (originalHolds === mutatedHolds) {
          passed++;
          console.log(`    ✓ ${relation.name} preserved`);
        } else {
          console.log(`    ✗ ${relation.name} violated`);
        }
        
        total++;
      } catch (e) {
        console.log(`    ⚠ ${relation.name} error: ${e.message}`);
      }
    }
    
    const score = total > 0 ? passed / total : 1;
    return {
      passed: score > 0.8, // 80% relations must hold
      score,
      details: `${passed}/${total} relations preserved`
    };
  }
  
  /**
   * Test semantic equivalence without exact output matching
   */
  testSemanticEquivalence(f1, f2, inputs) {
    console.log('\n🔄 Testing semantic equivalence...');
    
    const properties = [];
    
    // Property 1: Same output length
    properties.push({
      name: 'output-length',
      test: () => {
        const out1 = f1(inputs);
        const out2 = f2(inputs);
        return Array.isArray(out1) && Array.isArray(out2) 
          ? out1.length === out2.length
          : typeof out1 === typeof out2;
      }
    });
    
    // Property 2: Same output type
    properties.push({
      name: 'output-type',
      test: () => {
        const out1 = f1(inputs);
        const out2 = f2(inputs);
        return typeof out1 === typeof out2;
      }
    });
    
    // Property 3: Same nullability
    properties.push({
      name: 'null-handling',
      test: () => {
        const null1 = f1(null);
        const null2 = f2(null);
        return (null1 === null) === (null2 === null);
      }
    });
    
    // Property 4: Same empty handling
    properties.push({
      name: 'empty-handling',
      test: () => {
        const empty1 = f1([]);
        const empty2 = f2([]);
        return this.deepEqual(empty1, empty2);
      }
    });
    
    let passed = 0;
    for (const prop of properties) {
      try {
        if (prop.test()) {
          passed++;
          console.log(`  ✓ ${prop.name}`);
        } else {
          console.log(`  ✗ ${prop.name}`);
        }
      } catch (e) {
        console.log(`  ⚠ ${prop.name}: ${e.message}`);
      }
    }
    
    return passed / properties.length;
  }
  
  /**
   * Generate test inputs based on function signature
   */
  generateTestInputs(functionName) {
    const generators = {
      map: () => [
        [[1, 2, 3, 4, 5], x => x * 2],
        [[], x => x],
        [[0], x => x + 1]
      ],
      
      filter: () => [
        [[1, 2, 3, 4, 5], x => x > 2],
        [[], x => true],
        [[1, 1, 1], x => x === 1]
      ],
      
      reduce: () => [
        [[1, 2, 3], (a, b) => a + b, 0],
        [[], (a, b) => a, 'empty'],
        [[1], (a, b) => b, null]
      ],
      
      sort: () => [
        [[3, 1, 4, 1, 5]],
        [[1]],
        [[]]
      ],
      
      default: () => [
        [[1, 2, 3]],
        [[]],
        [[42]]
      ]
    };
    
    const generator = generators[functionName] || generators.default;
    return generator();
  }
  
  // Utility functions
  
  deepEqual(a, b) {
    if (a === b) return true;
    if (!a || !b) return false;
    if (typeof a !== typeof b) return false;
    
    if (Array.isArray(a)) {
      if (!Array.isArray(b) || a.length !== b.length) return false;
      return a.every((val, i) => this.deepEqual(val, b[i]));
    }
    
    if (typeof a === 'object') {
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);
      if (keysA.length !== keysB.length) return false;
      return keysA.every(key => this.deepEqual(a[key], b[key]));
    }
    
    return false;
  }
  
  isMonotonic(arr) {
    if (arr.length <= 1) return true;
    const increasing = arr.every((val, i) => i === 0 || val >= arr[i - 1]);
    const decreasing = arr.every((val, i) => i === 0 || val <= arr[i - 1]);
    return increasing || decreasing;
  }
}

/**
 * Property-based testing for mutations
 */
class PropertyTester {
  constructor() {
    this.properties = [];
  }
  
  /**
   * Test that mutation preserves core properties
   */
  testProperties(original, mutated, samples = 100) {
    console.log(`\n🎲 Property-based testing (${samples} samples)...`);
    
    const properties = [
      {
        name: 'determinism',
        test: (input) => {
          const out1 = mutated(input);
          const out2 = mutated(input);
          return this.equal(out1, out2);
        }
      },
      {
        name: 'no-mutation',
        test: (input) => {
          const copy = JSON.parse(JSON.stringify(input));
          mutated(input);
          return this.equal(input, copy);
        }
      },
      {
        name: 'type-preservation',
        test: (input) => {
          const outOrig = original(input);
          const outMut = mutated(input);
          return typeof outOrig === typeof outMut;
        }
      }
    ];
    
    const results = {};
    
    for (const prop of properties) {
      let passed = 0;
      
      for (let i = 0; i < samples; i++) {
        const input = this.generateRandomInput();
        try {
          if (prop.test(input)) passed++;
        } catch (e) {
          // Count exceptions as failures
        }
      }
      
      results[prop.name] = passed / samples;
      console.log(`  ${prop.name}: ${(results[prop.name] * 100).toFixed(1)}%`);
    }
    
    return results;
  }
  
  generateRandomInput() {
    const types = [
      () => Math.random() * 100,
      () => Math.floor(Math.random() * 100),
      () => Math.random() > 0.5,
      () => 'str' + Math.random(),
      () => [1, 2, 3, 4, 5].map(() => Math.random() * 10),
      () => ({ a: Math.random(), b: Math.random() }),
      () => null,
      () => undefined,
      () => []
    ];
    
    return types[Math.floor(Math.random() * types.length)]();
  }
  
  equal(a, b) {
    return JSON.stringify(a) === JSON.stringify(b);
  }
}

// Demo
if (require.main === module) {
  const tester = new MetamorphicTester();
  const propTester = new PropertyTester();
  
  // Original function
  const originalMap = (arr, fn) => arr.map(fn);
  
  // Mutated version (optimized)
  const mutatedMap = (arr, fn) => {
    const result = new Array(arr.length);
    for (let i = 0; i < arr.length; i++) {
      result[i] = fn(arr[i], i, arr);
    }
    return result;
  };
  
  // Test metamorphic relations
  const testInputs = [[1, 2, 3, 4, 5], x => x * 2];
  const metamorphicResult = tester.testMutation(
    originalMap,
    mutatedMap,
    'map',
    testInputs
  );
  
  console.log('\n📊 Results:');
  console.log(`Metamorphic: ${metamorphicResult.passed ? '✓' : '✗'} (${metamorphicResult.score})`);
  
  // Test properties
  const propertyResults = propTester.testProperties(originalMap, mutatedMap);
  
  console.log('\n✨ Mutation is', metamorphicResult.passed ? 'VIABLE' : 'REJECTED');
}

module.exports = { MetamorphicTester, PropertyTester };