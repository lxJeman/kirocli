/**
 * Spec Parser Module
 * 
 * This module handles parsing and validation of .kiro/spec.yaml files
 * for spec-driven development workflows.
 */

export interface KiroSpec {
	goal: string;
	language?: string;
	framework?: string;
	features?: string[];
	dependencies?: string[];
	outputPath?: string;
}

export interface ParseResult {
	spec: KiroSpec;
	isValid: boolean;
	errors: string[];
}

/**
 * Parses a YAML spec file and validates its structure
 */
export async function parseSpec(filePath: string): Promise<ParseResult> {
	// Implementation will use js-yaml in Phase 5
	throw new Error('Spec parsing not yet implemented - coming in Phase 5');
}

/**
 * Validates a parsed spec object
 */
export function validateSpec(spec: Partial<KiroSpec>): { isValid: boolean; errors: string[] } {
	const errors: string[] = [];

	if (!spec.goal || typeof spec.goal !== 'string') {
		errors.push('Spec must have a valid "goal" field');
	}

	if (spec.language && typeof spec.language !== 'string') {
		errors.push('Language field must be a string');
	}

	if (spec.features && !Array.isArray(spec.features)) {
		errors.push('Features field must be an array');
	}

	return {
		isValid: errors.length === 0,
		errors
	};
}

/**
 * Creates a default spec template
 */
export function createDefaultSpec(): KiroSpec {
	return {
		goal: 'Build a new feature',
		language: 'TypeScript',
		framework: 'React',
		features: [],
		dependencies: [],
		outputPath: './output'
	};
}