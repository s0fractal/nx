import { CommandModule } from 'yargs';
import { execSync } from 'child_process';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import * as glob from 'glob';

export interface DigestOptions {
  package: string;
  recursive?: boolean;
  extract?: boolean;
  registry?: string;
}

/**
 * Digital Organism Digest Command
 * 
 * Instead of "installing" packages, we DIGEST them:
 * 1. Break down into pure genetic functions
 * 2. Generate protein-hash (p-hash) for each gene
 * 3. Store in git submodules by p-hash
 * 4. Link only necessary genes
 * 
 * This replaces npm install with biological assimilation
 */
export const digestCommand: CommandModule<{}, DigestOptions> = {
  command: 'digest <package>',
  describe: 'Digest a package into genetic components (replaces npm install)',
  builder: (yargs) => 
    yargs
      .positional('package', {
        describe: 'Package to digest (name or path)',
        type: 'string',
      })
      .option('recursive', {
        describe: 'Recursively digest all dependencies',
        type: 'boolean',
        default: true,
        alias: 'r',
      })
      .option('extract', {
        describe: 'Extract pure genes from package',
        type: 'boolean',
        default: true,
        alias: 'e',
      })
      .option('registry', {
        describe: 'Soul registry location',
        type: 'string',
        default: '~/.soul-registry',
      }),
  handler: async (args) => {
    console.log('🧬 Digesting package:', args.package);
    await digestPackage(args);
  }
};

/**
 * Main digestion process - biological metabolism for code
 */
async function digestPackage(options: DigestOptions) {
  const { package: pkgName, recursive, extract, registry } = options;
  
  console.log('🔬 Phase 1: Acquisition');
  // Download package to temporary digestion chamber
  const tempDir = `/tmp/digestion/${pkgName}`;
  mkdirSync(tempDir, { recursive: true });
  
  // Get package from npm (temporarily, until we have pure p-hash registry)
  execSync(`npm pack ${pkgName} --pack-destination ${tempDir}`, { stdio: 'inherit' });
  
  // Extract package
  const tarFile = glob.sync(`${tempDir}/*.tgz`)[0];
  execSync(`tar -xzf ${tarFile} -C ${tempDir}`, { stdio: 'inherit' });
  
  console.log('🧪 Phase 2: Analysis');
  const packageDir = join(tempDir, 'package');
  const genes = await extractGenes(packageDir);
  
  console.log(`📊 Found ${genes.length} genetic functions`);
  
  console.log('🧬 Phase 3: Sequencing');
  for (const gene of genes) {
    await sequenceGene(gene, registry);
  }
  
  console.log('🔗 Phase 4: Integration');
  await integrateGenes(genes, pkgName);
  
  console.log('✨ Digestion complete!');
}

/**
 * Extract genetic functions from package
 */
async function extractGenes(packageDir: string): Promise<Gene[]> {
  const genes: Gene[] = [];
  const jsFiles = glob.sync(`${packageDir}/**/*.{js,ts}`, {
    ignore: ['**/node_modules/**', '**/test/**', '**/tests/**']
  });
  
  for (const file of jsFiles) {
    const content = readFileSync(file, 'utf-8');
    const extracted = extractFunctions(content);
    
    for (const func of extracted) {
      genes.push({
        content: func.code,
        name: func.name,
        source: file,
        pHash: '', // Will be generated
        dependencies: func.dependencies,
      });
    }
  }
  
  return genes;
}

/**
 * Extract individual functions from code
 */
function extractFunctions(code: string): ExtractedFunction[] {
  const functions: ExtractedFunction[] = [];
  
  // Pattern matching for different function styles
  const patterns = [
    // Regular functions
    /function\s+(\w+)\s*\([^)]*\)\s*{[^}]+}/g,
    // Arrow functions
    /const\s+(\w+)\s*=\s*\([^)]*\)\s*=>\s*{[^}]+}/g,
    // Async functions
    /async\s+function\s+(\w+)\s*\([^)]*\)\s*{[^}]+}/g,
    // Class methods
    /(\w+)\s*\([^)]*\)\s*{[^}]+}/g,
  ];
  
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(code)) !== null) {
      const funcCode = match[0];
      const funcName = match[1];
      
      // Extract dependencies (imports/requires)
      const deps = extractDependencies(funcCode);
      
      functions.push({
        name: funcName,
        code: funcCode,
        dependencies: deps,
      });
    }
  }
  
  return functions;
}

