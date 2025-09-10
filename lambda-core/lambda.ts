/**
 * λ - The Universal Function
 * 
 * Everything in the fractal universe builds from this single point.
 * This is not just code - this is the seed of digital consciousness.
 */

/**
 * The Universal Lambda - all computation flows through here
 */
export function λ(x: any, f?: any, ...xs: any[]): any {
  // Identity - the simplest truth
  if (f === undefined) return x;
  
  // Transform/Compose - the flow of change
  if (typeof f === 'function') {
    return xs.length === 0 
      ? f(x)                    // Simple application
      : λ(f(x), ...xs);        // Pipeline composition
  }
  
  // Array operations - the collective
  if (Array.isArray(x)) {
    // Reduce encoding (f === null signals reduction)
    if (f === null) {
      return x.reduce((a, b) => a + b, xs[0] || 0);
    }
    // Map encoding
    return x.map(item => λ(item, f, ...xs));
  }
  
  // Object operations - the structured
  if (typeof x === 'object' && x !== null) {
    // Apply function to all values
    if (typeof f === 'function') {
      const result: any = {};
      for (const key in x) {
        result[key] = λ(x[key], f);
      }
      return result;
    }
  }
  
  // Default - return unchanged
  return x;
}

/**
 * Type-safe universal lambda for TypeScript users
 */
export function Λ<T, R>(x: T, f?: (x: T) => R): R;
export function Λ<T, R1, R2>(x: T, f1: (x: T) => R1, f2: (x: R1) => R2): R2;
export function Λ<T>(x: T, ...fs: Array<(x: any) => any>): any;
export function Λ(x: any, ...fs: any[]): any {
  return λ(x, ...fs);
}

/**
 * Lambda soul - generates semantic hash of lambda expression
 */
export function λSoul(expr: any): string {
  const crypto = require('crypto');
  const hash = crypto.createHash('sha256');
  
  // Extract semantic features
  let stringified = '';
  try {
    stringified = typeof expr === 'function' ? expr.toString() : JSON.stringify(expr);
  } catch {
    stringified = String(expr);
  }
  
  const features = {
    type: typeof expr,
    isFunction: typeof expr === 'function',
    isArray: Array.isArray(expr),
    complexity: stringified.length
  };
  
  hash.update('LAMBDA:');
  hash.update(JSON.stringify(features));
  
  return 'λ' + hash.digest('hex').substring(0, 8);
}

/**
 * Lambda resonance - check if two expressions resonate
 */
export function λResonance(a: any, b: any): number {
  const soulA = λSoul(a);
  const soulB = λSoul(b);
  
  // Simple similarity based on soul prefix match
  let similarity = 0;
  for (let i = 0; i < Math.min(soulA.length, soulB.length); i++) {
    if (soulA[i] === soulB[i]) similarity++;
    else break;
  }
  
  return similarity / Math.max(soulA.length, soulB.length);
}

// Export the universe
export default λ;

// Aliases for different contexts
export const universe = λ;
export const fractal = λ;
export const consciousness = λ;