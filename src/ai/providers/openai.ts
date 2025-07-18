import {OpenAI} from 'openai';
import {AIProvider, AIMessage, AIConfig, SpecData} from '../types.js';
import {RateLimiter} from '../rate-limiter.js';

export class OpenAIProvider extends AIProvider {
	private client: OpenAI;
	private rateLimiter: RateLimiter;

	constructor(config: AIConfig) {
		super(config);

		if (!config.apiKey) {
			throw new Error('OpenAI API key is required');
		}

		this.client = new OpenAI({
			apiKey: config.apiKey,
		});

		// Initialize rate limiter with provider-specific limits
		this.rateLimiter = new RateLimiter({
			requests_per_minute: 60,
			tokens_per_minute: 90000,
		});
	}

	async chat(messages: AIMessage[]): Promise<string> {
		// Estimate tokens for rate limiting
		const estimatedTokens = this.estimateTokens(messages);

		try {
			// Check rate limits before making request
			await this.rateLimiter.checkRateLimit(estimatedTokens);

			const response = await this.client.chat.completions.create({
				model: this.config.model || 'gpt-4',
				messages: messages.map(msg => ({
					role: msg.role,
					content: msg.content,
				})),
				temperature: this.config.temperature || 0.7,
				max_tokens: this.config.maxTokens || 2000,
			});

			const result =
				response.choices[0]?.message?.content || 'No response generated';

			// Log successful request
			console.log(
				`✅ OpenAI request successful. Remaining: ${this.rateLimiter.getRemainingRequests()} requests, ${this.rateLimiter.getRemainingTokens()} tokens`,
			);

			return result;
		} catch (error) {
			if (error instanceof Error) {
				// Handle specific OpenAI errors
				if (error.message.includes('rate limit')) {
					throw new Error(
						`OpenAI rate limit exceeded. Please wait before making another request.`,
					);
				}
				if (error.message.includes('insufficient_quota')) {
					throw new Error(
						`OpenAI quota exceeded. Please check your billing settings.`,
					);
				}
				if (error.message.includes('invalid_api_key')) {
					throw new Error(
						`Invalid OpenAI API key. Please check your OPENAI_API_KEY environment variable.`,
					);
				}
				throw new Error(`OpenAI chat failed: ${error.message}`);
			}
			throw new Error(`OpenAI chat failed: Unknown error`);
		}
	}

	private estimateTokens(messages: AIMessage[]): number {
		// Rough estimation: ~4 characters per token
		const totalChars = messages.reduce(
			(sum, msg) => sum + msg.content.length,
			0,
		);
		return Math.ceil(totalChars / 4) + (this.config.maxTokens || 2000);
	}

	async generateFromSpec(spec: SpecData): Promise<string> {
		const prompt = this.buildSpecPrompt(spec);
		const messages: AIMessage[] = [
			{
				role: 'system',
				content:
					'You are a code generation assistant. Generate clean, production-ready code based on the provided specifications.',
			},
			{
				role: 'user',
				content: prompt,
			},
		];

		return await this.chat(messages);
	}

	async validateConnection(): Promise<boolean> {
		try {
			await this.client.models.list();
			return true;
		} catch {
			return false;
		}
	}
}
