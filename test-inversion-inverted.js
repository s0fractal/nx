
/**
 * INVERTED MODULE - All pure functions exposed as genes
 * Generated from: test-inversion.js
 * 
 * This demonstrates the inversion:
 * - No private functions
 * - Everything pure is public
 * - Privacy through context, not encapsulation
 */


// Gene: validateInput (pdd2aa4872048)
function validateInput(data) {
  return data && typeof data === 'object';
}
exports.validateInput = validateInput;


// Gene: normalizeData (p235994327dd7)
function normalizeData(data) {
  return Object.keys(data).reduce((acc, key) => {
    acc[key.toLowerCase()] = data[key];
    return acc;
  }
exports.normalizeData = normalizeData;


// Gene: applyTransform (pc60380167310)
function applyTransform(value, factor = 1) {
  return value * factor;
}
exports.applyTransform = applyTransform;


// Gene: compose (p5527fd0f85ce)
function compose(f, g) {
  return x => f(g(x));
}
exports.compose = compose;


// Gene: processData (p60a7edf47db7)
function processData(input) {
  if (!validateInput(input)) {
    return null;
  }
exports.processData = processData;


// Export genome metadata
exports.__genome = {"total":5,"exposed":5,"hidden":0};
exports.__lambda = 'compose(validateInput, normalizeData, applyTransform, compose, processData)';
exports.__proof = {"type":"state","truth":"All pure functions are public genes","pHash":"pfe685a19166d"};
