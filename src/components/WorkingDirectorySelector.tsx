import React, {useState, useEffect} from 'react';
import {Text, Box, useInput} from 'ink';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

interface Props {
	currentDirectory: string;
	onDirectorySelected: (directory: string) => void;
	onCancel: () => void;
}

interface DirectoryOption {
	path: string;
	name: string;
	type: 'current' | 'parent' | 'home' | 'root' | 'custom' | 'subdirectory';
	description: string;
}

export default function WorkingDirectorySelector({
	currentDirectory,
	onDirectorySelected,
	onCancel,
}: Props) {
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [customPath, setCustomPath] = useState('');
	const [isCustomMode, setIsCustomMode] = useState(false);
	const [directories, setDirectories] = useState<DirectoryOption[]>([]);
	const [error, setError] = useState<string>('');

	useEffect(() => {
		loadDirectoryOptions();
	}, [currentDirectory]);

	useInput((input, key) => {
		if (isCustomMode) {
			if (key.return) {
				handleCustomPathSubmit();
			} else if (key.escape) {
				setIsCustomMode(false);
				setCustomPath('');
				setError('');
			} else if (key.backspace || key.delete) {
				setCustomPath(prev => (prev.length > 0 ? prev.slice(0, -1) : ''));
			} else if (input && input.length === 1 && input >= ' ' && input <= '~') {
				setCustomPath(prev => prev + input);
			}
		} else {
			if (key.upArrow) {
				setSelectedIndex(prev =>
					prev > 0 ? prev - 1 : directories.length - 1,
				);
			} else if (key.downArrow) {
				setSelectedIndex(prev =>
					prev < directories.length - 1 ? prev + 1 : 0,
				);
			} else if (key.return) {
				handleDirectorySelection();
			} else if (key.escape) {
				onCancel();
			} else if (input === 'c' || input === 'C') {
				setIsCustomMode(true);
				setCustomPath('');
				setError('');
			}
		}
	});

	const loadDirectoryOptions = async () => {
		const options: DirectoryOption[] = [];

		// Current directory
		options.push({
			path: currentDirectory,
			name: path.basename(currentDirectory) || currentDirectory,
			type: 'current',
			description: 'Current working directory',
		});

		// Parent directory
		const parentDir = path.dirname(currentDirectory);
		if (parentDir !== currentDirectory) {
			options.push({
				path: parentDir,
				name: path.basename(parentDir) || parentDir,
				type: 'parent',
				description: 'Parent directory',
			});
		}

		// Home directory
		const homeDir = os.homedir();
		if (homeDir !== currentDirectory) {
			options.push({
				path: homeDir,
				name: '~',
				type: 'home',
				description: 'Home directory',
			});
		}

		// Root directory (only on Unix-like systems)
		if (process.platform !== 'win32' && currentDirectory !== '/') {
			options.push({
				path: '/',
				name: '/',
				type: 'root',
				description: 'Root directory',
			});
		}

		// Try to load subdirectories
		try {
			const entries = await fs.readdir(currentDirectory, {withFileTypes: true});
			const subdirs = entries
				.filter(entry => entry.isDirectory() && !entry.name.startsWith('.'))
				.slice(0, 5) // Limit to 5 subdirectories
				.map(entry => ({
					path: path.join(currentDirectory, entry.name),
					name: entry.name,
					type: 'subdirectory' as const,
					description: 'Subdirectory',
				}));

			options.push(...subdirs);
		} catch {
			// Ignore errors reading directory
		}

		// Custom path option
		options.push({
			path: '',
			name: 'Custom Path...',
			type: 'custom',
			description: 'Enter a custom directory path',
		});

		setDirectories(options);
	};

	const handleDirectorySelection = async () => {
		const selected = directories[selectedIndex];

		if (!selected) {
			setError('No directory selected');
			return;
		}

		if (selected.type === 'custom') {
			setIsCustomMode(true);
			return;
		}

		// Validate directory exists and is accessible
		try {
			await fs.access(selected.path);
			const stats = await fs.stat(selected.path);

			if (stats.isDirectory()) {
				onDirectorySelected(selected.path);
			} else {
				setError(`"${selected.path}" is not a directory`);
			}
		} catch (error) {
			setError(
				`Cannot access "${selected.path}": ${
					error instanceof Error ? error.message : 'Unknown error'
				}`,
			);
		}
	};

	const handleCustomPathSubmit = async () => {
		if (!customPath.trim()) {
			setError('Please enter a directory path');
			return;
		}

		let resolvedPath = customPath.trim();

		// Handle tilde expansion
		if (resolvedPath.startsWith('~')) {
			resolvedPath = path.join(os.homedir(), resolvedPath.slice(1));
		}

		// Handle relative paths
		if (!path.isAbsolute(resolvedPath)) {
			resolvedPath = path.resolve(currentDirectory, resolvedPath);
		}

		try {
			await fs.access(resolvedPath);
			const stats = await fs.stat(resolvedPath);

			if (stats.isDirectory()) {
				onDirectorySelected(resolvedPath);
			} else {
				setError(`"${resolvedPath}" is not a directory`);
			}
		} catch (error) {
			setError(
				`Cannot access "${resolvedPath}": ${
					error instanceof Error ? error.message : 'Unknown error'
				}`,
			);
		}
	};

	const getTypeIcon = (type: string): string => {
		switch (type) {
			case 'current':
				return '📍';
			case 'parent':
				return '⬆️';
			case 'home':
				return '🏠';
			case 'root':
				return '🌳';
			case 'subdirectory':
				return '📁';
			case 'custom':
				return '✏️';
			default:
				return '📂';
		}
	};

	const getTypeColor = (type: string): string => {
		switch (type) {
			case 'current':
				return 'green';
			case 'parent':
				return 'blue';
			case 'home':
				return 'cyan';
			case 'root':
				return 'red';
			case 'subdirectory':
				return 'white';
			case 'custom':
				return 'yellow';
			default:
				return 'white';
		}
	};

	return (
		<Box flexDirection="column" padding={1}>
			{/* Header */}
			<Box borderStyle="round" borderColor="blue" padding={1} marginBottom={1}>
				<Text color="blue" bold>
					📂 Select Working Directory
				</Text>
			</Box>

			{/* Current directory info */}
			<Box
				borderStyle="single"
				borderColor="white"
				padding={1}
				marginBottom={1}
			>
				<Box flexDirection="column">
					<Text color="white" bold>
						Current Directory:
					</Text>
					<Text color="cyan">{currentDirectory}</Text>
				</Box>
			</Box>

			{/* Custom path input */}
			{isCustomMode && (
				<Box
					borderStyle="single"
					borderColor="yellow"
					padding={1}
					marginBottom={1}
				>
					<Box flexDirection="column">
						<Text color="yellow" bold>
							✏️ Enter Custom Directory Path:
						</Text>
						<Box marginTop={1}>
							<Text color="white">
								Path: {customPath}
								<Text backgroundColor="white" color="black">
									{' '}
								</Text>
							</Text>
						</Box>
						<Box marginTop={1}>
							<Text color="white" dimColor>
								Examples: /home/user/projects, ~/Documents, ../parent-dir
							</Text>
						</Box>
					</Box>
				</Box>
			)}

			{/* Directory options */}
			{!isCustomMode && (
				<Box
					borderStyle="single"
					borderColor="green"
					padding={1}
					marginBottom={1}
				>
					<Box flexDirection="column">
						<Text color="white" bold>
							📋 Available Directories:
						</Text>

						{directories.map((dir, index) => (
							<Box key={index} marginTop={1}>
								<Box
									borderStyle={selectedIndex === index ? 'single' : undefined}
									borderColor={selectedIndex === index ? 'green' : undefined}
									padding={selectedIndex === index ? 1 : 0}
									paddingLeft={selectedIndex === index ? 1 : 2}
								>
									<Box width={40}>
										<Text
											color={
												selectedIndex === index
													? 'green'
													: getTypeColor(dir.type)
											}
											bold
										>
											{selectedIndex === index ? '❯ ' : '  '}
											{getTypeIcon(dir.type)} {dir.name}
										</Text>
									</Box>
									<Text color="white" dimColor>
										{dir.description}
									</Text>
								</Box>
								{selectedIndex === index && dir.path && (
									<Box paddingLeft={4}>
										<Text color="white" dimColor>
											Path: {dir.path}
										</Text>
									</Box>
								)}
							</Box>
						))}
					</Box>
				</Box>
			)}

			{/* Error display */}
			{error && (
				<Box
					borderStyle="single"
					borderColor="red"
					padding={1}
					marginBottom={1}
				>
					<Text color="red" bold>
						❌ Error: {error}
					</Text>
				</Box>
			)}

			{/* Instructions */}
			<Box borderStyle="single" borderColor="white" padding={1}>
				<Box flexDirection="column">
					<Text color="white" bold>
						🎮 Navigation:
					</Text>
					{isCustomMode ? (
						<>
							<Text color="white">• Type the directory path</Text>
							<Text color="green">• Press Enter to confirm</Text>
							<Text color="red">• Press Escape to cancel custom input</Text>
						</>
					) : (
						<>
							<Text color="white">• Use ↑↓ arrow keys to navigate</Text>
							<Text color="green">• Press Enter to select directory</Text>
							<Text color="yellow">• Press 'c' for custom path</Text>
							<Text color="red">• Press Escape to cancel</Text>
						</>
					)}
				</Box>
			</Box>

			{/* Current selection */}
			{!isCustomMode && directories.length > 0 && (
				<Box marginTop={1}>
					<Text color="white" dimColor>
						Selected: {directories[selectedIndex]?.name} • Press Enter to
						confirm
					</Text>
				</Box>
			)}
		</Box>
	);
}
