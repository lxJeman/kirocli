import React, {useState, useEffect} from 'react';
import {Text, Box, useInput, Newline} from 'ink';
import {AIProvider} from '../ai/index.js';
import CommandInterpreter from '../components/CommandInterpreter.js';
import EnhancedChat from '../components/EnhancedChat.js';
import {CommandResult} from '../utils/shell-executor.js';
import {logger} from '../utils/logger.js';

type Props = {
	model: string;
	onExit?: () => void;
	debug?: boolean;
	verbose?: boolean;
};

type ChatMode = 'chat' | 'command-interpretation';

export default function ChatCommand({model, onExit, debug = false, verbose = false}: Props) {
	const [input, setInput] = useState('');
	const [messages, setMessages] = useState<
		Array<{role: 'user' | 'assistant'; content: string; type?: 'command' | 'execution'}>
	>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [chatMode, setChatMode] = useState<ChatMode>('chat');
	const [pendingCommand, setPendingCommand] = useState<string>('');
	const [useEnhancedMode, setUseEnhancedMode] = useState(false);
	const [showModeSelector, setShowModeSelector] = useState(false);

	useEffect(() => {
		// Configure logger based on props
		logger.setDebugMode(debug);
		logger.setVerboseMode(verbose);
		
		logger.info('ChatCommand', `Starting chat with model: ${model}`, {
			model,
			debug,
			verbose
		});
	}, [model, debug, verbose]);

	useInput((inputChar, key) => {
		// Handle mode selector
		if (showModeSelector) {
			if (key.escape) {
				setShowModeSelector(false);
			} else if (inputChar === '1') {
				setUseEnhancedMode(true);
				setShowModeSelector(false);
				logger.info('ChatCommand', 'Switched to enhanced chat mode');
			} else if (inputChar === '2') {
				setUseEnhancedMode(false);
				setShowModeSelector(false);
				logger.info('ChatCommand', 'Switched to legacy chat mode');
			}
			return;
		}

		// Don't handle input when in command interpretation mode
		if (chatMode === 'command-interpretation') {
			return;
		}

		// Show mode selector with Ctrl+E
		if (key.ctrl && inputChar === 'e') {
			setShowModeSelector(true);
			return;
		}

		if (key.return) {
			// Handle Enter key - send message
			if (input.trim()) {
				handleUserInput(input.trim());
				setInput('');
			}
		} else if (key.backspace || key.delete) {
			// Handle Backspace/Delete key - remove last character
			setInput(prev => prev.length > 0 ? prev.slice(0, -1) : '');
		} else if (key.escape) {
			// Handle Escape key - exit to main menu
			if (onExit) {
				onExit();
			} else {
				process.exit(0);
			}
		} else if (key.ctrl && inputChar === 'c') {
			// Handle Ctrl+C - exit completely
			process.exit(0);
		} else if (key.ctrl && inputChar === 'm') {
			// Handle Ctrl+M - return to main menu
			if (onExit) {
				onExit();
			}
		} else if (!key.ctrl && !key.meta && !key.escape && inputChar && inputChar.length === 1) {
			// Handle regular character input (ignore control keys and multi-char sequences)
			// Only add printable characters
			if (inputChar >= ' ' && inputChar <= '~') {
				setInput(prev => prev + inputChar);
			}
		}
	});

	const handleUserInput = async (userInput: string) => {
		const newMessages = [
			...messages,
			{role: 'user' as const, content: userInput},
		];
		setMessages(newMessages);

		// Handle command execution responses (legacy - now handled by CommandInterpreter)
		if (pendingCommand) {
			const lowerInput = userInput.toLowerCase().trim();
			if (lowerInput === 'no' || lowerInput === 'n') {
				handleCommandRejected();
				return;
			}
			// If not yes/no, continue with normal chat but clear pending command
			setPendingCommand('');
		}

		setIsLoading(true);

		try {
			// Check if this looks like a command request
			if (isCommandRequest(userInput)) {
				// Switch to command interpretation mode
				setChatMode('command-interpretation');
				setPendingCommand(userInput);
				setIsLoading(false);
				return;
			}

			// Regular chat mode
			const ai = await AIProvider.create(model);
			const response = await ai.chat(newMessages);
			setMessages([...newMessages, {role: 'assistant', content: response}]);
		} catch (error) {
			setMessages([
				...newMessages,
				{
					role: 'assistant',
					content: `Error: ${
						error instanceof Error ? error.message : 'Unknown error'
					}`,
				},
			]);
		}

		setIsLoading(false);
	};

	const isCommandRequest = (input: string): boolean => {
		const commandKeywords = [
			'run', 'execute', 'delete', 'remove', 'create', 'make', 'install',
			'list', 'show', 'find', 'search', 'copy', 'move', 'rename',
			'git', 'npm', 'yarn', 'docker', 'kill', 'start', 'stop',
			'chmod', 'chown', 'mkdir', 'rmdir', 'touch', 'cat', 'grep',
			'how do i', 'how to', 'command for', 'script to'
		];
		
		const lowerInput = input.toLowerCase();
		return commandKeywords.some(keyword => lowerInput.includes(keyword));
	};



	const handleCommandExecuted = (result: CommandResult) => {
		// Add execution result to chat
		const resultMessage = {
			role: 'assistant' as const,
			content: result.success 
				? `✅ **Command executed successfully!**\n\n**Command:** \`${result.command}\`\n**Duration:** ${result.duration}ms\n\n**Output:**\n\`\`\`\n${result.output}\n\`\`\``
				: `❌ **Command execution failed!**\n\n**Command:** \`${result.command}\`\n**Exit Code:** ${result.exitCode}\n**Duration:** ${result.duration}ms\n\n**Error:**\n\`\`\`\n${result.error}\n\`\`\``,
			type: 'execution' as const
		};
		
		setMessages(prev => [...prev, resultMessage]);
		setChatMode('chat');
		setPendingCommand('');
	};

	const handleCommandRejected = () => {
		const rejectionMessage = {
			role: 'assistant' as const,
			content: `❌ Command execution cancelled. Feel free to ask for a different approach or continue our conversation!`,
		};
		setMessages(prev => [...prev, rejectionMessage]);
		setChatMode('chat');
		setPendingCommand('');
	};

	// Show mode selector
	if (showModeSelector) {
		return (
			<Box flexDirection="column" padding={1}>
				<Box borderStyle="round" borderColor="cyan" padding={1} marginBottom={1}>
					<Text color="cyan" bold>
						🎛️ Enhanced UI/UX Chat Mode Selection
					</Text>
				</Box>

				<Box flexDirection="column" marginBottom={2}>
					<Text bold>Choose your chat experience:</Text>
					<Text></Text>
					
					<Box marginBottom={1}>
						<Text color="green" bold>1. Enhanced Chat (Phase 7 Features)</Text>
						<Text>   • Persistent conversation history</Text>
						<Text>   • Command history with ↑↓ navigation</Text>
						<Text>   • Multiple chat sessions (Ctrl+S)</Text>
						<Text>   • Progress indicators and enhanced UI</Text>
						<Text>   • Better error handling with suggestions</Text>
						<Text>   • Syntax highlighting for commands</Text>
						<Text>   • Debug mode and verbose logging</Text>
					</Box>

					<Box marginBottom={1}>
						<Text color="yellow" bold>2. Legacy Chat</Text>
						<Text>   • Simple command interpretation</Text>
						<Text>   • Direct command execution</Text>
						<Text>   • Basic UI elements</Text>
					</Box>
				</Box>

				<Box borderStyle="single" borderColor="gray" padding={1}>
					<Text dimColor>
						Press 1 for Enhanced Chat, 2 for Legacy Chat, or Escape to cancel
					</Text>
				</Box>
			</Box>
		);
	}

	// Show enhanced chat if enabled
	if (useEnhancedMode) {
		return (
			<EnhancedChat
				model={model}
				onExit={onExit}
				debug={debug}
				verbose={verbose}
			/>
		);
	}

	// Show command interpreter if in command interpretation mode
	if (chatMode === 'command-interpretation') {
		return (
			<CommandInterpreter
				userInput={pendingCommand}
				onCommandExecuted={handleCommandExecuted}
				onError={(error) => {
					const errorMessage = {
						role: 'assistant' as const,
						content: `❌ **Command interpretation failed:** ${error}`,
					};
					setMessages(prev => [...prev, errorMessage]);
					setChatMode('chat');
					setPendingCommand('');
				}}
				onCancel={() => {
					setChatMode('chat');
					setPendingCommand('');
				}}
			/>
		);
	}

	return (
		<Box flexDirection="column" padding={1}>
			{/* Header */}
			<Box borderStyle="round" borderColor="cyan" padding={1} marginBottom={1}>
				<Box flexDirection="column">
					<Text color="cyan" bold>
						🤖 KiroCLI Chat Mode {pendingCommand && '(Command Ready)'}
					</Text>
					<Text color="white" dimColor>
						Model: {model} • Press Escape or Ctrl+M for menu • Ctrl+C to exit
					</Text>
				</Box>
			</Box>

			{/* Chat Messages */}
			<Box flexDirection="column" flexGrow={1}>
				{messages.length === 0 && (
					<Box
						borderStyle="single"
						borderColor="white"
						padding={1}
						marginBottom={1}
					>
						<Text color="white" dimColor>
							💡 Start a conversation by typing your message below and pressing
							Enter.
							<Newline />
							Try asking: "How do I list files in a directory?" or "Delete all .log files"
							<Newline />
							🚀 KiroCLI can understand commands and help you execute them safely!
						</Text>
					</Box>
				)}

				{messages.map((message, index) => (
					<Box key={index} marginBottom={1}>
						{message.role === 'user' ? (
							// User message styling
							<Box>
								<Box marginRight={1}>
									<Text color="green" bold>
										❯
									</Text>
								</Box>
								<Text color="white">{message.content}</Text>
							</Box>
						) : (
							// AI response styling with border and padding
							<Box
								borderStyle="single"
								borderColor={message.type === 'command' ? 'yellow' : message.type === 'execution' ? 'green' : 'blue'}
								padding={1}
								marginLeft={2}
							>
								<Box flexDirection="column">
									<Box marginBottom={1}>
										<Text color={message.type === 'command' ? 'yellow' : message.type === 'execution' ? 'green' : 'blue'} bold>
											{message.type === 'command' ? '⚡ Command' : message.type === 'execution' ? '🔧 Execution' : '🤖 Assistant'}
										</Text>
									</Box>
									<Text color="white">{message.content}</Text>
									
									{/* Command execution buttons */}
									{message.type === 'command' && pendingCommand && (
										<Box marginTop={1}>
											<Text color="white" dimColor>
												Type "yes" to execute, "no" to cancel, or continue chatting normally.
											</Text>
										</Box>
									)}
								</Box>
							</Box>
						)}
					</Box>
				))}

				{/* Loading indicator */}
				{isLoading && (
					<Box
						borderStyle="single"
						borderColor="yellow"
						padding={1}
						marginLeft={2}
					>
						<Box>
							<Text color="yellow">🔄 Thinking...</Text>
						</Box>
					</Box>
				)}
			</Box>

			{/* Input area */}
			<Box borderStyle="single" borderColor="green" padding={1} marginTop={1}>
				<Box>
					<Text color="green" bold>
						❯{' '}
					</Text>
					<Text color="white">
						{input}
						<Text backgroundColor="white" color="black">
							{' '}
						</Text>
					</Text>
				</Box>
			</Box>

			{/* Help text */}
			<Box marginTop={1}>
				<Text color="white" dimColor>
					Enter: send • Backspace: edit • Escape/Ctrl+M: main menu • Ctrl+C: exit
					{pendingCommand && ' • Type "yes" to execute suggested command'}
				</Text>
			</Box>
		</Box>
	);
}
