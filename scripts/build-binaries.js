#!/usr/bin/env node

/**
 * Cross-platform binary build script for KiroCLI
 * Handles platform-specific optimizations and shell detection
 */

import {execSync} from 'child_process';
import {existsSync, mkdirSync, writeFileSync, readFileSync} from 'fs';
import {join, dirname} from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Platform configurations
const platforms = {
	linux: {
		target: 'node18-linux-x64',
		output: 'kirocli-linux',
		shell: 'bash',
		pathSeparator: '/',
		executable: true,
	},
	macos: {
		target: 'node18-macos-x64',
		output: 'kirocli-macos',
		shell: 'zsh',
		pathSeparator: '/',
		executable: true,
	},
	windows: {
		target: 'node18-win-x64',
		output: 'kirocli-windows.exe',
		shell: 'cmd',
		pathSeparator: '\\',
		executable: true,
	},
};

// Colors for console output
const colors = {
	reset: '\x1b[0m',
	bright: '\x1b[1m',
	red: '\x1b[31m',
	green: '\x1b[32m',
	yellow: '\x1b[33m',
	blue: '\x1b[34m',
	magenta: '\x1b[35m',
	cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
	console.log(`${colors[color]}${message}${colors.reset}`);
}

function createBinariesDir() {
	const binariesDir = join(rootDir, 'binaries');
	if (!existsSync(binariesDir)) {
		mkdirSync(binariesDir, {recursive: true});
		log('📁 Created binaries directory', 'green');
	}
	return binariesDir;
}

function buildTypeScript() {
	log('🔨 Building TypeScript...', 'blue');
	try {
		execSync('npm run build', {cwd: rootDir, stdio: 'inherit'});
		log('✅ TypeScript build completed', 'green');
	} catch (error) {
		log('❌ TypeScript build failed', 'red');
		throw error;
	}
}

function createPlatformOptimizedEntry(platform) {
	const platformConfig = platforms[platform];
	const entryContent = `#!/usr/bin/env node

// Platform-optimized entry point for ${platform}
// Generated automatically by build-binaries.js

import { platform as osPlatform } from 'os';
import { join } from 'path';

// Platform-specific configurations
const PLATFORM_CONFIG = {
  name: '${platform}',
  shell: '${platformConfig.shell}',
  pathSeparator: '${platformConfig.pathSeparator}',
  executable: ${platformConfig.executable}
};

// Set platform-specific environment variables
process.env.KIROCLI_PLATFORM = PLATFORM_CONFIG.name;
process.env.KIROCLI_SHELL = PLATFORM_CONFIG.shell;
process.env.KIROCLI_PATH_SEP = PLATFORM_CONFIG.pathSeparator;

// Import and run the main CLI
import('./cli.js').then(module => {
  // CLI is already executed when imported
}).catch(error => {
  console.error('Failed to start KiroCLI:', error);
  process.exit(1);
});
`;

	const entryPath = join(rootDir, 'dist', `cli-${platform}.js`);
	writeFileSync(entryPath, entryContent);
	log(`📝 Created platform entry for ${platform}`, 'cyan');
	return entryPath;
}

function packageBinary(platform) {
	const platformConfig = platforms[platform];
	const binariesDir = createBinariesDir();
	const entryPath = createPlatformOptimizedEntry(platform);
	const outputPath = join(binariesDir, platformConfig.output);

	log(`📦 Packaging ${platform} binary...`, 'magenta');

	try {
		const pkgCommand = `pkg ${entryPath} --targets ${platformConfig.target} --output ${outputPath}`;
		execSync(pkgCommand, {cwd: rootDir, stdio: 'inherit'});
		log(`✅ ${platform} binary created: ${platformConfig.output}`, 'green');

		// Create installation script for the platform
		createInstallationScript(platform, binariesDir);
	} catch (error) {
		log(`❌ Failed to package ${platform} binary`, 'red');
		throw error;
	}
}

function createInstallationScript(platform, binariesDir) {
	const platformConfig = platforms[platform];

	if (platform === 'windows') {
		// Windows batch script
		const batchScript = `@echo off
echo Installing KiroCLI for Windows...
copy "${platformConfig.output}" "%USERPROFILE%\\AppData\\Local\\Microsoft\\WindowsApps\\kirocli.exe"
echo KiroCLI installed successfully!
echo You can now run 'kirocli' from anywhere in your terminal.
pause
`;
		writeFileSync(join(binariesDir, 'install-windows.bat'), batchScript);
	} else {
		// Unix shell script
		const shellScript = `#!/bin/bash
echo "Installing KiroCLI for ${platform}..."
sudo cp "${platformConfig.output}" /usr/local/bin/kirocli
sudo chmod +x /usr/local/bin/kirocli
echo "KiroCLI installed successfully!"
echo "You can now run 'kirocli' from anywhere in your terminal."
`;
		writeFileSync(join(binariesDir, `install-${platform}.sh`), shellScript);

		// Make the install script executable
		try {
			execSync(`chmod +x "${join(binariesDir, `install-${platform}.sh`)}"`, {
				cwd: rootDir,
			});
		} catch (error) {
			log(
				`⚠️ Could not make install script executable for ${platform}`,
				'yellow',
			);
		}
	}

	log(`📜 Created installation script for ${platform}`, 'cyan');
}

