import * as fs from 'fs/promises';
import * as path from 'path';
import * as yaml from 'js-yaml';
import * as os from 'os';

export interface AIProviderConfig {
	models: string[];
	temperature: number;
	max_tokens: number;
	rate_limit?: {
		requests_per_minute: number;
		tokens_per_minute: number;
	};
	api_key?: string;
}

export interface AIConfiguration {
	default_provider: 'openai' | 'claude' | 'gemini';
	default_model: string;
	providers: {
		openai: AIProviderConfig;
		claude: AIProviderConfig;
		gemini: AIProviderConfig;
	};
}

export class ConfigManager {
	private static instance: ConfigManager;
	private config: AIConfiguration | null = null;
	private configPath = '.kiro/config/ai.yaml';
	private userConfigPath = path.join(os.homedir(), '.kirocli', 'config.yaml');

	static getInstance(): ConfigManager {
		if (!ConfigManager.instance) {
			ConfigManager.instance = new ConfigManager();
		}
		return ConfigManager.instance;
	}

	async loadConfig(): Promise<AIConfiguration> {
		if (this.config) {
			return this.config;
		}

		try {
			// Try to load project-specific config first
			const projectConfig = await this.loadProjectConfig();

			// Try to load user-specific config
			const userConfig = await this.loadUserConfig();

			// Merge configs (project takes precedence)
			this.config = this.mergeConfigs(userConfig, projectConfig);

			// Apply environment variable overrides
			this.applyEnvironmentOverrides(this.config);

			return this.config;
		} catch (error) {
			console.warn(
				'Failed to load AI config, using defaults:',
				error instanceof Error ? error.message : 'Unknown error',
			);
			return this.getDefaultConfig();
		}
	}

	private async loadProjectConfig(): Promise<Partial<AIConfiguration>> {
		try {
			const content = await fs.readFile(this.configPath, 'utf8');
			return yaml.load(content) as AIConfiguration;
		} catch {
			return {};
		}
	}

	private async loadUserConfig(): Promise<Partial<AIConfiguration>> {
		try {
			const content = await fs.readFile(this.userConfigPath, 'utf8');
			return yaml.load(content) as AIConfiguration;
		} catch {
			return {};
		}
	}

	private mergeConfigs(
		userConfig: Partial<AIConfiguration>,
		projectConfig: Partial<AIConfiguration>,
	): AIConfiguration {
		const defaultConfig = this.getDefaultConfig();

		return {
			default_provider:
				projectConfig.default_provider ||
				userConfig.default_provider ||
				defaultConfig.default_provider,
			default_model:
				projectConfig.default_model ||
				userConfig.default_model ||
				defaultConfig.default_model,
			providers: {
				openai: {
					...defaultConfig.providers.openai,
					...userConfig.providers?.openai,
					...projectConfig.providers?.openai,
				},
				claude: {
					...defaultConfig.providers.claude,
					...userConfig.providers?.claude,
					...projectConfig.providers?.claude,
				},
				gemini: {
					...defaultConfig.providers.gemini,
					...userConfig.providers?.gemini,
					...projectConfig.providers?.gemini,
				},
			},
		};
	}

	private applyEnvironmentOverrides(config: AIConfiguration): void {
		// Override API keys from environment variables
		if (process.env['OPENAI_API_KEY']) {
			config.providers.openai.api_key = process.env['OPENAI_API_KEY'];
		}
		if (process.env['ANTHROPIC_API_KEY']) {
			config.providers.claude.api_key = process.env['ANTHROPIC_API_KEY'];
		}
		if (process.env['GOOGLE_API_KEY']) {
			config.providers.gemini.api_key = process.env['GOOGLE_API_KEY'];
		}

		// Override default provider if specified
		if (process.env['KIROCLI_DEFAULT_PROVIDER']) {
			const provider = process.env['KIROCLI_DEFAULT_PROVIDER'] as
				| 'openai'
				| 'claude'
				| 'gemini';
			if (['openai', 'claude', 'gemini'].includes(provider)) {
				config.default_provider = provider;
			}
		}

		// Override default model if specified
		if (process.env['KIROCLI_DEFAULT_MODEL']) {
			config.default_model = process.env['KIROCLI_DEFAULT_MODEL'];
		}
	}

