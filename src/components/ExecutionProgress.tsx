import React, {useState, useEffect} from 'react';
import {Text, Box} from 'ink';
import EnhancedSpinner from './EnhancedSpinner.js';
import ProgressBar from './ProgressBar.js';

interface ExecutionStep {
	id: string;
	name: string;
	status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
	duration?: number;
	output?: string;
	error?: string;
}

interface Props {
	steps: ExecutionStep[];
	currentStep?: string;
	overallProgress?: number;
	title?: string;
	showOutput?: boolean;
	showTimings?: boolean;
	onComplete?: (success: boolean) => void;
}

export default function ExecutionProgress({
	steps,
	currentStep,
	overallProgress,
	title = 'Execution Progress',
	showOutput = false,
	showTimings = true,
	onComplete,
}: Props) {
	const [startTime] = useState(Date.now());
	const [elapsedTime, setElapsedTime] = useState(0);

	useEffect(() => {
		const timer = setInterval(() => {
			setElapsedTime(Date.now() - startTime);
		}, 100);

		return () => clearInterval(timer);
	}, [startTime]);

	useEffect(() => {
		const allCompleted = steps.every(
			step =>
				step.status === 'completed' ||
				step.status === 'failed' ||
				step.status === 'skipped',
		);

		if (allCompleted && onComplete) {
			const success =
				steps.some(step => step.status === 'completed') &&
				!steps.some(step => step.status === 'failed');
			onComplete(success);
		}
	}, [steps, onComplete]);

	const getStatusIcon = (status: ExecutionStep['status']) => {
		switch (status) {
			case 'pending':
				return '⏳';
			case 'running':
				return '🔄';
			case 'completed':
				return '✅';
			case 'failed':
				return '❌';
			case 'skipped':
				return '⏭️';
			default:
				return '❓';
		}
	};

	const getStatusColor = (status: ExecutionStep['status']) => {
		switch (status) {
			case 'pending':
				return 'gray';
			case 'running':
				return 'yellow';
			case 'completed':
				return 'green';
			case 'failed':
				return 'red';
			case 'skipped':
				return 'blue';
			default:
				return 'white';
		}
	};

	const formatDuration = (ms: number) => {
		if (ms < 1000) return `${ms}ms`;
		if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
		return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
	};

	const completedSteps = steps.filter(
		step => step.status === 'completed',
	).length;
	const failedSteps = steps.filter(step => step.status === 'failed').length;
	const calculatedProgress =
		overallProgress ?? (completedSteps / steps.length) * 100;

	return (
		<Box flexDirection="column">
			{/* Header */}
			<Box borderStyle="round" borderColor="cyan" padding={1} marginBottom={1}>
				<Box flexDirection="column" width="100%">
					<Box justifyContent="space-between">
						<Text color="cyan" bold>
							{title}
						</Text>
						{showTimings && (
							<Text dimColor>Elapsed: {formatDuration(elapsedTime)}</Text>
						)}
					</Box>

					{/* Overall Progress */}
					<Box marginTop={1}>
						<ProgressBar
							progress={calculatedProgress}
							width={50}
							color={failedSteps > 0 ? 'red' : 'green'}
							label={`Progress: ${completedSteps}/${steps.length} steps`}
						/>
					</Box>
				</Box>
			</Box>

			{/* Steps */}
			<Box flexDirection="column">
				{steps.map((step, _index) => (
					<Box key={step.id} flexDirection="column" marginBottom={1}>
						<Box>
							<Text color={getStatusColor(step.status)}>
								{getStatusIcon(step.status)}
							</Text>
							<Box marginLeft={1}>
								<Text bold={step.status === 'running'}>{step.name}</Text>
							</Box>
							{step.status === 'running' && step.id === currentStep && (
								<Box marginLeft={2}>
									<EnhancedSpinner text="" type="dots" color="yellow" />
								</Box>
							)}
							{showTimings && step.duration && (
								<Box marginLeft={2}>
									<Text dimColor>({formatDuration(step.duration)})</Text>
								</Box>
							)}
						</Box>

						{/* Step Output */}
						{showOutput && step.output && (
							<Box marginLeft={4} marginTop={1}>
								<Box borderStyle="single" borderColor="gray" padding={1}>
									<Text color="gray">{step.output}</Text>
								</Box>
							</Box>
						)}

						{/* Step Error */}
						{step.error && (
							<Box marginLeft={4} marginTop={1}>
								<Box borderStyle="single" borderColor="red" padding={1}>
									<Text color="red">Error: {step.error}</Text>
								</Box>
							</Box>
						)}
					</Box>
				))}
			</Box>

			{/* Summary */}
			<Box borderStyle="single" borderColor="blue" padding={1} marginTop={1}>
				<Box flexDirection="column">
					<Text bold>Execution Summary:</Text>
					<Text>
						✅ Completed: {completedSteps} • ❌ Failed: {failedSteps} • ⏳
						Pending: {steps.filter(s => s.status === 'pending').length} • 🔄
						Running: {steps.filter(s => s.status === 'running').length}
					</Text>
					{showTimings && (
						<Text dimColor>
							Total elapsed time: {formatDuration(elapsedTime)}
						</Text>
					)}
				</Box>
			</Box>
		</Box>
	);
}
