#!/usr/bin/env node
import React from 'react';
import {render} from 'ink';
import meow from 'meow';
import App from './app.js';

const cli = meow(
	`
	Usage
	  $ kirocli [command] [action] [options]

	Commands
	  chat                    Start AI chat mode
	  config <action>         Manage configuration (show, test, setup, set-key)
	  spec <action>           Manage specifications (init, validate, build)
	  hook <action>           Manage agent hooks (list, run, create, templates, stats)
	  menu                    Show main menu (default)

	Options
	  --name <name>           Your name (legacy greeting mode)
	  --model <model>         AI model to use (gpt-4, claude-3-sonnet-20240229, gemini-pro)
	  --file <file>           Spec file path (default: .kiro/spec.yaml)
	  --template <template>   Template type for spec init (basic, web, api, cli, library)

	Examples
	  $ kirocli                           # Show main menu
	  $ kirocli chat                      # Start AI chat
	  $ kirocli chat --model=claude-3-sonnet-20240229
	  $ kirocli config show               # Show configuration
	  $ kirocli config test               # Test AI providers
	  $ kirocli spec validate             # Validate spec file
	  $ kirocli spec init --template=web  # Create web app spec
	  $ kirocli spec build                # Generate code from spec
	  $ kirocli hook list                 # List available hooks
	  $ kirocli hook run git-auto-commit  # Run specific hook
	  $ kirocli --name=Jane               # Legacy greeting mode
`,
	{
		importMeta: import.meta,
		flags: {
			name: {
				type: 'string',
			},
			model: {
				type: 'string',
				default: 'gpt-4',
			},
			file: {
				type: 'string',
			},
			template: {
				type: 'string',
			},
		},
	},
);

// Parse command and arguments
const [command, action, ...args] = cli.input;

// Determine initial mode and command state
let initialMode: 'menu' | 'chat' | 'config' | 'spec' | 'hook' | 'greeting' =
	'menu';
let commandAction = action;
let commandArgs = args;

// Handle legacy greeting mode
if (cli.flags.name && !command) {
	initialMode = 'greeting';
} else if (command) {
	switch (command.toLowerCase()) {
		case 'chat':
			initialMode = 'chat';
			break;
		case 'config':
			initialMode = 'config';
			commandAction = action || 'show';
			break;
		case 'spec':
			initialMode = 'spec';
			commandAction = action || 'validate';
			// Add file flag to args if provided
			if (cli.flags.file) {
				commandArgs = [cli.flags.file, ...commandArgs];
			}
			// Add template flag to args if provided for init command
			if (commandAction === 'init' && cli.flags.template) {
				commandArgs = [cli.flags.template, ...commandArgs];
			}
			break;
		case 'hook':
			initialMode = 'hook';
			commandAction = action || 'list';
			break;
		case 'menu':
		default:
			initialMode = 'menu';
			break;
	}
}

render(
	<App
		name={cli.flags.name}
		initialMode={initialMode}
		model={cli.flags.model}
		command={command}
		action={commandAction}
		args={commandArgs}
	/>,
);
