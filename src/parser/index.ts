import * as fs from 'fs/promises';
import * as path from 'path';
import * as yaml from 'js-yaml';
import {SpecData} from '../ai/types.js';

// Enhanced spec schema definition
export interface EnhancedSpecData extends SpecData {
	version?: string;
	name?: string;
	description?: string;
	author?: string;
	dependencies?: string[];
	devDependencies?: string[];
	scripts?: Record<string, string>;
	structure?: {
		directories?: string[];
		files?: Array<{
			path: string;
			template?: string;
			content?: string;
		}>;
	};
	templates?: Record<string, string>;
	variables?: Record<string, any>;
	hooks?: {
		preGenerate?: string[];
		postGenerate?: string[];
	};
}

export interface ValidationResult {
	valid: boolean;
	errors: string[];
	warnings: string[];
}

export interface GenerationResult {
	success: boolean;
	files: Array<{
		path: string;
		content: string;
		size: number;
	}>;
	errors: string[];
	duration: number;
}

export class SpecParser {
	private readonly supportedLanguages = [
		'typescript', 'javascript', 'python', 'java', 'go', 'rust', 'c++', 'c#', 'php', 'ruby'
	];

	private readonly supportedFrameworks = [
		'react', 'vue', 'angular', 'svelte', 'next.js', 'nuxt.js', 'express', 'fastapi', 'django', 'spring', 'gin'
	];

	async initSpec(filePath: string, options?: {
		interactive?: boolean;
		template?: 'basic' | 'web' | 'api' | 'cli' | 'library';
	}): Promise<void> {
		const template = options?.template || 'basic';
		const specTemplate = this.getSpecTemplate(template);

		const specContent = yaml.dump(specTemplate, {
			indent: 2,
			lineWidth: 100,
			quotingType: '"',
			forceQuotes: false,
		});

		// Ensure directory exists
		const dir = path.dirname(filePath);
		await fs.mkdir(dir, {recursive: true});

		// Write spec file with header comment
		const header = `# KiroCLI Specification File
# Generated on: ${new Date().toISOString()}
# Template: ${template}
# 
# This file defines the structure and requirements for code generation.
# Modify the values below to customize your generated code.
#
# For more information, visit: https://github.com/your-repo/kirocli

`;

		await fs.writeFile(filePath, header + specContent, 'utf8');
	}

