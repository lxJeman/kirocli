/**
 * Enhanced Error Handling and User Feedback System
 * Provides helpful error messages and suggestions for failed commands
 */

export interface ErrorSuggestion {
	type: 'command' | 'fix' | 'alternative' | 'documentation' | 'installation';
	title: string;
	description: string;
	action?: string;
	priority: 'high' | 'medium' | 'low';
}

export interface EnhancedError {
	originalError: Error;
	category: 'network' | 'permission' | 'syntax' | 'missing_dependency' | 'configuration' | 'ai_provider' | 'file_system' | 'unknown';
	severity: 'critical' | 'error' | 'warning' | 'info';
	userMessage: string;
	technicalDetails: string;
	suggestions: ErrorSuggestion[];
	context?: Record<string, any>;
	timestamp: Date;
}

export class ErrorHandler {
	private static errorPatterns: Array<{
		pattern: RegExp;
		category: EnhancedError['category'];
		severity: EnhancedError['severity'];
		messageGenerator: (match: RegExpMatchArray) => string;
		suggestionsGenerator: (match: RegExpMatchArray) => ErrorSuggestion[];
	}> = [
		// Network errors
		{
			pattern: /ENOTFOUND|ECONNREFUSED|ETIMEDOUT|fetch failed/i,
			category: 'network',
			severity: 'error',
			messageGenerator: () => 'Network connection failed. Please check your internet connection.',
			suggestionsGenerator: () => [
				{
					type: 'fix',
					title: 'Check Internet Connection',
					description: 'Verify that you have an active internet connection',
					priority: 'high'
				},
				{
					type: 'command',
					title: 'Test Network Connectivity',
					description: 'Run a network test to diagnose connection issues',
					action: 'ping google.com',
					priority: 'medium'
				},
				{
					type: 'alternative',
					title: 'Try Different Network',
					description: 'Switch to a different network or use mobile hotspot',
					priority: 'low'
				}
			]
		},

		// Permission errors
		{
			pattern: /EACCES|EPERM|permission denied/i,
			category: 'permission',
			severity: 'error',
			messageGenerator: () => 'Permission denied. You may need elevated privileges to perform this action.',
			suggestionsGenerator: () => [
				{
					type: 'command',
					title: 'Run with Sudo',
					description: 'Try running the command with administrator privileges',
					action: 'sudo [your-command]',
					priority: 'high'
				},
				{
					type: 'fix',
					title: 'Check File Permissions',
					description: 'Verify that you have the necessary permissions for the target files/directories',
					priority: 'medium'
				},
				{
					type: 'alternative',
					title: 'Change Ownership',
					description: 'Change the ownership of the files to your user account',
					action: 'sudo chown -R $USER:$USER [directory]',
					priority: 'medium'
				}
			]
		},

		// Missing dependency errors
		{
			pattern: /command not found|not recognized as an internal or external command/i,
			category: 'missing_dependency',
			severity: 'error',
			messageGenerator: (_match) => `Command not found. The required tool may not be installed.`,
			suggestionsGenerator: (_match) => [
				{
					type: 'installation',
					title: 'Install Missing Tool',
					description: 'Install the required command-line tool',
					priority: 'high'
				},
				{
					type: 'command',
					title: 'Check PATH',
					description: 'Verify that the tool is in your system PATH',
					action: 'echo $PATH',
					priority: 'medium'
				},
				{
					type: 'documentation',
					title: 'Installation Guide',
					description: 'Look up installation instructions for the missing tool',
					priority: 'low'
				}
			]
		},

		// API key errors
		{
			pattern: /invalid api key|unauthorized|authentication failed/i,
			category: 'configuration',
			severity: 'error',
			messageGenerator: () => 'API authentication failed. Please check your API key configuration.',
			suggestionsGenerator: () => [
				{
					type: 'command',
					title: 'Set API Key',
					description: 'Configure your API key using the config command',
					action: 'kirocli config set-key [provider] [your-api-key]',
					priority: 'high'
				},
				{
					type: 'command',
					title: 'Test Configuration',
					description: 'Test your API key configuration',
					action: 'kirocli config test',
					priority: 'high'
				},
				{
					type: 'documentation',
					title: 'API Key Setup Guide',
					description: 'Follow the setup guide to configure API keys properly',
					priority: 'medium'
				}
			]
		},

		// File system errors
		{
			pattern: /ENOENT|no such file or directory/i,
			category: 'file_system',
			severity: 'error',
			messageGenerator: () => 'File or directory not found.',
			suggestionsGenerator: () => [
				{
					type: 'command',
					title: 'Check File Path',
					description: 'Verify that the file or directory exists',
					action: 'ls -la [path]',
					priority: 'high'
				},
				{
					type: 'fix',
					title: 'Create Missing Directory',
					description: 'Create the required directory structure',
					action: 'mkdir -p [directory-path]',
					priority: 'medium'
				},
				{
					type: 'alternative',
					title: 'Use Absolute Path',
					description: 'Try using the absolute path instead of relative path',
					priority: 'low'
				}
			]
		},

		// Syntax errors
		{
			pattern: /syntax error|unexpected token|invalid syntax/i,
			category: 'syntax',
			severity: 'error',
			messageGenerator: () => 'Syntax error detected in the command or configuration.',
			suggestionsGenerator: () => [
				{
					type: 'fix',
					title: 'Check Syntax',
					description: 'Review the command syntax and fix any errors',
					priority: 'high'
				},
				{
					type: 'documentation',
					title: 'Command Reference',
					description: 'Consult the command documentation for correct syntax',
					priority: 'medium'
				},
				{
					type: 'alternative',
					title: 'Use Help Command',
					description: 'Get help for the specific command',
					action: '[command] --help',
					priority: 'medium'
				}
			]
		}
	];

