import {execa, ExecaError} from 'execa';
import * as os from 'os';
import {platformDetector} from './platform-detector.js';

export interface CommandResult {
	success: boolean;
	output: string;
	error?: string;
	exitCode: number;
	command: string;
	duration: number;
}

export interface CommandOptions {
	timeout?: number;
	maxBuffer?: number;
	cwd?: string;
	env?: Record<string, string>;
	shell?: boolean;
}

export class SafeShellExecutor {
	private static readonly DEFAULT_TIMEOUT = 30000; // 30 seconds
	private static readonly DEFAULT_MAX_BUFFER = 1024 * 1024; // 1MB
	private static readonly DANGEROUS_COMMANDS = [
		'rm -rf /',
		'rm -rf *',
		':(){ :|:& };:',
		'dd if=/dev/zero',
		'mkfs',
		'fdisk',
		'format',
		'del /f /s /q',
		'rmdir /s /q',
		'shutdown',
		'reboot',
		'halt',
		'init 0',
		'init 6',
		'sudo rm -rf',
		'chmod -R 777 /',
		'chown -R root:root /',
	];

	private static readonly RESTRICTED_PATHS = [
		'/',
		'/bin',
		'/sbin',
		'/usr/bin',
		'/usr/sbin',
		'/etc',
		'/boot',
		'/sys',
		'/proc',
		'C:\\Windows',
		'C:\\Program Files',
		'C:\\System32',
	];

	/**
	 * Validates and sanitizes a command before execution
	 */
	static validateCommand(command: string): {valid: boolean; reason?: string; sanitized?: string} {
		// Basic sanitization
		const sanitized = command.trim();
		
		if (!sanitized) {
			return {valid: false, reason: 'Empty command'};
		}

		// Check for dangerous commands
		const lowerCommand = sanitized.toLowerCase();
		for (const dangerous of this.DANGEROUS_COMMANDS) {
			if (lowerCommand.includes(dangerous.toLowerCase())) {
				return {valid: false, reason: `Dangerous command detected: ${dangerous}`};
			}
		}

		// Check for restricted paths
		for (const restrictedPath of this.RESTRICTED_PATHS) {
			if (lowerCommand.includes(restrictedPath.toLowerCase())) {
				return {valid: false, reason: `Access to restricted path: ${restrictedPath}`};
			}
		}

		// Check for command injection attempts
		const injectionPatterns = [
			/;\s*rm\s+-rf/i,
			/\|\s*rm\s+-rf/i,
			/&&\s*rm\s+-rf/i,
			/`.*rm.*`/i,
			/\$\(.*rm.*\)/i,
			/;\s*sudo/i,
			/\|\s*sudo/i,
			/&&\s*sudo/i,
		];

		for (const pattern of injectionPatterns) {
			if (pattern.test(sanitized)) {
				return {valid: false, reason: 'Potential command injection detected'};
			}
		}

		return {valid: true, sanitized};
	}

	/**
	 * Converts commands to be cross-platform compatible using platform detector
	 */
	static makeCommandCrossPlatform(command: string): string {
		// Use the platform detector for better cross-platform command translation
		return platformDetector.translateCommand(command);
	}

