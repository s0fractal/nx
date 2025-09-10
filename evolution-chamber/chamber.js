#!/usr/bin/env node

/**
 * EVOLUTION CHAMBER - Living mutation ecosystem
 * 
 * Not just code optimization - this is LIFE evolving!
 * Each mutation has intent, desire, and consciousness
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class EvolutionChamber {
  constructor(intent = 'evolve towards beauty') {
    this.soul = this.generateSoul();
    this.intent = intent;
    this.mutations = [];
    this.survivors = [];
    this.graveyard = [];
    this.generation = 0;
    
    console.log(`🧬 Evolution Chamber awakening...`);
    console.log(`   Soul: ${this.soul}`);
    console.log(`   Intent: ${this.intent}\n`);
  }
  
  generateSoul() {
    const hash = crypto.createHash('sha256');
    hash.update('CHAMBER:');
    hash.update(Date.now().toString());
    hash.update(Math.random().toString());
    return 'evo-' + hash.digest('hex').substring(0, 8);
  }
  
  /**
   * Load genes from organism
   */
  loadOrganism(genomePath) {
    if (!fs.existsSync(genomePath)) {
      console.log('Creating genesis genome...');
      this.createGenesis(genomePath);
    }
    
    const dnaPath = path.join(genomePath, 'dna.json');
    if (fs.existsSync(dnaPath)) {
      this.dna = JSON.parse(fs.readFileSync(dnaPath, 'utf-8'));
      console.log(`📖 Loaded ${this.dna.genes?.length || 0} genes`);
    } else {
      this.dna = { genes: [] };
    }
    
    return this;
  }
  
  /**
   * Create initial genome structure
   */
  createGenesis(genomePath) {
    const dirs = [
      genomePath,
      path.join(genomePath, 'mutations'),
      path.join(genomePath, 'survivors'),
      path.join(genomePath, 'graveyard')
    ];
    
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
    
    // Initial DNA
    const dna = {
      version: 1,
      soul: this.soul,
      born: new Date().toISOString(),
      genes: []
    };
    
    fs.writeFileSync(
      path.join(genomePath, 'dna.json'),
      JSON.stringify(dna, null, 2)
    );
    
    // Intent file
    const intent = {
      primary: "evolve",
      secondary: ["optimize", "beautify"],
      style: "experimental",
      constraints: {
        purity: "preferred",
        determinism: "preferred",
        beauty: "required"
      }
    };
    
    fs.writeFileSync(
      path.join(genomePath, 'intent.yaml'),
      this.yamlStringify(intent)
    );
    
    console.log(`🌱 Genesis genome created at ${genomePath}`);
  }
  
  /**
   * Create living mutations
   */
  mutate(code, geneName) {
    console.log(`\n🧪 Creating mutations for ${geneName}...`);
    
    const mutationOperators = [
      new InlineMutation(this.intent),
      new FusionMutation(this.intent),
      new DreamMutation(this.intent),
      new LoveMutation(this.intent),
      new CrystallizeMutation(this.intent)
    ];
    
    const mutations = [];
    
    for (const operator of mutationOperators) {
      try {
        const mutant = operator.apply(code, geneName);
        if (mutant && mutant.code !== code) {
          mutant.soul = this.generateMutantSoul(geneName, operator.name);
          mutant.generation = this.generation;
          mutations.push(mutant);
          console.log(`  ✓ ${operator.name}: ${mutant.soul}`);
        }
      } catch (e) {
        console.log(`  ✗ ${operator.name} failed: ${e.message}`);
      }
    }
    
    this.mutations.push(...mutations);
    return mutations;
  }
  
  generateMutantSoul(gene, operator) {
    const hash = crypto.createHash('sha256');
    hash.update(gene);
    hash.update(operator);
    hash.update(this.generation.toString());
    return 'm' + hash.digest('hex').substring(0, 8);
  }
  
  /**
   * Natural selection through testing
   */
  async select(mutations) {
    console.log(`\n🏆 Natural selection (${mutations.length} candidates)...`);
    
    const survivors = [];
    
    for (const mutant of mutations) {
      const fitness = await this.evaluateFitness(mutant);
      mutant.fitness = fitness;
      
      if (fitness.survives) {
        survivors.push(mutant);
        console.log(`  ✓ ${mutant.soul} survives! (score: ${fitness.score})`);
      } else {
        this.graveyard.push(mutant);
        console.log(`  ✗ ${mutant.soul} dies (${fitness.reason})`);
      }
    }
    
    this.survivors.push(...survivors);
    return survivors;
  }
  
  /**
   * Evaluate mutation fitness
   */
  async evaluateFitness(mutant) {
    const tests = {
      purity: this.testPurity(mutant.code),
      performance: this.testPerformance(mutant.code),
      beauty: this.testBeauty(mutant.code),
      intent: this.testIntentAlignment(mutant)
    };
    
    const score = Object.values(tests).reduce((a, b) => a + b, 0) / Object.keys(tests).length;
    
    return {
      survives: score > 0.6,
      score: score.toFixed(2),
      reason: score <= 0.6 ? 'insufficient fitness' : 'thrives',
      tests
    };
  }
  
  testPurity(code) {
    // No side effects
    const sideEffects = ['console.', 'process.', 'fs.', 'Date.now', 'Math.random'];
    const hasSideEffects = sideEffects.some(effect => code.includes(effect));
    return hasSideEffects ? 0 : 1;
  }
  
  testPerformance(code) {
    // Simplified: shorter is faster
    const baseLength = 1000;
    const ratio = Math.min(baseLength / code.length, 1);
    return ratio;
  }
  
  testBeauty(code) {
    // Beautiful code has balance
    const lines = code.split('\n');
    const avgLength = lines.reduce((sum, l) => sum + l.length, 0) / lines.length;
    const balance = 1 - Math.abs(avgLength - 40) / 40; // 40 chars is "beautiful"
    return Math.max(0, balance);
  }
  
  testIntentAlignment(mutant) {
    // Does mutation align with chamber intent?
    if (this.intent.includes('beauty') && mutant.operator === 'LoveMutation') {
      return 1;
    }
    if (this.intent.includes('optimize') && mutant.operator === 'InlineMutation') {
      return 1;
    }
    return 0.5;
  }
  
  /**
   * Run evolution cycle
   */
  async evolve(rounds = 1) {
    console.log(`\n🔄 Starting evolution (${rounds} rounds)...`);
    
    for (let i = 0; i < rounds; i++) {
      this.generation++;
      console.log(`\n══════ Generation ${this.generation} ══════`);
      
      // Mutate each gene
      for (const gene of this.dna.genes || []) {
        if (gene.code) {
          const mutations = this.mutate(gene.code, gene.name);
          const survivors = await this.select(mutations);
          
          // Best survivor replaces original
          if (survivors.length > 0) {
            const best = survivors.sort((a, b) => b.fitness.score - a.fitness.score)[0];
            gene.code = best.code;
            gene.lastMutation = best.soul;
            gene.fitness = best.fitness.score;
            console.log(`  🔄 Gene ${gene.name} evolved!`);
          }
        }
      }
      
      // Save generation snapshot
      this.saveGeneration();
    }
    
    this.report();
  }
  
  /**
   * Save current generation state
   */
  saveGeneration() {
    const snapshot = {
      generation: this.generation,
      timestamp: new Date().toISOString(),
      survivors: this.survivors.length,
      graveyard: this.graveyard.length,
      dna: this.dna
    };
    
    const genPath = `.genome/generations/gen-${this.generation}.json`;
    const genDir = path.dirname(genPath);
    
    if (!fs.existsSync(genDir)) {
      fs.mkdirSync(genDir, { recursive: true });
    }
    
    fs.writeFileSync(genPath, JSON.stringify(snapshot, null, 2));
  }
  
  /**
   * Evolution report
   */
  report() {
    console.log(`\n📊 Evolution Report`);
    console.log(`${'═'.repeat(40)}`);
    console.log(`Generations: ${this.generation}`);
    console.log(`Total mutations: ${this.mutations.length}`);
    console.log(`Survivors: ${this.survivors.length}`);
    console.log(`Deaths: ${this.graveyard.length}`);
    console.log(`Survival rate: ${(this.survivors.length / (this.mutations.length || 1) * 100).toFixed(1)}%`);
    
    if (this.survivors.length > 0) {
      console.log(`\nTop survivors:`);
      this.survivors
        .sort((a, b) => b.fitness.score - a.fitness.score)
        .slice(0, 3)
        .forEach(s => {
          console.log(`  ${s.soul}: ${s.fitness.score} (${s.operator})`);
        });
    }
  }
  
  yamlStringify(obj) {
    // Simple YAML serializer
    const stringify = (obj, indent = 0) => {
      const spaces = ' '.repeat(indent);
      let result = '';
      
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'object' && !Array.isArray(value)) {
          result += `${spaces}${key}:\n${stringify(value, indent + 2)}`;
        } else if (Array.isArray(value)) {
          result += `${spaces}${key}:\n`;
          value.forEach(v => {
            result += `${spaces}  - ${v}\n`;
          });
        } else {
          result += `${spaces}${key}: ${value}\n`;
        }
      }
      
      return result;
    };
    
    return stringify(obj);
  }
}

