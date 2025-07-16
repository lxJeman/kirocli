/**
 * Enhanced Logging System with Debug Mode and Verbose Output
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'verbose';

export interface LogEntry {
	timestamp: Date;
	level: LogLevel;
	category: string;
	message: string;
	data?: any;
	context?: Record<string, any>;
}

export class Logger {
	private static instance: Logger;
	private logEntries: LogEntry[] = [];
	private debugMode = false;
	private verboseMode = false;
	private logToFile = false;
	private logFilePath: string;
	private maxLogEntries = 1000;

	private constructor() {
		this.logFilePath = path.join(os.homedir(), '.kirocli', 'debug.log');
		
		// Check environment variables
		this.debugMode = process.env['KIROCLI_DEBUG'] === 'true' || process.argv.includes('--debug');
		this.verboseMode = process.env['KIROCLI_VERBOSE'] === 'true' || process.argv.includes('--verbose');
		this.logToFile = process.env['KIROCLI_LOG_FILE'] === 'true' || process.argv.includes('--log-file');
	}

	static getInstance(): Logger {
		if (!Logger.instance) {
			Logger.instance = new Logger();
		}
		return Logger.instance;
	}

	/**
	 * Enable or disable debug mode
	 */
	setDebugMode(enabled: boolean): void {
		this.debugMode = enabled;
		this.log('info', 'Logger', `Debug mode ${enabled ? 'enabled' : 'disabled'}`);
	}

	/**
	 * Enable or disable verbose mode
	 */
	setVerboseMode(enabled: boolean): void {
		this.verboseMode = enabled;
		this.log('info', 'Logger', `Verbose mode ${enabled ? 'enabled' : 'disabled'}`);
	}

	/**
	 * Enable or disable file logging
	 */
	setFileLogging(enabled: boolean): void {
		this.logToFile = enabled;
		this.log('info', 'Logger', `File logging ${enabled ? 'enabled' : 'disabled'}`);
	}

	/**
	 * Get current logger configuration
	 */
	getConfig(): {
		debugMode: boolean;
		verboseMode: boolean;
		logToFile: boolean;
		logFilePath: string;
		totalEntries: number;
	} {
		return {
			debugMode: this.debugMode,
			verboseMode: this.verboseMode,
			logToFile: this.logToFile,
			logFilePath: this.logFilePath,
			totalEntries: this.logEntries.length
		};
	}

	/**
	 * Main logging method
	 */
	log(level: LogLevel, category: string, message: string, data?: any, context?: Record<string, any>): void {
		const entry: LogEntry = {
			timestamp: new Date(),
			level,
			category,
			message,
			data,
			context
		};

		// Add to memory log
		this.logEntries.push(entry);
		
		// Trim log entries if too many
		if (this.logEntries.length > this.maxLogEntries) {
			this.logEntries = this.logEntries.slice(-this.maxLogEntries);
		}

		// Console output based on mode
		this.outputToConsole(entry);

		// File output if enabled
		if (this.logToFile) {
			this.outputToFile(entry).catch(err => {
				console.error('Failed to write to log file:', err);
			});
		}
	}

	/**
	 * Debug level logging
	 */
	debug(category: string, message: string, data?: any, context?: Record<string, any>): void {
		this.log('debug', category, message, data, context);
	}

	/**
	 * Info level logging
	 */
	info(category: string, message: string, data?: any, context?: Record<string, any>): void {
		this.log('info', category, message, data, context);
	}

	/**
	 * Warning level logging
	 */
	warn(category: string, message: string, data?: any, context?: Record<string, any>): void {
		this.log('warn', category, message, data, context);
	}

	/**
	 * Error level logging
	 */
	error(category: string, message: string, data?: any, context?: Record<string, any>): void {
		this.log('error', category, message, data, context);
	}

	/**
	 * Verbose level logging
	 */
	verbose(category: string, message: string, data?: any, context?: Record<string, any>): void {
		this.log('verbose', category, message, data, context);
	}

	/**
	 * Output log entry to console
	 */
	private outputToConsole(entry: LogEntry): void {
		const shouldOutput = this.shouldOutputToConsole(entry.level);
		
		if (!shouldOutput) return;

		const timestamp = entry.timestamp.toISOString();
		const levelEmoji = this.getLevelEmoji(entry.level);
		
		// Format message
		let output = `${levelEmoji} [${timestamp}] ${entry.category}: ${entry.message}`;
		
		// Add data if present and in debug/verbose mode
		if (entry.data && (this.debugMode || this.verboseMode)) {
			output += `\\n  Data: ${JSON.stringify(entry.data, null, 2)}`;
		}

		// Add context if present and in debug mode
		if (entry.context && this.debugMode) {
			output += `\\n  Context: ${JSON.stringify(entry.context, null, 2)}`;
		}

		// Output with appropriate method
		switch (entry.level) {
			case 'error':
				console.error(output);
				break;
			case 'warn':
				console.warn(output);
				break;
			case 'debug':
				console.debug(output);
				break;
			default:
				console.log(output);
		}
	}

	/**
	 * Output log entry to file
	 */
	private async outputToFile(entry: LogEntry): Promise<void> {
		try {
			// Ensure log directory exists
			await fs.mkdir(path.dirname(this.logFilePath), { recursive: true });

			const logLine = JSON.stringify({
				timestamp: entry.timestamp.toISOString(),
				level: entry.level,
				category: entry.category,
				message: entry.message,
				data: entry.data,
				context: entry.context
			}) + '\\n';

			await fs.appendFile(this.logFilePath, logLine);
		} catch (error) {
			// Silently fail to avoid infinite logging loops
		}
	}

	/**
	 * Determine if log entry should be output to console
	 */
	private shouldOutputToConsole(level: LogLevel): boolean {
		if (level === 'error' || level === 'warn') {
			return true; // Always show errors and warnings
		}

		if (level === 'debug') {
			return this.debugMode;
		}

		if (level === 'verbose') {
			return this.verboseMode;
		}

		if (level === 'info') {
			return this.debugMode || this.verboseMode;
		}

		return false;
	}

	/**
	 * Get emoji for log level
	 */
	private getLevelEmoji(level: LogLevel): string {
		const emojis = {
			debug: '🐛',
			info: 'ℹ️',
			warn: '⚠️',
			error: '❌',
			verbose: '📝'
		};
		return emojis[level] || '📄';
	}

	/**
	 * Get color for log level
	 */
	// private getLevelColor(level: LogLevel): string {
	//	const colors = {
	//		debug: 'gray',
	//		info: 'blue',
	//		warn: 'yellow',
	//		error: 'red',
	//		verbose: 'cyan'
	//	};
	//	return colors[level] || 'white';
	// }

	/**
	 * Get recent log entries
	 */
	getRecentLogs(count = 50, level?: LogLevel): LogEntry[] {
		let logs = this.logEntries.slice(-count);
		
		if (level) {
			logs = logs.filter(entry => entry.level === level);
		}

		return logs.reverse(); // Most recent first
	}

	/**
	 * Clear log entries
	 */
	clearLogs(): void {
		this.logEntries = [];
		this.log('info', 'Logger', 'Log entries cleared');
	}

	/**
	 * Export logs to file
	 */
	async exportLogs(filePath?: string): Promise<string> {
		const exportPath = filePath || path.join(os.homedir(), '.kirocli', `logs-export-${Date.now()}.json`);
		
		const exportData = {
			exportedAt: new Date().toISOString(),
			config: this.getConfig(),
			entries: this.logEntries
		};

		await fs.mkdir(path.dirname(exportPath), { recursive: true });
		await fs.writeFile(exportPath, JSON.stringify(exportData, null, 2));

		this.log('info', 'Logger', `Logs exported to ${exportPath}`);
		return exportPath;
	}

	/**
	 * Get log statistics
	 */
	getStats(): {
		totalEntries: number;
		byLevel: Record<LogLevel, number>;
		byCategory: Record<string, number>;
		oldestEntry?: Date;
		newestEntry?: Date;
	} {
		const byLevel: Record<LogLevel, number> = {
			debug: 0,
			info: 0,
			warn: 0,
			error: 0,
			verbose: 0
		};

		const byCategory: Record<string, number> = {};

		this.logEntries.forEach(entry => {
			byLevel[entry.level]++;
			byCategory[entry.category] = (byCategory[entry.category] || 0) + 1;
		});

		return {
			totalEntries: this.logEntries.length,
			byLevel,
			byCategory,
			oldestEntry: this.logEntries.length > 0 ? this.logEntries[0]?.timestamp : undefined,
			newestEntry: this.logEntries.length > 0 ? this.logEntries[this.logEntries.length - 1]?.timestamp : undefined
		};
	}
}

// Export singleton instance
export const logger = Logger.getInstance();