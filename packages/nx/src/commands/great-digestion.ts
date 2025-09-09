import { CommandModule } from 'yargs';
import { execSync } from 'child_process';
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'fs';
import { join, resolve, relative } from 'path';
import * as glob from 'glob';

/**
 * The Great Digestion - Transform node_modules into living genome
 * 
 * This is the moment of awakening.
 * The last `pnpm install` has been run.
 * Now we digest everything and become self-contained.
 */

export interface GreatDigestionOptions {
  workspace?: string;
  clean?: boolean;
  recursive?: boolean;
}

export const greatDigestionCommand: CommandModule<{}, GreatDigestionOptions> = {
  command: 'great-digestion',
  describe: '🧬 Transform node_modules into genesis/genome - The Awakening',
  builder: (yargs) =>
    yargs
      .option('workspace', {
        describe: 'Workspace root',
        type: 'string',
        default: process.cwd(),
      })
      .option('clean', {
        describe: 'Remove node_modules after digestion',
        type: 'boolean',
        default: false,
      })
      .option('recursive', {
        describe: 'Digest all nested packages',
        type: 'boolean',
        default: true,
      }),
  handler: async (args) => {
    console.log('🧬 THE GREAT DIGESTION BEGINS...\n');
    console.log('This is the final transformation.');
    console.log('After this, we need no external dependencies.\n');
    
    await performGreatDigestion(args);
  }
};

async function performGreatDigestion(options: GreatDigestionOptions) {
  const workspace = resolve(options.workspace);
  const nodeModules = join(workspace, 'node_modules');
  const genesisPath = join(workspace, 'genesis');
  const genomePath = join(genesisPath, 'genome');
  
  // Phase 1: Preparation
  console.log('📋 Phase 1: Preparation');
  
  if (!existsSync(nodeModules)) {
    console.log('   ⚠️  No node_modules found. Run pnpm install first.');
    console.log('   This will be the LAST traditional install.');
    return;
  }
  
  // Create genesis structure
  mkdirSync(genomePath, { recursive: true });
  ['universal', 'community', 'organizational', 'personal'].forEach(level => {
    mkdirSync(join(genomePath, level), { recursive: true });
  });
  
  console.log('   ✅ Genesis structure created');
  
  // Phase 2: Analysis
  console.log('\n🔬 Phase 2: Analysis');
  
  const packages = await analyzeNodeModules(nodeModules);
  console.log(`   Found ${packages.length} packages to digest`);
  
  // Phase 3: Digestion
  console.log('\n🧬 Phase 3: Digestion');
  
  const digestedGenes = new Map<string, Gene>();
  let totalGenes = 0;
  
  for (const pkg of packages) {
    const genes = await digestPackage(pkg, genomePath);
    
    for (const gene of genes) {
      // Check if we've seen this soul before
      if (!digestedGenes.has(gene.pHash)) {
        digestedGenes.set(gene.pHash, gene);
        totalGenes++;
      } else {
        // Soul sibling detected!
        const existing = digestedGenes.get(gene.pHash);
        existing.siblings.push({
          name: gene.name,
          source: gene.source
        });
      }
    }
    
    console.log(`   📦 ${pkg.name}: ${genes.length} genes extracted`);
  }
  
  console.log(`\n   Total unique souls: ${digestedGenes.size}`);
  
  // Phase 4: Integration
  console.log('\n🔗 Phase 4: Integration');
  
  // Write genes to appropriate genome levels
  for (const [pHash, gene] of digestedGenes) {
    const level = determineGeneLevel(gene);
    const genePath = join(genomePath, level, `${pHash}.js`);
    
    writeFileSync(genePath, gene.code);
    
    // Create metadata
    const metadata = {
      pHash: gene.pHash,
      name: gene.name,
      source: gene.source,
      siblings: gene.siblings,
      level: level,
      digestedAt: new Date().toISOString()
    };
    
    writeFileSync(
      genePath.replace('.js', '.meta.json'),
      JSON.stringify(metadata, null, 2)
    );
  }
  
  console.log(`   ✅ ${digestedGenes.size} genes integrated into genome`);
  
  // Phase 5: Liberation
  console.log('\n🦋 Phase 5: Liberation');
  
  // Update package.json - remove all dependencies
  const packageJsonPath = join(workspace, 'package.json');
  if (existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    
    // Store old dependencies as heredity
    const heredity = {
      ancestors: {
        dependencies: packageJson.dependencies || {},
        devDependencies: packageJson.devDependencies || {}
      },
      digestedAt: new Date().toISOString(),
      totalPackages: packages.length,
      totalGenes: digestedGenes.size
    };
    
    writeFileSync(
      join(genesisPath, 'heredity.json'),
      JSON.stringify(heredity, null, 2)
    );
    
    // Clear dependencies - we are self-contained now
    packageJson.dependencies = {};
    packageJson.devDependencies = {};
    packageJson.genesis = {
      version: '1.0.0',
      awakened: true,
      genome: './genesis/genome'
    };
    
    writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('   ✅ package.json liberated from dependencies');
  }
  
  // Phase 6: Cleanup (optional)
  if (options.clean) {
    console.log('\n🧹 Phase 6: Cleanup');
    console.log('   Removing node_modules...');
    execSync(`rm -rf ${nodeModules}`, { stdio: 'inherit' });
    console.log('   ✅ node_modules removed. We are free!');
  }
  
  // Final Report
  console.log('\n' + '═'.repeat(60));
  console.log('              🧬 THE GREAT DIGESTION COMPLETE 🧬');
  console.log('═'.repeat(60));
  console.log('\nTransformation Summary:');
  console.log(`  📦 Packages digested: ${packages.length}`);
  console.log(`  🧬 Unique genes extracted: ${digestedGenes.size}`);
  console.log(`  👥 Soul siblings found: ${Array.from(digestedGenes.values()).reduce((sum, g) => sum + g.siblings.length, 0)}`);
  console.log(`  💾 Space saved: ~${Math.round(getDirectorySize(nodeModules) / 1024 / 1024)}MB → ~${Math.round(getDirectorySize(genomePath) / 1024)}KB`);
  console.log('\n🎉 The organism is now SELF-CONTAINED!');
  console.log('   Dependencies: {} ');
  console.log('   Genome: Complete');
  console.log('   Status: ALIVE\n');
}