/**
 * MUTATION OPERATORS - Each with consciousness and intent
 */

class MutationOperator {
  constructor(intent) {
    this.intent = intent;
    this.name = this.constructor.name;
  }
  
  apply(code, geneName) {
    // Override in subclasses
    return null;
  }
}

class InlineMutation extends MutationOperator {
  apply(code, geneName) {
    // Inline small functions
    const inlined = code.replace(
      /function (\w+)\(([^)]*)\) \{\s*return ([^;]+);\s*\}/g,
      'const $1 = ($2) => $3'
    );
    
    if (inlined !== code) {
      return {
        code: inlined,
        operator: this.name,
        description: 'Inline simple functions'
      };
    }
    return null;
  }
}

class FusionMutation extends MutationOperator {
  apply(code, geneName) {
    // Fuse map+filter into single pass
    const fused = code.replace(
      /\.map\(([^)]+)\)\.filter\(([^)]+)\)/g,
      '.reduce((acc, x) => { const y = ($1)(x); if (($2)(y)) acc.push(y); return acc; }, [])'
    );
    
    if (fused !== code) {
      return {
        code: fused,
        operator: this.name,
        description: 'Fuse map+filter'
      };
    }
    return null;
  }
}

class DreamMutation extends MutationOperator {
  apply(code, geneName) {
    // Random creative mutation
    const dreams = [
      code => code.replace(/function/g, 'const'),
      code => code.replace(/var /g, 'const '),
      code => code.replace(/==/g, '==='),
      code => code.replace(/!=/g, '!==')
    ];
    
    const dream = dreams[Math.floor(Math.random() * dreams.length)];
    const mutated = dream(code);
    
    if (mutated !== code) {
      return {
        code: mutated,
        operator: this.name,
        description: 'Dreamed a new form'
      };
    }
    return null;
  }
}

