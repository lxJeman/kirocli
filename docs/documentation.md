# KiroCLI Complete Documentation

> Comprehensive guide to all KiroCLI commands, features, and functionality

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Core Commands](#core-commands)
- [AI Chat Commands](#ai-chat-commands)
- [Configuration Commands](#configuration-commands)
- [Specification Commands](#specification-commands)
- [Hook Commands](#hook-commands)
- [Development Commands](#development-commands)
- [Advanced Usage](#advanced-usage)
- [Environment Variables](#environment-variables)
- [Configuration Files](#configuration-files)
- [Troubleshooting](#troubleshooting)

## 🚀 Quick Start

```bash
# Show help and available commands
kirocli --help

# Start interactive main menu
kirocli

# Start AI chat mode
kirocli chat

# Show current configuration
kirocli config show
```

## 🎯 Core Commands

### Main Command Structure

```bash
kirocli [command] [action] [options]
```

### Global Options

| Option | Description | Example |
|--------|-------------|---------|
| `--help` | Show help information | `kirocli --help` |
| `--version` | Show version information | `kirocli --version` |
| `--verbose` | Enable verbose logging | `kirocli --verbose chat` |
| `--debug` | Enable debug mode | `kirocli --debug config test` |

### Interactive Menu

```bash
# Start main menu (default behavior)
kirocli
kirocli menu

# Navigation:
# • Use number keys (1-5) or arrow keys + Enter
# • Press 'q' to quit
# • Use Ctrl+C to force exit
```

**Menu Options:**
1. **Start AI Chat** - Interactive chat with AI models
2. **Command Line** - Execute commands directly
3. **Configuration** - Manage API keys and settings
4. **Spec Builder** - Generate code from specifications
5. **Agent Hooks** - Workflow automation tools

## 🤖 AI Chat Commands

### Basic Chat

```bash
# Start AI chat with default model (GPT-4)
kirocli chat

# Chat with specific model
kirocli chat --model=gpt-4
kirocli chat --model=claude-3-sonnet-20240229
kirocli chat --model=gemini-pro
```

### Supported AI Models

| Provider | Models | Command |
|----------|--------|---------|
| **OpenAI** | `gpt-4`, `gpt-3.5-turbo`, `gpt-4-turbo` | `kirocli chat --model=gpt-4` |
| **Claude** | `claude-3-sonnet-20240229`, `claude-3-haiku-20240307`, `claude-3-opus-20240229` | `kirocli chat --model=claude-3-sonnet-20240229` |
| **Gemini** | `gemini-pro`, `gemini-pro-vision` | `kirocli chat --model=gemini-pro` |

### Chat Features

- ✅ **Persistent Conversations** - History saved across sessions
- ✅ **Command History** - Navigate with up/down arrow keys
- ✅ **Multi-turn Context** - AI remembers conversation context
- ✅ **Syntax Highlighting** - Beautiful command previews
- ✅ **Command Execution** - AI can suggest and execute shell commands
- ✅ **Working Directory Selection** - Choose where commands run
- ✅ **Safety Assessment** - Commands rated as safe/caution/dangerous

### Chat Controls

| Key Combination | Action |
|-----------------|--------|
| `Enter` | Send message |
| `↑/↓` | Navigate command history |
| `Ctrl+C` | Exit chat |
| `Ctrl+L` | Clear screen |
| `Escape` | Return to main menu |

## ⚙️ Configuration Commands

### Show Configuration

```bash
# Display current configuration
kirocli config show

# Shows:
# • Default provider and model
# • API key status for all providers
# • Supported models list
# • Configuration file locations
```

### Test Configuration

```bash
# Test all configured AI providers
kirocli config test

# Test specific provider
kirocli config test --provider=openai
kirocli config test --provider=claude
kirocli config test --provider=gemini
```

### Setup Configuration

```bash
# Interactive setup wizard
kirocli config setup

# Guides you through:
# • API key configuration
# • Provider selection
# • Model preferences
# • Configuration validation
```

### Manage API Keys

```bash
# Set API keys
kirocli config set-key openai your-openai-api-key
kirocli config set-key claude your-claude-api-key
kirocli config set-key gemini your-gemini-api-key

# Remove API keys
kirocli config remove-key openai
kirocli config remove-key claude
kirocli config remove-key gemini

# List configured providers
kirocli config list-providers
```

### Configuration Files

| File | Location | Purpose |
|------|----------|---------|
| `config.json` | `~/.kirocli/config.json` | Main configuration |
| `api-keys.json` | `~/.kirocli/api-keys.json` | Encrypted API keys |
| `chat-history.json` | `~/.kirocli/chat-history.json` | Chat conversation history |

## 📜 Specification Commands

### Validate Specifications

```bash
# Validate default spec file
kirocli spec validate

# Validate specific file
kirocli spec validate --file=path/to/spec.yaml
kirocli spec validate --file=.kiro/custom-spec.yaml

# Validation checks:
# • YAML syntax
# • Required fields
# • Schema compliance
# • Dependency validation
```

### Initialize Specifications

```bash
# Create basic spec file
kirocli spec init

# Create with specific template
kirocli spec init --template=basic
kirocli spec init --template=web
kirocli spec init --template=api
kirocli spec init --template=cli
kirocli spec init --template=library

# Create in custom location
kirocli spec init --file=custom-spec.yaml --template=web
```

### Available Templates

| Template | Description | Use Case |
|----------|-------------|----------|
| `basic` | Simple project template | General purpose projects |
| `web` | React web application | Frontend web apps |
| `api` | Express.js API server | Backend REST APIs |
| `cli` | Command-line tool | CLI applications |
| `library` | Reusable library | NPM packages/libraries |

### Build from Specifications

```bash
# Generate code from default spec
kirocli spec build

# Generate from specific file
kirocli spec build --file=custom-spec.yaml

# Build process:
# • Validates specification
# • Generates code using AI
# • Creates directory structure
# • Installs dependencies
# • Runs post-generation hooks
```

### Specification File Structure

```yaml
# Example spec.yaml
version: 1.0.0
name: my-project
goal: Build a React login form
language: TypeScript
framework: React
features:
  - Email and password inputs
  - Form validation
  - Submit button with loading state
  - Error handling
  - Responsive design
outputPath: ./generated
dependencies:
  - react
  - react-dom
devDependencies:
  - "@types/react"
  - typescript
scripts:
  dev: vite
  build: vite build
```

## 🔗 Hook Commands

### List Hooks

```bash
# List all available hooks
kirocli hook list

# List with detailed information
kirocli hook list --verbose

# Filter by category
kirocli hook list --category=git
kirocli hook list --category=build
kirocli hook list --category=deploy
```

### Run Hooks

```bash
# Run specific hook by name
kirocli hook run git-auto-commit
kirocli hook run build-on-change
kirocli hook run test-runner

# Run hook by ID
kirocli hook run hook-1234567890

# Run with custom parameters
kirocli hook run git-auto-commit --message="Custom commit message"
```

### Create Hooks

```bash
# Interactive hook creation
kirocli hook create

# Create with template
kirocli hook create --template=git-workflow
kirocli hook create --template=build-automation
kirocli hook create --template=deployment

# Create from file
kirocli hook create --file=my-hook.yaml
```

### Hook Templates

```bash
# List available templates
kirocli hook templates

# Available templates:
# • git-auto-commit - Automatic git commits
# • build-on-change - Build when files change
# • test-runner - Run tests automatically
# • deploy-on-push - Deploy on git push
# • lint-on-save - Lint files on save
```

### Hook Management

```bash
# Enable/disable hooks
kirocli hook enable git-auto-commit
kirocli hook disable build-on-change

# Delete hooks
kirocli hook delete old-hook-name

# Show hook statistics
kirocli hook stats

# Export/import hooks
kirocli hook export --file=my-hooks.json
kirocli hook import --file=my-hooks.json
```

### Hook Configuration

```yaml
# Example hook configuration
name: Git Auto Commit
description: Automatically commit changes when files are modified
trigger:
  type: file_change
  patterns:
    - "src/**/*.ts"
    - "src/**/*.tsx"
  exclude:
    - "node_modules/**"
actions:
  - type: shell
    command: git add .
  - type: git
    action: commit
    message: "Auto-commit: {{timestamp}}"
conditions:
  - type: git_status
    has_changes: true
```

## 🛠️ Development Commands

### Build Commands

```bash
# Build TypeScript
npm run build

# Watch mode (development)
npm run dev

# Clean build
npm run clean && npm run build
```

### Testing Commands

```bash
# Run all tests
npm test

# Run linting only
npm run lint

# Fix linting issues
npm run lint:fix

# Run specific test suites
npm run test:unit
npm run test:integration
```

### Distribution Commands

```bash
# Create all platform packages
npm run dist

# Create platform-specific packages
npm run dist:linux
npm run dist:macos
npm run dist:windows

# Clean distribution directory
npm run clean:dist
```

### Development Utilities

```bash
# Setup GitHub Actions
./scripts/setup-github-actions.sh

# Create distribution packages
./scripts/create-distribution.js

# Build binaries (experimental)
./scripts/build-binaries.js
```

## 🔧 Advanced Usage

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `KIROCLI_DEBUG` | Enable debug mode | `export KIROCLI_DEBUG=true` |
| `KIROCLI_VERBOSE` | Enable verbose logging | `export KIROCLI_VERBOSE=true` |
| `KIROCLI_CONFIG_DIR` | Custom config directory | `export KIROCLI_CONFIG_DIR=/custom/path` |
| `KIROCLI_PLATFORM` | Override platform detection | `export KIROCLI_PLATFORM=linux` |
| `KIROCLI_SHELL` | Override shell detection | `export KIROCLI_SHELL=bash` |
| `OPENAI_API_KEY` | OpenAI API key | `export OPENAI_API_KEY=sk-...` |
| `ANTHROPIC_API_KEY` | Claude API key | `export ANTHROPIC_API_KEY=sk-ant-...` |
| `GOOGLE_API_KEY` | Gemini API key | `export GOOGLE_API_KEY=AIza...` |

### Configuration File Locations

| OS | Config Directory |
|----|------------------|
| **Linux** | `~/.kirocli/` |
| **macOS** | `~/.kirocli/` |
| **Windows** | `%USERPROFILE%\AppData\Local\KiroCLI\` |

### Working with Multiple Projects

```bash
# Use project-specific config
cd /path/to/project
kirocli config show  # Shows project + global config

# Project-specific spec files
kirocli spec validate --file=.kiro/project-spec.yaml
kirocli spec build --file=.kiro/project-spec.yaml

# Project-specific hooks
kirocli hook list --project-only
```

### Batch Operations

```bash
# Validate multiple specs
for spec in specs/*.yaml; do
  kirocli spec validate --file="$spec"
done

# Run multiple hooks
kirocli hook run git-auto-commit build-on-change test-runner

# Test all AI providers
kirocli config test --all-providers
```

## 🐛 Troubleshooting

### Common Issues

#### API Key Issues

```bash
# Check API key status
kirocli config show

# Test specific provider
kirocli config test --provider=openai

# Reset API keys
kirocli config remove-key openai
kirocli config set-key openai new-api-key
```

#### Build Issues

```bash
# Clear cache and rebuild
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### Permission Issues

```bash
# Linux/macOS: Make executable
chmod +x kirocli

# Windows: Run as administrator
# Right-click -> Run as administrator
```

#### Configuration Issues

```bash
# Reset configuration
rm -rf ~/.kirocli
kirocli config setup

# Check configuration files
ls -la ~/.kirocli/
cat ~/.kirocli/config.json
```

### Debug Mode

```bash
# Enable debug logging
export KIROCLI_DEBUG=true
kirocli chat

# Enable verbose output
kirocli --verbose config test

# Check log files
tail -f ~/.kirocli/logs/debug.log
```

### Getting Help

- **Documentation**: [README.md](../readme.md)
- **Installation Guide**: [INSTALL.md](INSTALL.md)
- **Setup Guide**: [SETUP.md](SETUP.md)
- **Project Features**: [PROJECT-FEATURES.md](PROJECT-FEATURES.md)
- **Issues**: [GitHub Issues](https://github.com/your-username/kirocli/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/kirocli/discussions)

## 📊 Command Reference Summary

### Quick Command Reference

```bash
# Core
kirocli                          # Main menu
kirocli --help                   # Show help
kirocli chat                     # AI chat
kirocli chat --model=claude-3-sonnet-20240229

# Configuration
kirocli config show              # Show config
kirocli config test              # Test providers
kirocli config setup             # Setup wizard
kirocli config set-key openai sk-...

# Specifications
kirocli spec validate            # Validate spec
kirocli spec init --template=web # Create spec
kirocli spec build               # Generate code

# Hooks
kirocli hook list                # List hooks
kirocli hook run git-auto-commit # Run hook
kirocli hook create              # Create hook
kirocli hook stats               # Show statistics

# Development
npm run build                    # Build project
npm run dist                     # Create packages
npm test                         # Run tests
./scripts/setup-github-actions.sh # Setup CI/CD
```

---

## 🎉 You're Ready!

This documentation covers all KiroCLI commands and features. For specific use cases or advanced configurations, refer to the individual guide files in the `docs/` directory.

**Happy coding with KiroCLI!** 🚀