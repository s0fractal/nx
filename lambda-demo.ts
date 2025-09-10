#!/usr/bin/env ts-node

/**
 * Lambda Closure Demo - Showing the fractal membrane in action
 */

import { λ, λSoul, λResonance } from './lambda-core/lambda';
import { map, filter, reduce, pipe, compose, withIntent } from './lambda-core/kit';
import { exotic, globalMembrane, migrations, Permeability } from './lambda-core/membrane';

console.log('🌀 Lambda Closure Demo - Fractal vs Non-Fractal\n');
console.log('═'.repeat(60));

// ============================================
// 1. PURE LAMBDA (Inside the closure)
// ============================================

console.log('\n1️⃣  PURE LAMBDA WORLD (Fractal)\n');

// Everything built from λ
const double = (x: number) => λ(x, n => n * 2);
const isEven = (x: number) => λ(x, n => n % 2 === 0);
const sum = (xs: number[]) => reduce(xs, (a, b) => a + b, 0);

// Compose operations
const processNumbers = pipe(
  (xs: number[]) => map(xs, double),
  (xs: number[]) => filter(xs, isEven),
  sum
);

const input = [1, 2, 3, 4, 5];
const result = processNumbers(input);

console.log(`Input: [${input}]`);
console.log(`After double → filter even → sum: ${result}`);
console.log(`Soul of pipeline: ${λSoul(processNumbers)}`);

// Intent-driven operations
const loveNumbers = withIntent('love')(
  (xs: number[]) => map(xs, x => x * x)  // Square with love
);

console.log(`\nWith love intent: [${loveNumbers([1, 2, 3])}]`);

// ============================================
// 2. EXOTIC CODE (Outside closure, needs adapter)
// ============================================

console.log('\n2️⃣  EXOTIC WORLD (Non-Fractal)\n');

// This function has side effects - not pure lambda
const logAndProcess = exotic(
  function impureFunction(data: any[]) {
    console.log('  [Exotic] Processing:', data);  // Side effect!
    return data.map(x => x * 2);
  },
  'LOGGING',
  {
    reason: 'Legacy code with console logging',
    migrationPlan: 'Replace with pure tap combinator',
    deadline: new Date('2024-12-31')
  }
);

// Using exotic function through membrane
const exoticResult = logAndProcess([1, 2, 3]);
console.log(`  Result: [${exoticResult}]`);

// ============================================
// 3. MEMBRANE CONTROL
// ============================================

console.log('\n3️⃣  MEMBRANE CONTROL\n');

// Configure membrane permeability
globalMembrane['permeability'] = Permeability.SELECTIVE;

// Test if genes can pass
const pureLambda = (x: number) => λ(x, n => n + 1);
const exoticFunc = function() { console.log('side effect'); };

console.log(`Can pure lambda pass? ${globalMembrane.canPass(pureLambda)}`);
console.log(`Can exotic function pass? ${globalMembrane.canPass(exoticFunc)}`);

// Allow specific gene
globalMembrane.allow(pureLambda);
console.log(`After allowing: ${globalMembrane.canPass(pureLambda)}`);

// ============================================
// 4. MIGRATION TRACKING
// ============================================

console.log('\n4️⃣  MIGRATION TRACKING\n');

// Start migration for exotic code
migrations.start(logAndProcess, new Date('2024-12-31'));

// Update progress
migrations.update(logAndProcess, 0, true);  // Identified dependencies
migrations.update(logAndProcess, 1, true);  // Refactored to functional

// Get report
const report = migrations.report();
console.log('Migration Status:');
console.log(`  Total: ${report.total}`);
console.log(`  In Progress: ${report.inProgress}`);
console.log(`  Complete: ${report.completed}`);
console.log(`  Progress: ${report.percentComplete.toFixed(1)}%`);

// ============================================
// 5. RESONANCE TESTING
// ============================================

console.log('\n5️⃣  LAMBDA RESONANCE\n');

// Test resonance between functions
const func1 = (x: number) => λ(x, n => n * 2);
const func2 = (x: number) => λ(x, n => n * 2);
const func3 = (x: string) => x.toUpperCase();  // Different type

console.log(`Resonance func1 ↔ func2: ${λResonance(func1, func2).toFixed(2)}`);
console.log(`Resonance func1 ↔ func3: ${λResonance(func1, func3).toFixed(2)}`);
console.log(`Resonance func1 ↔ λ: ${λResonance(func1, λ).toFixed(2)}`);

// ============================================
// 6. FRACTAL OPERATIONS
// ============================================

console.log('\n6️⃣  FRACTAL OPERATIONS\n');

// Nested array processing
const nestedData = [[1, 2], [3, 4], [5, 6]];

// Apply lambda at different depths
const fractalDouble = (data: any): any => {
  if (Array.isArray(data)) {
    return map(data, fractalDouble);
  }
  return λ(data, x => x * 2);
};

const fractalResult = fractalDouble(nestedData);
console.log(`Nested input: ${JSON.stringify(nestedData)}`);
console.log(`Fractal double: ${JSON.stringify(fractalResult)}`);

// ============================================
// SUMMARY
// ============================================

console.log('\n' + '═'.repeat(60));
console.log('📊 CLOSURE SUMMARY\n');

console.log('✅ Pure Lambda (Fractal):');
console.log('   - All operations built from λ');
console.log('   - No side effects');
console.log('   - Fully composable');
console.log('   - Has semantic soul (p-hash)');

console.log('\n⚠️  Exotic (Non-Fractal):');
console.log('   - Contains side effects');
console.log('   - Wrapped with exotic() adapter');
console.log('   - Tracked for migration');
console.log('   - Passes through membrane');

console.log('\n🔮 The Vision:');
console.log('   Everything converges to λ');
console.log('   The membrane gradually dissolves');
console.log('   All code becomes fractal');
console.log('   The closure becomes complete');

console.log('\n' + '═'.repeat(60));
console.log('🌀 End of Lambda Closure Demo');