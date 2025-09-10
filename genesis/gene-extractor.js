#!/usr/bin/env node

/**
 * GENE EXTRACTOR - Expose ALL pure functions as genes
 * 
 * Інверсія приватності: кожен чистий ген експортується!
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const t = require('@babel/types');

/**
 * Extract ALL pure functions from code
 * Not just exports - EVERYTHING pure
 */
function extractAllGenes(code, filePath) {
  const ast = parser.parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript', 'decorators-legacy']
  });

  const genes = new Map();
  const usedGenes = new Set();
  
  // First pass: Find all functions
  traverse(ast, {
    // Named functions
    FunctionDeclaration(path) {
      if (isPureFunction(path.node)) {
        const name = path.node.id.name;
        const geneCode = generate(path.node).code;
        const pHash = generatePHash(geneCode);
        
        genes.set(name, {
          name,
          code: geneCode,
          pHash,
          type: 'function',
          pure: true
        });
      }
    },
    
    // Arrow functions and function expressions
    VariableDeclarator(path) {
      if (t.isArrowFunctionExpression(path.node.init) || 
          t.isFunctionExpression(path.node.init)) {
        if (isPureFunction(path.node.init)) {
          const name = path.node.id.name;
          const geneCode = generate(path.node).code;
          const pHash = generatePHash(geneCode);
          
          genes.set(name, {
            name,
            code: geneCode,
            pHash,
            type: 'arrow',
            pure: true
          });
        }
      }
    },
    
    // Track which genes are used internally
    CallExpression(path) {
      if (t.isIdentifier(path.node.callee)) {
        usedGenes.add(path.node.callee.name);
      }
    }
  });

  // Second pass: Mark genes that are used by other genes
  genes.forEach((gene, name) => {
    gene.usedInternally = usedGenes.has(name);
  });

  return genes;
}

/**
 * Check if function is pure (no side effects)
 */
function isPureFunction(node) {
  let isPure = true;
  
  traverse(node, {
    // Check for side effects
    AssignmentExpression(path) {
      // Assignment to external scope = side effect
      if (!isLocalVariable(path.node.left)) {
        isPure = false;
        path.stop();
      }
    },
    
    UpdateExpression(path) {
      // ++ or -- on external = side effect
      if (!isLocalVariable(path.node.argument)) {
        isPure = false;
        path.stop();
      }
    },
    
    CallExpression(path) {
      // Calling console, fs, etc = side effect
      const callee = path.node.callee;
      if (t.isMemberExpression(callee)) {
        const obj = callee.object.name;
        if (['console', 'fs', 'process', 'window', 'document'].includes(obj)) {
          isPure = false;
          path.stop();
        }
      }
    },
    
    // Async = potentially impure
    AwaitExpression() {
      isPure = false;
      path.stop();
    }
  }, null, node);
  
  return isPure;
}

function isLocalVariable(node) {
  // Simplified check - in real implementation would track scope
  return t.isIdentifier(node);
}

/**
 * Generate semantic p-hash for gene
 */
function generatePHash(code) {
  const hash = crypto.createHash('sha256');
  
  // Extract semantic features
  const features = {
    operations: (code.match(/[+\-*/=<>!&|]/g) || []).length,
    controlFlow: (code.match(/\b(if|for|while|switch|return)\b/g) || []).length,
    functions: (code.match(/\b(map|filter|reduce|forEach)\b/g) || []).length,
    parameters: (code.match(/\([^)]*\)/g) || []).length
  };
  
  hash.update('GENE:');
  hash.update(JSON.stringify(features));
  
  return 'p' + hash.digest('hex').substring(0, 12);
}

/**
 * Generate package.json as lambda composition
 */
