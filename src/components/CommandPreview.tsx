import React from 'react';
import {Text, Box} from 'ink';

interface Props {
	command: string;
	language?: 'bash' | 'javascript' | 'typescript' | 'python' | 'json' | 'yaml' | 'sql';
	showLineNumbers?: boolean;
	title?: string;
	description?: string;
	safetyLevel?: 'safe' | 'caution' | 'dangerous';
}

export default function CommandPreview({
	command,
	language = 'bash',
	showLineNumbers = false,
	title,
	description,
	safetyLevel = 'safe'
}: Props) {
	const lines = command.split('\\n');
	
	const getSafetyColor = () => {
		switch (safetyLevel) {
			case 'safe': return 'green';
			case 'caution': return 'yellow';
			case 'dangerous': return 'red';
			default: return 'white';
		}
	};

	const getSafetyIcon = () => {
		switch (safetyLevel) {
			case 'safe': return '✅';
			case 'caution': return '⚠️';
			case 'dangerous': return '🚨';
			default: return '📝';
		}
	};

	const highlightBashCommand = (line: string) => {
		// Simple bash syntax highlighting
		// const parts: React.ReactNode[] = [];
		// let currentIndex = 0;

		// Keywords
		const keywords = ['if', 'then', 'else', 'fi', 'for', 'while', 'do', 'done', 'case', 'esac', 'function'];
		const commands = ['ls', 'cd', 'mkdir', 'rm', 'cp', 'mv', 'grep', 'find', 'sed', 'awk', 'cat', 'echo', 'git', 'npm', 'node'];
		
		// Split by spaces and process each part
		const words = line.split(/(\s+)/);
		
		return words.map((word, index) => {
			if (/^\s+$/.test(word)) {
				return <Text key={index}>{word}</Text>;
			}

			// Comments
			if (word.startsWith('#')) {
				return <Text key={index} color="gray">{word}</Text>;
			}

			// Strings
			if ((word.startsWith('"') && word.endsWith('"')) || (word.startsWith("'") && word.endsWith("'"))) {
				return <Text key={index} color="green">{word}</Text>;
			}

			// Commands
			if (commands.includes(word.toLowerCase())) {
				return <Text key={index} color="cyan" bold>{word}</Text>;
			}

			// Keywords
			if (keywords.includes(word.toLowerCase())) {
				return <Text key={index} color="magenta" bold>{word}</Text>;
			}

			// Flags (starting with -)
			if (word.startsWith('-')) {
				return <Text key={index} color="yellow">{word}</Text>;
			}

			// Variables (starting with $)
			if (word.startsWith('$')) {
				return <Text key={index} color="blue">{word}</Text>;
			}

			// Pipes and redirects
			if (['|', '>', '>>', '<', '&&', '||'].includes(word)) {
				return <Text key={index} color="red" bold>{word}</Text>;
			}

			// Default
			return <Text key={index}>{word}</Text>;
		});
	};

	const highlightCode = (line: string, _lineNumber: number) => {
		switch (language) {
			case 'bash':
				return highlightBashCommand(line);
			case 'javascript':
			case 'typescript':
				// Simple JS/TS highlighting
				return <Text color="blue">{line}</Text>;
			case 'python':
				return <Text color="green">{line}</Text>;
			case 'json':
				return <Text color="yellow">{line}</Text>;
			case 'yaml':
				return <Text color="cyan">{line}</Text>;
			default:
				return <Text>{line}</Text>;
		}
	};

	return (
		<Box flexDirection="column">
			{/* Header */}
			{(title || description || safetyLevel !== 'safe') && (
				<Box flexDirection="column" marginBottom={1}>
					{title && (
						<Box>
							<Text bold color="white">{title}</Text>
							<Box marginLeft={1}>
								<Text color={getSafetyColor()}>
									{getSafetyIcon()}
								</Text>
							</Box>
						</Box>
					)}
					{description && (
						<Text color="gray">{description}</Text>
					)}
					{safetyLevel !== 'safe' && (
						<Box>
							<Text color={getSafetyColor()} bold>
								Safety Level: {safetyLevel.toUpperCase()}
							</Text>
						</Box>
					)}
				</Box>
			)}

			{/* Code Block */}
			<Box 
				borderStyle="single" 
				borderColor={getSafetyColor()} 
				padding={1}
				flexDirection="column"
			>
				{/* Language indicator */}
				<Box marginBottom={1}>
					<Text color="gray" bold>
						{language.toUpperCase()}
					</Text>
				</Box>

				{/* Code lines */}
				{lines.map((line, index) => (
					<Box key={index}>
						{showLineNumbers && (
							<Text color="gray" dimColor>
								{String(index + 1).padStart(3, ' ')} │ 
							</Text>
						)}
						<Box marginLeft={showLineNumbers ? 1 : 0}>
							{highlightCode(line, index + 1)}
						</Box>
					</Box>
				))}
			</Box>

			{/* Footer info */}
			<Box marginTop={1}>
				<Text dimColor>
					Language: {language} • Lines: {lines.length} • Safety: {safetyLevel}
				</Text>
			</Box>
		</Box>
	);
}