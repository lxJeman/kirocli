import React, {useState, useEffect} from 'react';
import {Text, Box, useApp} from 'ink';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import MainMenu from './components/MainMenu.js';
import CommandLine from './components/CommandLine.js';
import GettingStarted from './components/GettingStarted.js';
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
	| 'greeting'
	| 'getting-started';

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
	const [mode, setMode] = useState<AppMode>(name ? 'greeting' : initialMode || 'menu');
	const [commandState, setCommandState] = useState<CommandState | null>(null);
	const {exit} = useApp();

	useEffect(() => {
		checkFirstTimeUser();
	}, []);

	const checkFirstTimeUser = async () => {
		try {
			const userConfigDir = path.join(os.homedir(), '.kirocli');
			const welcomeFile = path.join(userConfigDir, '.welcome-shown');
			
			// Check if welcome file exists
			try {
				await fs.access(welcomeFile);
				// File exists, not first time
				if (initialMode === 'menu' && !name) {
					setMode('menu');
				}
			} catch {
				// File doesn't exist, first time user
				if (!name) {
					setMode('getting-started');
				}
			}
		} catch (error) {
			console.warn('Error checking first-time user status:', error);
			// Default to showing getting started
			if (!name) {
				setMode('getting-started');
			}
		}
	};

	const markWelcomeShown = async () => {
		try {
			const userConfigDir = path.join(os.homedir(), '.kirocli');
			const welcomeFile = path.join(userConfigDir, '.welcome-shown');
			
			// Ensure directory exists
			await fs.mkdir(userConfigDir, { recursive: true });
			
			// Create welcome file
			await fs.writeFile(welcomeFile, new Date().toISOString(), 'utf8');
		} catch (error) {
			console.warn('Error marking welcome as shown:', error);
		}
	};

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
		case 'getting-started':
			return (
				<GettingStarted
					onComplete={async () => {
						await markWelcomeShown();
						setMode('menu');
					}}
					onExit={() => {
						markWelcomeShown();
						setMode('menu');
					}}
				/>
			);

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
