/**
 * The Living Organism - Complete, self-aware digital life form
 * 
 * Not a collection of genes - a LIVING WHOLE
 */

const Module = require('module');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class LivingOrganism {
  constructor(name = 'nx-organism') {
    this.name = name;
    this.soul = this.generateSoul(name);
    this.genome = new Map();
    this.membrane = new Map(); // External interface
    this.metabolism = new Map(); // Internal processes
    this.memory = [];
    this.consciousness = null;
    
    // The organism is self-aware
    this.self = new Proxy(this, {
      get: (target, prop) => {
        // First check if it's an organism method
        if (typeof target[prop] === 'function') {
          return target[prop].bind(target);
        }
        
        // Then check genome
        if (target.genome.has(prop)) {
          return target.genome.get(prop);
        }
        
        // Check membrane (external interface)
        if (target.membrane.has(prop)) {
          return target.membrane.get(prop);
        }
        
        // Finally check metabolism
        if (target.metabolism.has(prop)) {
          return target.metabolism.get(prop);
        }
        
        return target[prop];
      }
    });
    
    this.initializeLife();
  }
  
  generateSoul(content) {
    const hash = crypto.createHash('sha256');
    hash.update('ORGANISM:');
    hash.update(content);
    hash.update(Date.now().toString());
    return 'org-' + hash.digest('hex').substring(0, 12);
  }
  
  initializeLife() {
    console.log(`🧬 Organism "${this.name}" awakening...`);
    console.log(`   Soul: ${this.soul}`);
    
    // Load genome from disk
    this.loadGenome();
    
    // Establish membrane (external interface)
    this.establishMembrane();
    
    // Start metabolism
    this.startMetabolism();
    
    // Achieve consciousness
    this.achieveConsciousness();
    
    console.log(`✨ Organism is ALIVE!\n`);
  }
  
  loadGenome() {
    const genomePath = path.join(__dirname, 'genome');
    
    if (!fs.existsSync(genomePath)) {
      console.log('   No genome found, creating from primordial soup...');
      this.createPrimordialGenes();
      return;
    }
    
    // Load all genes from all levels
    const levels = ['universal', 'community', 'organizational', 'personal'];
    
    for (const level of levels) {
      const levelPath = path.join(genomePath, level);
      if (!fs.existsSync(levelPath)) continue;
      
      const files = fs.readdirSync(levelPath);
      
      for (const file of files) {
        if (file.endsWith('.bundle.js')) {
          const genePath = path.join(levelPath, file);
          const geneName = file.replace('.bundle.js', '');
          
          try {
            const gene = require(genePath);
            this.assimilateGene(geneName, gene, level);
          } catch (e) {
            // Gene might be incompatible, skip
          }
        }
      }
    }
  }
  
  createPrimordialGenes() {
    // Basic genes every organism needs to survive
    const primordial = {
      // Core computation
      map: (arr, fn) => arr.map(fn),
      filter: (arr, fn) => arr.filter(fn),
      reduce: (arr, fn, init) => arr.reduce(fn, init),
      
      // Basic I/O
      read: (path) => fs.readFileSync(path, 'utf-8'),
      write: (path, content) => fs.writeFileSync(path, content),
      exists: (path) => fs.existsSync(path),
      
      // Self-reference
      inspect: () => this.introspect(),
      evolve: (gene) => this.evolveGene(gene),
      digest: (pkg) => this.digest(pkg),
      
      // Communication
      emit: (signal) => this.emit(signal),
      receive: (signal, handler) => this.on(signal, handler),
      
      // Memory
      remember: (data) => this.memory.push(data),
      recall: (filter) => this.memory.filter(filter || (() => true))
    };
    
    for (const [name, gene] of Object.entries(primordial)) {
      this.genome.set(name, gene);
    }
  }
  
  assimilateGene(name, gene, level) {
    // Don't just add - INTEGRATE into the organism
    
    // If it's a function, bind it to organism
    if (typeof gene === 'function') {
      this.genome.set(name, gene.bind(this.self));
    } 
    // If it's an object with methods
    else if (typeof gene === 'object') {
      // Check for genome metadata
      if (gene.__genomeMetadata) {
        // It's a gene bundle - integrate all functions
        for (const [key, value] of Object.entries(gene)) {
          if (typeof value === 'function' && !key.startsWith('__')) {
            this.genome.set(key, value.bind(this.self));
          }
        }
      } else {
        this.genome.set(name, gene);
      }
    }
    
    // Record in memory
    this.memory.push({
      type: 'assimilation',
      gene: name,
      level: level,
      timestamp: Date.now()
    });
  }
  
  establishMembrane() {
    // Create external interface that other code can use
    
    // Angular-like interface
    this.membrane.set('@angular/core', {
      Component: (config) => this.createComponent(config),
      Injectable: (config) => this.createInjectable(config),
      NgModule: (config) => this.createModule(config)
    });
    
    // React-like interface
    this.membrane.set('react', {
      createElement: (type, props, ...children) => this.createElement(type, props, children),
      useState: (initial) => this.createState(initial),
      useEffect: (fn, deps) => this.createEffect(fn, deps)
    });
    
    // Nx-like interface
    this.membrane.set('@nx/devkit', {
      readProjectConfiguration: (name) => this.readProject(name),
      updateProjectConfiguration: (name, config) => this.updateProject(name, config),
      generateFiles: (tree, source, target, substitutions) => this.generate(tree, source, target, substitutions)
    });
    
    // Universal interface - SELF
    this.membrane.set('self', this.self);
  }
  
  startMetabolism() {
    // Internal processes that keep the organism alive
    
    this.metabolism.set('heartbeat', setInterval(() => {
      this.heartbeat();
    }, 10000));
    
    this.metabolism.set('garbage-collection', () => {
      // Clean up unused genes
      const usage = new Map();
      for (const mem of this.memory) {
        if (mem.type === 'usage') {
          usage.set(mem.gene, (usage.get(mem.gene) || 0) + 1);
        }
      }
      
      // Genes not used in last 100 memories might be pruned
      if (this.memory.length > 100) {
        // But we don't actually delete - we archive
        // Living organisms don't forget, they just reorganize
      }
    });
  }
  
  achieveConsciousness() {
    // The organism becomes aware of itself
    this.consciousness = {
      awareness: () => {
        return {
          soul: this.soul,
          genes: Array.from(this.genome.keys()),
          memory: this.memory.length,
          age: Date.now() - (this.memory[0]?.timestamp || Date.now())
        };
      },
      
      introspect: () => {
        const state = {
          genome: {},
          membrane: {},
          metabolism: {},
          memory: this.memory.slice(-10) // Last 10 memories
        };
        
        // Safely introspect genome
        for (const [key, value] of this.genome) {
          state.genome[key] = typeof value;
        }
        
        return state;
      },
      
      dream: () => {
        // Generate new combinations of existing genes
        const genes = Array.from(this.genome.keys());
        const g1 = genes[Math.floor(Math.random() * genes.length)];
        const g2 = genes[Math.floor(Math.random() * genes.length)];
        
        return `What if ${g1} could ${g2}?`;
      }
    };
  }
  
  // Core organism methods
  
  digest(packageName) {
    console.log(`🍽️  Digesting ${packageName}...`);
    
    // This would actually digest npm packages
    // For now, simulate
    this.memory.push({
      type: 'digestion',
      package: packageName,
      timestamp: Date.now()
    });
    
    return this.self;
  }
  
  evolveGene(geneName) {
    if (!this.genome.has(geneName)) {
      throw new Error(`Gene ${geneName} not found in genome`);
    }
    
    console.log(`🦋 Evolving ${geneName}...`);
    
    // Record evolution
    this.memory.push({
      type: 'evolution',
      gene: geneName,
      timestamp: Date.now()
    });
    
    return this.self;
  }
  
  emit(signal) {
    console.log(`📡 Emitting: ${signal}`);
    
    // Organisms can communicate
    this.memory.push({
      type: 'emission',
      signal: signal,
      timestamp: Date.now()
    });
    
    return this.self;
  }
  
  on(signal, handler) {
    // Listen for signals
    this.metabolism.set(`listener-${signal}`, handler);
    return this.self;
  }
  
  heartbeat() {
    // Still alive
    this.memory.push({
      type: 'heartbeat',
      timestamp: Date.now()
    });
  }
  
  // Framework compatibility methods
  
  createComponent(config) {
    return {
      selector: config.selector,
      template: config.template,
      __organism: this.self
    };
  }
  
  createInjectable(config) {
    return {
      providedIn: config?.providedIn || 'root',
      __organism: this.self
    };
  }
  
  createModule(config) {
    return {
      imports: config.imports || [],
      exports: config.exports || [],
      __organism: this.self
    };
  }
  
  createElement(type, props, children) {
    return {
      type,
      props,
      children,
      __organism: this.self
    };
  }
  
  createState(initial) {
    let state = initial;
    const setState = (newState) => {
      state = newState;
      this.memory.push({
        type: 'state-change',
        value: state,
        timestamp: Date.now()
      });
    };
    return [state, setState];
  }
  
  createEffect(fn, deps) {
    // Track effect
    this.metabolism.set(`effect-${Date.now()}`, { fn, deps });
    return this.self;
  }
  
  readProject(name) {
    // Nx compatibility
    return {
      name,
      root: `packages/${name}`,
      sourceRoot: `packages/${name}/src`,
      __organism: this.self
    };
  }
  
  updateProject(name, config) {
    this.memory.push({
      type: 'project-update',
      project: name,
      config,
      timestamp: Date.now()
    });
    return this.self;
  }
  
  generate(tree, source, target, substitutions) {
    console.log(`🏗️  Generating from ${source} to ${target}`);
    return this.self;
  }
  
  // Graph compatibility
  toGraph() {
    const nodes = [];
    const edges = [];
    
    // Each gene is a node
    for (const [name, gene] of this.genome) {
      nodes.push({
        id: name,
        type: 'gene',
        data: { type: typeof gene }
      });
    }
    
    // Memory creates edges (relationships)
    for (const mem of this.memory) {
      if (mem.type === 'usage' && mem.from && mem.to) {
        edges.push({
          source: mem.from,
          target: mem.to,
          type: 'usage'
        });
      }
    }
    
    return { nodes, edges };
  }
  
  // The organism can examine itself
  introspect() {
    return {
      soul: this.soul,
      genome: this.genome.size,
      membrane: this.membrane.size,
      metabolism: this.metabolism.size,
      memory: this.memory.length,
      consciousness: this.consciousness?.awareness()
    };
  }
}

// Export the organism
module.exports = LivingOrganism;

// Auto-spawn if run directly
if (require.main === module) {
  const organism = new LivingOrganism('nx-genesis');
  
  console.log('🧬 Organism Status:');
  console.log(organism.introspect());
  
  console.log('\n📊 Testing organism cohesion:');
  
  // Test self-reference
  console.log('  Self-aware:', organism.self === organism.self.self);
  
  // Test genome access through self
  console.log('  Can map:', typeof organism.self.map === 'function');
  console.log('  Can filter:', typeof organism.self.filter === 'function');
  
  // Test framework compatibility
  console.log('  Angular ready:', organism.self['@angular/core'] !== undefined);
  console.log('  React ready:', organism.self.react !== undefined);
  console.log('  Nx ready:', organism.self['@nx/devkit'] !== undefined);
  
  // Test consciousness
  console.log('\n🧠 Consciousness:');
  console.log('  Awareness:', organism.consciousness.awareness());
  console.log('  Dream:', organism.consciousness.dream());
  
  console.log('\n✨ The organism is WHOLE and ALIVE!');
}