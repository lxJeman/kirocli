import React, {useState, useEffect} from 'react';
import {Text, Box, useInput} from 'ink';
import {ConfigManager} from '../config/index.js';
import {AIProviderFactory} from '../ai/factory.js';

type Props = {
	action: 'show' | 'test' | 'setup' | 'set-key';
	provider?: string;
	apiKey?: string;
	onExit?: () => void;
};

export default function ConfigCommand({action, provider, apiKey, onExit}: Props) {
	const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
	const [message, setMessage] = useState('');
	const [details, setDetails] = useState<string[]>([]);

	useEffect(() => {
		handleAction();
	}, []);

	useInput((input, key) => {
		if (key.escape || (key.ctrl && input === 'm')) {
			if (onExit) {
				onExit();
			}
		} else if (key.ctrl && input === 'c') {
			process.exit(0);
		}
	});

	const handleAction = async () => {
		try {
			const configManager = ConfigManager.getInstance();

			switch (action) {
				case 'show':
					await showConfiguration(configManager);
					break;

				case 'test':
					await testProviders(configManager);
					break;

				case 'setup':
					await showSetupInstructions();
					break;

				case 'set-key':
					await setApiKey(configManager, provider!, apiKey!);
					break;
			}
		} catch (error) {
			setMessage(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
			setStatus('error');
		}
	};

	const showConfiguration = async (configManager: ConfigManager) => {
		const config = await configManager.loadConfig();
		const apiKeyStatus = await configManager.validateApiKeys();

		setMessage('📋 Current AI Configuration');
		setDetails([
			`Default Provider: ${config.default_provider}`,
			`Default Model: ${config.default_model}`,
			'',
			'API Key Status:',
			`  OpenAI: ${apiKeyStatus['openai'] ? '✅ Configured' : '❌ Missing'}`,
			`  Claude: ${apiKeyStatus['claude'] ? '✅ Configured' : '❌ Missing'}`,
			`  Gemini: ${apiKeyStatus['gemini'] ? '✅ Configured' : '❌ Missing'}`,
			'',
			'Supported Models:',
			...Object.entries(AIProviderFactory.getSupportedModels()).flatMap(([provider, models]) => [
				`  ${provider}:`,
				...models.map(model => `    - ${model}`),
			]),
		]);
		setStatus('success');
	};

	const testProviders = async (configManager: ConfigManager) => {
		setMessage('🧪 Testing AI Provider Connections...');
		const results: string[] = [];
		const apiKeyStatus = await configManager.validateApiKeys();

		for (const [provider, hasKey] of Object.entries(apiKeyStatus)) {
			if (!hasKey) {
				results.push(`❌ ${provider}: No API key configured`);
				continue;
			}

			try {
				const config = await configManager.getProviderConfig(provider as any);
				const apiKey = await configManager.getApiKey(provider as any);
				
				const aiProvider = AIProviderFactory.create({
					provider: provider as any,
					apiKey,
					model: config.models[0],
					temperature: config.temperature,
					maxTokens: config.max_tokens,
				});

				const isConnected = await aiProvider.validateConnection();
				results.push(`${isConnected ? '✅' : '❌'} ${provider}: ${isConnected ? 'Connected' : 'Connection failed'}`);
			} catch (error) {
				results.push(`❌ ${provider}: ${error instanceof Error ? error.message : 'Unknown error'}`);
			}
		}

		setDetails(results);
		setMessage('🔍 Provider Connection Test Results');
		setStatus('success');
	};

	const setApiKey = async (configManager: ConfigManager, provider: string, apiKey: string) => {
		if (!['openai', 'claude', 'gemini'].includes(provider)) {
			throw new Error(`Invalid provider: ${provider}. Must be one of: openai, claude, gemini`);
		}

		setMessage(`🔑 Setting API key for ${provider}...`);
		
		// Save the API key to user config
		await configManager.setApiKey(provider as 'openai' | 'claude' | 'gemini', apiKey);
		
		setMessage(`✅ API key for ${provider} saved successfully!`);
		setDetails([
			`Provider: ${provider}`,
			`API key: ${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`,
			'',
			'Test the connection with:',
			`  kirocli config test`,
			'',
			'Start chatting with:',
			`  kirocli chat --model=${provider === 'openai' ? 'gpt-4' : provider === 'claude' ? 'claude-3-sonnet-20240229' : 'gemini-pro'}`,
		]);
		setStatus('success');
	};

	const showSetupInstructions = async () => {
		setMessage('⚙️ AI Provider Setup Instructions');
		setDetails([
			'To use KiroCLI with AI providers, you can set up API keys in two ways:',
			'',
			'METHOD 1: Using KiroCLI config (Recommended):',
			'   kirocli config set-key openai "your-openai-key"',
			'   kirocli config set-key claude "your-claude-key"',
			'   kirocli config set-key gemini "your-gemini-key"',
			'',
			'METHOD 2: Environment variables:',
			'   export OPENAI_API_KEY="your-key-here"',
			'   export ANTHROPIC_API_KEY="your-key-here"',
			'   export GOOGLE_API_KEY="your-key-here"',
			'',
			'Get API keys from:',
			'1. OpenAI: https://platform.openai.com/api-keys',
			'2. Claude: https://console.anthropic.com/',
			'3. Gemini: https://makersuite.google.com/app/apikey',
			'',
			'After setting up, test with:',
			'   kirocli config test',
			'',
			'Start chatting with:',
			'   kirocli chat',
			'   kirocli chat --model=claude-3-sonnet-20240229',
		]);
		setStatus('success');
	};

	return (
		<Box flexDirection="column" padding={1}>
			{/* Header */}
			<Box borderStyle="round" borderColor="cyan" padding={1} marginBottom={1}>
				<Box flexDirection="column">
					<Text color="cyan" bold>
						⚙️ Configuration: {action}
					</Text>
					<Text color="white" dimColor>
						API key management and provider settings
					</Text>
				</Box>
			</Box>

			{/* Content */}
			<Box borderStyle="single" borderColor="blue" padding={1} marginBottom={1}>
				<Box flexDirection="column">
					<Text color={status === 'error' ? 'red' : status === 'success' ? 'green' : 'yellow'}>
						{message}
					</Text>

					{details.length > 0 && (
						<Box flexDirection="column" marginTop={1}>
							{details.map((detail, index) => (
								<Text key={index} color={detail.startsWith('✅') ? 'green' : detail.startsWith('❌') ? 'red' : 'white'}>
									{detail}
								</Text>
							))}
						</Box>
					)}
				</Box>
			</Box>

			{/* Help */}
			<Box borderStyle="single" borderColor="white" padding={1}>
				<Text color="white" dimColor>
					Press Escape to return to main menu • Ctrl+C to exit
				</Text>
			</Box>
		</Box>
	);
}