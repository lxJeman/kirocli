export interface AIMessage {
	role: 'user' | 'assistant' | 'system';
	content: string;
}

export interface AIProvider {
	chat(messages: AIMessage[]): Promise<string>;
	generateFromSpec(spec: any): Promise<string>;
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