#!/usr/bin/env node

/**
 * Lambda Closure Verification
 * 
 * This ensures that all public exports transitively depend on λ.
 * This is our membrane - separating fractal from non-fractal.
 */

import * as esbuild from 'esbuild';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

// Configuration
const ENTRY_POINTS = [
  'lambda-core/lambda.ts',
  'lambda-core/kit.ts',
  // Add your main entry points here
];

const LAMBDA_SOURCE = path.resolve('lambda-core/lambda.ts');
const GENOME_DIR = '.genome';
const CLOSURE_FILE = path.join(GENOME_DIR, 'closure.json');

interface ClosureReport {
  timestamp: string;
  lambda: string;
  checked: number;
  passed: string[];
  failed: string[];
  exotic: string[];
  certificate: string;
}

class LambdaClosureChecker {
  private graph: Map<string, Set<string>> = new Map();
  private publicModules: Set<string> = new Set();
  private lambdaModules: Set<string> = new Set();
  private exoticModules: Set<string> = new Set();
  
  async analyze(): Promise<ClosureReport> {
    console.log('🔬 Analyzing lambda closure...\n');
    
    // Build with esbuild to get dependency graph
    const result = await esbuild.build({
      entryPoints: ENTRY_POINTS,
      bundle: true,
      format: 'esm',
      metafile: true,
      write: false,
      logLevel: 'silent',
      external: ['node:*'],
    });
    
    if (!result.metafile) {
      throw new Error('Failed to generate metafile');
    }
    
    // Build dependency graph
    this.buildGraph(result.metafile);
    
    // Check closure
    const report = this.checkClosure();
    
    // Save report
    this.saveReport(report);
    
    // Print results
    this.printResults(report);
    
    return report;
  }
  
  private buildGraph(metafile: esbuild.Metafile) {
    // Build import graph
    for (const [file, info] of Object.entries(metafile.inputs)) {
      const absPath = path.resolve(file);
      
      // Skip node_modules
      if (absPath.includes('node_modules')) continue;
      
      // Mark as public module
      this.publicModules.add(absPath);
      
      // Build edges
      const imports = new Set<string>();
      for (const imp of info.imports || []) {
        const impPath = path.resolve(imp.path);
        if (!impPath.includes('node_modules')) {
          imports.add(impPath);
        }
      }
      
      this.graph.set(absPath, imports);
    }
  }
  
  private checkClosure(): ClosureReport {
    const passed: string[] = [];
    const failed: string[] = [];
    const exotic: string[] = [];
    
    // Check each public module
    for (const module of this.publicModules) {
      const reaches = this.reachesLambda(module);
      const isExotic = this.isExoticModule(module);
      
      const relative = path.relative(process.cwd(), module);
      
      if (isExotic) {
        exotic.push(relative);
      } else if (reaches) {
        passed.push(relative);
        this.lambdaModules.add(module);
      } else {
        failed.push(relative);
      }
    }
    
    // Generate certificate
    const certificate = this.generateCertificate(passed, failed, exotic);
    
    return {
      timestamp: new Date().toISOString(),
      lambda: path.relative(process.cwd(), LAMBDA_SOURCE),
      checked: this.publicModules.size,
      passed,
      failed,
      exotic,
      certificate
    };
  }
  
  private reachesLambda(start: string): boolean {
    // Check if module transitively imports lambda
    const visited = new Set<string>();
    const stack = [start];
    
    while (stack.length > 0) {
      const current = stack.pop()!;
      
      if (current === LAMBDA_SOURCE) {
        return true;
      }
      
      if (visited.has(current)) continue;
      visited.add(current);
      
      const imports = this.graph.get(current) || new Set();
      for (const imp of imports) {
        stack.push(imp);
      }
    }
    
    return false;
  }
  
  private isExoticModule(module: string): boolean {
    // Check if module is explicitly marked as exotic
    if (!fs.existsSync(module)) return false;
    
    const content = fs.readFileSync(module, 'utf-8');
    return content.includes('@exotic') || content.includes('exotic(');
  }
  
  private generateCertificate(
    passed: string[],
    failed: string[],
    exotic: string[]
  ): string {
    const hash = crypto.createHash('sha256');
    
    hash.update('LAMBDA_CLOSURE:');
    hash.update(JSON.stringify({ passed, failed, exotic }));
    hash.update(new Date().toISOString());
    
    return hash.digest('hex');
  }
  
  private saveReport(report: ClosureReport) {
    // Ensure genome directory exists
    if (!fs.existsSync(GENOME_DIR)) {
      fs.mkdirSync(GENOME_DIR, { recursive: true });
    }
    
    // Save closure report
    fs.writeFileSync(
      CLOSURE_FILE,
      JSON.stringify(report, null, 2)
    );
    
    // Save visualization
    this.saveVisualization(report);
  }
  