	private getDefaultConfig(): AIConfiguration {
		return {
			default_provider: 'openai',
			default_model: 'gpt-4',
			providers: {
				openai: {
					models: ['gpt-4', 'gpt-3.5-turbo', 'gpt-4-turbo'],
					temperature: 0.7,
					max_tokens: 2000,
					rate_limit: {
						requests_per_minute: 60,
						tokens_per_minute: 90000,
					},
				},
				claude: {
					models: [
						'claude-3-sonnet-20240229',
						'claude-3-haiku-20240307',
						'claude-3-opus-20240229',
					],
					temperature: 0.7,
					max_tokens: 2000,
					rate_limit: {
						requests_per_minute: 60,
						tokens_per_minute: 100000,
					},
				},
				gemini: {
					models: ['gemini-pro', 'gemini-pro-vision'],
					temperature: 0.7,
					max_tokens: 2000,
					rate_limit: {
						requests_per_minute: 60,
						tokens_per_minute: 32000,
					},
				},
			},
		};
	}

	async saveUserConfig(config: Partial<AIConfiguration>): Promise<void> {
		// Ensure user config directory exists
		const userConfigDir = path.dirname(this.userConfigPath);
		await fs.mkdir(userConfigDir, {recursive: true});

		// Save user config with proper formatting for long strings
		const yamlContent = yaml.dump(config, {
			indent: 2,
			lineWidth: 200, // Allow longer lines
			noRefs: true,
			quotingType: '"',
			forceQuotes: true,
		});
		await fs.writeFile(this.userConfigPath, yamlContent, 'utf8');

		// Reload config
		this.config = null;
		await this.loadConfig();
	}

	async getProviderConfig(
		provider: 'openai' | 'claude' | 'gemini',
	): Promise<AIProviderConfig> {
		const config = await this.loadConfig();
		return config.providers[provider];
	}

	async getApiKey(provider: 'openai' | 'claude' | 'gemini'): Promise<string> {
		const config = await this.loadConfig();
		const apiKey = config.providers[provider].api_key;

		if (!apiKey) {
			const envKey = `${provider.toUpperCase()}_API_KEY`;
			throw new Error(
				`API key not found for ${provider}. Please set ${envKey} environment variable or configure it in ${this.userConfigPath}`,
			);
		}

		return apiKey;
	}

	async validateApiKeys(): Promise<Record<string, boolean>> {
		const results: Record<string, boolean> = {};

		for (const provider of ['openai', 'claude', 'gemini'] as const) {
			try {
				await this.getApiKey(provider);
				results[provider] = true;
			} catch {
				results[provider] = false;
			}
		}

		return results;
	}

	async setApiKey(
		provider: 'openai' | 'claude' | 'gemini',
		apiKey: string,
	): Promise<void> {
		// Load current user config or create empty one
		let userConfig: Partial<AIConfiguration>;
		try {
			const content = await fs.readFile(this.userConfigPath, 'utf8');
			userConfig = yaml.load(content) as Partial<AIConfiguration>;
		} catch {
			userConfig = {};
		}

		// Ensure providers structure exists
		if (!userConfig.providers) {
			userConfig.providers = {
				openai: {} as AIProviderConfig,
				claude: {} as AIProviderConfig,
				gemini: {} as AIProviderConfig,
			};
		}
		if (!userConfig.providers[provider]) {
			userConfig.providers[provider] = {} as AIProviderConfig;
		}

		// Set the API key
		userConfig.providers[provider]!.api_key = apiKey;

		// Save the updated config
		await this.saveUserConfig(userConfig);

		console.log(`✅ API key for ${provider} saved to ${this.userConfigPath}`);
	}
}
