import React, {useState} from 'react';
import {Text, Box, useInput} from 'ink';
import {AIProvider} from '../ai/index.js';

type Props = {
	model: string;
};

export default function ChatCommand({model}: Props) {
	const [input, setInput] = useState('');
	const [messages, setMessages] = useState<Array<{role: 'user' | 'assistant'; content: string}>>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [mode] = useState<'input' | 'confirm'>('input');

	useInput((input, key) => {
		if (key.return && mode === 'input') {
			if (input.trim()) {
				handleUserInput(input.trim());
				setInput('');
			}
		} else if (mode === 'input') {
			setInput(prev => prev + input);
		}
	});

	const handleUserInput = async (userInput: string) => {
		const newMessages = [...messages, {role: 'user' as const, content: userInput}];
		setMessages(newMessages);
		setIsLoading(true);

		try {
			const ai = new AIProvider(model);
			const response = await ai.chat(newMessages);
			setMessages([...newMessages, {role: 'assistant', content: response}]);
		} catch (error) {
			setMessages([...newMessages, {role: 'assistant', content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`}]);
		}

		setIsLoading(false);
	};

	return (
		<Box flexDirection="column">
			<Text color="cyan" bold>
				🤖 KiroCLI Chat Mode (Model: {model})
			</Text>
			<Text color="gray">
				Type your commands or questions. Press Ctrl+C to exit.
			</Text>
			<Text> </Text>

			{messages.map((message, index) => (
				<Box key={index} marginBottom={1}>
					<Text color={message.role === 'user' ? 'green' : 'blue'}>
						{message.role === 'user' ? '> ' : '🤖 '}
						{message.content}
					</Text>
				</Box>
			))}

			{isLoading && (
				<Text color="yellow">
					🔄 Thinking...
				</Text>
			)}

			<Box>
				<Text color="green">
					{'> '}{input}
				</Text>
			</Box>
		</Box>
	);
}