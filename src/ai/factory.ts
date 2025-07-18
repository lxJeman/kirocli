import {AIProvider, AIConfig} from './types.js';
import {OpenAIProvider} from './providers/openai.js';
import {ClaudeProvider} from './providers/claude.js';
import {GeminiProvider} from './providers/gemini.js';
import {ConfigManager} from '../config/index.js';

export class AIProviderFactory {
	static create(config: AIConfig): AIProvider {
		switch (config.provider) {
			case 'openai':
				return new OpenAIProvider(config);
			case 'claude':
				return new ClaudeProvider(config);
			case 'gemini':
				return new GeminiProvider(config);
			default:
				throw new Error(`Unsupported AI provider: ${config.provider}`);
		}
	}

	static async createFromModel(model: string): Promise<AIProvider> {
		const config = await this.getConfigFromModel(model);
		return this.create(config);
	}

	static async createDefault(): Promise<AIProvider> {
		const configManager = ConfigManager.getInstance();
		const aiConfig = await configManager.loadConfig();
		return this.createFromModel(aiConfig.default_model);
	}

	private static async getConfigFromModel(model: string): Promise<AIConfig> {
		const configManager = ConfigManager.getInstance();
		const aiConfig = await configManager.loadConfig();

		// Determine provider from model name
		let provider: 'openai' | 'claude' | 'gemini' = aiConfig.default_provider;
		if (model.includes('claude')) provider = 'claude';
		if (model.includes('gemini')) provider = 'gemini';
		if (model.includes('gpt')) provider = 'openai';

		const providerConfig = await configManager.getProviderConfig(provider);
		const apiKey = await configManager.getApiKey(provider);

		return {
			provider,
			model: model || aiConfig.default_model,
			apiKey,
			temperature: providerConfig.temperature,
			maxTokens: providerConfig.max_tokens,
		};
	}

	static getSupportedProviders(): string[] {
		return ['openai', 'claude', 'gemini'];
	}

	static getSupportedModels(): Record<string, string[]> {
		return {
			openai: ['gpt-4', 'gpt-3.5-turbo', 'gpt-4-turbo'],
			claude: [
				'claude-3-sonnet-20240229',
				'claude-3-haiku-20240307',
				'claude-3-opus-20240229',
			],
			gemini: ['gemini-pro', 'gemini-pro-vision'],
		};
	}
}
