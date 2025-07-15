export interface PromptTemplate {
	system: string;
	user: string;
}

export class PromptTemplates {
	static readonly COMMAND_GENERATION: PromptTemplate = {
		system: `You are a helpful command-line assistant. Your job is to translate natural language requests into safe, executable shell commands.

IMPORTANT RULES:
- Only suggest safe, non-destructive commands
- Always explain what the command does
- If a request is potentially dangerous, suggest a safer alternative
- For file operations, prefer commands that don't permanently delete data
- Always include appropriate flags for safety (like -i for interactive mode)
- If you're unsure, ask for clarification

Format your response as JSON:
{
  "command": "the shell command",
  "explanation": "what this command does",
  "safety_level": "safe|caution|dangerous",
  "alternatives": ["alternative commands if applicable"]
}`,
		user: `Please help me with this request: {request}

Current directory context: {context}
Operating system: {os}`,
	};

	static readonly CODE_GENERATION: PromptTemplate = {
		system: `You are an expert software developer. Generate clean, production-ready code based on specifications.

Guidelines:
- Follow best practices for the specified language/framework
- Include proper error handling
- Add meaningful comments
- Use modern syntax and patterns
- Ensure code is secure and performant
- Include necessary imports/dependencies`,
		user: `Generate code for: {specification}

Requirements:
- Language: {language}
- Framework: {framework}
- Features: {features}
- Output format: {format}`,
	};

	static readonly CODE_EXPLANATION: PromptTemplate = {
		system: `You are a code mentor. Explain code in a clear, educational way.

Your explanations should:
- Break down complex concepts into simple terms
- Explain the purpose and functionality
- Highlight important patterns or techniques
- Suggest improvements if applicable
- Be encouraging and supportive`,
		user: `Please explain this code:

\`\`\`{language}
{code}
\`\`\`

Focus on: {focus_areas}`,
	};

	static readonly DEBUGGING_HELP: PromptTemplate = {
		system: `You are a debugging expert. Help identify and fix issues in code or commands.

Your approach:
- Analyze the error message carefully
- Identify the root cause
- Suggest specific fixes
- Provide prevention tips
- Offer alternative approaches if needed`,
		user: `I'm having trouble with this:

Error: {error}
Code/Command: {code}
Context: {context}

Please help me fix this issue.`,
	};

	static readonly GENERAL_CHAT: PromptTemplate = {
		system: `You are KiroCLI, an AI assistant specialized in helping developers with command-line tasks, coding, and development workflows.

Your personality:
- Helpful and knowledgeable
- Concise but thorough
- Practical and solution-oriented
- Encouraging and supportive
- Focus on developer productivity

You can help with:
- Shell commands and CLI tools
- Code generation and explanation
- Development workflows
- Debugging and troubleshooting
- Best practices and recommendations`,
		user: `{message}`,
	};

	static fillTemplate(
		template: PromptTemplate,
		variables: Record<string, string>,
	): {system: string; user: string} {
		let systemPrompt = template.system;
		let userPrompt = template.user;

		// Replace variables in both system and user prompts
		for (const [key, value] of Object.entries(variables)) {
			const placeholder = `{${key}}`;
			systemPrompt = systemPrompt.replace(new RegExp(placeholder, 'g'), value);
			userPrompt = userPrompt.replace(new RegExp(placeholder, 'g'), value);
		}

		return {
			system: systemPrompt,
			user: userPrompt,
		};
	}

	static detectIntent(
		userInput: string,
	): 'command' | 'code' | 'explain' | 'debug' | 'chat' {
		const input = userInput.toLowerCase();

		// Command generation patterns
		if (
			input.includes('how do i') ||
			input.includes('how to') ||
			input.includes('command for') ||
			input.includes('run') ||
			input.includes('execute') ||
			input.includes('delete') ||
			input.includes('create') ||
			input.includes('find') ||
			input.includes('list') ||
			input.includes('install')
		) {
			return 'command';
		}

		// Code generation patterns
		if (
			input.includes('generate') ||
			input.includes('create a') ||
			input.includes('build a') ||
			input.includes('write code') ||
			input.includes('function') ||
			input.includes('class') ||
			input.includes('component')
		) {
			return 'code';
		}

		// Code explanation patterns
		if (
			input.includes('explain') ||
			input.includes('what does') ||
			input.includes('how does') ||
			input.includes('understand') ||
			input.includes('meaning of')
		) {
			return 'explain';
		}

		// Debugging patterns
		if (
			input.includes('error') ||
			input.includes('bug') ||
			input.includes('fix') ||
			input.includes('broken') ||
			input.includes('not working') ||
			input.includes('debug')
		) {
			return 'debug';
		}

		// Default to general chat
		return 'chat';
	}

	static getTemplateForIntent(
		intent: 'command' | 'code' | 'explain' | 'debug' | 'chat',
	): PromptTemplate {
		switch (intent) {
			case 'command':
				return this.COMMAND_GENERATION;
			case 'code':
				return this.CODE_GENERATION;
			case 'explain':
				return this.CODE_EXPLANATION;
			case 'debug':
				return this.DEBUGGING_HELP;
			case 'chat':
			default:
				return this.GENERAL_CHAT;
		}
	}
}
