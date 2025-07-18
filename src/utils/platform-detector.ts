/**
 * Platform Detection and Cross-Platform Utilities
 * Handles platform-specific optimizations for KiroCLI
 */

import * as os from 'os';
import * as path from 'path';
import {execSync} from 'child_process';

export interface PlatformInfo {
	name: 'linux' | 'macos' | 'windows' | 'unknown';
	arch: string;
	shell: string;
	pathSeparator: string;
	homeDirectory: string;
	configDirectory: string;
	executableExtension: string;
	isWSL: boolean;
	version: string;
}

export class PlatformDetector {
	private static instance: PlatformDetector;
	private platformInfo: PlatformInfo;

	private constructor() {
		this.platformInfo = this.detectPlatform();
	}

	public static getInstance(): PlatformDetector {
		if (!PlatformDetector.instance) {
			PlatformDetector.instance = new PlatformDetector();
		}
		return PlatformDetector.instance;
	}

	public getPlatformInfo(): PlatformInfo {
		return {...this.platformInfo};
	}

	private detectPlatform(): PlatformInfo {
		const platform = os.platform();
		const arch = os.arch();
		const homeDir = os.homedir();

		let name: PlatformInfo['name'] = 'unknown';
		let shell = 'sh';
		let pathSeparator = '/';
		let executableExtension = '';
		let configDirectory = path.join(homeDir, '.kirocli');
		let isWSL = false;

		// Detect platform
		switch (platform) {
			case 'linux':
				name = 'linux';
				shell = this.detectLinuxShell();
				isWSL = this.detectWSL();
				break;
			case 'darwin':
				name = 'macos';
				shell = this.detectMacShell();
				break;
			case 'win32':
				name = 'windows';
				shell = this.detectWindowsShell();
				pathSeparator = '\\';
				executableExtension = '.exe';
				configDirectory = path.join(homeDir, 'AppData', 'Local', 'KiroCLI');
				break;
		}

		// Override with environment variables if set (for packaged binaries)
		if (process.env['KIROCLI_PLATFORM']) {
			name = process.env['KIROCLI_PLATFORM'] as PlatformInfo['name'];
		}
		if (process.env['KIROCLI_SHELL']) {
			shell = process.env['KIROCLI_SHELL'];
		}
		if (process.env['KIROCLI_PATH_SEP']) {
			pathSeparator = process.env['KIROCLI_PATH_SEP'];
		}

		return {
			name,
			arch,
			shell,
			pathSeparator,
			homeDirectory: homeDir,
			configDirectory,
			executableExtension,
			isWSL,
			version: os.release(),
		};
	}

	private detectLinuxShell(): string {
		try {
			// Check SHELL environment variable
			if (process.env['SHELL']) {
				const shellName = path.basename(process.env['SHELL']);
				if (['bash', 'zsh', 'fish', 'sh'].includes(shellName)) {
					return shellName;
				}
			}

			// Try to detect available shells
			const shells = ['zsh', 'bash', 'fish', 'sh'];
			for (const shell of shells) {
				try {
					execSync(`which ${shell}`, {stdio: 'ignore'});
					return shell;
				} catch {
					// Shell not found, continue
				}
			}

			return 'bash'; // Default fallback
		} catch {
			return 'bash';
		}
	}

	private detectMacShell(): string {
		try {
			// macOS Catalina+ defaults to zsh
			const osVersion = os.release();
			const versionParts = osVersion.split('.');
			const majorVersion =
				versionParts.length > 0 && versionParts[0]
					? parseInt(versionParts[0], 10)
					: 0;

			// macOS 10.15 (Catalina) is Darwin 19.x
			if (majorVersion >= 19) {
				return 'zsh';
			}

			// Check SHELL environment variable
			if (process.env['SHELL']) {
				const shellName = path.basename(process.env['SHELL']);
				if (['zsh', 'bash', 'fish', 'sh'].includes(shellName)) {
					return shellName;
				}
			}

			return 'zsh'; // Default for modern macOS
		} catch {
			return 'zsh';
		}
	}

