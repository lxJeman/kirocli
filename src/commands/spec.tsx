import React, {useState, useEffect} from 'react';
import {Text, Box} from 'ink';
import {SpecParser} from '../parser/index.js';
import {AIProvider} from '../ai/index.js';

type Props = {
	action: 'init' | 'build' | 'validate';
	file?: string;
};

export default function SpecCommand({action, file = '.kiro/spec.yaml'}: Props) {
	const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
	const [message, setMessage] = useState('');

	useEffect(() => {
		handleAction();
	}, []);

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
					const ai = new AIProvider();
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
		<Box flexDirection="column">
			<Text color="cyan" bold>
				📜 Spec Command: {action}
			</Text>
			{file && (
				<Text color="gray">
					File: {file}
				</Text>
			)}
			<Text> </Text>

			<Text color={status === 'error' ? 'red' : status === 'success' ? 'green' : 'yellow'}>
				{message}
			</Text>
		</Box>
	);
}