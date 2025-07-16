#!/usr/bin/env node
import {Command} from 'commander';

const program = new Command();

program
	.name('kirocli')
	.description('AI Developer Terminal Copilot')
	.version('0.1.0');

// Interactive chat mode (default when no command specified)
program
	.command('chat')
	.description('Start interactive AI chat mode')
	.option(
		'-m, --model <model>',
		'AI model to use (gpt-4, claude, gemini)',
		'gpt-4',
	)
	.action(async options => {
		const React = await import('react');
		const {render} = await import('ink');
		const {default: App} = await import('./app.js');
		render(React.createElement(App, {initialMode: 'chat', model: options.model}));
	});

// Main menu command
program
	.command('menu')
	.description('Show main menu')
	.action(async () => {
		const React = await import('react');
		const {render} = await import('ink');
		const {default: App} = await import('./app.js');
		render(React.createElement(App, {initialMode: 'menu'}));
	});

// Spec-driven development
program
	.command('spec')
	.description('Spec-driven code generation')
	.addCommand(
		new Command('init')
			.description('Initialize a new spec file')
			.option('-f, --file <file>', 'Spec file path', '.kiro/spec.yaml')
			.option('-t, --template <template>', 'Template type (basic, web, api, cli, library)', 'basic')
			.action(async options => {
				const React = await import('react');
				const {render} = await import('ink');
				const {default: SpecCommand} = await import('./commands/spec.js');
				render(React.createElement(SpecCommand, {
					action: 'init',
					file: options.file,
					template: options.template
				}));
			}),
	)
	.addCommand(
		new Command('build')
			.description('Generate code from spec')
			.option('-f, --file <file>', 'Spec file path', '.kiro/spec.yaml')
			.action(async options => {
				const React = await import('react');
				const {render} = await import('ink');
				const {default: SpecCommand} = await import('./commands/spec.js');
				render(
					React.createElement(SpecCommand, {
						action: 'build',
						file: options.file,
					}),
				);
			}),
	)
	.addCommand(
		new Command('validate')
			.description('Validate spec file')
			.option('-f, --file <file>', 'Spec file path', '.kiro/spec.yaml')
			.action(async options => {
				const React = await import('react');
				const {render} = await import('ink');
				const {default: SpecCommand} = await import('./commands/spec.js');
				render(
					React.createElement(SpecCommand, {
						action: 'validate',
						file: options.file,
					}),
				);
			}),
	);

// Agent hooks system
program
	.command('hook')
	.description('Agent hooks management')
	.addCommand(
		new Command('list').description('List available hooks').action(async () => {
			const React = await import('react');
			const {render} = await import('ink');
			const {default: HookCommand} = await import('./commands/hook.js');
			render(React.createElement(HookCommand, {action: 'list'}));
		}),
	)
	.addCommand(
		new Command('run')
			.description('Run a specific hook')
			.argument('<name>', 'Hook name to run')
			.action(async name => {
				const React = await import('react');
				const {render} = await import('ink');
				const {default: HookCommand} = await import('./commands/hook.js');
				render(
					React.createElement(HookCommand, {action: 'run', hookName: name}),
				);
			}),
	)
	.addCommand(
		new Command('create')
			.description('Create a new hook interactively')
			.action(async () => {
				const React = await import('react');
				const {render} = await import('ink');
				const {default: HookCommand} = await import('./commands/hook.js');
				render(React.createElement(HookCommand, {action: 'create'}));
			}),
	);

// Configuration management
program
	.command('config')
	.description('AI provider configuration management')
	.addCommand(
		new Command('show')
			.description('Show current configuration')
			.action(async () => {
				const React = await import('react');
				const {render} = await import('ink');
				const {default: ConfigCommand} = await import('./commands/config.js');
				render(React.createElement(ConfigCommand, {action: 'show'}));
			}),
	)
	.addCommand(
		new Command('test')
			.description('Test AI provider connections')
			.action(async () => {
				const React = await import('react');
				const {render} = await import('ink');
				const {default: ConfigCommand} = await import('./commands/config.js');
				render(React.createElement(ConfigCommand, {action: 'test'}));
			}),
	)
	.addCommand(
		new Command('setup')
			.description('Show setup instructions')
			.action(async () => {
				const React = await import('react');
				const {render} = await import('ink');
				const {default: ConfigCommand} = await import('./commands/config.js');
				render(React.createElement(ConfigCommand, {action: 'setup'}));
			}),
	)
	.addCommand(
		new Command('set-key')
			.description('Set API key for a provider')
			.argument('<provider>', 'Provider name (openai, claude, gemini)')
			.argument('<api-key>', 'API key value')
			.action(async (provider, apiKey) => {
				const React = await import('react');
				const {render} = await import('ink');
				const {default: ConfigCommand} = await import('./commands/config.js');
				render(
					React.createElement(ConfigCommand, {
						action: 'set-key',
						provider,
						apiKey,
					}),
				);
			}),
	);

// Legacy greeting command for backward compatibility
program
	.command('greet')
	.description('Simple greeting (legacy)')
	.option('--name <name>', 'Your name')
	.action(async options => {
		const React = await import('react');
		const {render} = await import('ink');
		const {default: App} = await import('./app.js');
		render(React.createElement(App, {name: options.name}));
	});

// Handle default action (no command specified)
if (process.argv.length === 2) {
	// No arguments provided, start main menu
	(async () => {
		const React = await import('react');
		const {render} = await import('ink');
		const {default: App} = await import('./app.js');
		render(React.createElement(App, {initialMode: 'menu'}));
	})();
} else {
	// Parse arguments normally
	program.parse();
}
