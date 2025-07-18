import React, {useState, useEffect} from 'react';
import {Text, Box, useInput} from 'ink';
import * as os from 'os';

type Props = {
	onComplete: () => void;
	onExit: () => void;
};

type Step = 'welcome' | 'platform' | 'features' | 'setup' | 'apikeys' | 'ready';

export default function GettingStarted({onComplete, onExit}: Props) {
	const [currentStep, setCurrentStep] = useState<Step>('welcome');
	const [platform, setPlatform] = useState<string>('');

	useEffect(() => {
		// Detect platform
		const platformInfo = os.platform();
		const arch = os.arch();
		setPlatform(`${platformInfo} (${arch})`);
	}, []);

	useInput((input, key) => {
		if (key.ctrl && input === 'c') {
			process.exit(0);
		} else if (key.escape) {
			onExit();
		} else if (key.return || input === ' ') {
			handleNext();
		} else if (input === 's' && currentStep === 'ready') {
			// Skip to main menu
			onComplete();
		}
	});

	const handleNext = () => {
		switch (currentStep) {
			case 'welcome':
				setCurrentStep('platform');
				break;
			case 'platform':
				setCurrentStep('features');
				break;
			case 'features':
				setCurrentStep('setup');
				break;
			case 'setup':
				setCurrentStep('apikeys');
				break;
			case 'apikeys':
				setCurrentStep('ready');
				break;
			case 'ready':
				onComplete();
				break;
		}
	};

	const renderWelcome = () => (
		<Box flexDirection="column">
			<Box borderStyle="double" borderColor="cyan" padding={2} marginBottom={2}>
				<Box flexDirection="column" alignItems="center">
					<Text color="cyan" bold>
						🚀 Welcome to KiroCLI!
					</Text>
					<Text color="white" dimColor>
						Your AI-Powered Development Assistant
					</Text>
				</Box>
			</Box>

			<Box flexDirection="column" marginBottom={2}>
				<Text color="green" bold>
					🎉 Thank you for choosing KiroCLI!
				</Text>
				<Text color="white">
					This quick tutorial will help you get started with your new AI
					development companion.
				</Text>
				<Text color="white">
					KiroCLI transforms natural language into actionable development tasks.
				</Text>
			</Box>

			<Box
				borderStyle="single"
				borderColor="yellow"
				padding={1}
				marginBottom={2}
			>
				<Box flexDirection="column">
					<Text color="yellow" bold>
						✨ What makes KiroCLI special:
					</Text>
					<Text color="white">• Natural language command interpretation</Text>
					<Text color="white">
						• AI-powered code generation from specifications
					</Text>
					<Text color="white">• Workflow automation with agent hooks</Text>
					<Text color="white">• Cross-platform terminal interface</Text>
					<Text color="white">
						• Multiple AI provider support (OpenAI, Claude, Gemini)
					</Text>
				</Box>
			</Box>
		</Box>
	);

	const renderPlatform = () => (
		<Box flexDirection="column">
			<Box borderStyle="round" borderColor="green" padding={1} marginBottom={2}>
				<Text color="green" bold>
					🖥️ Platform Detection
				</Text>
			</Box>

			<Box flexDirection="column" marginBottom={2}>
				<Text color="white">Great! KiroCLI has detected your system:</Text>
				<Box marginTop={1} marginBottom={1}>
					<Text color="cyan" bold>
						Platform: {platform}
					</Text>
				</Box>
				<Text color="white">
					KiroCLI is fully compatible with your system and ready to enhance your
					development workflow.
				</Text>
			</Box>

			<Box borderStyle="single" borderColor="blue" padding={1} marginBottom={2}>
				<Box flexDirection="column">
					<Text color="blue" bold>
						🔧 Platform-Specific Features:
					</Text>
					{platform.includes('linux') && (
						<>
							<Text color="white">• Native bash/zsh shell integration</Text>
							<Text color="white">
								• Full package manager support (apt, yum, pacman)
							</Text>
							<Text color="white">
								• Docker and container workflow automation
							</Text>
						</>
					)}
					{platform.includes('darwin') && (
						<>
							<Text color="white">• Native macOS terminal integration</Text>
							<Text color="white">• Homebrew package management</Text>
							<Text color="white">• Xcode development tools support</Text>
						</>
					)}
					{platform.includes('win32') && (
						<>
							<Text color="white">
								• Windows Command Prompt and PowerShell support
							</Text>
							<Text color="white">
								• WSL (Windows Subsystem for Linux) integration
							</Text>
							<Text color="white">
								• Visual Studio and .NET development tools
							</Text>
						</>
					)}
					<Text color="white">
						• Cross-platform Node.js and npm/yarn workflows
					</Text>
				</Box>
			</Box>
		</Box>
	);

	const renderFeatures = () => (
		<Box flexDirection="column">
			<Box
				borderStyle="round"
				borderColor="magenta"
				padding={1}
				marginBottom={2}
			>
				<Text color="magenta" bold>
					🎯 Core Features Overview
				</Text>
			</Box>

			<Box flexDirection="column" marginBottom={2}>
				<Box marginBottom={1}>
					<Text color="cyan" bold>
						1. 🧠 AI Chat Mode with Command Execution
					</Text>
					<Text color="white">
						• Ask questions in natural language: "How do I delete all .log
						files?"
					</Text>
					<Text color="white">
						• Get AI-powered command suggestions with detailed explanations
					</Text>
					<Text color="white">
						• Preview commands before execution with safety warnings
					</Text>
					<Text color="white">
						• Real-time execution progress and error recovery
					</Text>
					<Text color="white">• Cross-platform command compatibility</Text>
				</Box>

				<Box marginBottom={1}>
					<Text color="cyan" bold>
						2. 🛡️ Safe Command Execution
					</Text>
					<Text color="white">
						• Automatic command validation and sanitization
					</Text>
					<Text color="white">• Dangerous command detection and blocking</Text>
					<Text color="white">
						• Safety level assessment (Safe/Caution/Dangerous)
					</Text>
					<Text color="white">
						• User confirmation with detailed safety information
					</Text>
					<Text color="white">• Safe alternatives for risky operations</Text>
				</Box>

				<Box marginBottom={1}>
					<Text color="cyan" bold>
						3. 📜 Spec-Driven Development
					</Text>
					<Text color="white">
						• Define project requirements in YAML format
					</Text>
					<Text color="white">• Generate boilerplate code automatically</Text>
					<Text color="white">• Validate and build from specifications</Text>
				</Box>

				<Box marginBottom={1}>
					<Text color="cyan" bold>
						4. 🔗 Agent Hooks & Automation
					</Text>
					<Text color="white">• Automate repetitive development tasks</Text>
					<Text color="white">• Git workflow automation</Text>
					<Text color="white">• Custom build and deployment scripts</Text>
				</Box>

				<Box marginBottom={1}>
					<Text color="cyan" bold>
						5. ⚙️ Configuration Management
					</Text>
					<Text color="white">• Secure API key storage</Text>
					<Text color="white">
						• Multiple AI provider support (OpenAI, Claude, Gemini)
					</Text>
					<Text color="white">• Customizable model preferences</Text>
				</Box>
			</Box>
		</Box>
	);

	const renderSetup = () => (
		<Box flexDirection="column">
			<Box
				borderStyle="round"
				borderColor="yellow"
				padding={1}
				marginBottom={2}
			>
				<Text color="yellow" bold>
					⚙️ Quick Setup Guide
				</Text>
			</Box>

			<Box flexDirection="column" marginBottom={2}>
				<Text color="white" bold>
					To get the most out of KiroCLI, you'll need:
				</Text>

				<Box marginTop={1} marginBottom={1}>
					<Text color="green" bold>
						✅ Already Complete:
					</Text>
					<Text color="white">• Node.js v16+ (detected and working)</Text>
					<Text color="white">
						• KiroCLI installation (you're running it now!)
					</Text>
					<Text color="white">• Platform compatibility confirmed</Text>
				</Box>

				<Box marginBottom={1}>
					<Text color="yellow" bold>
						🔑 Next Steps:
					</Text>
					<Text color="white">• Configure AI provider API keys</Text>
					<Text color="white">• Test AI connections</Text>
					<Text color="white">• Explore the main features</Text>
				</Box>
			</Box>

			<Box borderStyle="single" borderColor="blue" padding={1} marginBottom={2}>
				<Box flexDirection="column">
					<Text color="blue" bold>
						📁 KiroCLI creates these directories:
					</Text>
					<Text color="white">
						• ~/.kirocli/ - User configuration and API keys
					</Text>
					<Text color="white">• .kiro/ - Project-specific specs and hooks</Text>
					<Text color="white">• .kiro/config/ - Project AI configuration</Text>
					<Text color="white">• .kiro/hooks/ - Custom automation scripts</Text>
				</Box>
			</Box>
		</Box>
	);

	const renderApiKeys = () => (
		<Box flexDirection="column">
			<Box borderStyle="round" borderColor="red" padding={1} marginBottom={2}>
				<Text color="red" bold>
					🔑 API Key Configuration
				</Text>
			</Box>

			<Box flexDirection="column" marginBottom={2}>
				<Text color="white">
					KiroCLI supports multiple AI providers. You'll need at least one API
					key to get started:
				</Text>

				<Box marginTop={1} marginBottom={1}>
					<Text color="cyan" bold>
						🤖 Supported AI Providers:
					</Text>
					<Text color="white">
						• OpenAI (GPT-4, GPT-3.5-turbo) - Recommended for beginners
					</Text>
					<Text color="white">
						• Anthropic Claude (Claude-3 Sonnet, Haiku, Opus)
					</Text>
					<Text color="white">
						• Google Gemini (Gemini Pro, Gemini Pro Vision)
					</Text>
				</Box>

				<Box marginBottom={1}>
					<Text color="green" bold>
						📝 How to get API keys:
					</Text>
					<Text color="white">
						1. OpenAI: https://platform.openai.com/api-keys
					</Text>
					<Text color="white">2. Claude: https://console.anthropic.com/</Text>
					<Text color="white">
						3. Gemini: https://makersuite.google.com/app/apikey
					</Text>
				</Box>

				<Box marginBottom={1}>
					<Text color="yellow" bold>
						⚡ Quick Setup Commands:
					</Text>
					<Text color="white">
						kirocli config set-key openai "your-api-key-here"
					</Text>
					<Text color="white">
						kirocli config set-key claude "your-api-key-here"
					</Text>
					<Text color="white">
						kirocli config set-key gemini "your-api-key-here"
					</Text>
				</Box>
			</Box>

			<Box
				borderStyle="single"
				borderColor="green"
				padding={1}
				marginBottom={2}
			>
				<Box flexDirection="column">
					<Text color="green" bold>
						🔒 Security Note:
					</Text>
					<Text color="white">
						API keys are stored securely in ~/.kirocli/config.yaml
					</Text>
					<Text color="white">
						Keys are never transmitted except to their respective AI services
					</Text>
					<Text color="white">
						You can also use environment variables for additional security
					</Text>
				</Box>
			</Box>
		</Box>
	);

	const renderReady = () => (
		<Box flexDirection="column">
			<Box
				borderStyle="double"
				borderColor="green"
				padding={2}
				marginBottom={2}
			>
				<Box flexDirection="column" alignItems="center">
					<Text color="green" bold>
						🎉 You're All Set!
					</Text>
					<Text color="white" dimColor>
						KiroCLI is ready to boost your productivity
					</Text>
				</Box>
			</Box>

			<Box flexDirection="column" marginBottom={2}>
				<Text color="white" bold>
					🚀 Ready to start? Here's what you can do next:
				</Text>

				<Box marginTop={1} marginBottom={1}>
					<Text color="cyan" bold>
						1. Configure your first AI provider:
					</Text>
					<Text color="white"> kirocli config setup</Text>
					<Text color="white"> kirocli config set-key openai "your-key"</Text>
				</Box>

				<Box marginBottom={1}>
					<Text color="cyan" bold>
						2. Test your AI connection:
					</Text>
					<Text color="white"> kirocli config test</Text>
				</Box>

				<Box marginBottom={1}>
					<Text color="cyan" bold>
						3. Start your first AI chat:
					</Text>
					<Text color="white"> kirocli chat</Text>
				</Box>

				<Box marginBottom={1}>
					<Text color="cyan" bold>
						4. Explore the main menu:
					</Text>
					<Text color="white"> kirocli (or just press Enter now!)</Text>
				</Box>
			</Box>

			<Box borderStyle="single" borderColor="blue" padding={1} marginBottom={2}>
				<Box flexDirection="column">
					<Text color="blue" bold>
						💡 Pro Tips:
					</Text>
					<Text color="white">
						• Use natural language: "Create a React component for login"
					</Text>
					<Text color="white">
						• Try spec-driven development for complex projects
					</Text>
					<Text color="white">• Set up hooks to automate your workflow</Text>
					<Text color="white">• Press Escape anytime to go back</Text>
				</Box>
			</Box>

			<Box marginBottom={1}>
				<Text color="yellow" bold>
					Choose your next step:
				</Text>
				<Text color="white">• Press Enter to go to Main Menu</Text>
				<Text color="white">• Press 's' to skip and start using KiroCLI</Text>
			</Box>
		</Box>
	);

	const getStepContent = () => {
		switch (currentStep) {
			case 'welcome':
				return renderWelcome();
			case 'platform':
				return renderPlatform();
			case 'features':
				return renderFeatures();
			case 'setup':
				return renderSetup();
			case 'apikeys':
				return renderApiKeys();
			case 'ready':
				return renderReady();
			default:
				return renderWelcome();
		}
	};

	const getStepNumber = () => {
		const steps = [
			'welcome',
			'platform',
			'features',
			'setup',
			'apikeys',
			'ready',
		];
		return steps.indexOf(currentStep) + 1;
	};

	return (
		<Box flexDirection="column" padding={1}>
			{/* Progress indicator */}
			<Box marginBottom={1}>
				<Text color="white" dimColor>
					Step {getStepNumber()} of 6 • Getting Started Tutorial
				</Text>
			</Box>

			{/* Main content */}
			{getStepContent()}

			{/* Navigation */}
			<Box borderStyle="single" borderColor="white" padding={1}>
				<Box flexDirection="column">
					<Text color="white" bold>
						🎮 Navigation:
					</Text>
					<Text color="white">• Press Enter or Space to continue</Text>
					<Text color="white">• Press Escape to skip tutorial</Text>
					<Text color="white">• Press Ctrl+C to exit KiroCLI</Text>
					{currentStep === 'ready' && (
						<Text color="yellow">• Press 's' to skip to main features</Text>
					)}
				</Box>
			</Box>
		</Box>
	);
}
