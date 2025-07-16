import React, {useState, useEffect} from 'react';
import {Text, Box, useInput} from 'ink';
import {CommandResult} from '../utils/shell-executor.js';

interface Props {
	command: string;
	onCancel: () => void;
	onComplete: (result: CommandResult) => void;
	executeFunction: () => Promise<CommandResult>;
}

type ExecutionState = 'preparing' | 'executing' | 'completed' | 'failed' | 'cancelled';

export default function ExecutionProgress({
	command,
	onCancel,
	onComplete,
	executeFunction,
}: Props) {
	const [state, setState] = useState<ExecutionState>('preparing');
	const [progress, setProgress] = useState(0);
	const [elapsedTime, setElapsedTime] = useState(0);
	const [result, setResult] = useState<CommandResult | null>(null);
	const [loadingDots, setLoadingDots] = useState('');
	const [canCancel, setCanCancel] = useState(true);

	useEffect(() => {
		executeCommand();
	}, []);

	useEffect(() => {
		// Update elapsed time every 100ms
		const timer = setInterval(() => {
			if (state === 'executing') {
				setElapsedTime(prev => prev + 100);
			}
		}, 100);

		return () => clearInterval(timer);
	}, [state]);

	useEffect(() => {
		// Animate loading dots
		if (state === 'preparing' || state === 'executing') {
			const interval = setInterval(() => {
				setLoadingDots(prev => {
					if (prev.length >= 3) return '';
					return prev + '.';
				});
			}, 500);
			return () => clearInterval(interval);
		}
		return undefined;
	}, [state]);

	useEffect(() => {
		// Simulate progress for visual feedback
		if (state === 'executing') {
			const progressTimer = setInterval(() => {
				setProgress(prev => {
					if (prev >= 90) return prev; // Don't go to 100% until actually complete
					return prev + Math.random() * 10;
				});
			}, 200);

			return () => clearInterval(progressTimer);
		}
		return undefined;
	}, [state]);

	useInput((input, key) => {
		if ((key.ctrl && input === 'c') || key.escape) {
			if (canCancel && (state === 'preparing' || state === 'executing')) {
				setState('cancelled');
				onCancel();
			}
		} else if (key.return && (state === 'completed' || state === 'failed')) {
			onComplete(result!);
		}
	});

	const executeCommand = async () => {
		try {
			setState('preparing');
			setProgress(0);
			
			// Brief preparation phase
			await new Promise(resolve => setTimeout(resolve, 500));
			
			setState('executing');
			setCanCancel(false); // Disable cancellation during actual execution
			
			const executionResult = await executeFunction();
			
			setResult(executionResult);
			setProgress(100);
			
			if (executionResult.success) {
				setState('completed');
			} else {
				setState('failed');
			}
			
		} catch (error) {
			const errorResult: CommandResult = {
				success: false,
				output: '',
				error: error instanceof Error ? error.message : 'Unknown execution error',
				exitCode: -1,
				command,
				duration: elapsedTime,
			};
			
			setResult(errorResult);
			setState('failed');
		}
	};

	const formatTime = (ms: number): string => {
		if (ms < 1000) return `${ms}ms`;
		return `${(ms / 1000).toFixed(1)}s`;
	};

	const getProgressBar = (percentage: number): string => {
		const width = 30;
		const filled = Math.round((percentage / 100) * width);
		const empty = width - filled;
		return '█'.repeat(filled) + '░'.repeat(empty);
	};

	const getStateColor = (currentState: ExecutionState): string => {
		switch (currentState) {
			case 'preparing': return 'yellow';
			case 'executing': return 'blue';
			case 'completed': return 'green';
			case 'failed': return 'red';
			case 'cancelled': return 'gray';
			default: return 'white';
		}
	};

	const getStateIcon = (currentState: ExecutionState): string => {
		switch (currentState) {
			case 'preparing': return '🔄';
			case 'executing': return '⚡';
			case 'completed': return '✅';
			case 'failed': return '❌';
			case 'cancelled': return '🚫';
			default: return '❓';
		}
	};

	const getStateMessage = (currentState: ExecutionState): string => {
		switch (currentState) {
			case 'preparing': return 'Preparing command execution';
			case 'executing': return 'Executing command';
			case 'completed': return 'Command completed successfully';
			case 'failed': return 'Command execution failed';
			case 'cancelled': return 'Command execution cancelled';
			default: return 'Unknown state';
		}
	};

	return (
		<Box flexDirection="column" padding={1}>
			{/* Header */}
			<Box borderStyle="round" borderColor={getStateColor(state)} padding={1} marginBottom={1}>
				<Text color={getStateColor(state)} bold>
					{getStateIcon(state)} Command Execution Progress
				</Text>
			</Box>

			{/* Command Info */}
			<Box borderStyle="single" borderColor="blue" padding={1} marginBottom={1}>
				<Box flexDirection="column">
					<Box marginBottom={1}>
						<Text color="white" bold>
							🔧 Executing Command:
						</Text>
					</Box>
					<Box marginBottom={1} paddingLeft={2}>
						<Text color="cyan" bold>
							{command}
						</Text>
					</Box>
					<Box>
						<Text color="white">
							📊 Status: <Text color={getStateColor(state)}>{getStateMessage(state)}</Text>
						</Text>
					</Box>
				</Box>
			</Box>

			{/* Progress Bar */}
			{(state === 'preparing' || state === 'executing') && (
				<Box borderStyle="single" borderColor="yellow" padding={1} marginBottom={1}>
					<Box flexDirection="column">
						<Box marginBottom={1}>
							<Text color="yellow" bold>
								⏱️ Progress: {Math.round(progress)}%
							</Text>
						</Box>
						<Box marginBottom={1}>
							<Text color="white">
								{getProgressBar(progress)}
							</Text>
						</Box>
						<Box>
							<Text color="white">
								Elapsed: {formatTime(elapsedTime)} • {state === 'preparing' ? 'Preparing' : 'Running'}{loadingDots}
							</Text>
						</Box>
					</Box>
				</Box>
			)}

			{/* Results */}
			{result && (state === 'completed' || state === 'failed') && (
				<Box borderStyle="single" borderColor={result.success ? 'green' : 'red'} padding={1} marginBottom={1}>
					<Box flexDirection="column">
						<Box marginBottom={1}>
							<Text color={result.success ? 'green' : 'red'} bold>
								{result.success ? '✅ Execution Successful' : '❌ Execution Failed'}
							</Text>
						</Box>
						
						<Box marginBottom={1}>
							<Text color="white">
								Duration: {formatTime(result.duration)} • Exit Code: {result.exitCode}
							</Text>
						</Box>

						{result.output && (
							<Box marginBottom={1}>
								<Box flexDirection="column">
									<Text color="white" bold>
										📤 Output:
									</Text>
									<Box paddingLeft={2}>
										<Text color="white">
											{result.output.length > 500 
												? result.output.substring(0, 500) + '...\n[Output truncated - too long]'
												: result.output
											}
										</Text>
									</Box>
								</Box>
							</Box>
						)}

						{result.error && (
							<Box marginBottom={1}>
								<Box flexDirection="column">
									<Text color="red" bold>
										❌ Error:
									</Text>
									<Box paddingLeft={2}>
										<Text color="red">
											{result.error.length > 300 
												? result.error.substring(0, 300) + '...\n[Error truncated - too long]'
												: result.error
											}
										</Text>
									</Box>
								</Box>
							</Box>
						)}
					</Box>
				</Box>
			)}

			{/* Recovery Options for Failed Commands */}
			{state === 'failed' && result && (
				<Box borderStyle="single" borderColor="yellow" padding={1} marginBottom={1}>
					<Box flexDirection="column">
						<Text color="yellow" bold>
							🔧 Troubleshooting Tips:
						</Text>
						{result.exitCode === 127 && (
							<Text color="white">• Command not found - check if it's installed and in PATH</Text>
						)}
						{result.exitCode === 1 && (
							<Text color="white">• General error - check command syntax and permissions</Text>
						)}
						{result.exitCode === 2 && (
							<Text color="white">• Invalid usage - check command arguments and options</Text>
						)}
						{result.error?.includes('permission') && (
							<Text color="white">• Permission denied - try with appropriate permissions</Text>
						)}
						{result.error?.includes('not found') && (
							<Text color="white">• File or directory not found - check the path</Text>
						)}
						<Text color="white">• Try running the command manually to debug further</Text>
						<Text color="white">• Check the command documentation for proper usage</Text>
					</Box>
				</Box>
			)}

			{/* Action Instructions */}
			<Box borderStyle="single" borderColor="white" padding={1}>
				<Box flexDirection="column">
					<Text color="white" bold>
						🎮 Controls:
					</Text>
					{canCancel && (state === 'preparing' || state === 'executing') ? (
						<>
							<Text color="red">
								• Press Ctrl+C or Escape to cancel execution
							</Text>
							<Text color="white" dimColor>
								• Cancellation may not be immediate during execution
							</Text>
						</>
					) : (state === 'completed' || state === 'failed') ? (
						<Text color="green">
							• Press Enter to continue
						</Text>
					) : (
						<Text color="white" dimColor>
							• Execution in progress - please wait
						</Text>
					)}
				</Box>
			</Box>
		</Box>
	);
}