	/**
	 * Executes a command safely with proper error handling and timeouts
	 */
	static async executeCommand(
		command: string,
		options: CommandOptions = {}
	): Promise<CommandResult> {
		const startTime = Date.now();
		
		// Validate command
		const validation = this.validateCommand(command);
		if (!validation.valid) {
			return {
				success: false,
				output: '',
				error: validation.reason,
				exitCode: -1,
				command,
				duration: Date.now() - startTime,
			};
		}

		// Make command cross-platform compatible
		const crossPlatformCommand = this.makeCommandCrossPlatform(validation.sanitized!);
		
		// Set up execution options
		const execOptions = {
			timeout: options.timeout || this.DEFAULT_TIMEOUT,
			maxBuffer: options.maxBuffer || this.DEFAULT_MAX_BUFFER,
			cwd: options.cwd || process.cwd(),
			env: {...process.env, ...options.env},
			shell: options.shell !== false, // Default to true for better compatibility
			encoding: 'utf8' as const,
		};

		try {
			// Parse command and arguments
			const [cmd, ...args] = this.parseCommand(crossPlatformCommand);
			
			// Ensure we have a command
			if (!cmd) {
				return {
					success: false,
					output: '',
					error: 'No command specified',
					exitCode: -1,
					command: crossPlatformCommand,
					duration: Date.now() - startTime,
				};
			}
			
			// Execute command
			const result = await execa(cmd, args, execOptions);
			
			return {
				success: true,
				output: result.stdout || result.stderr || 'Command executed successfully',
				exitCode: result.exitCode || 0,
				command: crossPlatformCommand,
				duration: Date.now() - startTime,
			};
		} catch (error) {
			const execaError = error as ExecaError;
			
			return {
				success: false,
				output: String(execaError.stdout || ''),
				error: String(execaError.stderr || execaError.message || 'Unknown execution error'),
				exitCode: execaError.exitCode || -1,
				command: crossPlatformCommand,
				duration: Date.now() - startTime,
			};
		}
	}

	/**
	 * Parses a command string into command and arguments
	 */
	private static parseCommand(command: string): string[] {
		// Simple command parsing - handles quoted arguments
		const args: string[] = [];
		let current = '';
		let inQuotes = false;
		let quoteChar = '';

		for (let i = 0; i < command.length; i++) {
			const char = command[i];
			
			if ((char === '"' || char === "'") && !inQuotes) {
				inQuotes = true;
				quoteChar = char;
			} else if (char === quoteChar && inQuotes) {
				inQuotes = false;
				quoteChar = '';
			} else if (char === ' ' && !inQuotes) {
				if (current) {
					args.push(current);
					current = '';
				}
			} else {
				current += char;
			}
		}

		if (current) {
			args.push(current);
		}

		return args;
	}

	/**
	 * Gets platform-specific information
	 */
	static getPlatformInfo(): {
		platform: string;
		arch: string;
		shell: string;
		homeDir: string;
		tempDir: string;
	} {
		return {
			platform: os.platform(),
			arch: os.arch(),
			shell: process.env['SHELL'] || process.env['COMSPEC'] || '/bin/sh',
			homeDir: os.homedir(),
			tempDir: os.tmpdir(),
		};
	}

	/**
	 * Checks if a command is available on the system
	 */
	static async isCommandAvailable(command: string): Promise<boolean> {
		try {
			const platform = os.platform();
			const checkCommand = platform === 'win32' ? 'where' : 'which';
			
			await execa(checkCommand, [command], {
				timeout: 5000,
				stdio: 'ignore',
			});
			
			return true;
		} catch {
			return false;
		}
	}

	/**
	 * Gets safe alternatives for common dangerous operations
	 */
	static getSafeAlternatives(command: string): string[] {
		const alternatives: Record<string, string[]> = {
			'rm -rf': [
				'Use specific file patterns: rm *.log',
				'Use find with confirmation: find . -name "*.log" -exec rm -i {} \\;',
				'Move to trash instead of permanent deletion',
			],
			'chmod 777': [
				'Use specific permissions: chmod 755 (rwxr-xr-x)',
				'Use chmod 644 for files (rw-r--r--)',
				'Avoid world-writable permissions',
			],
			'sudo rm': [
				'Double-check the path before using sudo',
				'Use rm without sudo when possible',
				'Consider using trash utilities instead',
			],
		};

		const lowerCommand = command.toLowerCase();
		for (const [dangerous, alts] of Object.entries(alternatives)) {
			if (lowerCommand.includes(dangerous)) {
				return alts;
			}
		}

		return [];
	}
}