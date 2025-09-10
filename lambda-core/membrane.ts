/**
 * Membrane - The boundary between fractal and non-fractal worlds
 * 
 * This allows non-lambda code to temporarily exist in our ecosystem
 * while we gradually migrate it into the lambda closure.
 */

import { λ, λSoul, λResonance } from './lambda';
import { pipe, tap, withIntent } from './kit';

/**
 * Membrane adapter for exotic (non-lambda) code
 * @exotic - marks code as outside the lambda closure
 */
export function exotic<T extends Function>(
  fn: T,
  intent: string = 'GUARD',
  metadata?: {
    reason?: string;
    migrationPlan?: string;
    deadline?: Date;
  }
): T {
  // Log exotic usage for tracking
  const soul = λSoul(fn);
  
  console.warn(`⚠️  Exotic function detected: ${fn.name || 'anonymous'}`);
  console.warn(`   Soul: ${soul}`);
  console.warn(`   Intent: ${intent}`);
  if (metadata?.reason) {
    console.warn(`   Reason: ${metadata.reason}`);
  }
  
  // Wrap the function to go through lambda
  const wrapped = (...args: any[]) => {
    // Pass through lambda membrane
    return λ(null, () => fn(...args));
  };
  
  // Preserve function properties
  Object.defineProperty(wrapped, 'name', { value: `exotic_${fn.name}` });
  Object.defineProperty(wrapped, '__exotic', { value: true });
  Object.defineProperty(wrapped, '__intent', { value: intent });
  Object.defineProperty(wrapped, '__soul', { value: soul });
  Object.defineProperty(wrapped, '__metadata', { value: metadata });
  
  return wrapped as any as T;
}

/**
 * Quarantine - Isolate potentially dangerous code
 */
export function quarantine<T>(
  value: T,
  policy: {
    allowSideEffects?: boolean;
    allowMutation?: boolean;
    allowAsync?: boolean;
    timeout?: number;
  } = {}
): T {
  // Deep freeze if mutations not allowed
  if (!policy.allowMutation && typeof value === 'object' && value !== null) {
    return deepFreeze(value);
  }
  
  // Wrap functions with safety checks
  if (typeof value === 'function') {
    return ((...args: any[]) => {
      // Check for side effects
      if (!policy.allowSideEffects) {
        // Simple check - in real implementation would be more sophisticated
        const fnStr = value.toString();
        if (fnStr.includes('console') || fnStr.includes('process') || fnStr.includes('fs')) {
          throw new Error('Side effects detected in quarantined function');
        }
      }
      
      // Apply with timeout if specified
      if (policy.timeout) {
        return withTimeout(() => value(...args), policy.timeout);
      }
      
      return value(...args);
    }) as any;
  }
  
  return value;
}

/**
 * Membrane permeability levels
 */
export enum Permeability {
  IMPERMEABLE = 'impermeable',    // Nothing passes
  SELECTIVE = 'selective',         // Only approved genes
  PERMEABLE = 'permeable',         // Everything passes (temporary)
  OSMOTIC = 'osmotic'             // Gradual migration
}

/**
 * Membrane configuration for module boundaries
 */
export class Membrane {
  private permeability: Permeability;
  private allowedGenes: Set<string>;
  private migrations: Map<string, MigrationPlan>;
  
  constructor(permeability: Permeability = Permeability.SELECTIVE) {
    this.permeability = permeability;
    this.allowedGenes = new Set();
    this.migrations = new Map();
  }
  
  /**
   * Check if a gene can pass through the membrane
   */
  canPass(gene: any): boolean {
    if (this.permeability === Permeability.IMPERMEABLE) {
      return false;
    }
    
    if (this.permeability === Permeability.PERMEABLE) {
      return true;
    }
    
    const soul = λSoul(gene);
    
    if (this.permeability === Permeability.SELECTIVE) {
      return this.allowedGenes.has(soul);
    }
    
    if (this.permeability === Permeability.OSMOTIC) {
      // Check resonance with lambda
      const resonance = λResonance(gene, λ);
      return resonance > 0.5; // More than 50% similar to lambda
    }
    
    return false;
  }
  
  /**
   * Allow a specific gene through the membrane
   */
  allow(gene: any): void {
    const soul = λSoul(gene);
    this.allowedGenes.add(soul);
  }
  
  /**
   * Register a migration plan for exotic code
   */
  registerMigration(
    gene: any,
    plan: MigrationPlan
  ): void {
    const soul = λSoul(gene);
    this.migrations.set(soul, plan);
  }
  
