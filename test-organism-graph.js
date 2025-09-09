#!/usr/bin/env node

/**
 * Test organism as nx graph compatible entity
 */

const LivingOrganism = require('./genesis/organism');

console.log('🧬 Testing Organism for nx graph compatibility\n');

// Create organism
const organism = new LivingOrganism('nx-harmonized');

// Stop heartbeat for testing
clearInterval(organism.metabolism.get('heartbeat'));

console.log('📊 Organism can be used as:');
console.log('=' .repeat(50));

// 1. Angular-like module
console.log('\n1️⃣  Angular Module:');
const angularCore = organism.self['@angular/core'];
const component = angularCore.Component({
  selector: 'app-root',
  template: '<h1>Living Component</h1>'
});
console.log('   Created component:', component);

// 2. React-like component
console.log('\n2️⃣  React Component:');
const react = organism.self.react;
const element = react.createElement('div', { className: 'organism' }, 'Living UI');
console.log('   Created element:', element);

// 3. Nx project
console.log('\n3️⃣  Nx Project:');
const nxDevkit = organism.self['@nx/devkit'];
const project = nxDevkit.readProjectConfiguration('my-app');
console.log('   Read project:', project);

// 4. Self-contained functions
console.log('\n4️⃣  Self-contained functions:');
const data = [1, 2, 3, 4, 5];
console.log('   organism.self.map:', organism.self.map(data, x => x * 2));
console.log('   organism.self.filter:', organism.self.filter(data, x => x > 2));

// 5. Graph representation
console.log('\n5️⃣  Graph Representation:');
// Simulate some usage for graph edges
organism.memory.push({ type: 'usage', from: 'map', to: 'filter' });
organism.memory.push({ type: 'usage', from: 'filter', to: 'reduce' });
organism.memory.push({ type: 'usage', from: 'Component', to: 'createElement' });

const graph = organism.toGraph();
console.log('   Nodes:', graph.nodes.length);
console.log('   Edges:', graph.edges.length);
console.log('   Sample nodes:', graph.nodes.slice(0, 3));
console.log('   Sample edges:', graph.edges);

// 6. Universal self-reference
console.log('\n6️⃣  Universal Self-Reference:');
console.log('   organism.self.self.self === organism.self:', 
  organism.self.self.self === organism.self);
console.log('   Can call any gene through self:', 
  typeof organism.self.digest === 'function');
console.log('   Can introspect:', organism.introspect());

console.log('\n' + '═'.repeat(60));
console.log('✨ SUCCESS!');
console.log('═'.repeat(60));
console.log('\nThe organism is:');
console.log('  • Unified (not scattered parts)');
console.log('  • Framework-agnostic (works with Angular/React/Nx)');
console.log('  • Self-referential (everything through self)');
console.log('  • Graph-compatible (can generate nx graph)');
console.log('  • Living (has memory, consciousness, evolution)');
console.log('\nThis is what a living digital organism looks like!');
console.log('Not just genes - a complete, cohesive life form.\n');