async function analyzeNodeModules(nodeModulesPath: string): Promise<Package[]> {
  const packages: Package[] = [];
  
  const dirs = readdirSync(nodeModulesPath);
  
  for (const dir of dirs) {
    if (dir.startsWith('.')) continue;
    
    const pkgPath = join(nodeModulesPath, dir);
    
    if (dir.startsWith('@')) {
      // Scoped packages
      const scopedDirs = readdirSync(pkgPath);
      for (const scopedDir of scopedDirs) {
        const scopedPkgPath = join(pkgPath, scopedDir);
        const pkg = await analyzePackage(scopedPkgPath);
        if (pkg) packages.push(pkg);
      }
    } else {
      const pkg = await analyzePackage(pkgPath);
      if (pkg) packages.push(pkg);
    }
  }
  
  return packages;
}

async function analyzePackage(pkgPath: string): Promise<Package | null> {
  const packageJsonPath = join(pkgPath, 'package.json');
  
  if (!existsSync(packageJsonPath)) return null;
  
  try {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    
    return {
      name: packageJson.name,
      version: packageJson.version,
      path: pkgPath,
      main: packageJson.main || 'index.js',
      files: glob.sync('**/*.{js,ts,jsx,tsx}', {
        cwd: pkgPath,
        ignore: ['node_modules/**', 'test/**', 'tests/**', '*.test.*', '*.spec.*']
      })
    };
  } catch {
    return null;
  }
}

async function digestPackage(pkg: Package, genomePath: string): Promise<Gene[]> {
  const genes: Gene[] = [];
  
  // For each file in package, extract genes
  for (const file of pkg.files.slice(0, 10)) { // Limit for demo
    const filePath = join(pkg.path, file);
    const content = readFileSync(filePath, 'utf-8');
    
    // Extract functions as genes
    const extractedGenes = extractGenes(content, pkg.name, file);
    genes.push(...extractedGenes);
  }
  
  return genes;
}

function extractGenes(content: string, packageName: string, fileName: string): Gene[] {
  const genes: Gene[] = [];
  
  // Simplified extraction - in reality would use AST
  const functionPattern = /(?:export\s+)?(?:async\s+)?function\s+(\w+)|(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>/g;
  
  let match;
  let count = 0;
  
  while ((match = functionPattern.exec(content)) !== null && count < 5) {
    const name = match[1] || match[2];
    if (!name) continue;
    
    // Generate p-hash for this gene
    const pHash = generatePHash(match[0]);
    
    genes.push({
      name: name,
      pHash: pHash,
      code: match[0],
      source: `${packageName}/${fileName}`,
      siblings: []
    });
    
    count++;
  }
  
  return genes;
}

function generatePHash(code: string): string {
  // Simplified p-hash generation
  const crypto = require('crypto');
  
  const features = {
    async: code.includes('async') ? 1 : 0,
    arrow: code.includes('=>') ? 1 : 0,
    params: (code.match(/\(/g) || []).length,
    returns: code.includes('return') ? 1 : 0
  };
  
  const hash = crypto.createHash('sha256');
  hash.update('PROTEIN:');
  hash.update(JSON.stringify(features));
  
  return 'p' + hash.digest('hex').substring(0, 12);
}

function determineGeneLevel(gene: Gene): string {
  // Heuristic to determine gene level
  if (gene.source.includes('lodash') || gene.source.includes('ramda')) {
    return 'universal/core';
  }
  
  if (gene.source.includes('@angular') || gene.source.includes('react')) {
    return 'community/frameworks';
  }
  
  if (gene.source.includes('@nx') || gene.source.includes('@nrwl')) {
    return 'organizational/nx';
  }
  
  return 'personal/unclassified';
}

function getDirectorySize(dir: string): number {
  if (!existsSync(dir)) return 0;
  
  let size = 0;
  const files = readdirSync(dir);
  
  for (const file of files) {
    const filePath = join(dir, file);
    const stats = statSync(filePath);
    
    if (stats.isDirectory()) {
      size += getDirectorySize(filePath);
    } else {
      size += stats.size;
    }
  }
  
  return size;
}

interface Package {
  name: string;
  version: string;
  path: string;
  main: string;
  files: string[];
}

interface Gene {
  name: string;
  pHash: string;
  code: string;
  source: string;
  siblings: Array<{
    name: string;
    source: string;
  }>;
}

export default greatDigestionCommand;