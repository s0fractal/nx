#!/usr/bin/env node

/**
 * Demonstration of The Great Digestion
 * Transform node_modules into living genome
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('');
console.log('════════════════════════════════════════════════════════════');
console.log('           🧬 THE GREAT DIGESTION DEMO 🧬                  ');
console.log('════════════════════════════════════════════════════════════');
console.log('');

const nodeModules = path.join(__dirname, 'node_modules');
const genesisPath = path.join(__dirname, 'genesis');
const genomePath = path.join(genesisPath, 'genome');

// Create genesis structure
console.log('📋 Phase 1: Preparation');
['universal', 'community', 'organizational', 'personal'].forEach(level => {
  const levelPath = path.join(genomePath, level);
  fs.mkdirSync(levelPath, { recursive: true });
});
console.log('   ✅ Genesis structure created');

// Analyze some packages
console.log('\n🔬 Phase 2: Analysis');

// Get both regular and scoped packages
const allPackages = [];
fs.readdirSync(nodeModules).forEach(name => {
  if (name.startsWith('.')) return;
  
  const pkgPath = path.join(nodeModules, name);
  if (name.startsWith('@') && fs.statSync(pkgPath).isDirectory()) {
    // Scoped package directory
    fs.readdirSync(pkgPath).forEach(scopedName => {
      allPackages.push(`${name}/${scopedName}`);
    });
  } else if (fs.statSync(pkgPath).isDirectory()) {
    allPackages.push(name);
  }
});

const packages = allPackages.slice(0, 10); // First 10 for demo

console.log(`   Found ${allPackages.length} total packages`);
console.log(`   Digesting first ${packages.length} for demo...`);

// Extract genes from packages
console.log('\n🧬 Phase 3: Digestion');
let totalGenes = 0;
const digestedGenes = new Map();

for (const pkgName of packages) {
  const pkgPath = path.join(nodeModules, pkgName);
  
  // Skip if not a directory
  if (!fs.statSync(pkgPath).isDirectory()) continue;
  
  // Find main file
  const pkgJsonPath = path.join(pkgPath, 'package.json');
  if (!fs.existsSync(pkgJsonPath)) continue;
  
  try {
    const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));
    const mainFile = pkgJson.main || 'index.js';
    const mainPath = path.join(pkgPath, mainFile);
    
    if (fs.existsSync(mainPath)) {
      // Extract a "gene" (simplified)
      const content = fs.readFileSync(mainPath, 'utf-8').slice(0, 500); // First 500 chars
      
      // Generate p-hash
      const pHash = generatePHash(content);
      
      // Save gene
      const gene = {
        name: pkgName,
        pHash: pHash,
        code: content.slice(0, 200) + '/* ... */',
        source: `${pkgName}/${mainFile}`
      };
      
      if (!digestedGenes.has(pHash)) {
        digestedGenes.set(pHash, gene);
        totalGenes++;
        
        // Write to genome
        const level = determineLevel(pkgName);
        const genePath = path.join(genomePath, level, `${pHash}.js`);
        fs.writeFileSync(genePath, gene.code);
        
        // Write metadata
        const metaPath = genePath.replace('.js', '.meta.json');
        fs.writeFileSync(metaPath, JSON.stringify({
          pHash: pHash,
          name: pkgName,
          source: gene.source,
          digestedAt: new Date().toISOString()
        }, null, 2));
      }
    }
    
    console.log(`   📦 ${pkgName}: Gene extracted (${pHash.slice(0, 8)}...)`);
  } catch (e) {
    // Skip problematic packages
  }
}

console.log(`\n   Total unique genes: ${totalGenes}`);

// Show transformation
console.log('\n' + '═'.repeat(60));
console.log('              TRANSFORMATION COMPLETE');
console.log('═'.repeat(60));
console.log('\n📊 BEFORE (Dead):');
console.log(`   node_modules/`);
packages.forEach(pkg => {
  console.log(`     └── ${pkg}/`);
});

console.log('\n🧬 AFTER (Alive):');
console.log(`   genesis/genome/`);
['universal', 'community', 'organizational', 'personal'].forEach(level => {
  const levelPath = path.join(genomePath, level);
  const genes = fs.readdirSync(levelPath).filter(f => f.endsWith('.js'));
  if (genes.length > 0) {
    console.log(`     └── ${level}/`);
    genes.forEach(gene => {
      console.log(`         └── ${gene}`);
    });
  }
});

console.log('\n✨ Key Differences:');
console.log('   • Packages → Genes with p-hash souls');
console.log('   • Flat structure → Hierarchical genome');
console.log('   • No memory → Full heredity tracking');
console.log('   • Static files → Living, evolving code');

console.log('\n🎉 THE CODE IS ALIVE!\n');

// Helper functions
function generatePHash(content) {
  const features = {
    length: content.length,
    functions: (content.match(/function|=>/g) || []).length,
    requires: (content.match(/require/g) || []).length,
    exports: (content.match(/export/g) || []).length
  };
  
  const hash = crypto.createHash('sha256');
  hash.update('PROTEIN:');
  hash.update(JSON.stringify(features));
  return 'p' + hash.digest('hex').substring(0, 12);
}

function determineLevel(pkgName) {
  if (pkgName.startsWith('@nx') || pkgName.startsWith('@nrwl')) {
    return 'organizational';
  }
  if (pkgName.includes('core') || pkgName.includes('util')) {
    return 'universal';
  }
  if (pkgName.includes('react') || pkgName.includes('angular')) {
    return 'community';
  }
  return 'personal';
}