	/**
	 * Enhance an error with helpful information and suggestions
	 */
	static enhanceError(error: Error, context?: Record<string, any>): EnhancedError {
		const errorMessage = error.message.toLowerCase();
		
		// Find matching pattern
		const matchedPattern = this.errorPatterns.find(pattern => 
			pattern.pattern.test(errorMessage)
		);

		if (matchedPattern) {
			const match = errorMessage.match(matchedPattern.pattern);
			return {
				originalError: error,
				category: matchedPattern.category,
				severity: matchedPattern.severity,
				userMessage: matchedPattern.messageGenerator(match || [''] as RegExpMatchArray),
				technicalDetails: error.message,
				suggestions: matchedPattern.suggestionsGenerator(match || [''] as RegExpMatchArray),
				context,
				timestamp: new Date()
			};
		}

		// Default enhanced error for unknown errors
		return {
			originalError: error,
			category: 'unknown',
			severity: 'error',
			userMessage: 'An unexpected error occurred.',
			technicalDetails: error.message,
			suggestions: [
				{
					type: 'documentation',
					title: 'Check Documentation',
					description: 'Review the documentation for troubleshooting tips',
					priority: 'medium'
				},
				{
					type: 'alternative',
					title: 'Try Again',
					description: 'Sometimes temporary issues resolve themselves',
					priority: 'low'
				}
			],
			context,
			timestamp: new Date()
		};
	}

	/**
	 * Generate contextual suggestions based on the current operation
	 */
	static generateContextualSuggestions(
		operation: string,
		_error: Error,
		_context?: Record<string, any>
	): ErrorSuggestion[] {
		const suggestions: ErrorSuggestion[] = [];

		// Operation-specific suggestions
		switch (operation) {
			case 'chat':
				suggestions.push(
					{
						type: 'command',
						title: 'Check AI Configuration',
						description: 'Verify your AI provider settings',
						action: 'kirocli config show',
						priority: 'high'
					},
					{
						type: 'command',
						title: 'Test AI Connection',
						description: 'Test your AI provider connection',
						action: 'kirocli config test',
						priority: 'high'
					}
				);
				break;

			case 'spec':
				suggestions.push(
					{
						type: 'command',
						title: 'Validate Spec File',
						description: 'Check your spec file for syntax errors',
						action: 'kirocli spec validate',
						priority: 'high'
					},
					{
						type: 'fix',
						title: 'Check Spec Format',
						description: 'Ensure your spec file follows the correct YAML format',
						priority: 'medium'
					}
				);
				break;

			case 'hook':
				suggestions.push(
					{
						type: 'command',
						title: 'List Available Hooks',
						description: 'Check what hooks are available',
						action: 'kirocli hook list',
						priority: 'high'
					},
					{
						type: 'command',
						title: 'Check Hook Status',
						description: 'Verify hook configuration and status',
						action: 'kirocli hook stats',
						priority: 'medium'
					}
				);
				break;
		}

		return suggestions;
	}

	/**
	 * Format error for display with suggestions
	 */
	static formatErrorForDisplay(enhancedError: EnhancedError): {
		title: string;
		message: string;
		details: string;
		suggestions: ErrorSuggestion[];
		severity: string;
	} {
		const severityEmoji = {
			critical: '🚨',
			error: '❌',
			warning: '⚠️',
			info: 'ℹ️'
		};

		return {
			title: `${severityEmoji[enhancedError.severity]} ${enhancedError.category.replace('_', ' ').toUpperCase()} Error`,
			message: enhancedError.userMessage,
			details: enhancedError.technicalDetails,
			suggestions: enhancedError.suggestions.sort((a, b) => {
				const priorityOrder = { high: 3, medium: 2, low: 1 };
				return priorityOrder[b.priority] - priorityOrder[a.priority];
			}),
			severity: enhancedError.severity
		};
	}

	/**
	 * Log error for debugging purposes
	 */
	static logError(enhancedError: EnhancedError, debug = false): void {
		if (debug) {
			console.error('Enhanced Error Details:', {
				category: enhancedError.category,
				severity: enhancedError.severity,
				userMessage: enhancedError.userMessage,
				technicalDetails: enhancedError.technicalDetails,
				suggestions: enhancedError.suggestions.length,
				context: enhancedError.context,
				timestamp: enhancedError.timestamp
			});
		}
	}
}