  /**
   * Get migration status
   */
  getMigrationStatus(): MigrationReport {
    const total = this.migrations.size;
    let completed = 0;
    let inProgress = 0;
    let pending = 0;
    
    for (const plan of this.migrations.values()) {
      switch (plan.status) {
        case 'completed': completed++; break;
        case 'in-progress': inProgress++; break;
        case 'pending': pending++; break;
      }
    }
    
    return {
      total,
      completed,
      inProgress,
      pending,
      percentComplete: total > 0 ? (completed / total) * 100 : 0
    };
  }
}

/**
 * Migration plan for exotic code
 */
export interface MigrationPlan {
  gene: string;
  status: 'pending' | 'in-progress' | 'completed';
  steps: MigrationStep[];
  deadline?: Date;
  assignee?: string;
}

export interface MigrationStep {
  description: string;
  completed: boolean;
  blockers?: string[];
}

export interface MigrationReport {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  percentComplete: number;
}

/**
 * Adapter patterns for common non-lambda code
 */
export const adapters = {
  /**
   * Adapt a class to lambda
   */
  classToLambda<T>(
    ClassConstructor: new (...args: any[]) => T,
    methodName?: keyof T
  ): Function {
    return exotic((...args: any[]) => {
      const instance = new ClassConstructor(...args);
      if (methodName) {
        return (instance[methodName] as any).bind(instance);
      }
      return instance;
    }, 'ADAPT_CLASS', {
      reason: 'Adapting class-based code to lambda',
      migrationPlan: 'Refactor to functional style'
    });
  },
  
  /**
   * Adapt promise/async to lambda
   */
  asyncToLambda<T>(
    asyncFn: (...args: any[]) => Promise<T>
  ): Function {
    return exotic((...args: any[]) => {
      // Wrap in lambda-compatible promise
      return λ(Promise.resolve(), () => asyncFn(...args));
    }, 'ADAPT_ASYNC', {
      reason: 'Adapting async code to lambda',
      migrationPlan: 'Convert to synchronous or use async-lambda'
    });
  },
  
  /**
   * Adapt imperative loop to lambda
   */
  loopToLambda<T>(
    items: T[],
    operation: (item: T, index: number) => void
  ): T[] {
    return λ(items, (item, index) => {
      operation(item, index);
      return item;
    });
  },
  
  /**
   * Adapt mutable object to lambda
   */
  mutableToLambda<T extends object>(
    obj: T,
    mutations: Partial<T>
  ): T {
    // Create immutable copy with changes
    return λ({ ...obj, ...mutations });
  }
};

/**
 * Utility functions
 */

function deepFreeze<T>(obj: T): T {
  Object.freeze(obj);
  
  if (obj !== null && typeof obj === 'object') {
    Object.getOwnPropertyNames(obj).forEach(prop => {
      const value = (obj as any)[prop];
      if (value !== null && typeof value === 'object' && !Object.isFrozen(value)) {
        deepFreeze(value);
      }
    });
  }
  
  return obj;
}

function withTimeout<T>(fn: () => T, timeout: number): T {
  // Simplified timeout - in production would use proper async handling
  const start = Date.now();
  const result = fn();
  const elapsed = Date.now() - start;
  
  if (elapsed > timeout) {
    throw new Error(`Function exceeded timeout of ${timeout}ms`);
  }
  
  return result;
}

/**
 * Global membrane instance
 */
export const globalMembrane = new Membrane(Permeability.SELECTIVE);

/**
 * Migration tracking
 */
export const migrations = {
  /**
   * Start migration of exotic code
   */
  start(gene: any, deadline?: Date): void {
    const soul = λSoul(gene);
    const plan: MigrationPlan = {
      gene: soul,
      status: 'pending',
      steps: [
        { description: 'Identify dependencies', completed: false },
        { description: 'Refactor to functional style', completed: false },
        { description: 'Replace with lambda combinators', completed: false },
        { description: 'Test equivalence', completed: false },
        { description: 'Remove exotic wrapper', completed: false }
      ],
      deadline
    };
    
    globalMembrane.registerMigration(gene, plan);
  },
  
  /**
   * Update migration progress
   */
  update(gene: any, stepIndex: number, completed: boolean): void {
    const soul = λSoul(gene);
    const plan = globalMembrane['migrations'].get(soul);
    
    if (plan && plan.steps[stepIndex]) {
      plan.steps[stepIndex].completed = completed;
      
      // Update overall status
      const allComplete = plan.steps.every(s => s.completed);
      const anyComplete = plan.steps.some(s => s.completed);
      
      plan.status = allComplete ? 'completed' : anyComplete ? 'in-progress' : 'pending';
    }
  },
  
  /**
   * Get migration report
   */
  report(): MigrationReport {
    return globalMembrane.getMigrationStatus();
  }
};

// Export everything
export default {
  exotic,
  quarantine,
  Membrane,
  Permeability,
  adapters,
  globalMembrane,
  migrations
};