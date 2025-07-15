# KiroCLI Development Setup

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Build the Project

```bash
npm run build
```

### 3. Test the CLI

```bash
# Show help
node dist/index.js --help

# Test subcommands
node dist/index.js spec --help
node dist/index.js hook --help
node dist/index.js chat --help
```

## 🧪 Testing Current Features

### Spec System

```bash
# Validate the example spec
node dist/index.js spec validate

# Initialize a new spec (creates .kiro/spec.yaml)
node dist/index.js spec init
```

### Hook System

```bash
# List available hooks
node dist/index.js hook list

# Run a sample hook (safe commands only)
node dist/index.js hook run git-commit
```

### Legacy Greeting

```bash
# Test the original greeting functionality
node dist/index.js greet --name="Developer"
```

## 🔧 Development Workflow

### Watch Mode

```bash
npm run dev
```

### Build and Run

```bash
npm run dev:run
```

## 🤖 AI Integration Setup (Phase 3)

To test AI features, you'll need API keys:

### Environment Variables

```bash
# OpenAI
export OPENAI_API_KEY="your-openai-key"

# Anthropic Claude
export ANTHROPIC_API_KEY="your-anthropic-key"

# Google Gemini
export GOOGLE_API_KEY="your-google-key"
```

### Test AI Chat (requires API key)

```bash
# Default GPT-4
node dist/index.js chat

# Specific model
node dist/index.js chat --model=claude-3-sonnet-20240229
```

### Test Spec Generation (requires API key)

```bash
# Generate code from spec
node dist/index.js spec build
```

## 📁 Project Structure

```
src/
├── index.ts              # Main CLI entry point
├── app.tsx              # Legacy greeting component
├── ai/
│   ├── index.ts         # AI provider wrapper
│   └── types.ts         # AI interfaces
├── commands/
│   ├── chat.tsx         # Interactive chat mode
│   ├── spec.tsx         # Spec commands
│   └── hook.tsx         # Hook commands
├── parser/
│   └── index.ts         # YAML spec parser
└── hooks/
    └── index.ts         # Hook management system

.kiro/
├── spec.yaml            # Example spec file
├── config/
│   └── ai.yaml         # AI configuration
└── hooks/
    ├── git-commit.yaml  # Example git hook
    └── test-and-build.yaml # Example build hook
```

## 🎯 Next Development Steps

1. **Set up AI API keys** and test chat functionality
2. **Implement command execution** for natural language → shell commands
3. **Test spec-to-code generation** with real AI models
4. **Enhance hook system** with more automation examples
5. **Add cross-platform testing** for Windows/macOS compatibility

## 🐛 Troubleshooting

### Build Errors

- Ensure all dependencies are installed: `npm install`
- Check TypeScript version compatibility
- Verify Node.js version >= 16

### Runtime Errors

- Check that `.kiro/` directory exists
- Verify spec.yaml syntax with `node dist/index.js spec validate`
- Ensure proper file permissions for hook execution

### AI Integration Issues

- Verify API keys are set as environment variables
- Check network connectivity
- Review API rate limits and quotas
