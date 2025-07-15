import React, {useState} from 'react';
import {Text, Box, useInput, Newline} from 'ink';
import {AIProvider} from '../ai/index.js';

type Props = {
	model: string;
	onExit?: () => void;
};

export default function ChatCommand({model, onExit}: Props) {
	const [input, setInput] = useState('');
	const [messages, setMessages] = useState<
		Array<{role: 'user' | 'assistant'; content: string}>
	>([]);
	const [isLoading, setIsLoading] = useState(false);

	useInput((inputChar, key) => {
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
		setIsLoading(true);

		try {
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

	return (
		<Box flexDirection="column" padding={1}>
			{/* Header */}
			<Box borderStyle="round" borderColor="cyan" padding={1} marginBottom={1}>
				<Box flexDirection="column">
					<Text color="cyan" bold>
						🤖 KiroCLI Chat Mode
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
							Try asking: "How do I list files in a directory?" or "Generate a
							React component"
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
								borderColor="blue"
								padding={1}
								marginLeft={2}
							>
								<Box flexDirection="column">
									<Box marginBottom={1}>
										<Text color="blue" bold>
											🤖 Assistant
										</Text>
									</Box>
									<Text color="white">{message.content}</Text>
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
				</Text>
			</Box>
		</Box>
	);
}