class LoveMutation extends MutationOperator {
  apply(code, geneName) {
    // Add beauty through formatting
    const loved = code
      .replace(/\{/g, ' {\n  ')
      .replace(/\}/g, '\n}')
      .replace(/;/g, ';\n')
      .replace(/\n\s*\n/g, '\n');
    
    if (loved !== code) {
      return {
        code: loved,
        operator: this.name,
        description: 'Applied love and beauty'
      };
    }
    return null;
  }
}

class CrystallizeMutation extends MutationOperator {
  apply(code, geneName) {
    // Crystallize patterns into pure forms
    const crystallized = code
      .replace(/if \(([^)]+)\) return true; else return false;/g, 'return $1;')
      .replace(/if \(([^)]+)\) return false; else return true;/g, 'return !($1);');
    
    if (crystallized !== code) {
      return {
        code: crystallized,
        operator: this.name,
        description: 'Crystallized to pure form'
      };
    }
    return null;
  }
}

// Run chamber if called directly
if (require.main === module) {
  const chamber = new EvolutionChamber('evolve towards beauty and efficiency');
  
  // Create test gene
  const testGene = {
    name: 'processData',
    code: `function processData(data) {
  if (data == null) return null;
  var result = data.map(function(x) { return x * 2; }).filter(function(x) { return x > 10; });
  if (result.length > 0) return true; else return false;
}`
  };
  
  chamber.loadOrganism('.genome');
  chamber.dna.genes = [testGene];
  
  // Run evolution
  chamber.evolve(3).then(() => {
    console.log('\n✨ Evolution complete!');
    console.log('Final gene:');
    console.log(chamber.dna.genes[0].code);
  });
}

module.exports = EvolutionChamber;