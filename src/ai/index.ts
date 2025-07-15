// Re-export everything for easy importing
export * from './types.js';
export * from './factory.js';
export {OpenAIProvider} from './providers/openai.js';
export {ClaudeProvider} from './providers/claude.js';
export {GeminiProvider} from './providers/gemini.js';

// For backward compatibility, create a simple wrapper
import {AIProviderFactory} from './factory.js';
import {AIProvider as BaseAIProvider} from './types.js';

export class AIProvider {
	static async create(model = 'gpt-4'): Promise<BaseAIProvider> {
		return AIProviderFactory.createFromModel(model);
	}

	static async createDefault(): Promise<BaseAIProvider> {
		return AIProviderFactory.createDefault();
	}
}