import React, {useState} from 'react';
import {Text, Box, useInput} from 'ink';
import {SafeShellExecutor} from '../utils/shell-executor.js';

interface Props {
	command: string;
	explanation: string;
	safety: 'safe' | 'caution' | 'dangerous';
	category: string;
	onConfirm: () => void;
	onReject: () => void;
	onCancel: () => void;
}

export default function CommandConfirmation({
	command,
	explanation,
	safety,
	category,
	onConfirm,
	onReject,
	onCancel,
}: Props) {
	const [showDetails, setShowDetails] = useState(false);

	useInput((input, key) => {
		if (key.escape) {
			onCancel();
		} else if (input === 'y' || input === 'Y') {
			onConfirm();
		} else if (input === 'n' || input === 'N') {
			onReject();
		} else if (input === 'd' || input === 'D') {
			setShowDetails(!showDetails);
		} else if (key.return) {
			// Default to reject for safety
			onReject();
		}
	});

	const getSafetyColor = (level: string) => {
		switch (level) {
			case 'safe':
				return 'green';
			case 'caution':
				return 'yellow';
			case 'dangerous':
				return 'red';
			default:
				return 'white';
		}
	};

	const getSafetyIcon = (level: string) => {
		switch (level) {
			case 'safe':
				return '✅';
			case 'caution':
				return '⚠️';
			case 'dangerous':
				return '🚨';
			default:
				return '❓';
		}
	};

	const getCategoryIcon = (cat: string) => {
		switch (cat.toLowerCase()) {
			case 'file':
				return '📁';
			case 'git':
				return '🔀';
			case 'system':
				return '⚙️';
			case 'development':
				return '💻';
			case 'network':
				return '🌐';
			default:
				return '🔧';
		}
	};

	// Validate command and get platform info
	const validation = SafeShellExecutor.validateCommand(command);
	const platformInfo = SafeShellExecutor.getPlatformInfo();
	const crossPlatformCommand =
		SafeShellExecutor.makeCommandCrossPlatform(command);
	const safeAlternatives = SafeShellExecutor.getSafeAlternatives(command);

	return (
		<Box flexDirection="column" padding={1}>
			{/* Header */}
			<Box
				borderStyle="round"
				borderColor={getSafetyColor(safety)}
				padding={1}
				marginBottom={1}
			>
				<Text color={getSafetyColor(safety)} bold>
					{getSafetyIcon(safety)} Command Confirmation Required
				</Text>
			</Box>

			{/* Command Details */}
			<Box borderStyle="single" borderColor="blue" padding={1} marginBottom={1}>
				<Box flexDirection="column">
					<Box marginBottom={1}>
						<Text color="white" bold>
							{getCategoryIcon(category)} Command to Execute:
						</Text>
					</Box>

					<Box marginBottom={1} paddingLeft={2}>
						<Text color="cyan" bold>
							{crossPlatformCommand !== command
								? crossPlatformCommand
								: command}
						</Text>
					</Box>

					{crossPlatformCommand !== command && (
						<Box marginBottom={1} paddingLeft={2}>
							<Text color="white" dimColor>
								Original: {command}
							</Text>
						</Box>
					)}

					<Box marginBottom={1}>
						<Text color="white">📝 {explanation}</Text>
					</Box>

					<Box>
						<Text color={getSafetyColor(safety)}>
							{getSafetyIcon(safety)} Safety Level:{' '}
							<Text bold>{safety.toUpperCase()}</Text>
						</Text>
					</Box>
				</Box>
			</Box>

			{/* Validation Status */}
			{!validation.valid && (
				<Box
					borderStyle="double"
					borderColor="red"
					padding={1}
					marginBottom={1}
				>
					<Box flexDirection="column">
						<Text color="red" bold>
							🚫 COMMAND BLOCKED
						</Text>
						<Text color="white">Reason: {validation.reason}</Text>
					</Box>
				</Box>
			)}

			{/* Safety Warnings */}
			{safety === 'dangerous' && (
				<Box
					borderStyle="double"
					borderColor="red"
					padding={1}
					marginBottom={1}
				>
					<Box flexDirection="column">
						<Text color="red" bold>
							🚨 DANGER WARNING
						</Text>
						<Text color="white">This command could potentially cause:</Text>
						<Text color="white">• Data loss or corruption</Text>
						<Text color="white">• System instability</Text>
						<Text color="white">• Security vulnerabilities</Text>
						<Text color="white">• Irreversible changes</Text>
					</Box>
				</Box>
			)}

			{safety === 'caution' && (
				<Box
					borderStyle="single"
					borderColor="yellow"
					padding={1}
					marginBottom={1}
				>
					<Box flexDirection="column">
						<Text color="yellow" bold>
							⚠️ CAUTION
						</Text>
						<Text color="white">
							This command will modify files or system state.
						</Text>
						<Text color="white">
							Make sure you understand the consequences before proceeding.
						</Text>
					</Box>
				</Box>
			)}

			{/* Safe Alternatives */}
			{safeAlternatives.length > 0 && (
				<Box
					borderStyle="single"
					borderColor="green"
					padding={1}
					marginBottom={1}
				>
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
				<Box
					borderStyle="single"
					borderColor="blue"
					padding={1}
					marginBottom={1}
				>
					<Box flexDirection="column">
						<Text color="blue" bold>
							🖥️ Platform Information:
						</Text>
						<Text color="white">
							Platform: {platformInfo.platform} ({platformInfo.arch})
						</Text>
						<Text color="white">Shell: {platformInfo.shell}</Text>
						<Text color="white">Working Directory: {process.cwd()}</Text>
						<Text color="white">Home Directory: {platformInfo.homeDir}</Text>
					</Box>
				</Box>
			)}

			{/* Action Buttons */}
			<Box
				borderStyle="single"
				borderColor="white"
				padding={1}
				marginBottom={1}
			>
				<Box flexDirection="column">
					<Text color="white" bold>
						🎮 What would you like to do?
					</Text>

					{validation.valid ? (
						<>
							<Text color="green">• Press 'y' to EXECUTE the command</Text>
							<Text color="red">• Press 'n' to REJECT and return to chat</Text>
						</>
					) : (
						<Text color="red">
							• Press 'n' to return to chat (command blocked for safety)
						</Text>
					)}

					<Text color="blue">• Press 'd' to toggle platform details</Text>
					<Text color="white">• Press Escape to cancel</Text>
					<Text color="white" dimColor>
						• Press Enter to reject (default for safety)
					</Text>
				</Box>
			</Box>

			{/* Safety Reminder */}
			<Box marginBottom={1}>
				<Text color="yellow" bold>
					🛡️ Safety Reminder: Always verify commands before execution!
				</Text>
			</Box>

			{/* Current Selection */}
			<Box>
				<Text color="white" dimColor>
					Command validation: {validation.valid ? '✅ Passed' : '❌ Failed'} •
					Platform: {platformInfo.platform} • Safety: {safety} • Press 'y' to
					execute, 'n' to reject
				</Text>
			</Box>
		</Box>
	);
}
