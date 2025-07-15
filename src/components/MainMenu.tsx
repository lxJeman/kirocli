import React, {useState} from 'react';
import {Text, Box, useInput} from 'ink';

type Props = {
	onSelectChat: () => void;
	onSelectCommandLine: () => void;
	onSelectConfig: () => void;
	onSelectSpec: () => void;
	onSelectHook: () => void;
	onExit: () => void;
};

const menuItems = [
	{key: '1', label: 'Start AI Chat', description: 'Interactive chat with AI models'},
	{key: '2', label: 'Command Line', description: 'Execute commands directly (config, spec, hook)'},
	{key: '3', label: 'Configuration', description: 'Manage API keys and settings'},
	{key: '4', label: 'Spec Builder', description: 'Generate code from specifications'},
	{key: '5', label: 'Agent Hooks', description: 'Workflow automation tools'},
	{key: 'q', label: 'Quit', description: 'Exit KiroCLI'},
];

export default function MainMenu({onSelectChat, onSelectCommandLine, onSelectConfig, onSelectSpec, onSelectHook, onExit}: Props) {
	const [selectedIndex, setSelectedIndex] = useState(0);

	useInput((input, key) => {
		if (key.upArrow) {
			setSelectedIndex(prev => (prev > 0 ? prev - 1 : menuItems.length - 1));
		} else if (key.downArrow) {
			setSelectedIndex(prev => (prev < menuItems.length - 1 ? prev + 1 : 0));
		} else if (key.return) {
			handleSelection(selectedIndex);
		} else if (input === '1') {
			onSelectChat();
		} else if (input === '2') {
			onSelectCommandLine();
		} else if (input === '3') {
			onSelectConfig();
		} else if (input === '4') {
			onSelectSpec();
		} else if (input === '5') {
			onSelectHook();
		} else if (input === 'q' || input === 'Q') {
			onExit();
		}
	});

	const handleSelection = (index: number) => {
		switch (index) {
			case 0:
				onSelectChat();
				break;
			case 1:
				onSelectCommandLine();
				break;
			case 2:
				onSelectConfig();
				break;
			case 3:
				onSelectSpec();
				break;
			case 4:
				onSelectHook();
				break;
			case 5:
				onExit();
				break;
		}
	};

	return (
		<Box flexDirection="column" padding={2}>
			{/* Header */}
			<Box borderStyle="double" borderColor="cyan" padding={1} marginBottom={2}>
				<Box flexDirection="column" alignItems="center">
					<Text color="cyan" bold>
						🚀 KiroCLI - AI Developer Terminal Copilot
					</Text>
					<Text color="white" dimColor>
						Your AI-powered development assistant
					</Text>
				</Box>
			</Box>

			{/* Menu Items */}
			<Box flexDirection="column" marginBottom={2}>
				<Box marginBottom={1}>
					<Text color="white" bold>
						📋 Main Menu
					</Text>
				</Box>
				
				{menuItems.map((item, index) => (
					<Box key={item.key} marginBottom={1}>
						<Box
							borderStyle={selectedIndex === index ? 'single' : undefined}
							borderColor={selectedIndex === index ? 'green' : undefined}
							padding={selectedIndex === index ? 1 : 0}
							paddingLeft={selectedIndex === index ? 1 : 2}
						>
							<Box width={20}>
								<Text color={selectedIndex === index ? 'green' : 'white'} bold>
									{selectedIndex === index ? '❯ ' : '  '}
									[{item.key}] {item.label}
								</Text>
							</Box>
							<Text color="white" dimColor>
								{item.description}
							</Text>
						</Box>
					</Box>
				))}
			</Box>

			{/* Instructions */}
			<Box borderStyle="single" borderColor="white" padding={1}>
				<Box flexDirection="column">
					<Box marginBottom={1}>
						<Text color="yellow" bold>
							🎮 Navigation:
						</Text>
					</Box>
					<Text color="white">
						• Use number keys (1-5) or arrow keys + Enter to select
					</Text>
					<Text color="white">
						• Press 'q' to quit
					</Text>
					<Text color="white">
						• Use Ctrl+C to force exit
					</Text>
				</Box>
			</Box>

			{/* Status */}
			<Box marginTop={1}>
				<Text color="white" dimColor>
					Selected: {menuItems[selectedIndex]?.label || 'None'} • Press Enter or number key to continue
				</Text>
			</Box>
		</Box>
	);
}