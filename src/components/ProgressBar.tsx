import React from 'react';
import {Text, Box} from 'ink';

interface Props {
	progress: number; // 0-100
	width?: number;
	showPercentage?: boolean;
	color?: 'green' | 'blue' | 'yellow' | 'red' | 'cyan' | 'magenta';
	backgroundColor?: 'gray' | 'blackBright';
	label?: string;
}

export default function ProgressBar({
	progress,
	width = 30,
	showPercentage = true,
	color = 'green',
	backgroundColor = 'gray',
	label
}: Props) {
	const clampedProgress = Math.max(0, Math.min(100, progress));
	const filledWidth = Math.round((clampedProgress / 100) * width);
	const emptyWidth = width - filledWidth;
	
	const filledBar = '█'.repeat(filledWidth);
	const emptyBar = '░'.repeat(emptyWidth);
	
	return (
		<Box flexDirection="column">
			{label && (
				<Text>{label}</Text>
			)}
			<Box>
				<Text color={color}>{filledBar}</Text>
				<Text color={backgroundColor}>{emptyBar}</Text>
				{showPercentage && (
					<Text> {clampedProgress.toFixed(1)}%</Text>
				)}
			</Box>
		</Box>
	);
}