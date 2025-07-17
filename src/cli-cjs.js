#!/usr/bin/env node

/**
 * CommonJS entry point for binary packaging
 * This file is used by PKG to create standalone binaries
 */

// Import the ES module CLI
import('./cli.js').then(() => {
  // CLI execution happens during import
}).catch(error => {
  console.error('Failed to start KiroCLI:', error);
  process.exit(1);
});