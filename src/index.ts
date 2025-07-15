#!/usr/bin/env node
import {Command} from 'commander';

const program = new Command();

program
	.name('kirocli')
	.description('AI Developer Terminal Copilot')
	.version('0.1.0');

// Interactive chat mode (default)
program
	.command('chat', {isDefault: true})
	.description('Start interactive AI chat mode')
	.option('-m, --model <model>', 'AI model to use (gpt-4, claude, gemini)', 'gpt-4')
	.action(async (options) => {
		const React = await import('react');
		const {render} = await import('ink');
		const {default: ChatCommand} = await import('./commands/chat.js');
		render(React.createElement(ChatCommand, {model: options.model}));
	});

// Spec-driven development
program
	.command('spec')
	.description('Spec-driven code generation')
	.addCommand(
		new Command('init')
			.description('Initialize a new spec file')
			.action(async () => {
				const React = await import('react');
				const {render} = await import('ink');
				const {default: SpecCommand} = await import('./commands/spec.js');
				render(React.createElement(SpecCommand, {action: 'init'}));
			})
	)
	.addCommand(
		new Command('build')
			.description('Generate code from spec')
			.option('-f, --file <file>', 'Spec file path', '.kiro/spec.yaml')
			.action(async (options) => {
				const React = await import('react');
				const {render} = await import('ink');
				const {default: SpecCommand} = await import('./commands/spec.js');
				render(React.createElement(SpecCommand, {action: 'build', file: options.file}));
			})
	)
	.addCommand(
		new Command('validate')
			.description('Validate spec file')
			.option('-f, --file <file>', 'Spec file path', '.kiro/spec.yaml')
			.action(async (options) => {
				const React = await import('react');
				const {render} = await import('ink');
				const {default: SpecCommand} = await import('./commands/spec.js');
				render(React.createElement(SpecCommand, {action: 'validate', file: options.file}));
			})
	);

// Agent hooks system
program
	.command('hook')
	.description('Agent hooks management')
	.addCommand(
		new Command('list')
			.description('List available hooks')
			.action(async () => {
				const React = await import('react');
				const {render} = await import('ink');
				const {default: HookCommand} = await import('./commands/hook.js');
				render(React.createElement(HookCommand, {action: 'list'}));
			})
	)
	.addCommand(
		new Command('run')
			.description('Run a specific hook')
			.argument('<name>', 'Hook name to run')
			.action(async (name) => {
				const React = await import('react');
				const {render} = await import('ink');
				const {default: HookCommand} = await import('./commands/hook.js');
				render(React.createElement(HookCommand, {action: 'run', hookName: name}));
			})
	)
	.addCommand(
		new Command('create')
			.description('Create a new hook interactively')
			.action(async () => {
				const React = await import('react');
				const {render} = await import('ink');
				const {default: HookCommand} = await import('./commands/hook.js');
				render(React.createElement(HookCommand, {action: 'create'}));
			})
	);

// Legacy greeting command for backward compatibility
program
	.command('greet')
	.description('Simple greeting (legacy)')
	.option('--name <name>', 'Your name')
	.action(async (options) => {
		const React = await import('react');
		const {render} = await import('ink');
		const {default: App} = await import('./app.js');
		render(React.createElement(App, {name: options.name}));
	});

program.parse();