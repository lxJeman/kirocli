import React, {useState, useEffect} from 'react';
import {Text, Box, useInput} from 'ink';

interface Props {
	prompt?: string;
	placeholder?: string;
	onSubmit: (value: string) => void;
	onCancel?: () => void;
	history?: string[];
	multiline?: boolean;
	maxLength?: number;
	color?: string;
	focusColor?: string;
}

export default function CommandLine({
	prompt = '> ',
	placeholder = 'Type your command...',
	onSubmit,
	onCancel,
	history = [],
	multiline = false,
	maxLength = 1000,
	color = 'white',
	focusColor = 'cyan',
}: Props) {
	const [input, setInput] = useState('');
	const [historyIndex, setHistoryIndex] = useState(-1);
	const [cursorPosition, setCursorPosition] = useState(0);
	const [isFocused] = useState(true);

	useEffect(() => {
		setCursorPosition(input.length);
	}, [input]);

	useInput((inputChar, key) => {
		if (key.escape) {
			if (onCancel) {
				onCancel();
			}
			return;
		}

		if (key.return) {
			if (multiline && !key.ctrl) {
				setInput(prev => prev + '\\n');
				return;
			}

			if (input.trim()) {
				onSubmit(input.trim());
				setInput('');
				setHistoryIndex(-1);
				setCursorPosition(0);
			}
			return;
		}

		if (key.upArrow) {
			if (history.length > 0) {
				const newIndex = Math.min(historyIndex + 1, history.length - 1);
				setHistoryIndex(newIndex);
				setInput(history[history.length - 1 - newIndex] || '');
			}
			return;
		}

		if (key.downArrow) {
			if (historyIndex > 0) {
				const newIndex = historyIndex - 1;
				setHistoryIndex(newIndex);
				setInput(history[history.length - 1 - newIndex] || '');
			} else if (historyIndex === 0) {
				setHistoryIndex(-1);
				setInput('');
			}
			return;
		}

		if (key.leftArrow) {
			setCursorPosition(Math.max(0, cursorPosition - 1));
			return;
		}

		if (key.rightArrow) {
			setCursorPosition(Math.min(input.length, cursorPosition + 1));
			return;
		}

		if (key.backspace || key.delete) {
			if (cursorPosition > 0) {
				const newInput =
					input.slice(0, cursorPosition - 1) + input.slice(cursorPosition);
				setInput(newInput);
				setCursorPosition(cursorPosition - 1);
			}
			return;
		}

		if (key.ctrl && inputChar === 'c') {
			if (onCancel) {
				onCancel();
			}
			return;
		}

		if (key.ctrl && inputChar === 'l') {
			// Clear screen (handled by parent)
			return;
		}

		if (key.ctrl && inputChar === 'u') {
			// Clear line
			setInput('');
			setCursorPosition(0);
			return;
		}

		// Regular character input
		if (inputChar && !key.ctrl && !key.meta && input.length < maxLength) {
			const newInput =
				input.slice(0, cursorPosition) +
				inputChar +
				input.slice(cursorPosition);
			setInput(newInput);
			setCursorPosition(cursorPosition + 1);
		}
	});

	const displayInput = input || (isFocused ? placeholder : '');
	const beforeCursor = displayInput.slice(0, cursorPosition);
	const atCursor = displayInput[cursorPosition] || ' ';
	const afterCursor = displayInput.slice(cursorPosition + 1);

	return (
		<Box flexDirection="column">
			<Box>
				<Text color={isFocused ? focusColor : color}>{prompt}</Text>
				<Text color={input ? color : 'gray'}>
					{beforeCursor}
					<Text backgroundColor={isFocused ? focusColor : undefined}>
						{atCursor}
					</Text>
					{afterCursor}
				</Text>
			</Box>

			{multiline && (
				<Text dimColor>
					Press Ctrl+Enter to submit, Enter for new line, Escape to cancel
				</Text>
			)}

			{!multiline && (
				<Text dimColor>
					Press Enter to submit, ↑↓ for history, Escape to cancel
				</Text>
			)}
		</Box>
	);
}
