import React, {useState, useEffect} from 'react';
import {Text, Box, useInput} from 'ink';
import {
	SpecParser,
	ValidationResult,
	GenerationResult,
} from '../parser/index.js';

type Props = {
	action: 'init' | 'build' | 'validate';
	file?: string;
	template?: 'basic' | 'web' | 'api' | 'cli' | 'library';
	onExit?: () => void;
};

export default function SpecCommand({
	action,
	file = '.kiro/spec.yaml',
	template,
	onExit,
}: Props) {
	const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
		'loading',
	);
	const [message, setMessage] = useState('');
	const [details, setDetails] = useState<string[]>([]);
	const [validationResult, setValidationResult] =
		useState<ValidationResult | null>(null);
	const [generationResult, setGenerationResult] =
		useState<GenerationResult | null>(null);

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
					await handleInit(parser);
					break;

				case 'validate':
					await handleValidate(parser);
					break;

				case 'build':
					await handleBuild(parser);
					break;
			}
		} catch (error) {
			setMessage(
				`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
			);
			setStatus('error');
		}
	};

	const handleInit = async (parser: SpecParser) => {
		setMessage('🔄 Creating spec file...');

		await parser.initSpec(file, {template: template || 'basic'});

		setMessage(`✅ Spec file created successfully!`);
		setDetails([
			`📁 File: ${file}`,
			`📋 Template: ${template || 'basic'}`,
			`🎯 Ready for customization`,
			'',
			'Next steps:',
			'1. Edit the spec file to match your requirements',
			'2. Run "kirocli spec validate" to check syntax',
			'3. Run "kirocli spec build" to generate code',
		]);
		setStatus('success');
	};

	const handleValidate = async (parser: SpecParser) => {
		setMessage('🔄 Validating spec file...');

		const result = await parser.validateSpec(file);
		setValidationResult(result);

		if (result.valid) {
			setMessage('✅ Spec file is valid!');
			setDetails([
				`📁 File: ${file}`,
				'🎯 All required fields present',
				'✅ Syntax is correct',
				'✅ Structure is valid',
				...(result.warnings.length > 0 ? ['', '⚠️ Warnings:'] : []),
				...result.warnings.map(w => `  • ${w}`),
			]);
			setStatus('success');
		} else {
			setMessage('❌ Spec file has validation errors');
			setDetails([
				`📁 File: ${file}`,
				'',
				'❌ Errors found:',
				...result.errors.map(e => `  • ${e}`),
				...(result.warnings.length > 0 ? ['', '⚠️ Warnings:'] : []),
				...result.warnings.map(w => `  • ${w}`),
				'',
				'Please fix these issues and try again.',
			]);
			setStatus('error');
		}
	};

	const handleBuild = async (parser: SpecParser) => {
		setMessage('🔄 Parsing spec file...');

		// First validate the spec
		const validation = await parser.validateSpec(file);
		if (!validation.valid) {
			setMessage('❌ Spec validation failed');
			setDetails([
				'Cannot build from invalid spec file.',
				'',
				'❌ Errors:',
				...validation.errors.map(e => `  • ${e}`),
				'',
				'Please run "kirocli spec validate" to see all issues.',
			]);
			setStatus('error');
			return;
		}

		setMessage('🔄 Loading spec and generating code...');

		const spec = await parser.parseSpec(file);

		setMessage('🔄 Generating code with AI...');
		setDetails([
			`📋 Project: ${spec.name || 'Unnamed'}`,
			`🎯 Goal: ${spec.goal}`,
			`💻 Language: ${spec.language}`,
			`🚀 Framework: ${spec.framework || 'None'}`,
			`📁 Output: ${spec.outputPath}`,
			`✨ Features: ${spec.features.length} items`,
			'',
			'🤖 AI is generating your code...',
		]);

		const result = await parser.generateCode(spec);
		setGenerationResult(result);

		if (result.success) {
			setMessage('✅ Code generation completed successfully!');
			setDetails([
				`📋 Project: ${spec.name || 'Unnamed'}`,
				`⏱️ Duration: ${result.duration}ms`,
				`📁 Output: ${spec.outputPath}`,
				`📄 Files generated: ${result.files.length}`,
				'',
				'📄 Generated files:',
				...result.files.map(f => `  • ${f.path} (${f.size} bytes)`),
				'',
				'🎉 Your code is ready to use!',
			]);
			setStatus('success');
		} else {
			setMessage('❌ Code generation failed');
			setDetails([
				`⏱️ Duration: ${result.duration}ms`,
				`📄 Files generated: ${result.files.length}`,
				'',
				'❌ Errors:',
				...result.errors.map(e => `  • ${e}`),
				'',
				'Please check your spec file and try again.',
			]);
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
						{template && ` • Template: ${template}`}
					</Text>
				</Box>
			</Box>

			{/* Status Message */}
			<Box
				borderStyle="single"
				borderColor={
					status === 'error' ? 'red' : status === 'success' ? 'green' : 'yellow'
				}
				padding={1}
				marginBottom={1}
			>
				<Text
					color={
						status === 'error'
							? 'red'
							: status === 'success'
							? 'green'
							: 'yellow'
					}
					bold
				>
					{message}
				</Text>
			</Box>

			{/* Details */}
			{details.length > 0 && (
				<Box
					borderStyle="single"
					borderColor="blue"
					padding={1}
					marginBottom={1}
				>
					<Box flexDirection="column">
						{details.map((detail, index) => (
							<Text
								key={index}
								color={
									detail.startsWith('❌')
										? 'red'
										: detail.startsWith('⚠️')
										? 'yellow'
										: detail.startsWith('✅')
										? 'green'
										: 'white'
								}
							>
								{detail}
							</Text>
						))}
					</Box>
				</Box>
			)}

			{/* Validation Results */}
			{validationResult && !validationResult.valid && (
				<Box
					borderStyle="single"
					borderColor="red"
					padding={1}
					marginBottom={1}
				>
					<Box flexDirection="column">
						<Text color="red" bold>
							🔍 Validation Details:
						</Text>
						{validationResult.errors.map((error, index) => (
							<Text key={index} color="red">
								• {error}
							</Text>
						))}
						{validationResult.warnings.length > 0 && (
							<>
								<Text color="yellow" bold>
									⚠️ Warnings:
								</Text>
								{validationResult.warnings.map((warning, index) => (
									<Text key={index} color="yellow">
										• {warning}
									</Text>
								))}
							</>
						)}
					</Box>
				</Box>
			)}

			{/* Generation Results */}
			{generationResult && (
				<Box
					borderStyle="single"
					borderColor={generationResult.success ? 'green' : 'red'}
					padding={1}
					marginBottom={1}
				>
					<Box flexDirection="column">
						<Text color={generationResult.success ? 'green' : 'red'} bold>
							🔧 Generation Summary:
						</Text>
						<Text color="white">Duration: {generationResult.duration}ms</Text>
						<Text color="white">
							Files: {generationResult.files.length} generated
						</Text>
						{generationResult.files.length > 0 && (
							<>
								<Text color="white" bold>
									📄 Files:
								</Text>
								{generationResult.files.slice(0, 10).map((file, index) => (
									<Text key={index} color="white">
										• {file.path} ({file.size} bytes)
									</Text>
								))}
								{generationResult.files.length > 10 && (
									<Text color="white" dimColor>
										... and {generationResult.files.length - 10} more files
									</Text>
								)}
							</>
						)}
						{generationResult.errors.length > 0 && (
							<>
								<Text color="red" bold>
									❌ Errors:
								</Text>
								{generationResult.errors.map((error, index) => (
									<Text key={index} color="red">
										• {error}
									</Text>
								))}
							</>
						)}
					</Box>
				</Box>
			)}

			{/* Help */}
			<Box borderStyle="single" borderColor="white" padding={1}>
				<Box flexDirection="column">
					<Text color="white" bold>
						🎮 Controls:
					</Text>
					<Text color="white">
						• Press Escape or Ctrl+M to return to main menu
					</Text>
					<Text color="white">• Press Ctrl+C to exit KiroCLI</Text>
					{status === 'success' && action === 'init' && (
						<Text color="green">
							• Edit {file} and run "kirocli spec build" to generate code
						</Text>
					)}
				</Box>
			</Box>
		</Box>
	);
}
