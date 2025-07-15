import {OpenAI} from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import {GoogleGenerativeAI} from '@google/generative-ai';
import {AIMessage, AIConfig, SpecData} from './types.js';

export class AIProvider {
	private config: AIConfig;
	private openai?: OpenAI;
	private anthropic?: Anthropic;
	private gemini?: GoogleGenerativeAI;

	constructor(model = 'gpt-4') {
		this.config = this.loadConfig(model);
		this.initializeProviders();
	}

	private loadConfig(model: string): AIConfig {
		// Determine provider from model name
		let provider: 'openai' | 'claude' | 'gemini' = 'openai';
		if (model.includes('claude')) provider = 'claude';
		if (model.includes('gemini')) provider = 'gemini';

		return {
			provider,
			model,
			apiKey: this.getApiKey(provider),
			temperature: 0.7,
			maxTokens: 2000,
		};
	}

	private getApiKey(provider: string): string {
		const envKey = `${provider.toUpperCase()}_API_KEY`;
		const apiKey = process.env[envKey];
		
		if (!apiKey) {
			throw new Error(`${envKey} environment variable is required`);
		}
		
		return apiKey;
	}

	private initializeProviders() {
		switch (this.config.provider) {
			case 'openai':
				this.openai = new OpenAI({
					apiKey: this.config.apiKey,
				});
				break;
			case 'claude':
				this.anthropic = new Anthropic({
					apiKey: this.config.apiKey,
				});
				break;
			case 'gemini':
				this.gemini = new GoogleGenerativeAI(this.config.apiKey!);
				break;
		}
	}

	async chat(messages: AIMessage[]): Promise<string> {
		try {
			switch (this.config.provider) {
				case 'openai':
					return await this.chatOpenAI(messages);
				case 'claude':
					return await this.chatClaude(messages);
				case 'gemini':
					return await this.chatGemini(messages);
				default:
					throw new Error(`Unsupported provider: ${this.config.provider}`);
			}
		} catch (error) {
			throw new Error(`AI chat failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}
	}

	private async chatOpenAI(messages: AIMessage[]): Promise<string> {
		if (!this.openai) throw new Error('OpenAI not initialized');

		const response = await this.openai.chat.completions.create({
			model: this.config.model || 'gpt-4',
			messages: messages.map(msg => ({
				role: msg.role,
				content: msg.content,
			})),
			temperature: this.config.temperature,
			max_tokens: this.config.maxTokens,
		});

		return response.choices[0]?.message?.content || 'No response generated';
	}

	private async chatClaude(messages: AIMessage[]): Promise<string> {
		if (!this.anthropic) throw new Error('Anthropic not initialized');

		const response = await this.anthropic.messages.create({
			model: this.config.model || 'claude-3-sonnet-20240229',
			max_tokens: this.config.maxTokens || 2000,
			messages: messages.filter(msg => msg.role !== 'system').map(msg => ({
				role: msg.role as 'user' | 'assistant',
				content: msg.content,
			})),
		});

		return response.content[0]?.type === 'text' ? response.content[0].text : 'No response generated';
	}

	private async chatGemini(messages: AIMessage[]): Promise<string> {
		if (!this.gemini) throw new Error('Gemini not initialized');

		const model = this.gemini.getGenerativeModel({
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
		return result.response.text();
	}

	async generateFromSpec(spec: SpecData): Promise<string> {
		const prompt = this.buildSpecPrompt(spec);
		const messages: AIMessage[] = [
			{
				role: 'system',
				content: 'You are a code generation assistant. Generate clean, production-ready code based on the provided specifications.',
			},
			{
				role: 'user',
				content: prompt,
			},
		];

		return await this.chat(messages);
	}

	private buildSpecPrompt(spec: SpecData): string {
		return `Generate ${spec.language} code for the following specification:

Goal: ${spec.goal}
Language: ${spec.language}
${spec.framework ? `Framework: ${spec.framework}` : ''}

Features:
${spec.features.map(feature => `- ${feature}`).join('\n')}

Please provide complete, working code with proper structure and comments.
${spec.outputPath ? `Output should be suitable for: ${spec.outputPath}` : ''}`;
	}
}