	async parseSpec(filePath: string): Promise<EnhancedSpecData> {
		try {
			const content = await fs.readFile(filePath, 'utf8');
			
			// Remove comments and parse YAML
			const cleanContent = content
				.split('\n')
				.filter(line => !line.trim().startsWith('#'))
				.join('\n');
			
			const spec = yaml.load(cleanContent) as EnhancedSpecData;

			// Validate and enhance spec
			const validation = await this.validateSpecData(spec);
			if (!validation.valid) {
				throw new Error(`Spec validation failed: ${validation.errors.join(', ')}`);
			}

			return this.enhanceSpec(spec);
		} catch (error) {
			if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
				throw new Error(`Spec file not found: ${filePath}`);
			}
			throw error;
		}
	}

	async validateSpec(filePath: string): Promise<ValidationResult> {
		try {
			const content = await fs.readFile(filePath, 'utf8');
			const spec = yaml.load(content) as EnhancedSpecData;
			return await this.validateSpecData(spec);
		} catch (error) {
			return {
				valid: false,
				errors: [error instanceof Error ? error.message : 'Unknown validation error'],
				warnings: []
			};
		}
	}

	async generateCode(spec: EnhancedSpecData): Promise<GenerationResult> {
		const startTime = Date.now();
		const result: GenerationResult = {
			success: false,
			files: [],
			errors: [],
			duration: 0
		};

		try {
			// Run pre-generation hooks
			if (spec.hooks?.preGenerate) {
				await this.runHooks(spec.hooks.preGenerate, 'pre-generate');
			}

			// Create output directory structure
			await this.createDirectoryStructure(spec);

			// Generate files based on templates and AI
			const files = await this.generateFiles(spec);
			result.files = files;

			// Run post-generation hooks
			if (spec.hooks?.postGenerate) {
				await this.runHooks(spec.hooks.postGenerate, 'post-generate');
			}

			result.success = true;
		} catch (error) {
			result.errors.push(error instanceof Error ? error.message : 'Unknown generation error');
		}

		result.duration = Date.now() - startTime;
		return result;
	}

	private getSpecTemplate(template: string): EnhancedSpecData {
		const baseTemplate: EnhancedSpecData = {
			version: '1.0.0',
			name: 'my-project',
			goal: 'Build a sample application',
			language: 'TypeScript',
			framework: 'React',
			features: [],
			outputPath: './generated',
			author: 'KiroCLI User',
			dependencies: [],
			devDependencies: [],
			scripts: {},
			structure: {
				directories: [],
				files: []
			},
			variables: {}
		};

		switch (template) {
			case 'web':
				return {
					...baseTemplate,
					name: 'web-application',
					goal: 'Build a modern web application',
					language: 'TypeScript',
					framework: 'React',
					features: [
						'Responsive user interface',
						'Component-based architecture',
						'State management',
						'API integration',
						'Form validation',
						'Error handling',
						'Loading states',
						'Routing'
					],
					dependencies: ['react', 'react-dom', 'react-router-dom'],
					devDependencies: ['@types/react', '@types/react-dom', 'vite', 'typescript'],
					scripts: {
						'dev': 'vite',
						'build': 'vite build',
						'preview': 'vite preview'
					},
					structure: {
						directories: ['src', 'src/components', 'src/pages', 'src/hooks', 'src/utils', 'public'],
						files: [
							{ path: 'src/App.tsx', template: 'react-app' },
							{ path: 'src/main.tsx', template: 'react-main' },
							{ path: 'index.html', template: 'html-template' },
							{ path: 'package.json', template: 'package-json' }
						]
					}
				};

			case 'api':
				return {
					...baseTemplate,
					name: 'api-server',
					goal: 'Build a RESTful API server',
					language: 'TypeScript',
					framework: 'Express',
					features: [
						'RESTful endpoints',
						'Request validation',
						'Error handling middleware',
						'Authentication',
						'Database integration',
						'API documentation',
						'Rate limiting',
						'CORS support'
					],
					dependencies: ['express', 'cors', 'helmet', 'dotenv'],
					devDependencies: ['@types/express', '@types/cors', 'nodemon', 'typescript'],
					scripts: {
						'dev': 'nodemon src/index.ts',
						'build': 'tsc',
						'start': 'node dist/index.js'
					},
					structure: {
						directories: ['src', 'src/routes', 'src/middleware', 'src/models', 'src/controllers'],
						files: [
							{ path: 'src/index.ts', template: 'express-server' },
							{ path: 'src/app.ts', template: 'express-app' },
							{ path: 'package.json', template: 'package-json' }
						]
					}
				};

			case 'cli':
				return {
					...baseTemplate,
					name: 'cli-tool',
					goal: 'Build a command-line interface tool',
					language: 'TypeScript',
					framework: 'Commander.js',
					features: [
						'Command-line argument parsing',
						'Interactive prompts',
						'File system operations',
						'Progress indicators',
						'Error handling',
						'Help system',
						'Configuration management'
					],
					dependencies: ['commander', 'inquirer', 'ora', 'chalk'],
					devDependencies: ['@types/inquirer', 'typescript', 'ts-node'],
					scripts: {
						'dev': 'ts-node src/index.ts',
						'build': 'tsc',
						'start': 'node dist/index.js'
					},
					structure: {
						directories: ['src', 'src/commands', 'src/utils'],
						files: [
							{ path: 'src/index.ts', template: 'cli-main' },
							{ path: 'src/cli.ts', template: 'cli-app' },
							{ path: 'package.json', template: 'package-json' }
						]
					}
				};

			case 'library':
				return {
					...baseTemplate,
					name: 'utility-library',
					goal: 'Build a reusable utility library',
					language: 'TypeScript',
					features: [
						'Modular architecture',
						'Type definitions',
						'Unit tests',
						'Documentation',
						'Build system',
						'NPM publishing'
					],
					dependencies: [],
					devDependencies: ['typescript', 'vitest', 'tsup'],
					scripts: {
						'build': 'tsup src/index.ts --format cjs,esm --dts',
						'test': 'vitest',
						'dev': 'tsup src/index.ts --format cjs,esm --dts --watch'
					},
					structure: {
						directories: ['src', 'tests', 'docs'],
						files: [
							{ path: 'src/index.ts', template: 'library-main' },
							{ path: 'package.json', template: 'package-json' },
							{ path: 'tsconfig.json', template: 'tsconfig' }
						]
					}
				};

			default:
				return baseTemplate;
		}
	}

	private async validateSpecData(spec: EnhancedSpecData): Promise<ValidationResult> {
		const errors: string[] = [];
		const warnings: string[] = [];

		// Required fields validation
		if (!spec.goal) errors.push('Missing required field: goal');
		if (!spec.language) errors.push('Missing required field: language');
		if (!spec.features || spec.features.length === 0) {
			errors.push('Missing required field: features (must be a non-empty array)');
		}

		// Language validation
		if (spec.language && !this.supportedLanguages.includes(spec.language.toLowerCase())) {
			warnings.push(`Language '${spec.language}' is not in the list of commonly supported languages`);
		}

		// Framework validation
		if (spec.framework && !this.supportedFrameworks.includes(spec.framework.toLowerCase())) {
			warnings.push(`Framework '${spec.framework}' is not in the list of commonly supported frameworks`);
		}

		// Output path validation
		if (spec.outputPath && path.isAbsolute(spec.outputPath)) {
			warnings.push('Using absolute output path - consider using relative paths for portability');
		}

		// Dependencies validation
		if (spec.dependencies && !Array.isArray(spec.dependencies)) {
			errors.push('Dependencies must be an array of strings');
		}

		// Structure validation
		if (spec.structure?.files) {
			for (const file of spec.structure.files) {
				if (!file.path) {
					errors.push('File structure entry missing required path field');
				}
			}
		}

		return {
			valid: errors.length === 0,
			errors,
			warnings
		};
	}

	private enhanceSpec(spec: EnhancedSpecData): EnhancedSpecData {
		// Set defaults
		const enhanced: EnhancedSpecData = {
			version: '1.0.0',
			outputPath: './generated',
			dependencies: [],
			devDependencies: [],
			scripts: {},
			structure: {
				directories: [],
				files: []
			},
			variables: {},
			...spec
		};

		// Auto-detect common dependencies based on language/framework
		if (enhanced.language?.toLowerCase() === 'typescript') {
			if (!enhanced.devDependencies?.includes('typescript')) {
				enhanced.devDependencies?.push('typescript');
			}
		}

		if (enhanced.framework?.toLowerCase() === 'react') {
			if (!enhanced.dependencies?.includes('react')) {
				enhanced.dependencies?.push('react', 'react-dom');
			}
			if (!enhanced.devDependencies?.includes('@types/react')) {
				enhanced.devDependencies?.push('@types/react', '@types/react-dom');
			}
		}

		return enhanced;
	}

	private async createDirectoryStructure(spec: EnhancedSpecData): Promise<void> {
		const outputPath = spec.outputPath || './generated';
		
		// Create main output directory
		await fs.mkdir(outputPath, { recursive: true });

		// Create specified directories
		if (spec.structure?.directories) {
			for (const dir of spec.structure.directories) {
				const fullPath = path.join(outputPath, dir);
				await fs.mkdir(fullPath, { recursive: true });
			}
		}
	}

	private async generateFiles(spec: EnhancedSpecData): Promise<Array<{ path: string; content: string; size: number }>> {
		const files: Array<{ path: string; content: string; size: number }> = [];
		const outputPath = spec.outputPath || './generated';

		// Generate files from structure definition
		if (spec.structure?.files) {
			for (const fileSpec of spec.structure.files) {
				const content = fileSpec.content || await this.generateFileContent(fileSpec, spec);
				const fullPath = path.join(outputPath, fileSpec.path);
				
				// Ensure directory exists
				await fs.mkdir(path.dirname(fullPath), { recursive: true });
				
				// Write file
				await fs.writeFile(fullPath, content, 'utf8');
				
				files.push({
					path: fileSpec.path,
					content,
					size: Buffer.byteLength(content, 'utf8')
				});
			}
		}

		// Generate main application file if not specified in structure
		if (!spec.structure?.files?.some(f => f.path.includes('main') || f.path.includes('index'))) {
			const mainFile = await this.generateMainFile(spec);
			const mainPath = this.getMainFileName(spec);
			const fullPath = path.join(outputPath, mainPath);
			
			await fs.writeFile(fullPath, mainFile, 'utf8');
			
			files.push({
				path: mainPath,
				content: mainFile,
				size: Buffer.byteLength(mainFile, 'utf8')
			});
		}

		return files;
	}

	private async generateFileContent(fileSpec: { path: string; template?: string; content?: string }, spec: EnhancedSpecData): Promise<string> {
		if (fileSpec.content) {
			return this.processTemplate(fileSpec.content, spec.variables || {});
		}

		if (fileSpec.template) {
			const template = this.getTemplate(fileSpec.template, spec);
			return this.processTemplate(template, spec.variables || {});
		}

		// Generate content using AI if no template specified
		return await this.generateAIContent(fileSpec.path, spec);
	}

	private async generateMainFile(spec: EnhancedSpecData): Promise<string> {
		// Use AI to generate the main application file
		const {AIProvider} = await import('../ai/index.js');
		const ai = await AIProvider.createDefault();
		
		return await ai.generateFromSpec({
			goal: spec.goal,
			language: spec.language,
			framework: spec.framework,
			features: spec.features,
			outputPath: spec.outputPath
		});
	}

	private async generateAIContent(filePath: string, spec: EnhancedSpecData): Promise<string> {
		const {AIProvider} = await import('../ai/index.js');
		const ai = await AIProvider.createDefault();
		
		const filePrompt = `Generate content for file: ${filePath}
		
Project: ${spec.name || 'Unnamed Project'}
Goal: ${spec.goal}
Language: ${spec.language}
Framework: ${spec.framework || 'None'}

Features to implement:
${spec.features.map(f => `- ${f}`).join('\n')}

Generate appropriate content for this file that fits the project structure and requirements.
Make sure the code is production-ready, well-commented, and follows best practices.`;

		return await ai.chat([{ role: 'user', content: filePrompt }]);
	}

	private buildEnhancedPrompt(spec: EnhancedSpecData): string {
		return `Generate ${spec.language} code for the following specification:

Project: ${spec.name || 'Unnamed Project'}
Goal: ${spec.goal}
Language: ${spec.language}
${spec.framework ? `Framework: ${spec.framework}` : ''}
${spec.version ? `Version: ${spec.version}` : ''}
${spec.author ? `Author: ${spec.author}` : ''}

Features to implement:
${spec.features.map(feature => `- ${feature}`).join('\n')}

${spec.dependencies && spec.dependencies.length > 0 ? `
Dependencies:
${spec.dependencies.map(dep => `- ${dep}`).join('\n')}
` : ''}

${spec.structure?.directories && spec.structure.directories.length > 0 ? `
Directory Structure:
${spec.structure.directories.map(dir => `- ${dir}/`).join('\n')}
` : ''}

Requirements:
- Write clean, maintainable, and well-documented code
- Follow best practices for ${spec.language}${spec.framework ? ` and ${spec.framework}` : ''}
- Include proper error handling
- Add TypeScript types if using TypeScript
- Include comments explaining complex logic
- Make the code production-ready
- Ensure all features are properly implemented

${spec.outputPath ? `Output should be suitable for: ${spec.outputPath}` : ''}`;
	}

	// Method to get enhanced prompt (public interface)
	public getEnhancedPrompt(spec: EnhancedSpecData): string {
		return this.buildEnhancedPrompt(spec);
	}

	private getTemplate(templateName: string, spec: EnhancedSpecData): string {
		// Built-in templates
		const templates: Record<string, string> = {
			'package-json': JSON.stringify({
				name: spec.name || 'generated-project',
				version: spec.version || '1.0.0',
				description: spec.goal,
				main: this.getMainFileName(spec),
				scripts: spec.scripts || {},
				dependencies: this.arrayToObject(spec.dependencies || []),
				devDependencies: this.arrayToObject(spec.devDependencies || []),
				author: spec.author || '',
				license: 'MIT'
			}, null, 2),

			'tsconfig': JSON.stringify({
				compilerOptions: {
					target: 'ES2020',
					module: 'ESNext',
					moduleResolution: 'node',
					strict: true,
					esModuleInterop: true,
					skipLibCheck: true,
					forceConsistentCasingInFileNames: true,
					outDir: './dist',
					rootDir: './src'
				},
				include: ['src/**/*'],
				exclude: ['node_modules', 'dist']
			}, null, 2),

			'react-main': `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,

			'html-template': `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${spec.name || 'Generated App'}</title>
</head>
<body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
</body>
</html>`
		};

		return templates[templateName] || `// Template '${templateName}' not found`;
	}

	private processTemplate(template: string, variables: Record<string, any>): string {
		let processed = template;
		
		// Replace variables in format {{variableName}}
		for (const [key, value] of Object.entries(variables)) {
			const regex = new RegExp(`{{${key}}}`, 'g');
			processed = processed.replace(regex, String(value));
		}
		
		return processed;
	}

	private async runHooks(hooks: string[], phase: string): Promise<void> {
		for (const hook of hooks) {
			try {
				const {execa} = await import('execa');
				await execa('sh', ['-c', hook], { stdio: 'inherit' });
			} catch (error) {
				console.warn(`Hook failed in ${phase}: ${hook}`);
			}
		}
	}

	private getMainFileName(spec: EnhancedSpecData): string {
		const extension = this.getFileExtension(spec.language, spec.framework);
		
		if (spec.framework?.toLowerCase().includes('react')) {
			return `App${extension}`;
		}
		
		return `index${extension}`;
	}

	private getFileExtension(language: string, framework?: string): string {
		const lang = language.toLowerCase();
		
		if (framework?.toLowerCase().includes('react')) {
			return lang === 'typescript' ? '.tsx' : '.jsx';
		}

		switch (lang) {
			case 'typescript':
				return '.ts';
			case 'javascript':
				return '.js';
			case 'python':
				return '.py';
			case 'java':
				return '.java';
			case 'go':
				return '.go';
			case 'rust':
				return '.rs';
			case 'c++':
				return '.cpp';
			case 'c#':
				return '.cs';
			case 'php':
				return '.php';
			case 'ruby':
				return '.rb';
			default:
				return '.txt';
		}
	}

	private arrayToObject(arr: string[]): Record<string, string> {
		const obj: Record<string, string> = {};
		for (const item of arr) {
			obj[item] = 'latest';
		}
		return obj;
	}

	// Legacy method for backward compatibility
	async writeGeneratedCode(code: string, spec: SpecData): Promise<void> {
		const outputPath = spec.outputPath || './generated';
		
		// Ensure output directory exists
		await fs.mkdir(outputPath, {recursive: true});

		// Determine file extension based on language
		const extension = this.getFileExtension(spec.language, spec.framework);
		const fileName = this.generateFileName(spec.goal, extension);
		const fullPath = path.join(outputPath, fileName);

		// Write generated code
		await fs.writeFile(fullPath, code, 'utf8');

		console.log(`Generated code written to: ${fullPath}`);
	}

	private generateFileName(goal: string, extension: string): string {
		// Convert goal to a valid filename
		const baseName = goal
			.toLowerCase()
			.replace(/[^a-z0-9\s]/g, '')
			.replace(/\s+/g, '-')
			.replace(/^-+|-+$/g, '');

		return `${baseName}${extension}`;
	}
}