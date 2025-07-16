import React, {useState} from 'react';
import {Text, Box, useInput} from 'ink';
import {SafeShellExecutor} from '../utils/shell-executor.js';
import WorkingDirectorySelector from './WorkingDirectorySelector.js';

interface Props {
	command: string;
	explanation: string;
	safety: 'safe' | 'caution' | 'dangerous';
	category: string;
	workingDirectory?: string;
	onExecute: (workingDirectory: string) => void;
	onCancel: () => void;
	onModify: (newCommand: string) => void;
}

export default function CommandPreview({
	command,
	explanation,
	safety,
	category,
	workingDirectory: initialWorkingDirectory,
	onExecute,
	onCancel,
	onModify,
}: Props) {
	const [showDetails, setShowDetails] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [editedCommand, setEditedCommand] = useState(command);
	const [showDirectorySelector, setShowDirectorySelector] = useState(false);
	const [workingDirectory, setWorkingDirectory] = useState(initialWorkingDirectory || process.cwd());

	useInput((input, key) => {
		// Don't handle input when directory selector is shown
		if (showDirectorySelector) {
			return;
		}

		if (isEditing) {
			if (key.return) {
				// Save edited command
				onModify(editedCommand);
				setIsEditing(false);
			} else if (key.escape) {
				// Cancel editing
				setEditedCommand(command);
				setIsEditing(false);
			} else if (key.backspace || key.delete) {
				setEditedCommand(prev => prev.length > 0 ? prev.slice(0, -1) : '');
			} else if (input && input.length === 1 && input >= ' ' && input <= '~') {
				setEditedCommand(prev => prev + input);
			}
		} else {
			if (key.escape) {
				onCancel();
			} else if (input === 'y' || input === 'Y') {
				onExecute(workingDirectory);
			} else if (input === 'n' || input === 'N') {
				onCancel();
			} else if (input === 'd' || input === 'D') {
				setShowDetails(!showDetails);
			} else if (input === 'e' || input === 'E') {
				setIsEditing(true);
			} else if (input === 'w' || input === 'W') {
				setShowDirectorySelector(true);
			}
		}
	});

	const handleDirectorySelected = (directory: string) => {
		setWorkingDirectory(directory);
		setShowDirectorySelector(false);
	};

	const handleDirectorySelectorCancel = () => {
		setShowDirectorySelector(false);
	};

	const getSafetyColor = (level: string) => {
		switch (level) {
			case 'safe': return 'green';
			case 'caution': return 'yellow';
			case 'dangerous': return 'red';
			default: return 'white';
		}
	};

	const getSafetyIcon = (level: string) => {
		switch (level) {
			case 'safe': return '✅';
			case 'caution': return '⚠️';
			case 'dangerous': return '🚨';
			default: return '❓';
		}
	};

	const getCategoryIcon = (cat: string) => {
		switch (cat.toLowerCase()) {
			case 'file': return '📁';
			case 'git': return '🔀';
			case 'system': return '⚙️';
			case 'development': return '💻';
			case 'network': return '🌐';
			default: return '🔧';
		}
	};

	// Get command validation and platform info
	const validation = SafeShellExecutor.validateCommand(command);
	const platformInfo = SafeShellExecutor.getPlatformInfo();
	const crossPlatformCommand = SafeShellExecutor.makeCommandCrossPlatform(command);
	const safeAlternatives = SafeShellExecutor.getSafeAlternatives(command);

	// Show directory selector if requested
	if (showDirectorySelector) {
		return (
			<WorkingDirectorySelector
				currentDirectory={workingDirectory}
				onDirectorySelected={handleDirectorySelected}
				onCancel={handleDirectorySelectorCancel}
			/>
		);
	}

	return (
		<Box flexDirection="column" padding={1}>
			{/* Header */}
			<Box borderStyle="round" borderColor={getSafetyColor(safety)} padding={1} marginBottom={1}>
				<Text color={getSafetyColor(safety)} bold>
					{getSafetyIcon(safety)} Command Preview & Confirmation
				</Text>
			</Box>

			{/* Working Directory */}
			<Box borderStyle="single" borderColor="cyan" padding={1} marginBottom={1}>
				<Box flexDirection="column">
					<Box marginBottom={1}>
						<Text color="cyan" bold>
							📂 Working Directory:
						</Text>
					</Box>
					<Box marginBottom={1} paddingLeft={2}>
						<Text color="white">
							{workingDirectory}
						</Text>
					</Box>
					<Box>
						<Text color="white" dimColor>
							Press 'w' to change working directory
						</Text>
					</Box>
				</Box>
			</Box>

			{/* Command Details */}
			<Box borderStyle="single" borderColor="blue" padding={1} marginBottom={1}>
				<Box flexDirection="column">
					<Box marginBottom={1}>
						<Text color="white" bold>
							{getCategoryIcon(category)} Command to Execute:
						</Text>
					</Box>
					
					{isEditing ? (
						<Box marginBottom={1} paddingLeft={2}>
							<Text color="yellow" bold>
								Editing: {editedCommand}
								<Text backgroundColor="white" color="black"> </Text>
							</Text>
						</Box>
					) : (
						<Box marginBottom={1} paddingLeft={2}>
							<Text color="cyan" bold>
								{crossPlatformCommand !== command ? crossPlatformCommand : command}
							</Text>
						</Box>
					)}

					{crossPlatformCommand !== command && !isEditing && (
						<Box marginBottom={1} paddingLeft={2}>
							<Text color="white" dimColor>
								Original: {command}
							</Text>
						</Box>
					)}

					<Box marginBottom={1}>
						<Text color="white">
							📝 {explanation}
						</Text>
					</Box>

					<Box>
						<Text color={getSafetyColor(safety)}>
							{getSafetyIcon(safety)} Safety Level: <Text bold>{safety.toUpperCase()}</Text>
						</Text>
					</Box>
				</Box>
			</Box>

			{/* Validation Status */}
			{!validation.valid && (
				<Box borderStyle="double" borderColor="red" padding={1} marginBottom={1}>
					<Box flexDirection="column">
						<Text color="red" bold>
							🚫 COMMAND BLOCKED
						</Text>
						<Text color="white">
							Reason: {validation.reason}
						</Text>
					</Box>
				</Box>
			)}

			{/* Safety Warnings */}
			{safety === 'dangerous' && validation.valid && (
				<Box borderStyle="double" borderColor="red" padding={1} marginBottom={1}>
					<Box flexDirection="column">
						<Text color="red" bold>
							🚨 DANGER WARNING
						</Text>
						<Text color="white">
							This command could potentially cause:
						</Text>
						<Text color="white">• Data loss or corruption</Text>
						<Text color="white">• System instability</Text>
						<Text color="white">• Security vulnerabilities</Text>
						<Text color="white">• Irreversible changes</Text>
					</Box>
				</Box>
			)}

			{safety === 'caution' && validation.valid && (
				<Box borderStyle="single" borderColor="yellow" padding={1} marginBottom={1}>
					<Box flexDirection="column">
						<Text color="yellow" bold>
							⚠️ CAUTION
						</Text>
						<Text color="white">
							This command will modify files or system state.
						</Text>
						<Text color="white">
							Review the command carefully before proceeding.
						</Text>
					</Box>
				</Box>
			)}

			{/* Safe Alternatives */}
			{safeAlternatives.length > 0 && (
				<Box borderStyle="single" borderColor="green" padding={1} marginBottom={1}>
					<Box flexDirection="column">
						<Text color="green" bold>
							💡 Safer Alternatives:
						</Text>
						{safeAlternatives.map((alt, index) => (
							<Text key={index} color="white">
								• {alt}
							</Text>
						))}
					</Box>
				</Box>
			)}

			{/* Platform Information */}
			{showDetails && (
				<Box borderStyle="single" borderColor="blue" padding={1} marginBottom={1}>
					<Box flexDirection="column">
						<Text color="blue" bold>
							🖥️ Execution Environment:
						</Text>
						<Text color="white">Platform: {platformInfo.platform} ({platformInfo.arch})</Text>
						<Text color="white">Shell: {platformInfo.shell}</Text>
						<Text color="white">Working Directory: {process.cwd()}</Text>
						<Text color="white">Home Directory: {platformInfo.homeDir}</Text>
						<Text color="white">Command Category: {category}</Text>
						<Text color="white">Cross-platform: {crossPlatformCommand !== command ? 'Yes' : 'No'}</Text>
					</Box>
				</Box>
			)}

			{/* Action Buttons */}
			<Box borderStyle="single" borderColor="white" padding={1} marginBottom={1}>
				<Box flexDirection="column">
					<Text color="white" bold>
						🎮 Available Actions:
					</Text>
					
					{isEditing ? (
						<>
							<Text color="green">
								• Press Enter to save changes
							</Text>
							<Text color="red">
								• Press Escape to cancel editing
							</Text>
						</>
					) : (
						<>
							{validation.valid ? (
								<Text color="green">
									• Press 'y' to EXECUTE the command
								</Text>
							) : (
								<Text color="red">
									• Command blocked - cannot execute
								</Text>
							)}
							<Text color="red">
								• Press 'n' to CANCEL and return
							</Text>
							<Text color="blue">
								• Press 'e' to EDIT the command
							</Text>
							<Text color="cyan">
								• Press 'w' to change WORKING DIRECTORY
							</Text>
							<Text color="blue">
								• Press 'd' to toggle execution details
							</Text>
							<Text color="white">
								• Press Escape to cancel
							</Text>
						</>
					)}
				</Box>
			</Box>

			{/* Current Status */}
			<Box>
				<Text color="white" dimColor>
					{isEditing ? (
						`Editing command... Press Enter to save, Escape to cancel`
					) : (
						`Validation: ${validation.valid ? '✅ Passed' : '❌ Failed'} • Platform: ${platformInfo.platform} • Safety: ${safety}`
					)}
				</Text>
			</Box>
		</Box>
	);
}