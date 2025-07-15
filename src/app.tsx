import React, {useState} from 'react';
import {Text, Box, useApp} from 'ink';
import MainMenu from './components/MainMenu.js';
import CommandLine from './components/CommandLine.js';
import ChatCommand from './commands/chat.js';
import ConfigCommand from './commands/config.js';
import SpecCommand from './commands/spec.js';
import HookCommand from './commands/hook.js';

type AppMode =
	| 'menu'
	| 'chat'
	| 'commandline'
	| 'config'
	| 'spec'
	| 'hook'
	| 'greeting';

type Props = {
	name?: string;
	initialMode?: AppMode;
	model?: string;
};

type CommandState = {
	command: string;
	action: string;
	args: string[];
};

export default function App({
	name,
	initialMode = 'menu',
	model = 'gpt-4',
}: Props) {
	const [mode, setMode] = useState<AppMode>(name ? 'greeting' : initialMode);
	const [commandState, setCommandState] = useState<CommandState | null>(null);
	const {exit} = useApp();

	const handleCommandExecution = (command: string, args: string[]) => {
		const action = args[0] || 'show'; // Default action
		const remainingArgs = args.slice(1);

		switch (command.toLowerCase()) {
			case 'config':
				setCommandState({command: 'config', action, args: remainingArgs});
				setMode('config');
				break;
			case 'spec':
				setCommandState({command: 'spec', action, args: remainingArgs});
				setMode('spec');
				break;
			case 'hook':
				setCommandState({command: 'hook', action, args: remainingArgs});
				setMode('hook');
				break;
			case 'chat':
				setMode('chat');
				break;
			case 'menu':
				setMode('menu');
				break;
			default:
				// Invalid command - stay in command line mode
				console.log(`Unknown command: ${command}`);
				break;
		}
	};

	// Legacy greeting mode
	if (mode === 'greeting' && name) {
		return (
			<Box padding={1}>
				<Text>
					Hello, <Text color="green">{name}</Text>
				</Text>
			</Box>
		);
	}

	// Main application modes
	switch (mode) {
		case 'menu':
			return (
				<MainMenu
					onSelectChat={() => setMode('chat')}
					onSelectCommandLine={() => setMode('commandline')}
					onSelectConfig={() => {
						setCommandState({command: 'config', action: 'show', args: []});
						setMode('config');
					}}
					onSelectSpec={() => {
						setCommandState({command: 'spec', action: 'validate', args: []});
						setMode('spec');
					}}
					onSelectHook={() => {
						setCommandState({command: 'hook', action: 'list', args: []});
						setMode('hook');
					}}
					onExit={() => exit()}
				/>
			);

		case 'chat':
			return <ChatCommand model={model} onExit={() => setMode('menu')} />;

		case 'commandline':
			return (
				<CommandLine
					onExecuteCommand={handleCommandExecution}
					onExit={() => setMode('menu')}
				/>
			);

		case 'config':
			return (
				<ConfigCommand
					action={(commandState?.action as any) || 'show'}
					provider={commandState?.args[0]}
					apiKey={commandState?.args[1]}
					onExit={() => setMode('commandline')}
				/>
			);

		case 'spec':
			return (
				<SpecCommand
					action={(commandState?.action as any) || 'validate'}
					file={commandState?.args[0]}
					onExit={() => setMode('commandline')}
				/>
			);

		case 'hook':
			return (
				<HookCommand
					action={(commandState?.action as any) || 'list'}
					hookName={commandState?.args[0]}
					onExit={() => setMode('commandline')}
				/>
			);

		default:
			return (
				<MainMenu
					onSelectChat={() => setMode('chat')}
					onSelectCommandLine={() => setMode('commandline')}
					onSelectConfig={() => {
						setCommandState({command: 'config', action: 'show', args: []});
						setMode('config');
					}}
					onSelectSpec={() => {
						setCommandState({command: 'spec', action: 'validate', args: []});
						setMode('spec');
					}}
					onSelectHook={() => {
						setCommandState({command: 'hook', action: 'list', args: []});
						setMode('hook');
					}}
					onExit={() => exit()}
				/>
			);
	}
}
