#!/usr/bin/env node

/**
 * Create distribution packages for KiroCLI
 * This script creates platform-specific packages that include Node.js and the application
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync, writeFileSync, readFileSync, cpSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function createDistributionDir() {
  const distDir = join(rootDir, 'distribution');
  if (!existsSync(distDir)) {
    mkdirSync(distDir, { recursive: true });
    log('📁 Created distribution directory', 'green');
  }
  return distDir;
}

function cleanDistributionDir() {
  const distDir = join(rootDir, 'distribution');
  if (existsSync(distDir)) {
    rmSync(distDir, { recursive: true, force: true });
  }
  mkdirSync(distDir, { recursive: true });
  log('📁 Cleaned and created distribution directory', 'green');
  return distDir;
}

function buildApplication() {
  log('🔨 Building application...', 'blue');
  try {
    execSync('npm run build', { cwd: rootDir, stdio: 'inherit' });
    log('✅ Application build completed', 'green');
  } catch (error) {
    log('❌ Application build failed', 'red');
    throw error;
  }
}

function createPortablePackage(platform) {
  const distDir = createDistributionDir();
  const packageDir = join(distDir, `kirocli-${platform}-portable`);
  
  log(`📦 Creating portable package for ${platform}...`, 'magenta');
  
  // Create package directory
  mkdirSync(packageDir, { recursive: true });
  
  // Copy application files
  const appDir = join(packageDir, 'app');
  mkdirSync(appDir);
  
  // Copy dist directory
  cpSync(join(rootDir, 'dist'), join(appDir, 'dist'), { recursive: true });
  
  // Copy package.json (minimal version)
  const originalPackageJson = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf8'));
  const minimalPackageJson = {
    name: originalPackageJson.name,
    version: originalPackageJson.version,
    description: originalPackageJson.description || 'AI Developer Terminal Copilot',
    type: 'module',
    bin: 'dist/cli.js',
    engines: originalPackageJson.engines,
    dependencies: originalPackageJson.dependencies
  };
  
  writeFileSync(
    join(appDir, 'package.json'), 
    JSON.stringify(minimalPackageJson, null, 2)
  );
  
  // Copy node_modules (production only)
  log('📦 Installing production dependencies...', 'cyan');
  try {
    execSync('npm ci --production --silent', { 
      cwd: appDir, 
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'production' }
    });
  } catch (error) {
    log('⚠️ Failed to install dependencies, copying from main project', 'yellow');
    cpSync(join(rootDir, 'node_modules'), join(appDir, 'node_modules'), { 
      recursive: true,
      filter: (src) => {
        // Skip dev dependencies and cache directories
        return !src.includes('.cache') && !src.includes('/.git');
      }
    });
  }
  
  // Create launcher scripts
  createLauncherScripts(packageDir, platform);
  
  // Create README
  createPackageReadme(packageDir, platform);
  
  log(`✅ Portable package created: ${packageDir}`, 'green');
  return packageDir;
}

function createLauncherScripts(packageDir, platform) {
  if (platform === 'windows') {
    // Windows batch script
    const batchScript = `@echo off
cd /d "%~dp0\\app"
node dist/cli.js %*
`;
    writeFileSync(join(packageDir, 'kirocli.bat'), batchScript);
    
    // PowerShell script
    const psScript = `#!/usr/bin/env pwsh
Set-Location (Join-Path $PSScriptRoot "app")
node dist/cli.js @args
`;
    writeFileSync(join(packageDir, 'kirocli.ps1'), psScript);
    
  } else {
    // Unix shell script
    const shellScript = `#!/bin/bash
cd "$(dirname "$0")/app"
node dist/cli.js "$@"
`;
    writeFileSync(join(packageDir, 'kirocli'), shellScript);
    
    // Make executable
    try {
      execSync(`chmod +x "${join(packageDir, 'kirocli')}"`, { cwd: rootDir });
    } catch (error) {
      log(`⚠️ Could not make launcher script executable`, 'yellow');
    }
  }
  
  log(`📜 Created launcher scripts for ${platform}`, 'cyan');
}

function createPackageReadme(packageDir, platform) {
  const readmeContent = `# KiroCLI Portable Distribution

This is a portable distribution of KiroCLI that includes all dependencies.

## Requirements

- Node.js 16+ (must be installed separately)

## Installation

### ${platform === 'windows' ? 'Windows' : 'Linux/macOS'}

${platform === 'windows' ? `
1. Extract this package to your desired location
2. Add the package directory to your PATH, or
3. Run directly using:
   - \`kirocli.bat\` (Command Prompt)
   - \`kirocli.ps1\` (PowerShell)

#### Adding to PATH (Windows)
1. Open System Properties > Environment Variables
2. Add the package directory to your PATH
3. Open a new terminal and run \`kirocli\`
` : `
1. Extract this package to your desired location (e.g., /opt/kirocli)
2. Add to your PATH or create a symlink:
   \`\`\`bash
   # Option 1: Add to PATH
   echo 'export PATH="$PATH:/path/to/kirocli-${platform}-portable"' >> ~/.bashrc
   source ~/.bashrc
   
   # Option 2: Create symlink
   sudo ln -s /path/to/kirocli-${platform}-portable/kirocli /usr/local/bin/kirocli
   \`\`\`
3. Run \`kirocli --help\` to verify installation
`}

## Usage

After installation, you can use KiroCLI from anywhere:

\`\`\`bash
# Show help
kirocli --help

# Start AI chat
kirocli chat

# Validate a spec file
kirocli spec validate

# Show configuration
kirocli config show
\`\`\`

## Configuration

Run the setup command to configure your AI API keys:

\`\`\`bash
kirocli config setup
\`\`\`

## Features

- ✅ AI Chat with OpenAI, Claude, and Gemini
- ✅ Spec-driven code generation
- ✅ Agent hooks for workflow automation
- ✅ Cross-platform shell command execution
- ✅ Enhanced terminal UI with syntax highlighting
- ✅ Persistent conversation history

## Support

- **Documentation**: https://github.com/lxJeman/kirocli
- **Issues**: https://github.com/lxJeman/kirocli/issues

---

Built with ❤️ using Node.js, React, and Ink
`;

  writeFileSync(join(packageDir, 'README.md'), readmeContent);
  log('📚 Created package README', 'cyan');
}

function createArchive(packageDir, platform) {
  const archiveName = `${packageDir}.tar.gz`;
  
  log(`🗜️ Creating archive: ${archiveName}`, 'blue');
  
  try {
    execSync(`tar -czf "${archiveName}" -C "${dirname(packageDir)}" "${platform === 'windows' ? 'kirocli-windows-portable' : `kirocli-${platform}-portable`}"`, {
      cwd: rootDir,
      stdio: 'inherit'
    });
    
    log(`✅ Archive created: ${archiveName}`, 'green');
    return archiveName;
  } catch (error) {
    log(`⚠️ Failed to create archive, package available as directory`, 'yellow');
    return packageDir;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const platforms = args.length > 0 ? args : ['linux', 'macos', 'windows'];
  
  log('🚀 Starting KiroCLI distribution creation...', 'bright');
  log(`📋 Target platforms: ${platforms.join(', ')}`, 'blue');
  
  try {
    // Build application
    buildApplication();
    
    // Clean distribution directory at the start
    cleanDistributionDir();
    
    // Create packages for each platform
    for (const platform of platforms) {
      const packageDir = createPortablePackage(platform);
      createArchive(packageDir, platform);
    }
    
    log('🎉 Distribution creation completed successfully!', 'green');
    log(`📁 Packages available in: ${join(rootDir, 'distribution')}`, 'cyan');
    
  } catch (error) {
    log('💥 Distribution creation failed:', 'red');
    console.error(error);
    process.exit(1);
  }
}

// Run the distribution creation process
main().catch(console.error);