	private detectWindowsShell(): string {
		try {
			// Check for PowerShell Core
			try {
				execSync('pwsh --version', {stdio: 'ignore'});
				return 'pwsh';
			} catch {
				// PowerShell Core not available
			}

			// Check for Windows PowerShell
			try {
				execSync('powershell -Command "Get-Host"', {stdio: 'ignore'});
				return 'powershell';
			} catch {
				// PowerShell not available
			}

			// Check for WSL
			if (this.detectWSL()) {
				return 'bash';
			}

			return 'cmd'; // Fallback to Command Prompt
		} catch {
			return 'cmd';
		}
	}

	private detectWSL(): boolean {
		try {
			// Check for WSL environment variables
			if (process.env['WSL_DISTRO_NAME'] || process.env['WSLENV']) {
				return true;
			}

			// Check /proc/version for WSL signature
			if (os.platform() === 'linux') {
				try {
					const version = execSync('cat /proc/version', {encoding: 'utf8'});
					return (
						version.toLowerCase().includes('microsoft') ||
						version.toLowerCase().includes('wsl')
					);
				} catch {
					// /proc/version not readable
				}
			}

			return false;
		} catch {
			return false;
		}
	}

	/**
	 * Get platform-specific command translations
	 */
	public translateCommand(command: string): string {
		const platform = this.platformInfo.name;

		// Common command translations
		const translations: Record<string, Record<string, string>> = {
			windows: {
				ls: 'dir',
				cat: 'type',
				grep: 'findstr',
				which: 'where',
				rm: 'del',
				cp: 'copy',
				mv: 'move',
				mkdir: 'mkdir',
				rmdir: 'rmdir',
				pwd: 'cd',
				clear: 'cls',
				ps: 'tasklist',
				kill: 'taskkill',
			},
		};

		if (platform === 'windows' && !this.platformInfo.isWSL) {
			const windowsTranslations = translations['windows'];
			const commandParts = command.split(' ');
			const baseCommand = commandParts[0];

			if (
				windowsTranslations &&
				baseCommand &&
				windowsTranslations[baseCommand]
			) {
				return command.replace(baseCommand, windowsTranslations[baseCommand]);
			}
		}

		return command;
	}

	/**
	 * Get platform-specific path handling
	 */
	public normalizePath(inputPath: string): string {
		if (this.platformInfo.name === 'windows' && !this.platformInfo.isWSL) {
			// Convert forward slashes to backslashes on Windows
			return inputPath.replace(/\//g, '\\');
		}

		// Convert backslashes to forward slashes on Unix-like systems
		return inputPath.replace(/\\/g, '/');
	}

	/**
	 * Get platform-specific executable name
	 */
	public getExecutableName(baseName: string): string {
		return baseName + this.platformInfo.executableExtension;
	}

	/**
	 * Get platform-specific configuration directory
	 */
	public getConfigDirectory(): string {
		return this.platformInfo.configDirectory;
	}

	/**
	 * Get platform-specific shell command prefix
	 */
	public getShellCommandPrefix(): string[] {
		const {shell, name} = this.platformInfo;

		switch (name) {
			case 'windows':
				if (shell === 'powershell') {
					return ['powershell', '-Command'];
				}
				if (shell === 'pwsh') {
					return ['pwsh', '-Command'];
				}
				return ['cmd', '/c'];

			case 'linux':
			case 'macos':
			default:
				return [shell, '-c'];
		}
	}

	/**
	 * Check if a command is available on the current platform
	 */
	public isCommandAvailable(command: string): boolean {
		try {
			const checkCommand =
				this.platformInfo.name === 'windows' ? 'where' : 'which';
			execSync(`${checkCommand} ${command}`, {stdio: 'ignore'});
			return true;
		} catch {
			return false;
		}
	}

	/**
	 * Get platform-specific environment variable separator
	 */
	public getPathSeparator(): string {
		return this.platformInfo.name === 'windows' ? ';' : ':';
	}

	/**
	 * Get platform information as a formatted string
	 */
	public getPlatformSummary(): string {
		const info = this.platformInfo;
		const lines = [
			`Platform: ${info.name} (${info.arch})`,
			`Shell: ${info.shell}`,
			`Version: ${info.version}`,
			`Home: ${info.homeDirectory}`,
			`Config: ${info.configDirectory}`,
		];

		if (info.isWSL) {
			lines.push('Environment: WSL (Windows Subsystem for Linux)');
		}

		return lines.join('\n');
	}
}

// Export singleton instance for easy access
export const platformDetector = PlatformDetector.getInstance();
