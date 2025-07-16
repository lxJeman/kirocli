import React, {useState, useEffect} from 'react';
import {Text, Box, useInput} from 'ink';
import {AIProvider} from '../ai/index.js';
import CommandConfirmation from './CommandConfirmation.js';
import CommandPreview from './CommandPreview.js';
import ExecutionProgress from './ExecutionProgress.js';
import {SafeShellExecutor, CommandResult} from '../utils/shell-executor.js';

type Props = {
	userInput: string;
	onCommandExecuted: (result: CommandResult) => void;
	onError: (error: string) => void;
	onCancel: () => void;
};

type InterpretationState = 'analyzing' | 'suggesting' | 'previewing' | 'confirming' | 'executing' | 'error' | 'cancelled';

interface CommandSuggestion {
	command: string;
	explanation: string;
	safety: 'safe' | 'caution' | 'dangerous';
	category: 'file' | 'git' | 'system' | 'development' | 'network' | 'other';
}

export default function CommandInterpreter({userInput, onCommandExecuted, onError, onCancel}: Props) {
	const [state, setState] = useState<InterpretationState>('analyzing');
	const [suggestion, setSuggestion] = useState<CommandSuggestion | null>(null);
	const [loadingDots, setLoadingDots] = useState('');
	const [workingDirectory, setWorkingDirectory] = useState(process.cwd());

	useEffect(() => {
		interpretCommand();
	}, [userInput]);

	useEffect(() => {
		// Animate loading dots
		if (state === 'analyzing') {
			const interval = setInterval(() => {
				setLoadingDots(prev => {
					if (prev.length >= 3) return '';
					return prev + '.';
				});
			}, 500);
			return () => clearInterval(interval);
		}
		return undefined;
	}, [state]);

	useInput((input, key) => {
		if (key.escape || (key.ctrl && input === 'c')) {
			setState('cancelled');
			onCancel();
		} else if (key.return && suggestion && state === 'suggesting') {
			// Move to preview state for detailed command review
			setState('previewing');
		} else if (input === 'n' && state === 'suggesting') {
			onCancel();
		}
	});

	const handlePreviewExecute = (selectedWorkingDirectory: string) => {
		setWorkingDirectory(selectedWorkingDirectory);
		setState('confirming');
	};

	const handlePreviewCancel = () => {
		setState('cancelled');
		onCancel();
	};

	const handlePreviewModify = (newCommand: string) => {
		if (suggestion) {
			setSuggestion({
				...suggestion,
				command: newCommand,
			});
		}
	};

	const handleCommandConfirm = async () => {
		if (!suggestion) return;
		setState('executing');
	};

	const handleCommandReject = () => {
		setState('cancelled');
		onCancel();
	};

	const executeCommand = async (): Promise<CommandResult> => {
		if (!suggestion) {
			throw new Error('No command to execute');
		}
		return SafeShellExecutor.executeCommand(suggestion.command, {
			cwd: workingDirectory
		});
	};

	const handleExecutionComplete = (result: CommandResult) => {
		onCommandExecuted(result);
	};

	const handleExecutionCancel = () => {
		setState('cancelled');
		onCancel();
	};

	const interpretCommand = async () => {
		try {
			setState('analyzing');
			
			// Create AI provider
			const aiProvider = await AIProvider.createDefault();
			
			// Create a specialized prompt for command interpretation
			const prompt = `You are a helpful command-line assistant. The user wants to: "${userInput}"

Please suggest a single, specific command that accomplishes this task. Respond in this exact JSON format:

{
  "command": "the actual command to run",
  "explanation": "brief explanation of what this command does",
  "safety": "safe|caution|dangerous",
  "category": "file|git|system|development|network|other"
}

Guidelines:
- Provide only ONE command that best accomplishes the task
- Use safe, commonly accepted commands
- For file operations, prefer relative paths
- For dangerous operations, mark safety as "dangerous"
- Keep explanations concise but informative
- If the request is unclear, suggest the most likely interpretation

Examples:
User: "delete all log files"
Response: {"command": "find . -name '*.log' -type f -delete", "explanation": "Finds and deletes all .log files in current directory and subdirectories", "safety": "caution", "category": "file"}

User: "show git status"
Response: {"command": "git status", "explanation": "Shows the current status of the git repository", "safety": "safe", "category": "git"}`;

			const response = await aiProvider.chat([{role: 'user', content: prompt}]);
			
			// Parse the JSON response with better error handling
			let cleanResponse = response.trim();
			
			// Remove markdown code blocks if present
			cleanResponse = cleanResponse.replace(/```json\n?|\n?```/g, '');
			cleanResponse = cleanResponse.replace(/```\n?|\n?```/g, '');
			
			// Try to extract JSON from the response if it's mixed with other text
			const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
			if (jsonMatch) {
				cleanResponse = jsonMatch[0];
			}
			
			// Validate that we have a JSON-like string
			if (!cleanResponse.startsWith('{') || !cleanResponse.endsWith('}')) {
				throw new Error('AI response is not in valid JSON format');
			}
			
			const parsedSuggestion = JSON.parse(cleanResponse) as CommandSuggestion;
			
			setSuggestion(parsedSuggestion);
			setState('suggesting');
			
		} catch (error) {
			console.error('Command interpretation error:', error);
			setState('error');
			onError(error instanceof Error ? error.message : 'Failed to interpret command');
		}
	};

	const getSafetyColor = (safety: string) => {
		switch (safety) {
			case 'safe': return 'green';
			case 'caution': return 'yellow';
			case 'dangerous': return 'red';
			default: return 'white';
		}
	};

	const getSafetyIcon = (safety: string) => {
		switch (safety) {
			case 'safe': return '✅';
			case 'caution': return '⚠️';
			case 'dangerous': return '🚨';
			default: return '❓';
		}
	};

	const getCategoryIcon = (category: string) => {
		switch (category) {
			case 'file': return '📁';
			case 'git': return '🔀';
			case 'system': return '⚙️';
			case 'development': return '💻';
			case 'network': return '🌐';
			default: return '🔧';
		}
	};

	if (state === 'analyzing') {
		return (
			<Box flexDirection="column" padding={1}>
				<Box borderStyle="round" borderColor="blue" padding={1} marginBottom={1}>
					<Text color="blue" bold>
						🧠 AI Command Interpreter
					</Text>
				</Box>

				<Box flexDirection="column" marginBottom={2}>
					<Text color="white">
						Analyzing your request: <Text color="cyan">"{userInput}"</Text>
					</Text>
					<Text color="yellow">
						🤔 Thinking{loadingDots}
					</Text>
				</Box>

				<Box borderStyle="single" borderColor="white" padding={1}>
					<Text color="white" dimColor>
						Press Escape to cancel
					</Text>
				</Box>
			</Box>
		);
	}

	if (state === 'error') {
		return (
			<Box flexDirection="column" padding={1}>
				<Box borderStyle="round" borderColor="red" padding={1} marginBottom={1}>
					<Text color="red" bold>
						❌ Command Interpretation Failed
					</Text>
				</Box>

				<Box flexDirection="column" marginBottom={2}>
					<Text color="red">
						Sorry, I couldn't understand your request: "{userInput}"
					</Text>
					<Text color="white">
						Try rephrasing your request or being more specific.
					</Text>
				</Box>

				<Box borderStyle="single" borderColor="white" padding={1}>
					<Text color="white" dimColor>
						Press Escape to return
					</Text>
				</Box>
			</Box>
		);
	}

	if (state === 'suggesting' && suggestion) {
		return (
			<Box flexDirection="column" padding={1}>
				<Box borderStyle="round" borderColor="green" padding={1} marginBottom={1}>
					<Text color="green" bold>
						💡 Command Suggestion
					</Text>
				</Box>

				<Box flexDirection="column" marginBottom={2}>
					<Text color="white">
						For: <Text color="cyan">"{userInput}"</Text>
					</Text>
				</Box>

				{/* Command suggestion */}
				<Box borderStyle="single" borderColor={getSafetyColor(suggestion.safety)} padding={1} marginBottom={2}>
					<Box flexDirection="column">
						<Box marginBottom={1}>
							<Text color="white" bold>
								{getCategoryIcon(suggestion.category)} Suggested Command:
							</Text>
						</Box>
						
						<Box marginBottom={1} paddingLeft={2}>
							<Text color="cyan" bold>
								{suggestion.command}
							</Text>
						</Box>

						<Box marginBottom={1}>
							<Text color="white">
								📝 Explanation: {suggestion.explanation}
							</Text>
						</Box>

						<Box>
							<Text color={getSafetyColor(suggestion.safety)}>
								{getSafetyIcon(suggestion.safety)} Safety Level: {suggestion.safety.toUpperCase()}
							</Text>
						</Box>
					</Box>
				</Box>

				{/* Safety warning for dangerous commands */}
				{suggestion.safety === 'dangerous' && (
					<Box borderStyle="double" borderColor="red" padding={1} marginBottom={2}>
						<Box flexDirection="column">
							<Text color="red" bold>
								🚨 DANGER WARNING
							</Text>
							<Text color="white">
								This command could potentially cause data loss or system damage.
							</Text>
							<Text color="white">
								Please review carefully before executing.
							</Text>
						</Box>
					</Box>
				)}

				{/* Caution warning */}
				{suggestion.safety === 'caution' && (
					<Box borderStyle="single" borderColor="yellow" padding={1} marginBottom={2}>
						<Box flexDirection="column">
							<Text color="yellow" bold>
								⚠️ CAUTION
							</Text>
							<Text color="white">
								This command modifies files or system state.
							</Text>
							<Text color="white">
								Make sure you understand what it does before proceeding.
							</Text>
						</Box>
					</Box>
				)}

				{/* Action buttons */}
				<Box borderStyle="single" borderColor="white" padding={1}>
					<Box flexDirection="column">
						<Text color="white" bold>
							🎮 What would you like to do?
						</Text>
						<Text color="green">
							• Press Enter to proceed to confirmation
						</Text>
						<Text color="red">
							• Press 'n' to reject and try again
						</Text>
						<Text color="white">
							• Press Escape to cancel
						</Text>
					</Box>
				</Box>
			</Box>
		);
	}

	if (state === 'previewing' && suggestion) {
		return (
			<CommandPreview
				command={suggestion.command}
				explanation={suggestion.explanation}
				safety={suggestion.safety}
				category={suggestion.category}
				workingDirectory={workingDirectory}
				onExecute={handlePreviewExecute}
				onCancel={handlePreviewCancel}
				onModify={handlePreviewModify}
			/>
		);
	}

	if (state === 'confirming' && suggestion) {
		return (
			<CommandConfirmation
				command={suggestion.command}
				explanation={suggestion.explanation}
				safety={suggestion.safety}
				category={suggestion.category}
				onConfirm={handleCommandConfirm}
				onReject={handleCommandReject}
				onCancel={onCancel}
			/>
		);
	}

	if (state === 'executing' && suggestion) {
		return (
			<ExecutionProgress
				command={suggestion.command}
				onCancel={handleExecutionCancel}
				onComplete={handleExecutionComplete}
				executeFunction={executeCommand}
			/>
		);
	}

	return (
		<Box flexDirection="column" padding={1}>
			<Text color="white">Processing...</Text>
		</Box>
	);
}