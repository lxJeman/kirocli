import * as fs from 'fs/promises';
import * as path from 'path';
import * as yaml from 'js-yaml';
import {SpecData} from '../ai/types.js';

export class SpecParser {
	async initSpec(filePath: string): Promise<void> {
		const specTemplate: SpecData = {
			goal: 'Build a sample application',
			language: 'TypeScript',
			framework: 'React',
			features: [
				'User interface',
				'Basic functionality',
				'Error handling',
			],
			outputPath: './generated',
		};

		const specContent = yaml.dump(specTemplate, {
			indent: 2,
			lineWidth: 80,
		});

		// Ensure directory exists
		const dir = path.dirname(filePath);
		await fs.mkdir(dir, {recursive: true});

		// Write spec file
		await fs.writeFile(filePath, specContent, 'utf8');
	}

	async parseSpec(filePath: string): Promise<SpecData> {
		try {
			const content = await fs.readFile(filePath, 'utf8');
			const spec = yaml.load(content) as SpecData;

			// Validate required fields
			if (!spec.goal || !spec.language || !spec.features) {
				throw new Error('Spec file is missing required fields: goal, language, features');
			}

			return spec;
		} catch (error) {
			if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
				throw new Error(`Spec file not found: ${filePath}`);
			}
			throw error;
		}
	}

	async validateSpec(filePath: string): Promise<boolean> {
		try {
			await this.parseSpec(filePath);
			return true;
		} catch {
			return false;
		}
	}

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
			default:
				return '.txt';
		}
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