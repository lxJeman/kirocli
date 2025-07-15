import * as fs from 'fs/promises';
import * as path from 'path';
import * as yaml from 'js-yaml';
import {execa} from 'execa';

interface Hook {
	name: string;
	description: string;
	trigger?: string;
	commands: string[];
	workingDirectory?: string;
}

export class HookManager {
	private hooksDir = '.kiro/hooks';

	async listHooks(): Promise<string[]> {
		try {
			await fs.mkdir(this.hooksDir, {recursive: true});
			const files = await fs.readdir(this.hooksDir);
			return files
				.filter(file => file.endsWith('.yaml') || file.endsWith('.yml'))
				.map(file => path.basename(file, path.extname(file)));
		} catch {
			return [];
		}
	}

	async runHook(hookName: string): Promise<void> {
		const hookPath = path.join(this.hooksDir, `${hookName}.yaml`);
		
		try {
			const content = await fs.readFile(hookPath, 'utf8');
			const hook = yaml.load(content) as Hook;

			console.log(`Running hook: ${hook.name}`);
			if (hook.description) {
				console.log(`Description: ${hook.description}`);
			}

			const workingDir = hook.workingDirectory || process.cwd();

			for (const command of hook.commands) {
				console.log(`Executing: ${command}`);
				
				// Parse command and arguments
				const [cmd, ...args] = command.split(' ');
				
				if (!cmd) {
					throw new Error(`Invalid command: ${command}`);
				}
				
				try {
					const result = await execa(cmd, args, {
						cwd: workingDir,
						stdio: 'inherit',
					});
					
					if (result.exitCode !== 0) {
						throw new Error(`Command failed with exit code ${result.exitCode}`);
					}
				} catch (error) {
					throw new Error(`Failed to execute command "${command}": ${error instanceof Error ? error.message : 'Unknown error'}`);
				}
			}

			console.log(`Hook '${hookName}' completed successfully`);
		} catch (error) {
			if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
				throw new Error(`Hook not found: ${hookName}`);
			}
			throw error;
		}
	}

	async createHook(): Promise<void> {
		// Create hooks directory if it doesn't exist
		await fs.mkdir(this.hooksDir, {recursive: true});

		// Create a sample hook
		const sampleHook: Hook = {
			name: 'sample-hook',
			description: 'A sample hook that demonstrates the hook system',
			commands: [
				'echo "Hello from KiroCLI hook!"',
				'pwd',
				'ls -la',
			],
			workingDirectory: '.',
		};

		const hookContent = yaml.dump(sampleHook, {
			indent: 2,
			lineWidth: 80,
		});

		const hookPath = path.join(this.hooksDir, 'sample-hook.yaml');
		await fs.writeFile(hookPath, hookContent, 'utf8');

		console.log(`Sample hook created at: ${hookPath}`);
		console.log('You can now run it with: kirocli hook run sample-hook');
	}

	async createCustomHook(name: string, description: string, commands: string[]): Promise<void> {
		await fs.mkdir(this.hooksDir, {recursive: true});

		const hook: Hook = {
			name,
			description,
			commands,
			workingDirectory: '.',
		};

		const hookContent = yaml.dump(hook, {
			indent: 2,
			lineWidth: 80,
		});

		const hookPath = path.join(this.hooksDir, `${name}.yaml`);
		await fs.writeFile(hookPath, hookContent, 'utf8');

		console.log(`Hook '${name}' created at: ${hookPath}`);
	}
}