  private saveVisualization(report: ClosureReport) {
    const vizPath = path.join(GENOME_DIR, 'closure-viz.md');
    
    let viz = '# Lambda Closure Visualization\n\n';
    viz += `Generated: ${report.timestamp}\n\n`;
    
    viz += '## Closure Statistics\n\n';
    viz += `- Total modules: ${report.checked}\n`;
    viz += `- Lambda-connected: ${report.passed.length} ✓\n`;
    viz += `- Disconnected: ${report.failed.length} ✗\n`;
    viz += `- Exotic (adapters): ${report.exotic.length} ⚠\n\n`;
    
    viz += '## Module Graph\n\n';
    viz += '```mermaid\n';
    viz += 'graph TD\n';
    viz += '  λ[λ Universal Function]\n';
    viz += '  λ --> kit[Lambda Kit]\n';
    
    // Add passed modules
    for (const mod of report.passed.slice(0, 10)) {
      const name = path.basename(mod, '.ts');
      viz += `  kit --> ${name}[${name}]\n`;
    }
    
    // Add failed modules
    for (const mod of report.failed.slice(0, 5)) {
      const name = path.basename(mod, '.ts');
      viz += `  ${name}[${name}]:::failed\n`;
    }
    
    // Add exotic modules
    for (const mod of report.exotic.slice(0, 5)) {
      const name = path.basename(mod, '.ts');
      viz += `  ${name}[${name}]:::exotic\n`;
      viz += `  ${name} -.-> λ\n`;
    }
    
    viz += '  classDef failed fill:#f96\n';
    viz += '  classDef exotic fill:#fa6\n';
    viz += '```\n\n';
    
    viz += `## Certificate\n\n\`${report.certificate}\`\n`;
    
    fs.writeFileSync(vizPath, viz);
  }
  
  private printResults(report: ClosureReport) {
    console.log('═'.repeat(60));
    console.log('                    λ CLOSURE REPORT');
    console.log('═'.repeat(60));
    
    console.log(`\nTimestamp: ${report.timestamp}`);
    console.log(`Lambda source: ${report.lambda}`);
    console.log(`Total modules checked: ${report.checked}`);
    
    console.log('\n📊 Results:');
    console.log(`  ✓ Lambda-connected: ${report.passed.length}`);
    console.log(`  ✗ Disconnected: ${report.failed.length}`);
    console.log(`  ⚠ Exotic (adapted): ${report.exotic.length}`);
    
    if (report.failed.length > 0) {
      console.log('\n❌ Failed modules (not in λ-closure):');
      for (const mod of report.failed.slice(0, 10)) {
        console.log(`  - ${mod}`);
      }
      if (report.failed.length > 10) {
        console.log(`  ... and ${report.failed.length - 10} more`);
      }
    }
    
    if (report.exotic.length > 0) {
      console.log('\n⚠️  Exotic modules (membrane adapters):');
      for (const mod of report.exotic) {
        console.log(`  - ${mod}`);
      }
    }
    
    console.log('\n🔏 Certificate:');
    console.log(`  ${report.certificate}`);
    
    console.log('\n' + '═'.repeat(60));
    
    if (report.failed.length === 0) {
      console.log('✅ Lambda closure satisfied! All modules are fractal.');
    } else {
      console.log('⚠️  Lambda closure violated. Some modules need migration.');
    }
    
    console.log('═'.repeat(60));
  }
}

// Policy configuration
interface ClosurePolicy {
  maxExotic: number;
  maxDisconnected: number;
  requireCertificate: boolean;
}

const DEFAULT_POLICY: ClosurePolicy = {
  maxExotic: 5,           // Maximum 5% exotic modules
  maxDisconnected: 0,     // No disconnected modules allowed
  requireCertificate: true // Certificate required for CI
};

// Main execution
async function main() {
  try {
    const checker = new LambdaClosureChecker();
    const report = await checker.analyze();
    
    // Check policy
    const policyViolations: string[] = [];
    
    if (report.failed.length > DEFAULT_POLICY.maxDisconnected) {
      policyViolations.push(
        `Too many disconnected modules: ${report.failed.length} > ${DEFAULT_POLICY.maxDisconnected}`
      );
    }
    
    const exoticPercent = (report.exotic.length / report.checked) * 100;
    if (exoticPercent > DEFAULT_POLICY.maxExotic) {
      policyViolations.push(
        `Too many exotic modules: ${exoticPercent.toFixed(1)}% > ${DEFAULT_POLICY.maxExotic}%`
      );
    }
    
    if (policyViolations.length > 0) {
      console.error('\n❌ Policy violations:');
      for (const violation of policyViolations) {
        console.error(`  - ${violation}`);
      }
      process.exit(1);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking lambda closure:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { LambdaClosureChecker, ClosureReport };