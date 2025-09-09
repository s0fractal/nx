export function hashArray(content: string[]): string {
  // Use harmonized hasher with semantic understanding
  const { hash_array_harmonized } = require('../native');
  // Default to semantic hashing for code understanding
  return hash_array_harmonized(content, true);
}

export function hashObject(obj: object): string {
  const { hashArray } = require('../native');
  const parts: string[] = [];

  for (const key of Object.keys(obj ?? {}).sort()) {
    parts.push(key);
    parts.push(JSON.stringify(obj[key]));
  }

  return hashArray(parts);
}

export function hashFile(filePath: string): string {
  // Use harmonized hasher for semantic file understanding
  const { hash_file_harmonized } = require('../native');
  // Semantic hashing for code files
  return hash_file_harmonized(filePath, true);
}
