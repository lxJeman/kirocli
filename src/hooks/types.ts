/**
 * Agent Hooks System - Type Definitions
 * Defines interfaces and types for the hook system
 */

export interface HookConfig {
	id: string;
	name: string;
	description: string;
	version?: string;
	author?: string;
	enabled: boolean;
	trigger: HookTrigger;
	actions: HookAction[];
	conditions?: HookCondition[];
	variables?: Record<string, any>;
	timeout?: number; // in milliseconds
	retries?: number;
	onError?: 'continue' | 'stop' | 'retry';
	tags?: string[];
	category?: HookCategory;
	created?: string;
	modified?: string;
}

export interface HookTrigger {
	type: TriggerType;
	event?: string;
	schedule?: string; // cron expression
	filePattern?: string;
	command?: string;
	manual?: boolean;
}

export interface HookAction {
	id: string;
	type: ActionType;
	command?: string;
	script?: string;
	file?: string;
	content?: string;
	target?: string;
	source?: string;
	message?: string;
	title?: string;
	prompt?: string;
	specFile?: string;
	parameters?: Record<string, any>;
	condition?: string;
	timeout?: number;
	continueOnError?: boolean;
}

export interface HookCondition {
	type: 'file_exists' | 'command_success' | 'env_var' | 'git_status' | 'custom';
	parameter: string;
	value?: any;
	operator?: 'equals' | 'contains' | 'matches' | 'exists' | 'not_exists';
}

export type TriggerType =
	| 'manual' // User-triggered
	| 'file_change' // File system events
	| 'git_event' // Git operations
	| 'schedule' // Time-based
	| 'command' // After specific commands
	| 'startup' // On KiroCLI startup
	| 'shutdown' // On KiroCLI shutdown
	| 'spec_build' // After spec build
	| 'spec_validate'; // After spec validation

export type ActionType =
	| 'shell' // Execute shell command
	| 'script' // Run script file
	| 'file_create' // Create file
	| 'file_copy' // Copy file
	| 'file_move' // Move file
	| 'file_delete' // Delete file
	| 'git' // Git operations
	| 'npm' // NPM operations
	| 'notification' // Show notification
	| 'ai_generate' // AI code generation
	| 'spec_build' // Build from spec
	| 'custom'; // Custom action

export type HookCategory =
	| 'git' // Git workflow automation
	| 'build' // Build and test automation
	| 'deploy' // Deployment automation
	| 'maintenance' // Code maintenance
	| 'notification' // Notifications and alerts
	| 'development' // Development workflow
	| 'custom'; // User-defined

export interface HookExecutionResult {
	hookId: string;
	success: boolean;
	duration: number;
	actions: ActionExecutionResult[];
	error?: string;
	output?: string;
	timestamp: string;
}

export interface ActionExecutionResult {
	actionId: string;
	success: boolean;
	duration: number;
	output?: string;
	error?: string;
	exitCode?: number;
}

export interface HookExecutionContext {
	workingDirectory: string;
	environment: Record<string, string>;
	variables: Record<string, any>;
	trigger: {
		type: TriggerType;
		data?: any;
	};
	timestamp: string;
}

export interface HookListOptions {
	category?: HookCategory;
	enabled?: boolean;
	tags?: string[];
	search?: string;
}

export interface HookCreateOptions {
	interactive?: boolean;
	template?: string;
	category?: HookCategory;
}

export interface HookStats {
	total: number;
	enabled: number;
	disabled: number;
	byCategory: Record<HookCategory, number>;
	lastExecuted?: string;
	totalExecutions: number;
	successRate: number;
}

// Built-in hook templates
export interface HookTemplate {
	id: string;
	name: string;
	description: string;
	category: HookCategory;
	config: Partial<HookConfig>;
}

// Hook validation result
export interface HookValidationResult {
	valid: boolean;
	errors: string[];
	warnings: string[];
}

// File watcher configuration
export interface FileWatcherConfig {
	patterns: string[];
	ignored?: string[];
	persistent?: boolean;
	ignoreInitial?: boolean;
}

// Git event types
export type GitEventType =
	| 'commit'
	| 'push'
	| 'pull'
	| 'branch_create'
	| 'branch_delete'
	| 'tag_create'
	| 'merge'
	| 'rebase';

// Notification types
export type NotificationType = 'info' | 'success' | 'warning' | 'error';
