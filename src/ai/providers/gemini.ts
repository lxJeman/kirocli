import {GoogleGenerativeAI} from '@google/generative-ai';
import {AIProvider, AIMessage, AIConfig, SpecData} from '../types.js';
import {RateLimiter} from '../rate-limiter.js';

export class GeminiProvider extends AIProvider {
	private client: GoogleGenerativeAI;
	private rateLimiter: RateLimiter;

	constructor(config: AIConfig) {
		super(config);

		if (!config.apiKey) {
			throw new Error('Google API key is required');
		}

		this.client = new GoogleGenerativeAI(config.apiKey);

		// Initialize rate limiter with Gemini-specific limits
		this.rateLimiter = new RateLimiter({
			requests_per_minute: 60,
			tokens_per_minute: 32000,
		});
	}

	async chat(messages: AIMessage[]): Promise<string> {
		// Estimate tokens for rate limiting
		const estimatedTokens = this.estimateTokens(messages);

		try {
			// Check rate limits before making request
			await this.rateLimiter.checkRateLimit(estimatedTokens);

			const model = this.client.getGenerativeModel({
				model: this.config.model || 'gemini-pro',
			});

			const chat = model.startChat({
				history: messages.slice(0, -1).map(msg => ({
					role: msg.role === 'assistant' ? 'model' : 'user',
					parts: [{text: msg.content}],
				})),
			});

			const lastMessage = messages[messages.length - 1];
			if (!lastMessage) {
				throw new Error('No messages provided');
			}

			const result = await chat.sendMessage(lastMessage.content);
			const response = result.response.text();

			// Log successful request
			console.log(
				`✅ Gemini request successful. Remaining: ${this.rateLimiter.getRemainingRequests()} requests, ${this.rateLimiter.getRemainingTokens()} tokens`,
			);

			return response;
		} catch (error) {
			if (error instanceof Error) {
				// Handle specific Gemini errors
				if (error.message.includes('quota')) {
					throw new Error(
						`Gemini quota exceeded. Please check your billing settings.`,
					);
				}
				if (error.message.includes('API_KEY')) {
					throw new Error(
						`Invalid Google API key. Please check your GOOGLE_API_KEY environment variable.`,
					);
				}
				if (error.message.includes('RATE_LIMIT')) {
					throw new Error(
						`Gemini rate limit exceeded. Please wait before making another request.`,
					);
				}
				throw new Error(`Gemini chat failed: ${error.message}`);
			}
			throw new Error(`Gemini chat failed: Unknown error`);
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
				role: 'user',
				content: `You are a code generation assistant. Generate clean, production-ready code based on the provided specifications.\n\n${prompt}`,
			},
		];

		return await this.chat(messages);
	}

	async validateConnection(): Promise<boolean> {
		try {
			const model = this.client.getGenerativeModel({
				model: this.config.model || 'gemini-pro',
			});

			await model.generateContent('Hi');
			return true;
		} catch {
			return false;
		}
	}
}
