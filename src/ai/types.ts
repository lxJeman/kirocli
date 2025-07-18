export interface AIMessage {
	role: 'user' | 'assistant' | 'system';
	content: string;
}

export abstract class AIProvider {
	protected config: AIConfig;

	constructor(config: AIConfig) {
		this.config = config;
	}

	// Abstract methods that all providers must implement
	abstract chat(messages: AIMessage[]): Promise<string>;
	abstract generateFromSpec(spec: SpecData): Promise<string>;
	abstract validateConnection(): Promise<boolean>;

	// Common functionality all providers can use
	protected buildSpecPrompt(spec: SpecData): string {
		return `Generate ${spec.language} code for the following specification:

Goal: ${spec.goal}
Language: ${spec.language}
${spec.framework ? `Framework: ${spec.framework}` : ''}

Features:
${spec.features.map(feature => `- ${feature}`).join('\n')}

Please provide complete, working code with proper structure and comments.
${spec.outputPath ? `Output should be suitable for: ${spec.outputPath}` : ''}`;
	}

	// Getter for provider info
	get providerName(): string {
		return this.config.provider;
	}

	get modelName(): string {
		return this.config.model || 'default';
	}
}

export interface AIConfig {
	provider: 'openai' | 'claude' | 'gemini';
	apiKey?: string;
	model?: string;
	temperature?: number;
	maxTokens?: number;
}

export interface SpecData {
	goal: string;
	language: string;
	framework?: string;
	features: string[];
	outputPath?: string;
}
