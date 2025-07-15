import React, {useState, useEffect} from 'react';
import {Text, Box, useInput} from 'ink';
import {HookManager} from '../hooks/index.js';

type Props = {
	action: 'list' | 'run' | 'create';
	hookName?: string;
	onExit?: () => void;
};

export default function HookCommand({action, hookName, onExit}: Props) {
	const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
	const [message, setMessage] = useState('');
	const [hooks, setHooks] = useState<string[]>([]);

	useEffect(() => {
		handleAction();
	}, []);

	useInput((input, key) => {
		if (key.escape || (key.ctrl && input === 'm')) {
			if (onExit) {
				onExit();
			}
		} else if (key.ctrl && input === 'c') {
			process.exit(0);
		}
	});

	const handleAction = async () => {
		try {
			const hookManager = new HookManager();

			switch (action) {
				case 'list':
					const availableHooks = await hookManager.listHooks();
					setHooks(availableHooks);
					setMessage(availableHooks.length > 0 ? 'Available hooks:' : 'No hooks found');
					setStatus('success');
					break;

				case 'run':
					if (!hookName) {
						throw new Error('Hook name is required');
					}
					setMessage(`🔄 Running hook: ${hookName}`);
					await hookManager.runHook(hookName);
					setMessage(`✅ Hook '${hookName}' executed successfully`);
					setStatus('success');
					break;

				case 'create':
					setMessage('🔄 Creating new hook...');
					await hookManager.createHook();
					setMessage('✅ Hook created successfully');
					setStatus('success');
					break;
			}
		} catch (error) {
			setMessage(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
			setStatus('error');
		}
	};

	return (
		<Box flexDirection="column" padding={1}>
			{/* Header */}
			<Box borderStyle="round" borderColor="cyan" padding={1} marginBottom={1}>
				<Box flexDirection="column">
					<Text color="cyan" bold>
						🔗 Hook Command: {action}
					</Text>
					<Text color="white" dimColor>
						Workflow automation and agent hooks management
					</Text>
				</Box>
			</Box>

			{/* Content */}
			<Box borderStyle="single" borderColor="blue" padding={1} marginBottom={1}>
				<Box flexDirection="column">
					<Text color={status === 'error' ? 'red' : status === 'success' ? 'green' : 'yellow'}>
						{message}
					</Text>

					{action === 'list' && hooks.length > 0 && (
						<Box flexDirection="column" marginTop={1}>
							{hooks.map((hook, index) => (
								<Text key={index} color="white">
									• {hook}
								</Text>
							))}
						</Box>
					)}
				</Box>
			</Box>

			{/* Help */}
			<Box borderStyle="single" borderColor="white" padding={1}>
				<Text color="white" dimColor>
					Press Escape to return to main menu • Ctrl+C to exit
				</Text>
			</Box>
		</Box>
	);
}