#!/usr/bin/env node

/**
 * EXPOSE GENES - Simple regex-based gene exposer
 * Інверсія приватності через експорт ВСІХ чистих функцій
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * Extract functions using regex (simplified)
 */
function extractFunctions(code) {
  const functions = new Map();
  
  // Match regular functions: function name(...) { ... }
  const funcRegex = /function\s+(\w+)\s*\([^)]*\)\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/g;
  let match;
  
  while ((match = funcRegex.exec(code)) !== null) {
    const name = match[1];
    const body = match[2];
    const fullFunc = match[0];
    
    if (isProbablyPure(body)) {
      functions.set(name, {
        name,
        code: fullFunc,
        pHash: generatePHash(fullFunc),
        pure: true
      });
    }
  }
  
  // Match arrow functions: const name = (...) => ...
  const arrowRegex = /const\s+(\w+)\s*=\s*\([^)]*\)\s*=>\s*([^;]+);/g;
  
  while ((match = arrowRegex.exec(code)) !== null) {
    const name = match[1];
    const body = match[2];
    const fullFunc = match[0];
    
    if (isProbablyPure(body)) {
      functions.set(name, {
        name,
        code: fullFunc,
        pHash: generatePHash(fullFunc),
        pure: true
      });
    }
  }
  
  return functions;
}

/**
 * Simple purity check
 */
function isProbablyPure(body) {
  // Check for obvious side effects
  const sideEffects = [
    'console.',
    'fs.',
    'process.',
    'window.',
    'document.',
    'await ',
    '.push(',
    '.pop(',
    '.shift(',
    '.unshift(',
    'throw ',
    'new Error'
  ];
  
  for (const effect of sideEffects) {
    if (body.includes(effect)) {
      return false;
    }
  }
  
  return true;
}

/**
 * Generate p-hash
 */
function generatePHash(code) {
  const hash = crypto.createHash('sha256');
  hash.update('GENE:');
  hash.update(code.replace(/\s+/g, ' ').trim());
  return 'p' + hash.digest('hex').substring(0, 12);
}

/**
 * Expose all genes from a module
 */
function exposeAllGenes(filePath) {
  console.log(`\n🧬 EXPOSING GENES from ${path.basename(filePath)}`);
  console.log('=' .repeat(50));
  
  const code = fs.readFileSync(filePath, 'utf-8');
  const functions = extractFunctions(code);
  
  console.log(`Found ${functions.size} pure functions\n`);
  
  // Show what was hidden
  console.log('BEFORE (Traditional Encapsulation):');
  console.log('  Exported: processData only');
  console.log('  Hidden: all internal functions\n');
  
  console.log('AFTER (Inverted - Everything Pure is Public):');
  
  // Create exposed version
  const exposedCode = [];
  
  functions.forEach((func, name) => {
    console.log(`  ✓ ${name} → ${func.pHash}`);
    exposedCode.push(`
// Gene: ${name} (${func.pHash})
${func.code}
exports.${name} = ${name};
`);
  });
  
  // Generate lambda composition
  const geneNames = Array.from(functions.keys());
  const lambda = geneNames.length > 1 
    ? `compose(${geneNames.join(', ')})` 
    : geneNames[0] || 'identity';
  
  // Create package.json with lambda version
  const packageJson = {
    name: '@inverted/module',
    version: {
      lambda,
      genes: Object.fromEntries(
        Array.from(functions.entries()).map(([name, func]) => 
          [name, func.pHash]
        )
      ),
      timestamp: new Date().toISOString()
    },
    exports: {
      '.': './index.js',
      './genes/*': './genes/*.js'
    },
    genome: {
      total: functions.size,
      exposed: functions.size,  // ALL exposed!
      hidden: 0  // NOTHING hidden!
    },
    proof: {
      type: 'state',
      truth: 'All pure functions are public genes',
      pHash: generatePHash(lambda)
    }
  };
  
  console.log('\n📦 Lambda Package.json:');
  console.log(JSON.stringify(packageJson, null, 2));
  
  // Create inverted module
  const outputPath = filePath.replace('.js', '-inverted.js');
  const outputContent = `
/**
 * INVERTED MODULE - All pure functions exposed as genes
 * Generated from: ${path.basename(filePath)}
 * 
 * This demonstrates the inversion:
 * - No private functions
 * - Everything pure is public
 * - Privacy through context, not encapsulation
 */

${exposedCode.join('\n')}

// Export genome metadata
exports.__genome = ${JSON.stringify(packageJson.genome)};
exports.__lambda = '${lambda}';
exports.__proof = ${JSON.stringify(packageJson.proof)};
`;
  
  fs.writeFileSync(outputPath, outputContent);
  console.log(`\n✨ Created inverted module: ${path.basename(outputPath)}`);
  
  return {
    original: filePath,
    inverted: outputPath,
    genes: functions.size,
    lambda
  };
}

// Demo the inversion
if (require.main === module) {
  const testFile = process.argv[2] || 'test-inversion.js';
  
  if (!fs.existsSync(testFile)) {
    console.log(`File not found: ${testFile}`);
    process.exit(1);
  }
  
  const result = exposeAllGenes(testFile);
  
  console.log('\n' + '='.repeat(50));
  console.log('🔄 INVERSION COMPLETE!\n');
  console.log('The Old Way: "Hide implementation details"');
  console.log('The New Way: "Expose all pure genes"\n');
  console.log('Why? Because:');
  console.log('  1. Pure functions have nothing to hide');
  console.log('  2. Enables genetic substitution & evolution');
  console.log('  3. Creates true composability');
  console.log('  4. Package.json becomes Proof of State\n');
  console.log(`Lambda: ${result.lambda}`);
  console.log(`Genes: ${result.genes} (all exposed!)`);
  console.log('='.repeat(50));
}

module.exports = { exposeAllGenes, extractFunctions, generatePHash };