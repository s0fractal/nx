/**
 * ESLint configuration for Lambda-only imports
 * Ensures all code stays within the lambda closure
 */

module.exports = {
  plugins: ['lambda-closure'],
  rules: {
    'lambda-closure/transitive-lambda': 'error',
    'lambda-closure/no-direct-node-imports': 'warn',
    'lambda-closure/exotic-must-be-marked': 'error'
  },
  overrides: [
    {
      // Lambda core files can import anything
      files: ['lambda-core/**/*.ts', 'lambda-core/**/*.js'],
      rules: {
        'lambda-closure/transitive-lambda': 'off'
      }
    },
    {
      // Membrane files can use exotic
      files: ['**/membrane.ts', '**/membrane.js'],
      rules: {
        'lambda-closure/exotic-must-be-marked': 'off'
      }
    }
  ]
};

// Custom plugin definition
const lambdaClosurePlugin = {
  rules: {
    /**
     * Ensure all exports transitively depend on lambda
     */
    'transitive-lambda': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Ensures all public exports are within lambda closure',
          category: 'Lambda Closure',
          recommended: true
        },
        messages: {
          missingLambda: 'Module exports public API but does not import from lambda core',
          exoticNotMarked: 'Exotic code must be explicitly marked with @exotic comment or exotic() wrapper'
        }
      },
      create(context) {
        let hasLambdaImport = false;
        let hasExoticMarker = false;
        let hasPublicExport = false;
        
        return {
          ImportDeclaration(node) {
            const source = node.source.value;
            if (typeof source === 'string') {
              if (source.includes('lambda-core') || 
                  source.includes('lambda/') ||
                  source.includes('/kit')) {
                hasLambdaImport = true;
              }
            }
          },
          
          ExportNamedDeclaration() {
            hasPublicExport = true;
          },
          
          ExportDefaultDeclaration() {
            hasPublicExport = true;
          },
          
          Program(node) {
            // Check for @exotic marker in comments
            const sourceCode = context.getSourceCode();
            const comments = sourceCode.getAllComments();
            
            hasExoticMarker = comments.some(comment => 
              comment.value.includes('@exotic')
            );
          },
          
          'Program:exit'(node) {
            if (hasPublicExport && !hasLambdaImport && !hasExoticMarker) {
              context.report({
                node,
                messageId: 'missingLambda'
              });
            }
          }
        };
      }
    },
    
    /**
     * Prevent direct node imports (should go through membrane)
     */
    'no-direct-node-imports': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'Discourages direct node imports, prefer lambda wrappers',
          category: 'Lambda Closure',
          recommended: false
        },
        messages: {
          directNodeImport: 'Direct node import detected. Consider using lambda wrapper or marking as @exotic'
        }
      },
      create(context) {
        return {
          ImportDeclaration(node) {
            const source = node.source.value;
            if (typeof source === 'string') {
              if (source.startsWith('node:') || 
                  source === 'fs' || 
                  source === 'path' || 
                  source === 'crypto' ||
                  source === 'http' ||
                  source === 'https') {
                
                // Check if file has @exotic marker
                const sourceCode = context.getSourceCode();
                const comments = sourceCode.getAllComments();
                const hasExotic = comments.some(c => c.value.includes('@exotic'));
                
                if (!hasExotic) {
                  context.report({
                    node,
                    messageId: 'directNodeImport'
                  });
                }
              }
            }
          }
        };
      }
    },
    
    /**
     * Ensure exotic functions are properly marked
     */
    'exotic-must-be-marked': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Exotic functions must be wrapped with exotic() or marked with @exotic',
          category: 'Lambda Closure',
          recommended: true
        },
        messages: {
          unmarkedExotic: 'Function "{{name}}" appears to be exotic but is not marked. Use exotic() wrapper or @exotic comment'
        }
      },
      create(context) {
        return {
          FunctionDeclaration(node) {
            if (!node.id) return;
            
            const functionName = node.id.name;
            const sourceCode = context.getSourceCode();
            const functionCode = sourceCode.getText(node);
            
            // Check for side effects
            const hasSideEffects = 
              functionCode.includes('console.') ||
              functionCode.includes('process.') ||
              functionCode.includes('fs.') ||
              functionCode.includes('window.') ||
              functionCode.includes('document.') ||
              functionCode.includes('Date.now') ||
              functionCode.includes('Math.random');
            
            if (hasSideEffects) {
              // Check if properly marked
              const comments = sourceCode.getCommentsInside(node);
              const hasExoticComment = comments.some(c => 
                c.value.includes('@exotic')
              );
              
              // Check if wrapped in exotic()
              const parent = node.parent;
              const isWrapped = parent && 
                parent.type === 'CallExpression' &&
                parent.callee.name === 'exotic';
              
              if (!hasExoticComment && !isWrapped) {
                context.report({
                  node,
                  messageId: 'unmarkedExotic',
                  data: { name: functionName }
                });
              }
            }
          },
          
          ArrowFunctionExpression(node) {
            const sourceCode = context.getSourceCode();
            const functionCode = sourceCode.getText(node);
            
            // Similar checks for arrow functions
            const hasSideEffects = 
              functionCode.includes('console.') ||
              functionCode.includes('process.');
            
            if (hasSideEffects) {
              const parent = node.parent;
              const isWrapped = parent && 
                parent.type === 'CallExpression' &&
                parent.callee.name === 'exotic';
              
              if (!isWrapped) {
                // Check for @exotic in variable declaration
                const varDecl = parent && parent.type === 'VariableDeclarator' ? parent : null;
                if (varDecl) {
                  const comments = sourceCode.getCommentsInside(varDecl);
                  const hasExoticComment = comments.some(c => 
                    c.value.includes('@exotic')
                  );
                  
                  if (!hasExoticComment) {
                    context.report({
                      node,
                      messageId: 'unmarkedExotic',
                      data: { name: varDecl.id?.name || 'anonymous' }
                    });
                  }
                }
              }
            }
          }
        };
      }
    }
  }
};

// Export plugin configuration
module.exports.plugins = {
  'lambda-closure': lambdaClosurePlugin
};