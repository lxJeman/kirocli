---
inclusion: always
---

# Project Structure & Architecture

## Directory Layout

```
├── src/              # TypeScript source code
│   ├── app.tsx       # Main React component (UI logic)
│   ├── cli.tsx       # CLI entry point with meow setup
│   ├── ai/           # AI integration modules
│   └── parser/       # Spec and configuration parsers
├── dist/             # Compiled JavaScript output
├── test.tsx          # Test files (root level)
└── .kiro/            # Kiro configuration and steering
```

## File Organization Rules

- **Source files**: All TypeScript/TSX in `src/` directory (not `source/`)
- **Tests**: Root-level `.tsx` files for testing
- **Build output**: Always compile to `dist/` directory
- **Entry point**: `dist/cli.js` serves as executable binary
- **Modules**: Group related functionality in subdirectories (`ai/`, `parser/`)

## Naming Conventions

- **Package**: kebab-case (`kirocli`)
- **Components**: PascalCase (`App`, `GreetingComponent`)
- **Variables/Functions**: camelCase (`userName`, `parseConfig`)
- **Files**: Use `.tsx` for React components, `.ts` for utilities
- **Imports**: Use `.js` extensions in TypeScript (ESM requirement)

## Architecture Patterns

- **Separation of concerns**: CLI logic (`cli.tsx`) separate from UI (`app.tsx`)
- **Component design**: Simple, focused, single-responsibility components
- **Type definitions**: Use `type Props = {}` interfaces for component props
- **Exports**: Default exports for main components, named exports for utilities
- **React patterns**: Functional components with hooks, avoid class components
- **Module structure**: Group related functionality (AI, parsing, etc.) in dedicated folders

## Code Quality Standards

- TypeScript strict mode enabled
- All components must have proper type definitions
- Prefer composition over inheritance
- Keep components stateless when possible
- Use descriptive variable and function names
