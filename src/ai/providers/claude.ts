import Anthropic from '@anthropic-ai/sdk';
import {AIProvider, AIMessage, AIConfig, SpecData} from '../types.js';
import {RateLimiter} from '../rate-limiter.js';

export class ClaudeProvider extends AIProvider {
	private client: Anthropic;
	private rateLimiter: RateLimiter;

	constructor(config: AIConfig) {
		super(config);
		
		if (!config.apiKey) {
			throw new Error('Anthropic API key is required');
		}

		this.client = new Anthropic({
			apiKey: config.apiKey,
		});

		// Initialize rate limiter with Claude-specific limits
		this.rateLimiter = new RateLimiter({
			requests_per_minute: 60,
			tokens_per_minute: 100000,
		});
	}

	async chat(messages: AIMessage[]): Promise<string> {
		// Estimate tokens for rate limiting
		const estimatedTokens = this.estimateTokens(messages);
		
		try {
			// Check rate limits before making request
			await this.rateLimiter.checkRateLimit(estimatedTokens);

			const response = await this.client.messages.create({
				model: this.config.model || 'claude-3-sonnet-20240229',
				max_tokens: this.config.maxTokens || 2000,
				messages: messages.filter(msg => msg.role !== 'system').map(msg => ({
					role: msg.role as 'user' | 'assistant',
					content: msg.content,
				})),
			});

			const result = response.content[0]?.type === 'text' ? response.content[0].text : 'No response generated';
			
			// Log successful request
			console.log(`✅ Claude request successful. Remaining: ${this.rateLimiter.getRemainingRequests()} requests, ${this.rateLimiter.getRemainingTokens()} tokens`);
			
			return result;
		} catch (error) {
			if (error instanceof Error) {
				// Handle specific Claude errors
				if (error.message.includes('rate_limit')) {
					throw new Error(`Claude rate limit exceeded. Please wait before making another request.`);
				}
				if (error.message.includes('insufficient_quota')) {
					throw new Error(`Claude quota exceeded. Please check your billing settings.`);
				}
				if (error.message.includes('authentication_error')) {
					throw new Error(`Invalid Claude API key. Please check your ANTHROPIC_API_KEY environment variable.`);
				}
				throw new Error(`Claude chat failed: ${error.message}`);
			}
			throw new Error(`Claude chat failed: Unknown error`);
		}
	}

	private estimateTokens(messages: AIMessage[]): number {
		// Rough estimation: ~4 characters per token
		const totalChars = messages.reduce((sum, msg) => sum + msg.content.length, 0);
		return Math.ceil(totalChars / 4) + (this.config.maxTokens || 2000);
	}

	async generateFromSpec(spec: SpecData): Promise<string> {
		const prompt = this.buildSpecPrompt(spec);
		const messages: AIMessage[] = [
			{
				role: 'user',
				content: `You are a code generation assistant. Generate clean, production-ready code based on the provided specifications.\n\n${prompt}`,
			},
		];

		return await this.chat(messages);
	}

	async validateConnection(): Promise<boolean> {
		try {
			// Claude doesn't have a simple ping endpoint, so we'll try a minimal request
			await this.client.messages.create({
				model: this.config.model || 'claude-3-haiku-20240307',
				max_tokens: 10,
				messages: [{role: 'user', content: 'Hi'}],
			});
			return true;
		} catch {
			return false;
		}
	}
}