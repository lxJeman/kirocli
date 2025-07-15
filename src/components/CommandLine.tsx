import React, {useState} from 'react';
import {Text, Box, useInput} from 'ink';

type Props = {
	onExecuteCommand: (command: string, args: string[]) => void;
	onExit: () => void;
};

export default function CommandLine({onExecuteCommand, onExit}: Props) {
	const [input, setInput] = useState('');
	const [history, setHistory] = useState<string[]>([]);
	const [historyIndex, setHistoryIndex] = useState(-1);

	useInput((inputChar, key) => {
		if (key.return) {
			// Handle Enter key - execute command
			if (input.trim()) {
				const parts = input.trim().split(' ');
				const command = parts[0];
				const args = parts.slice(1);
				
				if (command) {
					// Add to history
					setHistory(prev => [...prev, input.trim()]);
					setHistoryIndex(-1);
					
					// Execute command
					onExecuteCommand(command, args);
					setInput('');
				}
			}
		} else if (key.backspace || key.delete) {
			// Handle Backspace/Delete key - remove last character
			setInput(prev => prev.length > 0 ? prev.slice(0, -1) : '');
		} else if (key.upArrow) {
			// Navigate history up
			if (history.length > 0) {
				const newIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
				setHistoryIndex(newIndex);
				setInput(history[newIndex] || '');
			}
		} else if (key.downArrow) {
			// Navigate history down
			if (historyIndex >= 0) {
				const newIndex = historyIndex + 1;
				if (newIndex >= history.length) {
					setHistoryIndex(-1);
					setInput('');
				} else {
					setHistoryIndex(newIndex);
					setInput(history[newIndex] || '');
				}
			}
		} else if (key.escape) {
			// Handle Escape key - exit to main menu
			onExit();
		} else if (key.ctrl && inputChar === 'c') {
			// Handle Ctrl+C - exit completely
			process.exit(0);
		} else if (key.ctrl && inputChar === 'm') {
			// Handle Ctrl+M - return to main menu
			onExit();
		} else if (!key.ctrl && !key.meta && !key.escape && inputChar && inputChar.length === 1) {
			// Handle regular character input - only printable characters
			if (inputChar >= ' ' && inputChar <= '~') {
				setInput(prev => prev + inputChar);
			}
		}
	});

	return (
		<Box flexDirection="column" padding={1}>
			{/* Header */}
			<Box borderStyle="round" borderColor="cyan" padding={1} marginBottom={1}>
				<Box flexDirection="column">
					<Text color="cyan" bold>
						💻 KiroCLI Command Line
					</Text>
					<Text color="white" dimColor>
						Execute commands directly without the kirocli prefix
					</Text>
				</Box>
			</Box>

			{/* Command Examples */}
			<Box borderStyle="single" borderColor="blue" padding={1} marginBottom={1}>
				<Box flexDirection="column">
					<Text color="yellow" bold>
						💡 Available Commands:
					</Text>
					<Text color="white">
						config show                    # Show configuration
					</Text>
					<Text color="white">
						config test                    # Test API connections
					</Text>
					<Text color="white">
						config set-key openai "key"   # Set API key
					</Text>
					<Text color="white">
						spec validate                  # Validate spec file
					</Text>
					<Text color="white">
						spec build                     # Generate code from spec
					</Text>
					<Text color="white">
						hook list                      # List available hooks
					</Text>
					<Text color="white">
						hook run git-commit           # Run specific hook
					</Text>
					<Text color="white">
						chat                          # Start chat mode
					</Text>
					<Text color="white">
						menu                          # Return to main menu
					</Text>
				</Box>
			</Box>

			{/* Command Input */}
			<Box borderStyle="single" borderColor="green" padding={1} marginBottom={1}>
				<Box>
					<Text color="green" bold>
						kirocli❯{' '}
					</Text>
					<Text color="white">
						{input}
						<Text backgroundColor="white" color="black">
							{' '}
						</Text>
					</Text>
				</Box>
			</Box>

			{/* Help */}
			<Box borderStyle="single" borderColor="white" padding={1}>
				<Text color="white" dimColor>
					Enter: execute • Backspace: edit • ↑↓: history • Escape/Ctrl+M: menu • Ctrl+C: exit
				</Text>
			</Box>
		</Box>
	);
}