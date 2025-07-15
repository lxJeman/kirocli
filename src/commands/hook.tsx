import React, {useState, useEffect} from 'react';
import {Text, Box} from 'ink';
import {HookManager} from '../hooks/index.js';

type Props = {
	action: 'list' | 'run' | 'create';
	hookName?: string;
};

export default function HookCommand({action, hookName}: Props) {
	const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
	const [message, setMessage] = useState('');
	const [hooks, setHooks] = useState<string[]>([]);

	useEffect(() => {
		handleAction();
	}, []);

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
		<Box flexDirection="column">
			<Text color="cyan" bold>
				🔗 Hook Command: {action}
			</Text>
			<Text> </Text>

			<Text color={status === 'error' ? 'red' : status === 'success' ? 'green' : 'yellow'}>
				{message}
			</Text>

			{action === 'list' && hooks.length > 0 && (
				<Box flexDirection="column" marginTop={1}>
					{hooks.map((hook, index) => (
						<Text key={index} color="blue">
							• {hook}
						</Text>
					))}
				</Box>
			)}
		</Box>
	);
}