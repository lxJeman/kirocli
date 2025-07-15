/**
 * AI Integration Module
 * 
 * This module provides a unified interface for different AI providers
 * including OpenAI GPT, Anthropic Claude, and Google Gemini.
 */

export interface AIProvider {
	name: string;
	generateResponse(prompt: string): Promise<string>;
	isConfigured(): boolean;
}

export interface AIConfig {
	provider: 'openai' | 'claude' | 'gemini';
	apiKey?: string;
	model?: string;
}

/**
 * Main AI service that manages different providers
 */
export class AIService {
	private providers: Map<string, AIProvider> = new Map();
	private currentProvider?: AIProvider;

	constructor(private config: AIConfig) {
		// Provider initialization will be implemented in Phase 3
	}

	async generateResponse(prompt: string): Promise<string> {
		if (!this.currentProvider) {
			throw new Error('No AI provider configured');
		}

		return this.currentProvider.generateResponse(prompt);
	}

	setProvider(providerName: string): void {
		const provider = this.providers.get(providerName);
		if (!provider) {
			throw new Error(`Provider ${providerName} not found`);
		}
		this.currentProvider = provider;
	}

	getAvailableProviders(): string[] {
		return Array.from(this.providers.keys());
	}
}

// Export default instance (will be properly configured later)
export const aiService = new AIService({ provider: 'openai' });