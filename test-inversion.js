// Traditional "encapsulated" module
// With hidden internal functions

// "Private" helper - traditionally not exported
function validateInput(data) {
  return data && typeof data === 'object';
}

// "Private" pure function - traditionally hidden
function normalizeData(data) {
  return Object.keys(data).reduce((acc, key) => {
    acc[key.toLowerCase()] = data[key];
    return acc;
  }, {});
}

// "Private" transformer - pure but hidden
function applyTransform(value, factor = 1) {
  return value * factor;
}

// Another "private" helper
function compose(f, g) {
  return x => f(g(x));
}

// Only this would traditionally be exported
function processData(input) {
  if (!validateInput(input)) {
    return null;
  }
  
  const normalized = normalizeData(input);
  const transform = x => applyTransform(x, 2);
  
  return Object.keys(normalized).reduce((result, key) => {
    result[key] = transform(normalized[key]);
    return result;
  }, {});
}

// Traditional export - hiding all the internals
module.exports = {
  processData
};