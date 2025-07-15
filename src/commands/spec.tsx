import React, {useState, useEffect} from 'react';
import {Text, Box, useInput} from 'ink';
import {SpecParser} from '../parser/index.js';
import {AIProvider} from '../ai/index.js';

type Props = {
	action: 'init' | 'build' | 'validate';
	file?: string;
	onExit?: () => void;
};

export default function SpecCommand({action, file = '.kiro/spec.yaml', onExit}: Props) {
	const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
	const [message, setMessage] = useState('');

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
			const parser = new SpecParser();

			switch (action) {
				case 'init':
					await parser.initSpec(file);
					setMessage(`✅ Spec file created at ${file}`);
					setStatus('success');
					break;

				case 'validate':
					const isValid = await parser.validateSpec(file);
					setMessage(isValid ? '✅ Spec file is valid' : '❌ Spec file has errors');
					setStatus(isValid ? 'success' : 'error');
					break;

				case 'build':
					setMessage('🔄 Generating code from spec...');
					const spec = await parser.parseSpec(file);
					const ai = await AIProvider.createDefault(); // Use default configured model
					const code = await ai.generateFromSpec(spec);
					await parser.writeGeneratedCode(code, spec);
					setMessage('✅ Code generated successfully');
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
						📜 Spec Command: {action}
					</Text>
					<Text color="white" dimColor>
						{file ? `File: ${file}` : 'YAML specification processing'}
					</Text>
				</Box>
			</Box>

			{/* Content */}
			<Box borderStyle="single" borderColor="blue" padding={1} marginBottom={1}>
				<Text color={status === 'error' ? 'red' : status === 'success' ? 'green' : 'yellow'}>
					{message}
				</Text>
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