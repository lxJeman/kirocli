/**
 * Agent Hooks System - Hook Manager
 * Core hook management functionality
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { watch } from 'chokidar';
import { execa } from 'execa';
import {
	HookConfig,
	HookExecutionResult,
	HookExecutionContext,
	HookListOptions,
	HookCreateOptions,
	HookStats,
	HookTemplate,
	HookValidationResult,
	ActionExecutionResult,
	ActionType,
	HookCategory
} from './types.js';

export class HookManager {
	private hooks: Map<string, HookConfig> = new Map();
	private watchers: Map<string, any> = new Map();
	private executionHistory: HookExecutionResult[] = [];
	private readonly hooksDirectory: string;
	// private readonly configFile: string;
	private isInitialized = false;

	constructor(hooksDirectory = '.kiro/hooks') {
		this.hooksDirectory = hooksDirectory;
		// this.configFile = path.join(hooksDirectory, 'config.yaml');
	}

	/**
	 * Initialize the hook manager
	 */
	async initialize(): Promise<void> {
		if (this.isInitialized) return;

		try {
			// Ensure hooks directory exists
			await fs.mkdir(this.hooksDirectory, { recursive: true });

			// Load existing hooks
			await this.loadHooks();

			// Start file watchers for enabled hooks
			await this.startFileWatchers();

			this.isInitialized = true;
		} catch (error) {
			throw new Error(`Failed to initialize hook manager: ${(error as Error).message}`);
		}
	}

	/**
	 * Load all hooks from the hooks directory
	 */
	async loadHooks(): Promise<void> {
		try {
			const files = await fs.readdir(this.hooksDirectory);
			const hookFiles = files.filter(file => file.endsWith('.yaml') || file.endsWith('.yml'));

			for (const file of hookFiles) {
				if (file === 'config.yaml' || file === 'config.yml') continue;

				try {
					const hookPath = path.join(this.hooksDirectory, file);
					const content = await fs.readFile(hookPath, 'utf8');
					const hookConfig = yaml.load(content) as HookConfig;

					// Validate hook configuration
					const validation = this.validateHook(hookConfig);
					if (!validation.valid) {
						console.warn(`Invalid hook configuration in ${file}: ${validation.errors.join(', ')}`);
						continue;
					}

					// Set default values
					hookConfig.id = hookConfig.id || path.basename(file, path.extname(file));
					hookConfig.enabled = hookConfig.enabled !== false;
					hookConfig.timeout = hookConfig.timeout || 30000;
					hookConfig.retries = hookConfig.retries || 0;
					hookConfig.onError = hookConfig.onError || 'stop';

					this.hooks.set(hookConfig.id, hookConfig);
				} catch (error) {
					console.warn(`Failed to load hook from ${file}: ${(error as Error).message}`);
				}
			}
		} catch (error) {
			// Directory doesn't exist or is empty, that's okay
		}
	}

	/**
	 * Save a hook configuration to file
	 */
	async saveHook(hook: HookConfig): Promise<void> {
		const hookPath = path.join(this.hooksDirectory, `${hook.id}.yaml`);
		const yamlContent = yaml.dump(hook, {
			indent: 2,
			lineWidth: 100,
			noRefs: true
		});

		await fs.writeFile(hookPath, yamlContent, 'utf8');
		this.hooks.set(hook.id, hook);
	}

	/**
	 * Create a new hook
	 */
	async createHook(options: HookCreateOptions = {}): Promise<HookConfig> {
		const hookId = `hook-${Date.now()}`;
		
		let hookConfig: HookConfig;

		if (options.template) {
			const template = this.getHookTemplate(options.template);
			if (!template) {
				throw new Error(`Hook template '${options.template}' not found`);
			}

			hookConfig = {
				id: hookId,
				name: template.name,
				description: template.description,
				enabled: true,
				trigger: { type: 'manual', manual: true },
				actions: [],
				category: template.category,
				created: new Date().toISOString(),
				...template.config
			} as HookConfig;
		} else {
			hookConfig = {
				id: hookId,
				name: 'New Hook',
				description: 'A new agent hook',
				enabled: true,
				trigger: { type: 'manual', manual: true },
				actions: [],
				category: 'custom',
				created: new Date().toISOString()
			};
		}

		await this.saveHook(hookConfig);
		return hookConfig;
	}

	/**
	 * List hooks with optional filtering
	 */
	listHooks(options: HookListOptions = {}): HookConfig[] {
		let hooks = Array.from(this.hooks.values());

		// Filter by category
		if (options.category) {
			hooks = hooks.filter(hook => hook.category === options.category);
		}

		// Filter by enabled status
		if (options.enabled !== undefined) {
			hooks = hooks.filter(hook => hook.enabled === options.enabled);
		}

		// Filter by tags
		if (options.tags && options.tags.length > 0) {
			hooks = hooks.filter(hook => 
				hook.tags && hook.tags.some(tag => options.tags!.includes(tag))
			);
		}

		// Search filter
		if (options.search) {
			const searchLower = options.search.toLowerCase();
			hooks = hooks.filter(hook => 
				hook.name.toLowerCase().includes(searchLower) ||
				hook.description.toLowerCase().includes(searchLower) ||
				(hook.tags && hook.tags.some(tag => tag.toLowerCase().includes(searchLower)))
			);
		}

		return hooks.sort((a, b) => a.name.localeCompare(b.name));
	}

	/**
	 * Get a specific hook by ID
	 */
	getHook(id: string): HookConfig | undefined {
		return this.hooks.get(id);
	}

	/**
	 * Execute a hook by ID
	 */
	async executeHook(id: string, context?: Partial<HookExecutionContext>): Promise<HookExecutionResult> {
		const hook = this.hooks.get(id);
		if (!hook) {
			throw new Error(`Hook '${id}' not found`);
		}

		if (!hook.enabled) {
			throw new Error(`Hook '${id}' is disabled`);
		}

		const executionContext: HookExecutionContext = {
			workingDirectory: process.cwd(),
			environment: process.env as Record<string, string>,
			variables: hook.variables || {},
			trigger: { type: 'manual' },
			timestamp: new Date().toISOString(),
			...context
		};

		const startTime = Date.now();
		const result: HookExecutionResult = {
			hookId: id,
			success: false,
			duration: 0,
			actions: [],
			timestamp: executionContext.timestamp
		};

		try {
			// Check conditions
			if (hook.conditions && !await this.checkConditions(hook.conditions, executionContext)) {
				result.error = 'Hook conditions not met';
				return result;
			}

			// Execute actions
			for (const action of hook.actions) {
				const actionResult = await this.executeAction(action, executionContext, hook);
				result.actions.push(actionResult);

				if (!actionResult.success && !action.continueOnError) {
					if (hook.onError === 'stop') {
						break;
					} else if (hook.onError === 'retry' && hook.retries && hook.retries > 0) {
						// Implement retry logic
						for (let retry = 0; retry < hook.retries; retry++) {
							const retryResult = await this.executeAction(action, executionContext, hook);
							if (retryResult.success) {
								result.actions[result.actions.length - 1] = retryResult;
								break;
							}
						}
					}
				}
			}

			result.success = result.actions.every(action => action.success);
		} catch (error) {
			result.error = (error as Error).message;
		}

		result.duration = Date.now() - startTime;
		this.executionHistory.push(result);

		return result;
	}

	/**
	 * Execute a single action
	 */
	private async executeAction(
		action: any,
		context: HookExecutionContext,
		_hook: HookConfig
	): Promise<ActionExecutionResult> {
		const startTime = Date.now();
		const result: ActionExecutionResult = {
			actionId: action.id,
			success: false,
			duration: 0
		};

		try {
			switch (action.type as ActionType) {
				case 'shell':
					result.output = await this.executeShellAction(action, context);
					result.success = true;
					break;

				case 'script':
					result.output = await this.executeScriptAction(action, context);
					result.success = true;
					break;

				case 'file_create':
					await this.executeFileCreateAction(action, context);
					result.success = true;
					break;

				case 'file_copy':
					await this.executeFileCopyAction(action, context);
					result.success = true;
					break;

				case 'git':
					result.output = await this.executeGitAction(action, context);
					result.success = true;
					break;

				case 'npm':
					result.output = await this.executeNpmAction(action, context);
					result.success = true;
					break;

				case 'notification':
					await this.executeNotificationAction(action, context);
					result.success = true;
					break;

				case 'ai_generate':
					result.output = await this.executeAIGenerateAction(action, context);
					result.success = true;
					break;

				case 'spec_build':
					result.output = await this.executeSpecBuildAction(action, context);
					result.success = true;
					break;

				default:
					throw new Error(`Unknown action type: ${action.type}`);
			}
		} catch (error) {
			result.error = (error as Error).message;
			result.success = false;
		}

		result.duration = Date.now() - startTime;
		return result;
	}

	/**
	 * Execute shell command action
	 */
	private async executeShellAction(action: any, context: HookExecutionContext): Promise<string> {
		const command = this.processTemplate(action.command, context);
		const { stdout } = await execa('sh', ['-c', command], {
			cwd: context.workingDirectory,
			env: context.environment,
			timeout: action.timeout || 30000
		});
		return stdout;
	}

	/**
	 * Execute script file action
	 */
	private async executeScriptAction(action: any, context: HookExecutionContext): Promise<string> {
		const scriptPath = this.processTemplate(action.script, context);
		const { stdout } = await execa('sh', [scriptPath], {
			cwd: context.workingDirectory,
			env: context.environment,
			timeout: action.timeout || 30000
		});
		return stdout;
	}

	/**
	 * Execute file creation action
	 */
	private async executeFileCreateAction(action: any, context: HookExecutionContext): Promise<void> {
		const filePath = this.processTemplate(action.file, context);
		const content = this.processTemplate(action.content || '', context);
		
		// Ensure directory exists
		await fs.mkdir(path.dirname(filePath), { recursive: true });
		await fs.writeFile(filePath, content, 'utf8');
	}

	/**
	 * Execute file copy action
	 */
	private async executeFileCopyAction(action: any, context: HookExecutionContext): Promise<void> {
		const source = this.processTemplate(action.source, context);
		const target = this.processTemplate(action.target, context);
		
		// Ensure target directory exists
		await fs.mkdir(path.dirname(target), { recursive: true });
		await fs.copyFile(source, target);
	}

	/**
	 * Execute Git action
	 */
	private async executeGitAction(action: any, context: HookExecutionContext): Promise<string> {
		const gitCommand = this.processTemplate(action.command, context);
		const { stdout } = await execa('git', gitCommand.split(' '), {
			cwd: context.workingDirectory,
			env: context.environment
		});
		return stdout;
	}

	/**
	 * Execute NPM action
	 */
	private async executeNpmAction(action: any, context: HookExecutionContext): Promise<string> {
		const npmCommand = this.processTemplate(action.command, context);
		const { stdout } = await execa('npm', npmCommand.split(' '), {
			cwd: context.workingDirectory,
			env: context.environment
		});
		return stdout;
	}

	/**
	 * Execute notification action
	 */
	private async executeNotificationAction(action: any, context: HookExecutionContext): Promise<void> {
		const message = this.processTemplate(action.message, context);
		console.log(`🔔 ${action.title || 'Notification'}: ${message}`);
	}

	/**
	 * Execute AI generation action
	 */
	private async executeAIGenerateAction(action: any, context: HookExecutionContext): Promise<string> {
		const { AIProvider } = await import('../ai/index.js');
		const ai = await AIProvider.createDefault();
		
		const prompt = this.processTemplate(action.prompt, context);
		return await ai.chat([{ role: 'user', content: prompt }]);
	}

	/**
	 * Execute spec build action
	 */
	private async executeSpecBuildAction(action: any, context: HookExecutionContext): Promise<string> {
		const { SpecParser } = await import('../parser/index.js');
		const parser = new SpecParser();
		
		const specFile = this.processTemplate(action.specFile || '.kiro/spec.yaml', context);
		const spec = await parser.parseSpec(specFile);
		const result = await parser.generateCode(spec);
		
		return `Generated ${result.files.length} files in ${result.duration}ms`;
	}

	/**
	 * Check hook conditions
	 */
	private async checkConditions(conditions: any[], context: HookExecutionContext): Promise<boolean> {
		for (const condition of conditions) {
			const result = await this.checkCondition(condition, context);
			if (!result) return false;
		}
		return true;
	}

	/**
	 * Check a single condition
	 */
	private async checkCondition(condition: any, context: HookExecutionContext): Promise<boolean> {
		switch (condition.type) {
			case 'file_exists':
				try {
					await fs.access(condition.parameter);
					return true;
				} catch {
					return false;
				}

			case 'command_success':
				try {
					await execa('sh', ['-c', condition.parameter], {
						cwd: context.workingDirectory
					});
					return true;
				} catch {
					return false;
				}

			case 'env_var':
				const envValue = context.environment[condition.parameter];
				if (!condition.value) return !!envValue;
				
				switch (condition.operator) {
					case 'equals':
						return envValue === condition.value;
					case 'contains':
						return envValue ? envValue.includes(condition.value) : false;
					default:
						return !!envValue;
				}

			default:
				return true;
		}
	}

	/**
	 * Process template strings with variable substitution
	 */
	private processTemplate(template: string, context: HookExecutionContext): string {
		let processed = template;

		// Replace context variables
		processed = processed.replace(/\{\{(\w+)\}\}/g, (match, key) => {
			return context.variables[key] || context.environment[key] || match;
		});

		// Replace built-in variables
		processed = processed.replace(/\{\{timestamp\}\}/g, context.timestamp);
		processed = processed.replace(/\{\{workingDirectory\}\}/g, context.workingDirectory);

		return processed;
	}

	/**
	 * Start file watchers for hooks with file_change triggers
	 */
	private async startFileWatchers(): Promise<void> {
		for (const hook of this.hooks.values()) {
			if (hook.enabled && hook.trigger.type === 'file_change' && hook.trigger.filePattern) {
				const watcher = watch(hook.trigger.filePattern, {
					persistent: true,
					ignoreInitial: true
				});

				watcher.on('change', async (filePath) => {
					try {
						await this.executeHook(hook.id, {
							trigger: { type: 'file_change', data: { filePath } }
						});
					} catch (error) {
						console.error(`Error executing hook ${hook.id}:`, error);
					}
				});

				this.watchers.set(hook.id, watcher);
			}
		}
	}

	/**
	 * Stop all file watchers
	 */
	async stopFileWatchers(): Promise<void> {
		for (const [hookId, watcher] of this.watchers) {
			await watcher.close();
			this.watchers.delete(hookId);
		}
	}

	/**
	 * Validate hook configuration
	 */
	validateHook(hook: any): HookValidationResult {
		const errors: string[] = [];
		const warnings: string[] = [];

		// Required fields
		if (!hook.name) errors.push('Missing required field: name');
		if (!hook.description) errors.push('Missing required field: description');
		if (!hook.trigger) errors.push('Missing required field: trigger');
		if (!hook.actions || !Array.isArray(hook.actions)) {
			errors.push('Missing required field: actions (must be an array)');
		}

		// Validate trigger
		if (hook.trigger && !hook.trigger.type) {
			errors.push('Trigger must have a type');
		}

		// Validate actions
		if (hook.actions && Array.isArray(hook.actions)) {
			hook.actions.forEach((action: any, index: number) => {
				if (!action.type) {
					errors.push(`Action ${index + 1} missing required field: type`);
				}
				if (!action.id) {
					warnings.push(`Action ${index + 1} missing recommended field: id`);
				}
			});
		}

		return {
			valid: errors.length === 0,
			errors,
			warnings
		};
	}

	/**
	 * Get hook statistics
	 */
	getStats(): HookStats {
		const hooks = Array.from(this.hooks.values());
		const enabled = hooks.filter(h => h.enabled);
		const byCategory = hooks.reduce((acc, hook) => {
			const category = hook.category || 'custom';
			acc[category] = (acc[category] || 0) + 1;
			return acc;
		}, {} as Record<string, number>);

		const executions = this.executionHistory;
		const successful = executions.filter(e => e.success);

		return {
			total: hooks.length,
			enabled: enabled.length,
			disabled: hooks.length - enabled.length,
			byCategory: byCategory as Record<HookCategory, number>,
			lastExecuted: executions.length > 0 ? executions[executions.length - 1]?.timestamp : undefined,
			totalExecutions: executions.length,
			successRate: executions.length > 0 ? (successful.length / executions.length) * 100 : 0
		};
	}

	/**
	 * Get built-in hook templates
	 */
	getHookTemplates(): HookTemplate[] {
		return [
			{
				id: 'git-auto-commit',
				name: 'Git Auto Commit',
				description: 'Automatically commit changes when files are modified',
				category: 'git',
				config: {
					trigger: {
						type: 'file_change',
						filePattern: 'src/**/*'
					},
					actions: [
						{
							id: 'git-add',
							type: 'git',
							command: 'add .'
						},
						{
							id: 'git-commit',
							type: 'git',
							command: 'commit -m "Auto-commit: {{timestamp}}"'
						}
					]
				}
			},
			{
				id: 'build-on-change',
				name: 'Build on File Change',
				description: 'Automatically build project when source files change',
				category: 'build',
				config: {
					trigger: {
						type: 'file_change',
						filePattern: 'src/**/*'
					},
					actions: [
						{
							id: 'npm-build',
							type: 'npm',
							command: 'run build'
						},
						{
							id: 'notify',
							type: 'notification',
							message: 'Project built successfully at {{timestamp}}'
						}
					]
				}
			},
			{
				id: 'test-runner',
				name: 'Test Runner',
				description: 'Run tests when test files or source files change',
				category: 'build',
				config: {
					trigger: {
						type: 'file_change',
						filePattern: '{src,test}/**/*'
					},
					actions: [
						{
							id: 'run-tests',
							type: 'npm',
							command: 'test'
						}
					]
				}
			},
			{
				id: 'deploy-on-push',
				name: 'Deploy on Git Push',
				description: 'Deploy application when changes are pushed to main branch',
				category: 'deploy',
				config: {
					trigger: {
						type: 'git_event',
						event: 'push'
					},
					conditions: [
						{
							type: 'command_success',
							parameter: 'git branch --show-current | grep -q main'
						}
					],
					actions: [
						{
							id: 'deploy',
							type: 'shell',
							command: 'npm run deploy'
						},
						{
							id: 'notify-deploy',
							type: 'notification',
							message: 'Application deployed successfully'
						}
					]
				}
			}
		];
	}

	/**
	 * Get a specific hook template
	 */
	getHookTemplate(id: string): HookTemplate | undefined {
		return this.getHookTemplates().find(template => template.id === id);
	}

	/**
	 * Delete a hook
	 */
	async deleteHook(id: string): Promise<void> {
		const hook = this.hooks.get(id);
		if (!hook) {
			throw new Error(`Hook '${id}' not found`);
		}

		// Stop file watcher if exists
		const watcher = this.watchers.get(id);
		if (watcher) {
			await watcher.close();
			this.watchers.delete(id);
		}

		// Remove from memory
		this.hooks.delete(id);

		// Delete file
		const hookPath = path.join(this.hooksDirectory, `${id}.yaml`);
		try {
			await fs.unlink(hookPath);
		} catch (error) {
			// File might not exist, that's okay
		}
	}

	/**
	 * Enable/disable a hook
	 */
	async toggleHook(id: string, enabled?: boolean): Promise<void> {
		const hook = this.hooks.get(id);
		if (!hook) {
			throw new Error(`Hook '${id}' not found`);
		}

		hook.enabled = enabled !== undefined ? enabled : !hook.enabled;
		hook.modified = new Date().toISOString();

		await this.saveHook(hook);

		// Restart file watchers if needed
		if (hook.enabled && hook.trigger.type === 'file_change') {
			await this.startFileWatchers();
		} else if (!hook.enabled) {
			const watcher = this.watchers.get(id);
			if (watcher) {
				await watcher.close();
				this.watchers.delete(id);
			}
		}
	}

	/**
	 * Get execution history
	 */
	getExecutionHistory(limit = 50): HookExecutionResult[] {
		return this.executionHistory
			.slice(-limit)
			.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
	}

	/**
	 * Clear execution history
	 */
	clearExecutionHistory(): void {
		this.executionHistory = [];
	}

	/**
	 * Cleanup resources
	 */
	async cleanup(): Promise<void> {
		await this.stopFileWatchers();
	}
}