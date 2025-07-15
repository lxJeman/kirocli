# Project Structure

## Directory Layout
```
├── source/           # TypeScript source code
│   ├── app.tsx      # Main React component
│   └── cli.tsx      # CLI entry point with meow setup
├── dist/            # Compiled JavaScript output
├── test.tsx         # Test files (root level)
├── node_modules/    # Dependencies
└── .kiro/           # Kiro configuration and steering
```

## File Organization Patterns
- **Source code**: All TypeScript/TSX files in `source/` directory
- **Tests**: Test files at project root with `.tsx` extension
- **Build output**: Compiled to `dist/` directory
- **Entry point**: `dist/cli.js` as the executable binary

## Naming Conventions
- Use kebab-case for package name (`kirocli`)
- Use PascalCase for React components (`App`)
- Use camelCase for variables and functions
- Use `.tsx` extension for React components
- Use `.js` imports in TypeScript files (ESM requirement)

## Code Organization
- Separate CLI logic (`cli.tsx`) from UI components (`app.tsx`)
- Keep components simple and focused
- Use TypeScript interfaces for props (`type Props`)
- Default exports for main components
- Functional components with hooks pattern