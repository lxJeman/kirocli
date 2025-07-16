import React, {useState, useEffect} from 'react';
import {Text, Box, useInput} from 'ink';
import {AIProvider as BaseAIProvider} from '../ai/types.js';
import {AIProvider} from '../ai/index.js';
import EnhancedSpinner from './EnhancedSpinner.js';
import ProgressBar from './ProgressBar.js';
import CommandLine from './CommandLine.js';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

interface ChatMessage {
	id: string;
	role: 'user' | 'assistant' | 'system';
	content: string;
	timestamp: Date;
	metadata?: {
		model?: string;
		tokens?: number;
		duration?: number;
		error?: string;
	};
}

interface ChatSession {
	id: string;
	name: string;
	messages: ChatMessage[];
	created: Date;
	lastActive: Date;
	model: string;
}

interface Props {
	model?: string;
	onExit?: () => void;
	debug?: boolean;
	verbose?: boolean;
}

export default function EnhancedChat({model = 'gpt-4', onExit, debug = false, verbose = false}: Props) {
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
	const [commandHistory, setCommandHistory] = useState<string[]>([]);
	const [aiProvider, setAiProvider] = useState<BaseAIProvider | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [progress, setProgress] = useState(0);
	const [sessionList, setSessionList] = useState<ChatSession[]>([]);
	const [mode, setMode] = useState<'chat' | 'sessions' | 'help'>('chat');
	const chatHistoryPath = path.join(os.homedir(), '.kirocli', 'chat-history.json');
	const sessionHistoryPath = path.join(os.homedir(), '.kirocli', 'chat-sessions.json');

	useEffect(() => {
		initializeChat();
		loadChatHistory();
		loadSessions();
	}, []);

	useEffect(() => {
		if (currentSession) {
			saveChatHistory();
			saveSessions();
		}
	}, [messages, currentSession]);

	useInput((input, key) => {
		if (key.escape) {
			if (mode !== 'chat') {
				setMode('chat');
			} else if (onExit) {
				onExit();
			}
		}

		if (key.ctrl && input === 'h') {
			setMode(mode === 'help' ? 'chat' : 'help');
		}

		if (key.ctrl && input === 's') {
			setMode(mode === 'sessions' ? 'chat' : 'sessions');
		}

		if (key.ctrl && input === 'n') {
			createNewSession();
		}

		if (key.ctrl && input === 'l') {
			clearCurrentSession();
		}

		if (key.ctrl && input === 'd') {
			setMode('chat');
			// Toggle debug mode
		}
	});

	const initializeChat = async () => {
		try {
			setIsLoading(true);
			setProgress(25);
			
			const provider = await AIProvider.createDefault();
			setAiProvider(provider);
			setProgress(50);
			
			// Create initial session if none exists
			if (!currentSession) {
				createNewSession();
			}
			
			setProgress(100);
		} catch (err) {
			setError(`Failed to initialize AI provider: ${(err as Error).message}`);
		} finally {
			setIsLoading(false);
			setProgress(0);
		}
	};

	const createNewSession = () => {
		const newSession: ChatSession = {
			id: `session-${Date.now()}`,
			name: `Chat ${new Date().toLocaleString()}`,
			messages: [],
			created: new Date(),
			lastActive: new Date(),
			model
		};
		
		setCurrentSession(newSession);
		setMessages([]);
		addSystemMessage('New chat session started. How can I help you today?');
	};

	const clearCurrentSession = () => {
		if (currentSession) {
			setMessages([]);
			setCurrentSession({
				...currentSession,
				messages: [],
				lastActive: new Date()
			});
			addSystemMessage('Chat history cleared. Starting fresh!');
		}
	};

	const addSystemMessage = (content: string) => {
		const systemMessage: ChatMessage = {
			id: `system-${Date.now()}`,
			role: 'system',
			content,
			timestamp: new Date()
		};
		
		setMessages(prev => [...prev, systemMessage]);
	};

	const loadChatHistory = async () => {
		try {
			const historyData = await fs.readFile(chatHistoryPath, 'utf8');
			const history = JSON.parse(historyData);
			setCommandHistory(history.commands || []);
		} catch {
			// File doesn't exist or is invalid, start with empty history
			setCommandHistory([]);
		}
	};

	const saveChatHistory = async () => {
		try {
			await fs.mkdir(path.dirname(chatHistoryPath), { recursive: true });
			const historyData = {
				commands: commandHistory,
				lastUpdated: new Date().toISOString()
			};
			await fs.writeFile(chatHistoryPath, JSON.stringify(historyData, null, 2));
		} catch (err) {
			if (debug) {
				console.error('Failed to save chat history:', err);
			}
		}
	};

	const loadSessions = async () => {
		try {
			const sessionsData = await fs.readFile(sessionHistoryPath, 'utf8');
			const sessions = JSON.parse(sessionsData);
			setSessionList(sessions.map((s: any) => ({
				...s,
				created: new Date(s.created),
				lastActive: new Date(s.lastActive),
				messages: s.messages.map((m: any) => ({
					...m,
					timestamp: new Date(m.timestamp)
				}))
			})));
		} catch {
			// File doesn't exist or is invalid, start with empty sessions
			setSessionList([]);
		}
	};

	const saveSessions = async () => {
		try {
			await fs.mkdir(path.dirname(sessionHistoryPath), { recursive: true });
			const allSessions = currentSession ? 
				[...sessionList.filter(s => s.id !== currentSession.id), {
					...currentSession,
					messages,
					lastActive: new Date()
				}] : sessionList;
			
			await fs.writeFile(sessionHistoryPath, JSON.stringify(allSessions, null, 2));
		} catch (err) {
			if (debug) {
				console.error('Failed to save sessions:', err);
			}
		}
	};

	const handleUserMessage = async (content: string) => {
		if (!aiProvider || !currentSession) return;

		// Add to command history
		setCommandHistory(prev => {
			const newHistory = [content, ...prev.filter(cmd => cmd !== content)];
			return newHistory.slice(0, 100); // Keep last 100 commands
		});

		// Add user message
		const userMessage: ChatMessage = {
			id: `user-${Date.now()}`,
			role: 'user',
			content,
			timestamp: new Date()
		};

		setMessages(prev => [...prev, userMessage]);
		setIsLoading(true);
		setError(null);

		try {
			const startTime = Date.now();
			setProgress(10);

			// Prepare conversation context
			const conversationMessages = [...messages, userMessage].map(msg => ({
				role: msg.role as 'user' | 'assistant' | 'system',
				content: msg.content
			}));

			setProgress(30);

			// Get AI response
			if (!aiProvider) {
				throw new Error('AI provider not initialized');
			}
			const response = await aiProvider.chat(conversationMessages);
			const duration = Date.now() - startTime;

			setProgress(80);

			// Add assistant message
			const assistantMessage: ChatMessage = {
				id: `assistant-${Date.now()}`,
				role: 'assistant',
				content: response,
				timestamp: new Date(),
				metadata: {
					model,
					duration
				}
			};

			setMessages(prev => [...prev, assistantMessage]);
			setProgress(100);

			if (verbose) {
				console.log(`AI Response received in ${duration}ms`);
			}

		} catch (err) {
			const errorMessage = (err as Error).message;
			setError(errorMessage);
			
			const errorChatMessage: ChatMessage = {
				id: `error-${Date.now()}`,
				role: 'assistant',
				content: `I apologize, but I encountered an error: ${errorMessage}`,
				timestamp: new Date(),
				metadata: {
					error: errorMessage
				}
			};

			setMessages(prev => [...prev, errorChatMessage]);

			if (debug) {
				console.error('AI Error:', err);
			}
		} finally {
			setIsLoading(false);
			setProgress(0);
		}
	};

	const renderMessage = (message: ChatMessage, _index: number) => {
		const isUser = message.role === 'user';
		const isSystem = message.role === 'system';
		const timestamp = message.timestamp.toLocaleTimeString();

		return (
			<Box key={message.id} flexDirection="column" marginBottom={1}>
				<Box>
					<Text color={isUser ? 'cyan' : isSystem ? 'yellow' : 'green'} bold>
						{isUser ? '👤 You' : isSystem ? '🔔 System' : '🤖 Assistant'}
					</Text>
					<Text dimColor> • {timestamp}</Text>
					{message.metadata?.duration && (
						<Text dimColor> • {message.metadata.duration}ms</Text>
					)}
				</Box>
				
				<Box marginLeft={2} flexDirection="column">
					<Text>{message.content}</Text>
					{message.metadata?.error && (
						<Text color="red" dimColor>Error: {message.metadata.error}</Text>
					)}
				</Box>
			</Box>
		);
	};

	const renderHelp = () => (
		<Box flexDirection="column" padding={1}>
			<Text bold color="cyan">🎮 Enhanced Chat Controls</Text>
			<Text></Text>
			<Text bold>Navigation:</Text>
			<Text>• Escape - Exit chat or return to chat from other modes</Text>
			<Text>• Ctrl+H - Toggle this help screen</Text>
			<Text>• Ctrl+S - View/manage chat sessions</Text>
			<Text>• Ctrl+N - Create new chat session</Text>
			<Text>• Ctrl+L - Clear current session</Text>
			<Text>• Ctrl+D - Toggle debug mode</Text>
			<Text></Text>
			<Text bold>Chat Features:</Text>
			<Text>• ↑↓ Arrow keys - Navigate command history</Text>
			<Text>• Multi-turn conversations with context</Text>
			<Text>• Persistent chat sessions</Text>
			<Text>• Command history across sessions</Text>
			<Text></Text>
			<Text bold>Current Session:</Text>
			<Text>• Model: {model}</Text>
			<Text>• Messages: {messages.length}</Text>
			<Text>• Session: {currentSession?.name || 'None'}</Text>
		</Box>
	);

	const renderSessions = () => (
		<Box flexDirection="column" padding={1}>
			<Text bold color="cyan">💬 Chat Sessions</Text>
			<Text></Text>
			{sessionList.length === 0 ? (
				<Text dimColor>No saved sessions found.</Text>
			) : (
				sessionList.map((session, _index) => (
					<Box key={session.id} flexDirection="column" marginBottom={1}>
						<Box>
							<Text bold>{session.name}</Text>
							<Text dimColor> • {session.messages.length} messages</Text>
						</Box>
						<Text dimColor>
							Created: {session.created.toLocaleString()}
						</Text>
						<Text dimColor>
							Last active: {session.lastActive.toLocaleString()}
						</Text>
					</Box>
				))
			)}
			<Text></Text>
			<Text dimColor>Press Ctrl+N to create a new session</Text>
		</Box>
	);

	if (mode === 'help') {
		return renderHelp();
	}

	if (mode === 'sessions') {
		return renderSessions();
	}

	return (
		<Box flexDirection="column" height="100%">
			{/* Header */}
			<Box borderStyle="round" borderColor="cyan" padding={1} marginBottom={1}>
				<Box flexDirection="column" width="100%">
					<Box justifyContent="space-between">
						<Text color="cyan" bold>
							🤖 Enhanced AI Chat
						</Text>
						<Text dimColor>
							Model: {model} • Session: {currentSession?.name || 'None'}
						</Text>
					</Box>
					{progress > 0 && (
						<Box marginTop={1}>
							<ProgressBar progress={progress} width={40} color="cyan" />
						</Box>
					)}
				</Box>
			</Box>

			{/* Error Display */}
			{error && (
				<Box borderStyle="single" borderColor="red" padding={1} marginBottom={1}>
					<Text color="red">❌ Error: {error}</Text>
				</Box>
			)}

			{/* Messages */}
			<Box flexDirection="column" flexGrow={1} paddingX={1}>
				{messages.length === 0 ? (
					<Box flexDirection="column">
						<Text bold color="green">
							👋 Welcome to Enhanced Chat!
						</Text>
						<Text></Text>
						<Text>Features:</Text>
						<Text>• Persistent conversations with context</Text>
						<Text>• Command history (↑↓ arrows)</Text>
						<Text>• Multiple chat sessions (Ctrl+S)</Text>
						<Text>• Enhanced error handling</Text>
						<Text>• Progress indicators</Text>
						<Text></Text>
						<Text dimColor>Press Ctrl+H for help, or start chatting below!</Text>
					</Box>
				) : (
					messages.map(renderMessage)
				)}
				
				{isLoading && (
					<Box marginTop={1}>
						<EnhancedSpinner 
							text="AI is thinking..." 
							type="dots" 
							color="cyan" 
						/>
					</Box>
				)}
			</Box>

			{/* Input */}
			<Box borderStyle="single" borderColor="gray" padding={1} marginTop={1}>
				<CommandLine
					prompt="💬 "
					placeholder="Ask me anything..."
					onSubmit={handleUserMessage}
					onCancel={onExit}
					history={commandHistory}
					color="white"
					focusColor="cyan"
				/>
			</Box>

			{/* Footer */}
			<Box justifyContent="center" marginTop={1}>
				<Text dimColor>
					Ctrl+H: Help • Ctrl+S: Sessions • Ctrl+N: New • Ctrl+L: Clear • Escape: Exit
				</Text>
			</Box>
		</Box>
	);
}