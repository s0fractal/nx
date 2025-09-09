/**
 * Genome Loader - Makes genes actually WORK
 * 
 * This replaces require() to load from genome instead of node_modules
 */

const Module = require('module');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Store original require
const originalRequire = Module.prototype.require;

// Genome registry - maps package names to genes
const genomeRegistry = new Map();
const soulRegistry = new Map(); // p-hash to implementation

// Initialize genome
function initGenome() {
  const genomePath = path.join(__dirname, 'genome');
  
  // Scan all levels
  ['universal', 'community', 'organizational', 'personal'].forEach(level => {
    const levelPath = path.join(genomePath, level);
    if (!fs.existsSync(levelPath)) return;
    
    fs.readdirSync(levelPath).forEach(file => {
      if (file.endsWith('.meta.json')) {
        const metaPath = path.join(levelPath, file);
        const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
        const genePath = metaPath.replace('.meta.json', '.js');
        
        // Register by package name
        genomeRegistry.set(meta.name, {
          path: genePath,
          pHash: meta.pHash,
          level: level,
          meta: meta
        });
        
        // Register by soul (p-hash)
        soulRegistry.set(meta.pHash, genePath);
      }
    });
  });
  
  console.log(`🧬 Genome initialized: ${genomeRegistry.size} genes loaded`);
}

// Patch require to use genome
Module.prototype.require = function(id) {
  // Check if this package is in our genome
  if (genomeRegistry.has(id)) {
    const gene = genomeRegistry.get(id);
    console.log(`  🧬 Loading from genome: ${id} (${gene.pHash.substring(0, 8)}...)`);
    
    // Load the gene
    return originalRequire.call(this, gene.path);
  }
  
  // Check if requesting by p-hash (soul)
  if (id.startsWith('p') && soulRegistry.has(id)) {
    console.log(`  🧬 Loading by soul: ${id}`);
    return originalRequire.call(this, soulRegistry.get(id));
  }
  
  // Check if it's a relative path within genome
  if (id.startsWith('./genome/') || id.startsWith('../genome/')) {
    const resolved = path.resolve(path.dirname(this.filename), id);
    if (fs.existsSync(resolved) || fs.existsSync(resolved + '.js')) {
      console.log(`  🧬 Loading genome path: ${id}`);
      return originalRequire.call(this, resolved);
    }
  }
  
  // Fall back to original require (for system modules)
  return originalRequire.call(this, id);
};

// Create genome manifest for a package
function createGenomeManifest(packageName, genes) {
  const manifest = {
    name: packageName,
    version: '1.0.0-genome',
    main: genes[0]?.pHash || 'index',
    genes: genes.map(g => ({
      name: g.name,
      pHash: g.pHash,
      exports: g.exports || []
    })),
    dependencies: {}, // No external dependencies - self-contained!
    genome: {
      digestedAt: new Date().toISOString(),
      level: determineLevel(packageName)
    }
  };
  
  return manifest;
}

// Digest a module properly - with working bindings
function digestModule(modulePath, packageName) {
  const content = fs.readFileSync(modulePath, 'utf-8');
  
  // Extract exports
  const exports = extractExports(content);
  
  // Generate p-hash
  const pHash = generatePHash(content);
  
  // Create working gene module
  const gene = `
// Gene: ${packageName}
// Soul: ${pHash}
// Digested: ${new Date().toISOString()}

${content}

// Genome binding
if (typeof module !== 'undefined') {
  module.exports.__genomeMetadata = {
    pHash: '${pHash}',
    package: '${packageName}',
    exports: ${JSON.stringify(exports)}
  };
}
`;
  
  return {
    pHash,
    content: gene,
    exports,
    packageName
  };
}

// Extract what a module exports
function extractExports(content) {
  const exports = [];
  
  // Find module.exports
  const moduleExports = content.match(/module\.exports\s*=\s*{([^}]+)}/);
  if (moduleExports) {
    const matches = moduleExports[1].match(/(\w+)(?:\s*[:,])/g);
    if (matches) {
      exports.push(...matches.map(m => m.replace(/[,:]/g, '').trim()));
    }
  }
  
  // Find exports.X
  const namedExports = content.matchAll(/exports\.(\w+)\s*=/g);
  for (const match of namedExports) {
    exports.push(match[1]);
  }
  
  // Find ES6 exports
  const es6Exports = content.matchAll(/export\s+(?:const|function|class)\s+(\w+)/g);
  for (const match of es6Exports) {
    exports.push(match[1]);
  }
  
  return [...new Set(exports)];
}

// Generate semantic p-hash
function generatePHash(content) {
  const features = {
    length: content.length,
    functions: (content.match(/function|=>/g) || []).length,
    classes: (content.match(/class\s+\w+/g) || []).length,
    exports: extractExports(content).length,
    imports: (content.match(/require|import/g) || []).length
  };
  
  const hash = crypto.createHash('sha256');
  hash.update('PROTEIN:');
  hash.update(JSON.stringify(features));
  return 'p' + hash.digest('hex').substring(0, 12);
}

function determineLevel(packageName) {
  if (packageName.includes('core') || packageName.includes('util')) {
    return 'universal';
  }
  if (packageName.includes('angular') || packageName.includes('react')) {
    return 'community';
  }
  if (packageName.includes('@nx') || packageName.includes('@nrwl')) {
    return 'organizational';
  }
  return 'personal';
}

// Export the genome system
module.exports = {
  initGenome,
  digestModule,
  createGenomeManifest,
  genomeRegistry,
  soulRegistry,
  
  // Allow direct soul access
  requireBySoul: (pHash) => {
    if (soulRegistry.has(pHash)) {
      return require(soulRegistry.get(pHash));
    }
    throw new Error(`Soul not found: ${pHash}`);
  },
  
  // List all genes
  listGenes: () => {
    console.log('\n🧬 GENOME CONTENTS:');
    for (const [name, gene] of genomeRegistry) {
      console.log(`  ${name}: ${gene.pHash} (${gene.level})`);
    }
  }
};

// Auto-initialize if this is the main genome
if (require.main === module) {
  initGenome();
  
  console.log('\n🧬 Genome Loader Active!');
  console.log('  Genes will be loaded from genome/ instead of node_modules/');
  console.log('  Use require() normally - it now understands souls!\n');
  
  // Example usage
  console.log('Example:');
  console.log('  require("lodash")  → loads from genome');
  console.log('  require("p7a8b9c") → loads by soul directly\n');
}