function createReadme(binariesDir) {
	const readmeContent = `# KiroCLI Binary Distribution

This directory contains pre-built binaries for KiroCLI across different platforms.

## Available Binaries

### Linux (x64)
- **Binary**: \`kirocli-linux\`
- **Installation**: Run \`./install-linux.sh\` or manually copy to \`/usr/local/bin/\`
- **Requirements**: Linux x64, glibc 2.17+

### macOS (x64)
- **Binary**: \`kirocli-macos\`
- **Installation**: Run \`./install-macos.sh\` or manually copy to \`/usr/local/bin/\`
- **Requirements**: macOS 10.13+ (High Sierra)

### Windows (x64)
- **Binary**: \`kirocli-windows.exe\`
- **Installation**: Run \`install-windows.bat\` or manually add to PATH
- **Requirements**: Windows 10+ (x64)

## Manual Installation

### Linux/macOS
\`\`\`bash
# Make executable
chmod +x kirocli-linux  # or kirocli-macos

# Copy to system path
sudo cp kirocli-linux /usr/local/bin/kirocli

# Verify installation
kirocli --help
\`\`\`

### Windows
\`\`\`cmd
# Copy to a directory in your PATH, or add the binary location to PATH
copy kirocli-windows.exe C:\\Windows\\System32\\kirocli.exe

# Verify installation
kirocli --help
\`\`\`

## Features

All binaries include:
- ✅ AI Chat with OpenAI, Claude, and Gemini
- ✅ Spec-driven code generation
- ✅ Agent hooks for workflow automation
- ✅ Cross-platform shell command execution
- ✅ Enhanced terminal UI with syntax highlighting
- ✅ Persistent conversation history
- ✅ Debug mode and verbose logging

## Configuration

After installation, run:
\`\`\`bash
kirocli config setup
\`\`\`

This will guide you through setting up your AI API keys.

## Support

- **Documentation**: https://github.com/your-repo/kirocli
- **Issues**: https://github.com/your-repo/kirocli/issues
- **Discussions**: https://github.com/your-repo/kirocli/discussions

---

Built with ❤️ using Node.js, React, and Ink
`;

	writeFileSync(join(binariesDir, 'README.md'), readmeContent);
	log('📚 Created distribution README', 'cyan');
}

function generateChecksums(binariesDir) {
	const checksumContent = [];

	Object.values(platforms).forEach(config => {
		const binaryPath = join(binariesDir, config.output);
		if (existsSync(binaryPath)) {
			try {
				const command =
					process.platform === 'win32'
						? `certutil -hashfile "${binaryPath}" SHA256`
						: `shasum -a 256 "${binaryPath}"`;

				const result = execSync(command, {encoding: 'utf8'});
				const hash =
					process.platform === 'win32'
						? result.split('\n')[1].trim()
						: result.split(' ')[0];

				checksumContent.push(`${hash}  ${config.output}`);
			} catch (error) {
				log(`⚠️ Could not generate checksum for ${config.output}`, 'yellow');
			}
		}
	});

	if (checksumContent.length > 0) {
		writeFileSync(
			join(binariesDir, 'SHA256SUMS'),
			checksumContent.join('\n') + '\n',
		);
		log('🔐 Generated SHA256 checksums', 'cyan');
	}
}

async function main() {
	const args = process.argv.slice(2);
	const targetPlatforms = args.length > 0 ? args : Object.keys(platforms);

	log('🚀 Starting KiroCLI binary build process...', 'bright');
	log(`📋 Target platforms: ${targetPlatforms.join(', ')}`, 'blue');

	try {
		// Build TypeScript
		buildTypeScript();

		// Create binaries directory
		const binariesDir = createBinariesDir();

		// Package binaries for each platform
		for (const platform of targetPlatforms) {
			if (!platforms[platform]) {
				log(`⚠️ Unknown platform: ${platform}`, 'yellow');
				continue;
			}

			await packageBinary(platform);
		}

		// Create documentation and checksums
		createReadme(binariesDir);
		generateChecksums(binariesDir);

		log('🎉 Binary build process completed successfully!', 'green');
		log(`📁 Binaries available in: ${binariesDir}`, 'cyan');
	} catch (error) {
		log('💥 Build process failed:', 'red');
		console.error(error);
		process.exit(1);
	}
}

// Run the build process
main().catch(console.error);
