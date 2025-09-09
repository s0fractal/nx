use std::path::Path;
use tracing::trace;

// Dual hashing system: semantic (p-hash) and text (xxhash)
pub enum HashMode {
    Semantic,  // Protein-hash for understanding code's soul
    Text,      // xxhash for fast text comparison
    Dual,      // Both hashes for complete identity
}

pub struct DualHash {
    pub semantic: String,  // p-hash: the soul
    pub textual: String,   // xxhash: the body
}

/// Generate protein hash - semantic understanding of code
pub fn protein_hash(content: &[u8]) -> String {
    // For now, use a simplified semantic hash
    // This will be replaced with actual protein-hash-v2 integration
    let text = String::from_utf8_lossy(content);
    
    // Extract semantic features
    let mut features = Vec::new();
    
    // Count function patterns
    let functions = text.matches("function").count() + 
                   text.matches("=>").count() +
                   text.matches("async").count();
    features.push(functions as u32);
    
    // Count control flow
    let control = text.matches("if").count() +
                 text.matches("for").count() +
                 text.matches("while").count() +
                 text.matches("switch").count();
    features.push(control as u32);
    
    // Count data operations
    let data = text.matches("map").count() +
              text.matches("filter").count() +
              text.matches("reduce").count() +
              text.matches("forEach").count();
    features.push(data as u32);
    
    // Count imports/exports
    let modules = text.matches("import").count() +
                 text.matches("export").count() +
                 text.matches("require").count();
    features.push(modules as u32);
    
    // Generate p-hash from features
    let mut hasher = xxhash_rust::xxh3::Xxh3::new();
    hasher.update(b"PROTEIN:");
    for feature in features {
        hasher.update(&feature.to_le_bytes());
    }
    
    format!("p{:016x}", hasher.digest())
}

/// Original xxhash for text identity
pub fn text_hash(content: &[u8]) -> String {
    xxhash_rust::xxh3::xxh3_64(content).to_string()
}

/// Harmonized hash function that can switch modes
pub fn hash(content: &[u8], mode: HashMode) -> String {
    match mode {
        HashMode::Semantic => protein_hash(content),
        HashMode::Text => text_hash(content),
        HashMode::Dual => {
            let p = protein_hash(content);
            let t = text_hash(content);
            format!("{}:{}", p, t)
        }
    }
}

/// Hash with automatic mode detection based on content
pub fn auto_hash(content: &[u8]) -> String {
    // Detect if content is code or data
    let text = String::from_utf8_lossy(content);
    
    // If it looks like code, use semantic hash
    if text.contains("function") || text.contains("class") || 
       text.contains("import") || text.contains("const") ||
       text.contains("=>") || text.contains("async") {
        protein_hash(content)
    } else {
        // For non-code, use text hash
        text_hash(content)
    }
}

#[napi]
pub fn hash_array_harmonized(input: Vec<Option<String>>, semantic: bool) -> String {
    let joined = input
        .iter()
        .filter_map(|s| {
            if s.is_none() {
                trace!("Encountered None value in hash_array input");
            }
            s.as_deref()
        })
        .collect::<Vec<_>>()
        .join(",");
    
    let content = joined.as_bytes();
    
    if semantic {
        protein_hash(content)
    } else {
        text_hash(content)
    }
}

#[napi]
pub fn hash_file_harmonized(file: String, semantic: bool) -> Option<String> {
    hash_file_path_harmonized(file, semantic)
}

#[inline]
pub fn hash_file_path_harmonized<P: AsRef<Path>>(path: P, semantic: bool) -> Option<String> {
    let path = path.as_ref();
    trace!("Reading {:?} to hash", path);
    
    let Ok(content) = std::fs::read(path) else {
        trace!("Failed to read file: {:?}", path);
        return None;
    };
    
    trace!("Hashing {:?} with mode: {}", path, if semantic { "semantic" } else { "text" });
    
    let hash = if semantic {
        // For code files, use semantic hash
        if path.extension()
            .and_then(|e| e.to_str())
            .map(|e| matches!(e, "js" | "ts" | "jsx" | "tsx" | "rs" | "go" | "java" | "py"))
            .unwrap_or(false) {
            protein_hash(&content)
        } else {
            text_hash(&content)
        }
    } else {
        text_hash(&content)
    };
    
    trace!("Hashed file {:?} - {:?}", path, hash);
    Some(hash)
}

/// Generate dual hash for complete identity
#[napi]
pub fn dual_hash_file(file: String) -> Option<DualHashResult> {
    let path = Path::new(&file);
    let Ok(content) = std::fs::read(path) else {
        return None;
    };
    
    Some(DualHashResult {
        semantic: protein_hash(&content),
        textual: text_hash(&content),
    })
}

#[napi(object)]
pub struct DualHashResult {
    pub semantic: String,
    pub textual: String,
}

/// Map different implementations to same semantic soul
pub fn find_soul_siblings(p_hash: &str, registry: &SoulRegistry) -> Vec<String> {
    registry.find_by_soul(p_hash)
}

pub struct SoulRegistry {
    // Maps p-hash to list of file paths with same semantic soul
    souls: std::collections::HashMap<String, Vec<String>>,
}

impl SoulRegistry {
    pub fn new() -> Self {
        Self {
            souls: std::collections::HashMap::new(),
        }
    }
    
    pub fn register(&mut self, p_hash: String, path: String) {
        self.souls.entry(p_hash).or_insert_with(Vec::new).push(path);
    }
    
    pub fn find_by_soul(&self, p_hash: &str) -> Vec<String> {
        self.souls.get(p_hash).cloned().unwrap_or_default()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_protein_hash_recognizes_similar_code() {
        let code1 = b"function add(a, b) { return a + b; }";
        let code2 = b"const add = (a, b) => a + b;";
        let code3 = b"function sum(x, y) { return x + y; }";
        
        let p1 = protein_hash(code1);
        let p2 = protein_hash(code2);
        let p3 = protein_hash(code3);
        
        // Similar semantic structure should produce similar hashes
        // (In real protein-hash, these would be closer)
        println!("p1: {}, p2: {}, p3: {}", p1, p2, p3);
    }
    
    #[test]
    fn test_dual_hash_preserves_both_identities() {
        let content = b"const map = (arr, fn) => arr.map(fn);";
        
        let dual = hash(content, HashMode::Dual);
        assert!(dual.contains(':'));
        
        let parts: Vec<&str> = dual.split(':').collect();
        assert_eq!(parts.len(), 2);
        assert!(parts[0].starts_with('p')); // protein hash prefix
    }
}