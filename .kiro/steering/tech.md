# Technology Stack

## Core Technologies

- **Node.js**: >=16 required
- **TypeScript**: Primary language with strict configuration
- **React**: UI framework for terminal interfaces
- **Ink**: React renderer for CLI applications

## Key Dependencies

- **meow**: CLI argument parsing
- **chalk**: Terminal string styling (dev/test only)

## Build System & Tools

- **TypeScript Compiler**: Direct `tsc` compilation
- **XO**: ESLint configuration with React support
- **Prettier**: Code formatting with @vdemedes/prettier-config
- **AVA**: Test runner with TypeScript support

## Common Commands

```bash
# Development
npm run dev          # Watch mode compilation
npm run build        # Production build
npm test            # Run linting, formatting, and tests

# Testing the CLI locally
node dist/cli.js --name=Test
```

## Code Quality

- XO linting with React extensions
- Prettier formatting enforced
- TypeScript strict mode via @sindresorhus/tsconfig
- Automated testing with ink-testing-library