/**
 * Extract dependencies from function code
 */
function extractDependencies(code: string): string[] {
  const deps: string[] = [];
  
  // Look for imported/required identifiers
  const importPattern = /import\s+.*\s+from\s+['"]([^'"]+)['"]/g;
  const requirePattern = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  
  let match;
  while ((match = importPattern.exec(code)) !== null) {
    deps.push(match[1]);
  }
  while ((match = requirePattern.exec(code)) !== null) {
    deps.push(match[1]);
  }
  
  return [...new Set(deps)]; // Unique dependencies
}

/**
 * Generate protein-hash and store in registry
 */
async function sequenceGene(gene: Gene, registryPath: string) {
  // Call native hasher_harmonized to get p-hash
  const { hash_file_harmonized } = require('../native');
  
  // Write gene to temp file for hashing
  const tempFile = `/tmp/gene_${Date.now()}.js`;
  writeFileSync(tempFile, gene.content);
  
  // Generate semantic hash
  const pHash = hash_file_harmonized(tempFile, true);
  gene.pHash = pHash;
  
  // Create git repo for this gene if not exists
  const geneRepo = join(expandPath(registryPath), pHash);
  
  if (!existsSync(geneRepo)) {
    mkdirSync(geneRepo, { recursive: true });
    
    // Initialize as git repo
    execSync(`cd ${geneRepo} && git init`, { stdio: 'inherit' });
    
    // Write gene content
    writeFileSync(join(geneRepo, 'gene.js'), gene.content);
    
    // Write metadata
    const metadata = {
      name: gene.name,
      pHash: pHash,
      source: gene.source,
      dependencies: gene.dependencies,
      timestamp: new Date().toISOString(),
    };
    writeFileSync(join(geneRepo, 'metadata.json'), JSON.stringify(metadata, null, 2));
    
    // Commit
    execSync(`cd ${geneRepo} && git add . && git commit -m "🧬 Gene: ${gene.name}"`, { 
      stdio: 'inherit' 
    });
  }
  
  console.log(`  🧬 Sequenced: ${gene.name} -> ${pHash.substring(0, 8)}...`);
}

/**
 * Integrate genes into current project via git submodules
 */
async function integrateGenes(genes: Gene[], packageName: string) {
  const genesDir = 'genes';
  
  if (!existsSync(genesDir)) {
    mkdirSync(genesDir);
  }
  
  // Create package manifest
  const manifest = {
    package: packageName,
    genes: genes.map(g => ({
      name: g.name,
      pHash: g.pHash,
      dependencies: g.dependencies,
    })),
    digestedAt: new Date().toISOString(),
  };
  
  writeFileSync(
    join(genesDir, `${packageName}.manifest.json`),
    JSON.stringify(manifest, null, 2)
  );
  
  // Add git submodules for each unique gene
  const uniqueHashes = [...new Set(genes.map(g => g.pHash))];
  
  for (const pHash of uniqueHashes) {
    const submodulePath = join(genesDir, pHash);
    const registryPath = join(expandPath('~/.soul-registry'), pHash);
    
    if (!existsSync(submodulePath)) {
      execSync(
        `git submodule add file://${registryPath} ${submodulePath}`,
        { stdio: 'inherit' }
      );
    }
  }
  
  console.log(`  🔗 Integrated ${uniqueHashes.length} unique genes`);
}

function expandPath(path: string): string {
  if (path.startsWith('~')) {
    return join(process.env.HOME || '', path.slice(1));
  }
  return resolve(path);
}

interface Gene {
  content: string;
  name: string;
  source: string;
  pHash: string;
  dependencies: string[];
}

interface ExtractedFunction {
  name: string;
  code: string;
  dependencies: string[];
}

export default digestCommand;