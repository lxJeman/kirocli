import React, {useState, useEffect} from 'react';
import {Text, Box, useInput} from 'ink';
import {
	HookManager,
	HookConfig,
	HookExecutionResult,
	HookStats,
	HookTemplate,
} from '../hooks/index.js';

type Props = {
	action:
		| 'list'
		| 'run'
		| 'create'
		| 'stats'
		| 'templates'
		| 'enable'
		| 'disable'
		| 'delete';
	hookName?: string;
	template?: string;
	category?: string;
	onExit?: () => void;
};

type HookState = 'loading' | 'success' | 'error' | 'running' | 'ready';

export default function HookCommand({
	action,
	hookName,
	template,
	category,
	onExit,
}: Props) {
	const [state, setState] = useState<HookState>('loading');
	const [message, setMessage] = useState('');
	const [hooks, setHooks] = useState<HookConfig[]>([]);
	const [executionResult, setExecutionResult] =
		useState<HookExecutionResult | null>(null);
	const [stats, setStats] = useState<HookStats | null>(null);
	const [templates, setTemplates] = useState<HookTemplate[]>([]);
	const [error, setError] = useState<string | null>(null);

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
			const hookManager = new HookManager();
			await hookManager.initialize();

			switch (action) {
				case 'list':
					await handleList(hookManager);
					break;
				case 'run':
					await handleRun(hookManager);
					break;
				case 'create':
					await handleCreate(hookManager);
					break;
				case 'stats':
					await handleStats(hookManager);
					break;
				case 'templates':
					await handleTemplates(hookManager);
					break;
				case 'enable':
					await handleToggle(hookManager, true);
					break;
				case 'disable':
					await handleToggle(hookManager, false);
					break;
				case 'delete':
					await handleDelete(hookManager);
					break;
				default:
					throw new Error(`Unknown action: ${action}`);
			}
		} catch (err) {
			setError((err as Error).message);
			setState('error');
		}
	};

	const handleList = async (hookManager: HookManager) => {
		setState('loading');
		setMessage('📋 Loading hooks...');

		const options: any = {};
		if (category) options.category = category;

		const hookList = hookManager.listHooks(options);
		setHooks(hookList);

		if (hookList.length === 0) {
			setMessage('📋 No hooks found');
		} else {
			setMessage(
				`📋 Found ${hookList.length} hook${hookList.length === 1 ? '' : 's'}`,
			);
		}

		setState('success');
	};

	const handleRun = async (hookManager: HookManager) => {
		if (!hookName) {
			throw new Error('Hook name is required for run action');
		}

		setState('running');
		setMessage(`🔄 Executing hook: ${hookName}...`);

		const result = await hookManager.executeHook(hookName);
		setExecutionResult(result);

		if (result.success) {
			setMessage(`✅ Hook '${hookName}' executed successfully`);
			setState('success');
		} else {
			setMessage(`❌ Hook '${hookName}' execution failed`);
			setState('error');
		}
	};

	const handleCreate = async (hookManager: HookManager) => {
		setState('loading');
		setMessage('🔄 Creating new hook...');

		const options: any = {};
		if (template) options.template = template;
		if (category) options.category = category;

		const newHook = await hookManager.createHook(options);

		setMessage(`✅ Hook '${newHook.name}' created successfully`);
		setHooks([newHook]);
		setState('success');
	};

	const handleStats = async (hookManager: HookManager) => {
		setState('loading');
		setMessage('📊 Loading hook statistics...');

		const hookStats = hookManager.getStats();
		setStats(hookStats);

		setMessage('📊 Hook statistics loaded');
		setState('success');
	};

	const handleTemplates = async (hookManager: HookManager) => {
		setState('loading');
		setMessage('📋 Loading hook templates...');

		const templateList = hookManager.getHookTemplates();
		setTemplates(templateList);

		setMessage(
			`📋 Found ${templateList.length} hook template${
				templateList.length === 1 ? '' : 's'
			}`,
		);
		setState('success');
	};

	const handleToggle = async (hookManager: HookManager, enabled: boolean) => {
		if (!hookName) {
			throw new Error('Hook name is required for enable/disable action');
		}

		setState('loading');
		setMessage(`🔄 ${enabled ? 'Enabling' : 'Disabling'} hook: ${hookName}...`);

		await hookManager.toggleHook(hookName, enabled);

		setMessage(
			`✅ Hook '${hookName}' ${enabled ? 'enabled' : 'disabled'} successfully`,
		);
		setState('success');
	};

	const handleDelete = async (hookManager: HookManager) => {
		if (!hookName) {
			throw new Error('Hook name is required for delete action');
		}

		setState('loading');
		setMessage(`🔄 Deleting hook: ${hookName}...`);

		await hookManager.deleteHook(hookName);

		setMessage(`✅ Hook '${hookName}' deleted successfully`);
		setState('success');
	};

	const renderHookList = () => {
		if (hooks.length === 0) return null;

		return (
			<Box flexDirection="column" marginBottom={1}>
				<Text bold>📋 Hooks:</Text>
				{hooks.map((hook, index) => (
					<Box key={index} flexDirection="column" marginLeft={2}>
						<Box>
							<Text color={hook.enabled ? 'green' : 'red'}>
								{hook.enabled ? '●' : '○'}
							</Text>
							<Box marginLeft={1}>
								<Text bold>{hook.name}</Text>
							</Box>
							<Box marginLeft={1}>
								<Text dimColor>({hook.id})</Text>
							</Box>
						</Box>
						<Box marginLeft={2}>
							<Text dimColor>{hook.description}</Text>
						</Box>
						<Box marginLeft={2}>
							<Text dimColor>Trigger: {hook.trigger.type}</Text>
							{hook.category && (
								<Box marginLeft={2}>
									<Text dimColor>Category: {hook.category}</Text>
								</Box>
							)}
							<Box marginLeft={2}>
								<Text dimColor>Actions: {hook.actions.length}</Text>
							</Box>
						</Box>
					</Box>
				))}
			</Box>
		);
	};

	const renderExecutionResult = () => {
		if (!executionResult) return null;

		return (
			<Box
				flexDirection="column"
				marginBottom={1}
				borderStyle="single"
				borderColor={executionResult.success ? 'green' : 'red'}
				padding={1}
			>
				<Text bold color={executionResult.success ? 'green' : 'red'}>
					🔧 Execution Result:
				</Text>
				<Text>Hook: {executionResult.hookId}</Text>
				<Text>Duration: {executionResult.duration}ms</Text>
				<Text>Success: {executionResult.success ? '✅' : '❌'}</Text>
				<Text>Actions executed: {executionResult.actions.length}</Text>

				{executionResult.error && (
					<Box marginTop={1}>
						<Text color="red" bold>
							Error:
						</Text>
						<Text color="red">{executionResult.error}</Text>
					</Box>
				)}

				{executionResult.actions.length > 0 && (
					<Box flexDirection="column" marginTop={1}>
						<Text bold>Action Results:</Text>
						{executionResult.actions.map((action, index) => (
							<Box key={index} marginLeft={2}>
								<Text color={action.success ? 'green' : 'red'}>
									{action.success ? '✅' : '❌'}
								</Text>
								<Box marginLeft={1}>
									<Text>{action.actionId}</Text>
								</Box>
								<Box marginLeft={1}>
									<Text dimColor>({action.duration}ms)</Text>
								</Box>
								{action.error && (
									<Box marginLeft={1}>
										<Text color="red">- {action.error}</Text>
									</Box>
								)}
							</Box>
						))}
					</Box>
				)}
			</Box>
		);
	};

	const renderStats = () => {
		if (!stats) return null;

		return (
			<Box
				flexDirection="column"
				marginBottom={1}
				borderStyle="single"
				borderColor="blue"
				padding={1}
			>
				<Text bold color="blue">
					📊 Hook Statistics:
				</Text>
				<Text>Total hooks: {stats.total}</Text>
				<Text>Enabled: {stats.enabled}</Text>
				<Text>Disabled: {stats.disabled}</Text>
				<Text>Total executions: {stats.totalExecutions}</Text>
				<Text>Success rate: {stats.successRate.toFixed(1)}%</Text>
				{stats.lastExecuted && (
					<Text>
						Last executed: {new Date(stats.lastExecuted).toLocaleString()}
					</Text>
				)}

				{Object.keys(stats.byCategory).length > 0 && (
					<Box flexDirection="column" marginTop={1}>
						<Text bold>By Category:</Text>
						{Object.entries(stats.byCategory).map(([category, count]) => (
							<Box key={category} marginLeft={2}>
								<Text>
									• {category}: {count}
								</Text>
							</Box>
						))}
					</Box>
				)}
			</Box>
		);
	};

	const renderTemplates = () => {
		if (templates.length === 0) return null;

		return (
			<Box flexDirection="column" marginBottom={1}>
				<Text bold>📋 Available Templates:</Text>
				{templates.map((template, index) => (
					<Box
						key={index}
						flexDirection="column"
						marginLeft={2}
						marginBottom={1}
					>
						<Box>
							<Text bold color="cyan">
								{template.name}
							</Text>
							<Box marginLeft={1}>
								<Text dimColor>({template.id})</Text>
							</Box>
						</Box>
						<Box marginLeft={2}>
							<Text dimColor>{template.description}</Text>
						</Box>
						<Box marginLeft={2}>
							<Text dimColor>Category: {template.category}</Text>
						</Box>
					</Box>
				))}
			</Box>
		);
	};

	const getStatusColor = () => {
		switch (state) {
			case 'success':
				return 'green';
			case 'error':
				return 'red';
			case 'running':
				return 'yellow';
			case 'loading':
				return 'yellow';
			default:
				return 'white';
		}
	};

	const getStatusIcon = () => {
		switch (state) {
			case 'success':
				return '✅';
			case 'error':
				return '❌';
			case 'running':
				return '🔄';
			case 'loading':
				return '🔄';
			default:
				return '🔗';
		}
	};

	return (
		<Box flexDirection="column" padding={1}>
			{/* Header */}
			<Box borderStyle="round" borderColor="cyan" padding={1} marginBottom={1}>
				<Box flexDirection="column">
					<Text color="cyan" bold>
						🔗 Hook Command: {action}
					</Text>
					<Text color="white" dimColor>
						Agent hooks system - Workflow automation and event triggers
						{hookName && ` • Hook: ${hookName}`}
						{template && ` • Template: ${template}`}
						{category && ` • Category: ${category}`}
					</Text>
				</Box>
			</Box>

			{/* Status */}
			<Box
				borderStyle="single"
				borderColor={getStatusColor()}
				padding={1}
				marginBottom={1}
			>
				<Text color={getStatusColor()} bold>
					{getStatusIcon()} {message}
				</Text>
			</Box>

			{/* Error Display */}
			{error && (
				<Box
					borderStyle="single"
					borderColor="red"
					padding={1}
					marginBottom={1}
				>
					<Text color="red" bold>
						❌ Error: {error}
					</Text>
				</Box>
			)}

			{/* Content */}
			{renderHookList()}
			{renderExecutionResult()}
			{renderStats()}
			{renderTemplates()}

			{/* Usage Examples */}
			{action === 'list' && hooks.length === 0 && (
				<Box
					borderStyle="single"
					borderColor="yellow"
					padding={1}
					marginBottom={1}
				>
					<Box flexDirection="column">
						<Text color="yellow" bold>
							💡 Getting Started with Hooks:
						</Text>
						<Text>
							• Create a hook: kirocli hook create --template git-auto-commit
						</Text>
						<Text>• List templates: kirocli hook templates</Text>
						<Text>• View statistics: kirocli hook stats</Text>
						<Text>• Run a hook: kirocli hook run &lt;hook-name&gt;</Text>
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
					{action === 'run' && executionResult?.success && (
						<Text color="green">
							• Hook executed successfully! Check the results above.
						</Text>
					)}
				</Box>
			</Box>
		</Box>
	);
}