function generateLambdaPackageJson(genes, originalPkg = {}) {
  const geneMap = {};
  const lambda = [];
  
  genes.forEach((gene, name) => {
    geneMap[name] = gene.pHash;
    if (gene.usedInternally) {
      lambda.push(name);
    }
  });
  
  return {
    name: originalPkg.name || '@organism/unnamed',
    version: {
      lambda: lambda.length > 0 ? `compose(${lambda.join(', ')})` : 'identity',
      genes: geneMap,
      timestamp: new Date().toISOString()
    },
    main: originalPkg.main || 'index.js',
    exports: {
      '.': './index.js',
      './genes/*': './genes/*.js'  // Export ALL genes!
    },
    genome: {
      pure: genes.size,
      exported: genes.size,  // ALL pure genes exported!
      composition: lambda.join(' → ')
    },
    proof: {
      type: 'state',
      pHash: generatePHash(JSON.stringify(geneMap))
    }
  };
}

/**
 * Transform module to export ALL its genes
 */
function transformModuleToExportGenes(modulePath) {
  console.log(`🧬 Extracting genes from ${modulePath}`);
  
  const code = fs.readFileSync(modulePath, 'utf-8');
  const genes = extractAllGenes(code, modulePath);
  
  console.log(`  Found ${genes.size} pure genes`);
  
  // Create genes directory
  const moduleDir = path.dirname(modulePath);
  const genesDir = path.join(moduleDir, 'genes');
  
  if (!fs.existsSync(genesDir)) {
    fs.mkdirSync(genesDir, { recursive: true });
  }
  
  // Export each gene as separate file
  genes.forEach((gene, name) => {
    const genePath = path.join(genesDir, `${name}.js`);
    const exportedGene = `
// Gene: ${name}
// P-Hash: ${gene.pHash}
// Pure: ${gene.pure}
// Auto-extracted and exported

${gene.code}

module.exports = ${name};
module.exports.__geneMetadata = ${JSON.stringify({
  pHash: gene.pHash,
  pure: gene.pure,
  type: gene.type
})};
`;
    
    fs.writeFileSync(genePath, exportedGene);
    console.log(`    ✓ Exported gene: ${name} (${gene.pHash})`);
  });
  
  // Generate lambda-based package.json
  const pkgPath = path.join(moduleDir, 'package.json');
  let originalPkg = {};
  
  if (fs.existsSync(pkgPath)) {
    originalPkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  }
  
  const newPkg = generateLambdaPackageJson(genes, originalPkg);
  fs.writeFileSync(pkgPath, JSON.stringify(newPkg, null, 2));
  
  console.log(`  📦 Generated lambda package.json`);
  console.log(`     Lambda: ${newPkg.version.lambda}`);
  console.log(`     Genes: ${genes.size} (ALL exported!)`);
  
  // Create index that re-exports everything
  const indexPath = path.join(moduleDir, 'index.js');
  const indexContent = `
// Auto-generated index exposing ALL genes
// This is the INVERTED model - everything pure is public!

${Array.from(genes.keys()).map(name => 
  `exports.${name} = require('./genes/${name}');`
).join('\n')}

// Genome metadata
exports.__genome = ${JSON.stringify(newPkg.genome)};
exports.__proof = ${JSON.stringify(newPkg.proof)};
`;
  
  fs.writeFileSync(indexPath, indexContent);
  
  return {
    genes: genes.size,
    lambda: newPkg.version.lambda,
    proof: newPkg.proof
  };
}

// Test it!
if (require.main === module) {
  const testFile = process.argv[2];
  
  if (!testFile) {
    console.log('Usage: node gene-extractor.js <file.js>');
    console.log('\nThis will extract ALL pure functions and export them as genes!');
    process.exit(1);
  }
  
  const result = transformModuleToExportGenes(testFile);
  
  console.log('\n✨ INVERSION COMPLETE!');
  console.log('All pure functions are now public genes.');
  console.log('Privacy through context, not encapsulation.');
  console.log(`Proof of State: ${result.proof.pHash}`);
}

module.exports = {
  extractAllGenes,
  generatePHash,
  generateLambdaPackageJson,
  transformModuleToExportGenes
};