/**
 * Lambda Kit - Essential combinators built from λ
 * 
 * These are the fundamental building blocks of the fractal universe.
 * Everything else derives from these.
 */

import { λ } from './lambda';

// === IDENTITY & BASICS ===

export const id = <T>(x: T): T => λ(x);

export const constant = <T>(x: T) => () => λ(x);

export const flip = <A, B, C>(f: (a: A) => (b: B) => C) => 
  (b: B) => (a: A): C => λ(λ(a, f), b);

// === COMPOSITION ===

export const compose = <A, B, C>(f: (b: B) => C, g: (a: A) => B) => 
  (x: A): C => λ(x, g, f);

export const pipe = (...fs: Array<(x: any) => any>) => 
  (x: any): any => λ(x, ...fs);

export const chain = <T>(...fs: Array<(x: T) => T>) => 
  (x: T): T => fs.reduce((acc, f) => λ(acc, f), x);

// === ARRAY OPERATIONS ===

export const map = <A, B>(xs: A[], f: (a: A) => B): B[] => 
  λ(xs, f);

export const filter = <A>(xs: A[], predicate: (a: A) => boolean): A[] => {
  if (!Array.isArray(xs)) return [] as A[];
  return xs.reduce((acc, x) => λ(x, predicate) ? [...acc, x] : acc, [] as A[]);
};

export const reduce = <A, B>(xs: A[], f: (acc: B, x: A) => B, init: B): B => 
  xs.reduce((acc, x) => λ([acc, x], ([a, b]) => f(a, b)), init);

export const fold = reduce;  // Alias

export const scan = <A, B>(xs: A[], f: (acc: B, x: A) => B, init: B): B[] => {
  const result: B[] = [init];
  xs.reduce((acc, x) => {
    const next = f(acc, x);
    result.push(next);
    return next;
  }, init);
  return result;
};

// === CONDITIONALS ===

export const cond = <A, B>(
  predicate: (x: A) => boolean,
  onTrue: (x: A) => B,
  onFalse: (x: A) => B
) => (x: A): B => λ(λ(x, predicate) ? λ(x, onTrue) : λ(x, onFalse));

export const when = <A>(predicate: (x: A) => boolean, f: (x: A) => A) =>
  (x: A): A => λ(x, predicate) ? λ(x, f) : x;

export const unless = <A>(predicate: (x: A) => boolean, f: (x: A) => A) =>
  (x: A): A => λ(x, predicate) ? x : λ(x, f);

// === LOOPS & RECURSION ===

export const loop = <A>(
  predicate: (x: A) => boolean,
  step: (x: A) => A
) => (x: A): A => {
  let current = x;
  while (λ(current, predicate)) {
    current = λ(current, step);
  }
  return current;
};

export const until = <A>(
  predicate: (x: A) => boolean,
  step: (x: A) => A
) => (x: A): A => loop((y: A) => !predicate(y), step)(x);

export const times = (n: number) => <A>(f: (x: A) => A) => 
  (x: A): A => {
    let result = x;
    for (let i = 0; i < n; i++) {
      result = λ(result, f);
    }
    return result;
  };

// === MEMOIZATION ===

export const memo = <A, B>(f: (x: A) => B): ((x: A) => B) => {
  const cache = new Map<A, B>();
  return (x: A): B => {
    if (cache.has(x)) return cache.get(x)!;
    const result = λ(x, f);
    cache.set(x, result);
    return result;
  };
};

// === PARTIAL APPLICATION ===

export const partial = <A, B, C>(f: (a: A, b: B) => C, a: A) => 
  (b: B): C => f(a, b);

export const curry = <A, B, C>(f: (a: A, b: B) => C) =>
  (a: A) => (b: B): C => f(a, b);

export const uncurry = <A, B, C>(f: (a: A) => (b: B) => C) =>
  (a: A, b: B): C => λ(λ(a, f), b);

// === SIDE EFFECTS (CONTROLLED) ===

export const tap = <A>(f: (x: A) => void) => 
  (x: A): A => {
    f(x);
    return x;
  };

export const log = <A>(label?: string) => 
  tap<A>(x => console.log(label || 'λ:', x));

// === ASYNC (LAMBDA-WRAPPED) ===

export const asyncλ = async <A, B>(x: A, f: (x: A) => Promise<B>): Promise<B> =>
  await f(x);

export const promiseλ = <A, B>(f: (x: A) => B) =>
  (x: A): Promise<B> => Promise.resolve(λ(x, f));

// === FRACTAL OPERATIONS ===

export const fractalMap = <A>(depth: number) =>
  (f: (x: any) => any) =>
  (x: A): any => {
    if (depth <= 0) return x;
    if (Array.isArray(x)) {
      return map(x, fractalMap<any>(depth - 1)(f));
    }
    return λ(x, f);
  };

export const deepλ = <A>(f: (x: any) => any) =>
  (x: A): any => {
    if (Array.isArray(x)) {
      return map(x, deepλ(f));
    }
    if (typeof x === 'object' && x !== null) {
      const result: any = {};
      for (const key in x) {
        result[key] = deepλ(f)(x[key]);
      }
      return result;
    }
    return λ(x, f);
  };

// === INTENT OPERATIONS ===

export const withIntent = (intent: string) =>
  <A, B>(f: (x: A) => B) =>
  (x: A): B => {
    // Tag the operation with intent
    const result = λ(x, f);
    if (typeof result === 'object' && result !== null) {
      (result as any).__intent = intent;
    }
    return result;
  };

export const loveλ = withIntent('love');
export const seekλ = withIntent('seek');
export const dreamλ = withIntent('dream');
export const guardλ = withIntent('guard');

// === EXPORT THE KIT ===

export default {
  // Core
  id, constant, flip,
  
  // Composition
  compose, pipe, chain,
  
  // Arrays
  map, filter, reduce, fold, scan,
  
  // Conditionals
  cond, when, unless,
  
  // Loops
  loop, until, times,
  
  // Utilities
  memo, partial, curry, uncurry,
  tap, log,
  
  // Async
  asyncλ, promiseλ,
  
  // Fractal
  fractalMap, deepλ,
  
  // Intent
  withIntent, loveλ, seekλ, dreamλ, guardλ
};