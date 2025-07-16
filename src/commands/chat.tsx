import React, {useState} from 'react';
import {Text, Box, useInput, Newline} from 'ink';
import {AIProvider} from '../ai/index.js';
import CommandInterpreter from '../components/CommandInterpreter.js';
import {CommandResult} from '../utils/shell-executor.js';

type Props = {
	model: string;
	onExit?: () => void;
};

type ChatMode = 'chat' | 'command-interpretation';

export default function ChatCommand({model, onExit}: Props) {
	const [input, setInput] = useState('');
	const [messages, setMessages] = useState<
		Array<{role: 'user' | 'assistant'; content: string; type?: 'command' | 'execution'}>
	>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [chatMode, setChatMode] = useState<ChatMode>('chat');
	const [pendingCommand, setPendingCommand] = useState<string>('');

	useInput((inputChar, key) => {
		// Don't handle input when in command interpretation mode
		if (chatMode === 'command-interpretation') {
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
