```
██╗  ██╗██╗██████╗  ██████╗  ██████╗██╗     ██╗
██║ ██╔╝██║██╔══██╗██╔═══██╗██╔════╝██║     ██║
█████╔╝ ██║██████╔╝██║   ██║██║     ██║     ██║
██╔═██╗ ██║██╔══██╗██║   ██║██║     ██║     ██║
██║  ██╗██║██║  ██║╚██████╔╝╚██████╗███████╗██║
╚═╝  ╚═╝╚═╝╚═╝  ╚═╝ ╚═════╝  ╚═════╝╚══════╝╚═╝

    AI Developer Terminal Copilot
```

[![CI](https://github.com/lxJeman/kirocli/actions/workflows/ci.yml/badge.svg)](https://github.com/lxJeman/kirocli/actions/workflows/ci.yml)
[![Release](https://github.com/lxJeman/kirocli/actions/workflows/release.yml/badge.svg)](https://github.com/lxJeman/kirocli/actions/workflows/release.yml)
[![Dev Build](https://github.com/lxJeman/kirocli/actions/workflows/dev-build.yml/badge.svg)](https://github.com/lxJeman/kirocli/actions/workflows/dev-build.yml)

> A cross-platform AI-powered terminal assistant that understands natural language and helps developers run commands, generate code, and automate workflows — all from the command line.

## 📦 Quick Install

### Pre-built Packages (Recommended)

Download the latest release for your platform:

- **Linux**: [kirocli-linux-portable.tar.gz](https://github.com/lxJeman/kirocli/releases/latest/download/kirocli-linux-portable.tar.gz)
- **macOS**: [kirocli-macos-portable.tar.gz](https://github.com/lxJeman/kirocli/releases/latest/download/kirocli-macos-portable.tar.gz)
- **Windows**: [kirocli-windows-portable.tar.gz](https://github.com/lxJeman/kirocli/releases/latest/download/kirocli-windows-portable.tar.gz)

```bash
# Linux/macOS
wget https://github.com/lxJeman/kirocli/releases/latest/download/kirocli-linux-portable.tar.gz
tar -xzf kirocli-linux-portable.tar.gz
cd kirocli-linux-portable
./kirocli --help
```

### Development Builds

Every commit to master automatically creates development builds available in [GitHub Actions](https://github.com/lxJeman/kirocli/actions).

## 🚀 Overview

KiroCLI is a command-line tool designed to boost developer productivity by interpreting natural language instructions and converting them into shell commands or code snippets. Inspired by AWS Kiro but fully independent, KiroCLI supports:

- Running shell commands safely and interactively
- Spec-driven code generation via `.kiro/spec.yaml`
- Custom agent hooks for workflow automation
- Cross-platform support (Linux, macOS, Windows)
- Easy distribution as native CLI binaries

## 🎯 Features

- **Natural language to shell commands:** Just type what you want to do, and KiroCLI translates it into executable commands.
- **Safe command execution:** Commands run through a secure interface allowing confirmation before execution.
- **AI-powered code generation:** Generate boilerplate or complex code from YAML specs or natural language.
- **Workflow automation:** Use hooks to automate git, build, deploy, or other repetitive tasks.
- **Cross-platform:** Works on Linux, Windows (including WSL), and macOS.
- **CLI-based UI:** Built with [Ink](https://github.com/vadimdemedes/ink) for an interactive terminal experience.

## 📚 Documentation

- **[Complete Documentation](docs/documentation.md)** - All commands and features
- **[Installation Guide](docs/INSTALL.md)** - Setup instructions for all platforms
- **[Development Setup](docs/SETUP.md)** - GitHub Actions and CI/CD setup
- **[Project Features](docs/PROJECT-FEATURES.md)** - Detailed overview of implemented features

## ⚙️ Getting Started

### Prerequisites

- Node.js v16+
- npm or yarn

### Installation

#### Option 1: Clone and Install Locally (Recommended)

```bash
# Clone the repository
git clone https://github.com/lxJeman/kirocli.git
cd kirocli

# Install dependencies
npm install

# Build the project
npm run build

# Make KiroCLI available globally on your system
npm link
```

After running these commands, you can use `kirocli` from anywhere in your terminal!

#### Option 2: Install from npm (when published)

```bash
npm install -g kirocli
```

### Running KiroCLI

```bash
# Start the main menu
kirocli

# Or directly access specific features
kirocli chat                      # Start AI chat mode
kirocli config show               # Show configuration
kirocli config set-key openai "YOUR_API_KEY"  # Set OpenAI API key
kirocli spec validate             # Validate spec file
kirocli hook list                 # List available hooks
```

### Development Mode

```bash
# Watch mode for development
npm run dev

# Build and run
npm run build && node dist/index.js

# Run without global installation
node dist/index.js
```

## 📦 Usage Examples

### 🧠 AI-Powered Command Execution (New in Phase 4!)

KiroCLI now features a complete AI command execution system with safety checks and interactive confirmation:

```bash
$ kirocli chat
> Delete all .log files recursively

🧠 AI Command Interpreter
Analyzing your request: "Delete all .log files recursively"
🤔 Thinking...

💡 Command Suggestion
For: "Delete all .log files recursively"

📁 Suggested Command:
find . -name '*.log' -type f -delete

📝 Explanation: Finds and deletes all .log files in current directory and subdirectories
⚠️ Safety Level: CAUTION

🎮 What would you like to do?
• Press Enter to proceed to confirmation
• Press 'n' to reject and try again
• Press Escape to cancel

[User presses Enter]

🛡️ Command Preview & Confirmation
📁 Command to Execute:
find . -name '*.log' -type f -delete

⚠️ CAUTION
This command will modify files or system state.
Review the command carefully before proceeding.

🎮 Available Actions:
• Press 'y' to EXECUTE the command
• Press 'n' to CANCEL and return
• Press 'e' to EDIT the command
• Press 'd' to toggle execution details

[User presses 'y']

⚡ Command Execution Progress
🔧 Executing Command:
find . -name '*.log' -type f -delete

⏱️ Progress: 100%
████████████████████████████████
Elapsed: 1.2s • Running...

✅ Execution Successful
Duration: 1.2s • Exit Code: 0
📤 Output:
[3 files deleted successfully]
```

### 📜 Spec-Driven Development (New in Phase 5!)

KiroCLI now supports comprehensive spec-driven development for generating complete projects from YAML specifications:

#### Initialize a New Spec

```bash
# Create a basic spec file
kirocli spec init

# Create with specific templates
kirocli spec init --template web      # React web application
kirocli spec init --template api      # Express API server
kirocli spec init --template cli      # Command-line tool
kirocli spec init --template library  # Utility library
```

#### Define Your Project Spec

Edit `.kiro/spec.yaml` to define your project:

```yaml
name: my-awesome-app
version: 1.0.0
goal: Build a modern React application with authentication
language: TypeScript
framework: React
features:
  - User authentication system
  - Responsive dashboard
  - API integration
  - Form validation
  - Dark/light theme toggle
dependencies:
  - react
  - react-dom
  - react-router-dom
  - axios
devDependencies:
  - typescript
  - '@types/react'
  - vite
structure:
  directories:
    - src
    - src/components
    - src/pages
    - src/hooks
    - src/utils
  files:
    - path: src/App.tsx
      template: react-app
    - path: package.json
      template: package-json
```

#### Validate and Build

```bash
# Validate your spec file
kirocli spec validate

# Generate the complete project
kirocli spec build
```

#### Example Output

```bash
$ kirocli spec build
✅ Code generation completed successfully!
📋 Project: my-awesome-app
⏱️ Duration: 2847ms
📁 Output: ./generated
📄 Files generated: 12

📄 Generated files:
  • src/App.tsx (2.1 KB)
  • src/components/AuthForm.tsx (3.4 KB)
  • src/components/Dashboard.tsx (2.8 KB)
  • src/hooks/useAuth.ts (1.9 KB)
  • src/utils/api.ts (1.2 KB)
  • package.json (847 bytes)
  • tsconfig.json (456 bytes)
  • index.html (312 bytes)
  • README.md (1.1 KB)
  • .gitignore (234 bytes)

🎉 Your code is ready to use!
```

### 🔗 Agent Hooks System (New in Phase 6!)

KiroCLI now features a comprehensive agent hooks system for workflow automation and event-driven actions:

#### Available Hook Templates

```bash
# List all available hook templates
kirocli hook templates

# Create hooks from built-in templates
kirocli hook create --template git-auto-commit    # Auto-commit on file changes
kirocli hook create --template build-on-change    # Auto-build on source changes
kirocli hook create --template test-runner        # Auto-run tests on changes
kirocli hook create --template deploy-on-push     # Auto-deploy on git push
```

#### Hook Management

```bash
# List all hooks
kirocli hook list

# List hooks by category
kirocli hook list --category git

# Run a specific hook
kirocli hook run my-hook-name

# Enable/disable hooks
kirocli hook enable my-hook-name
kirocli hook disable my-hook-name

# View hook statistics
kirocli hook stats

# Delete a hook
kirocli hook delete my-hook-name
```

#### Example Hook Configuration

Create custom hooks by editing `.kiro/hooks/my-hook.yaml`:

```yaml
id: my-custom-hook
name: My Custom Hook
description: A custom workflow automation hook
enabled: true
trigger:
  type: file_change
  filePattern: 'src/**/*.ts'
actions:
  - id: run-tests
    type: npm
    command: test
  - id: notify
    type: notification
    message: 'Tests completed at {{timestamp}}'
category: development
```

#### Hook Features

- **Multiple Trigger Types**: Manual, file changes, git events, scheduled, and more
- **Rich Action Types**: Shell commands, git operations, file operations, AI generation, notifications
- **Built-in Templates**: Ready-to-use hooks for common workflows
- **File Watching**: Automatic execution on file system changes
- **Conditional Execution**: Run hooks based on conditions
- **Error Handling**: Retry logic and graceful failure handling
- **Statistics**: Track execution history and success rates

## 🔑 API Key Setup

### Option 1: Using the CLI (Recommended)

```bash
# Set up OpenAI API key
kirocli config set-key openai "your-openai-key"

# Set up Claude API key (optional)
kirocli config set-key claude "your-claude-key"

# Set up Gemini API key (optional)
kirocli config set-key gemini "your-gemini-key"

# Test your API connections
kirocli config test
```

### Option 2: Environment Variables

```bash
# OpenAI (required for default functionality)
export OPENAI_API_KEY="your-openai-key"

# Anthropic Claude (optional)
export ANTHROPIC_API_KEY="your-claude-key"

# Google Gemini (optional)
export GOOGLE_API_KEY="your-gemini-key"
```

API keys are stored securely in `~/.kirocli/config.yaml` when using the CLI method.

## 🛠️ Tech Stack & Libraries

- [Node.js](https://nodejs.org/) + [TypeScript](https://www.typescriptlang.org/)
- [Ink](https://github.com/vadimdemedes/ink) — React-style CLI UI
- [Commander.js](https://github.com/tj/commander.js) — Command-line interface
- [execa](https://github.com/sindresorhus/execa) — Safe shell command execution
- [js-yaml](https://github.com/nodeca/js-yaml) — YAML parsing
- AI API wrappers for OpenAI GPT, Anthropic Claude, Google Gemini
- Bundling with [pkg](https://github.com/vercel/pkg) or [nexe](https://github.com/nexe/nexe) for cross-platform binaries

## ⚡ Cross-Platform Support

| Platform | Notes                                             |
| -------- | ------------------------------------------------- |
| Linux    | Native environment, default shell `bash` or `zsh` |
| macOS    | Test on macOS hardware or GitHub Actions runner   |
| Windows  | Support via WSL, native Node, or Wine             |

## 🔒 Intellectual Property & Naming

**Note:** This project is inspired by AWS Kiro but is NOT affiliated with, endorsed by, or sponsored by Amazon or the Kiro platform.

This project is named **KiroCLI** as an independent implementation.

## 🧩 Project Structure

```
/KiroCLI
├── src/
│   ├── index.ts            # CLI entry point
│   ├── app.tsx             # Main application component
│   ├── ai/                 # AI API wrappers
│   │   ├── index.ts        # Main AI provider interface
│   │   ├── factory.ts      # AI provider factory
│   │   ├── providers/      # Individual AI providers
│   │   └── types.ts        # AI interfaces and types
│   ├── commands/           # Command implementations
│   │   ├── chat.tsx        # AI chat interface
│   │   ├── config.tsx      # Configuration management
│   │   ├── spec.tsx        # Spec-driven development
│   │   └── hook.tsx        # Agent hooks management
│   ├── components/         # UI components
│   │   ├── MainMenu.tsx    # Main menu interface
│   │   └── CommandLine.tsx # Internal command line
│   ├── config/             # Configuration management
│   ├── parser/             # YAML spec parsing
│   └── hooks/              # Agent hook system
├── .kiro/                  # Spec & hook configs
│   ├── config/             # Configuration files
│   ├── hooks/              # Hook definitions
│   └── spec.yaml           # Example spec file
├── package.json
├── tsconfig.json
└── README.md
```

## 🚀 Command Reference

| Command                                   | Description                   | Options                                          |
| ----------------------------------------- | ----------------------------- | ------------------------------------------------ |
| `kirocli`                                 | Start main menu               |                                                  |
| `kirocli menu`                            | Show main menu                |                                                  |
| `kirocli chat`                            | Start AI chat                 | `--model <model>`                                |
| `kirocli config show`                     | Show configuration            |                                                  |
| `kirocli config test`                     | Test API connections          |                                                  |
| `kirocli config set-key <provider> <key>` | Set API key                   | `openai`, `claude`, `gemini`                     |
| `kirocli spec init`                       | Create new spec               | `--file <path>`, `--template <type>`             |
| `kirocli spec validate`                   | Validate spec file            | `--file <path>`                                  |
| `kirocli spec build`                      | Generate code from spec       | `--file <path>`                                  |
| `kirocli hook list`                       | List available hooks          | `--category <category>`                          |
| `kirocli hook run <name>`                 | Run specific hook             |                                                  |
| `kirocli hook create`                     | Create new hook               | `--template <template>`, `--category <category>` |
| `kirocli hook templates`                  | List available hook templates |                                                  |
| `kirocli hook stats`                      | Show hook statistics          |                                                  |
| `kirocli hook enable <name>`              | Enable a hook                 |                                                  |
| `kirocli hook disable <name>`             | Disable a hook                |                                                  |
| `kirocli hook delete <name>`              | Delete a hook                 |                                                  |

## 📜 License

MIT License © Jeman Alex.

## 🙌 Contributions

Contributions are welcome! Please open issues or pull requests for improvements, bug fixes, or new features.

## 🤝 Disclaimer

This project uses AI APIs which may send your commands or code to third-party services. Use responsibly and avoid sensitive data.

---

## 🔧 Troubleshooting

### Command Not Found

If `kirocli` command is not found after installation:

```bash
# Make sure you've built the project
npm run build

# Link it globally
npm link

# If that doesn't work, try installing globally
npm install -g .

# Check if it's in your PATH
which kirocli
```

### API Key Issues

If you're having trouble with API keys:

```bash
# Check your current configuration
kirocli config show

# Test API connections
kirocli config test

# Set a new API key
kirocli config set-key openai "your-new-key"
```

### Navigation Tips

- Press **Escape** to return to previous screen
- Press **Ctrl+M** as an alternative to return to menu
- Press **Ctrl+C** to exit completely
- Use **↑↓** arrow keys in command line for history

### Common Issues

1. **Node.js version**: Make sure you're using Node.js v16 or higher
2. **Permission errors**: On some systems, you might need to use `sudo npm link`
3. **Windows users**: Consider using WSL for the best experience
4. **Build errors**: Run `npm install` again if you encounter TypeScript compilation issues

## 📞 Contact

For questions or help, reach out at [lxjeman@gmail.com](mailto:lxjeman@gmail.com)

---

**Enjoy building with KiroCLI!** 🚀
