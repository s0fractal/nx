#!/usr/bin/env node

/**
 * Proper Digestion - Creates WORKING genes with bindings
 */

const fs = require('fs');
const path = require('path');
const { digestModule, createGenomeManifest } = require('./genome-loader');

console.log('🧬 PROPER DIGESTION - Creating Working Genes\n');

const nodeModules = path.join(__dirname, '..', 'node_modules');
const genomePath = path.join(__dirname, 'genome');

// Ensure genome structure exists
['universal', 'community', 'organizational', 'personal'].forEach(level => {
  fs.mkdirSync(path.join(genomePath, level), { recursive: true });
});

// Digest specific working packages
const targetPackages = [
  // Core utilities
  { name: 'chalk', main: 'source/index.js' },
  { name: 'yargs', main: 'index.cjs' },
  { name: 'glob', main: 'glob.js' },
  // Let's also grab some simple ones
  { name: 'minimatch', main: 'minimatch.js' },
  { name: 'semver', main: 'index.js' }
];

const digestedGenes = [];

for (const pkg of targetPackages) {
  const pkgPath = path.join(nodeModules, pkg.name);
  
  if (!fs.existsSync(pkgPath)) {
    console.log(`  ⚠️  ${pkg.name} not found, skipping...`);
    continue;
  }
  
  // Find actual main file
  let mainFile = pkg.main;
  const packageJsonPath = path.join(pkgPath, 'package.json');
  
  if (!mainFile && fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    mainFile = packageJson.main || 'index.js';
  }
  
  const modulePath = path.join(pkgPath, mainFile);
  
  if (!fs.existsSync(modulePath)) {
    console.log(`  ⚠️  ${pkg.name}: main file not found at ${mainFile}`);
    continue;
  }
  
  console.log(`📦 Digesting ${pkg.name}...`);
  
  // Properly digest with bindings
  const gene = digestModule(modulePath, pkg.name);
  digestedGenes.push(gene);
  
  // Determine level
  const level = gene.packageName.includes('glob') || gene.packageName.includes('minimatch') 
    ? 'universal' 
    : 'community';
  
  // Write working gene
  const genePath = path.join(genomePath, level, `${gene.pHash}.js`);
  fs.writeFileSync(genePath, gene.content);
  
  // Write metadata
  const metaPath = genePath.replace('.js', '.meta.json');
  fs.writeFileSync(metaPath, JSON.stringify({
    pHash: gene.pHash,
    name: pkg.name,
    source: `${pkg.name}/${mainFile}`,
    exports: gene.exports,
    level: level,
    digestedAt: new Date().toISOString()
  }, null, 2));
  
  // Create package.json in genome for compatibility
  const genePkgPath = path.join(genomePath, level, `${gene.pHash}.package.json`);
  fs.writeFileSync(genePkgPath, JSON.stringify(createGenomeManifest(pkg.name, [gene]), null, 2));
  
  console.log(`  ✅ Gene created: ${gene.pHash}`);
  console.log(`     Exports: ${gene.exports.join(', ') || 'default'}`);
  console.log(`     Level: ${level}\n`);
}

// Create genome index for easy loading
const genomeIndex = {
  version: '1.0.0',
  genes: digestedGenes.map(g => ({
    name: g.packageName,
    pHash: g.pHash,
    exports: g.exports
  })),
  mappings: {}
};

// Create mappings
digestedGenes.forEach(gene => {
  genomeIndex.mappings[gene.packageName] = gene.pHash;
});

fs.writeFileSync(
  path.join(genomePath, 'index.json'),
  JSON.stringify(genomeIndex, null, 2)
);

// Create the magic loader bootstrap
const bootstrap = `
// Genome Bootstrap - Activates living code
const genomeLoader = require('./genome-loader');

// Initialize the genome
genomeLoader.initGenome();

// Now you can require by package name OR by soul!
console.log('🧬 Genome activated! Examples:');
console.log('  require("chalk")     → loads from genome');
console.log('  require("p7a8b9c...") → loads by soul');

// Export for use
module.exports = genomeLoader;
`;

fs.writeFileSync(path.join(__dirname, 'bootstrap.js'), bootstrap);

console.log('═'.repeat(60));
console.log('           PROPER DIGESTION COMPLETE');
console.log('═'.repeat(60));
console.log('\n✅ Created working genes with:');
console.log('  • Proper module bindings');
console.log('  • Export tracking');
console.log('  • Soul-based loading');
console.log('  • Backwards compatibility');
console.log('\n🎯 To use:');
console.log('  require("./genesis/bootstrap")');
console.log('  Then require() will load from genome!\n');