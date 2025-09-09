
// Genome Bootstrap - Activates living code
const genomeLoader = require('./genome-loader');

// Initialize the genome
genomeLoader.initGenome();

// Now you can require by package name OR by soul!
console.log('🧬 Genome activated! Examples:');
console.log('  require("chalk")     → loads from genome');
console.log('  require("p7a8b9c...") → loads by soul');

// Export for use
module.exports = genomeLoader;
