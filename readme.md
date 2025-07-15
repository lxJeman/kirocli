# KiroCLI — AI Developer Terminal Copilot

![Alt text](https://imgur.com/Get4U9q.png)

> A cross-platform AI-powered terminal assistant that understands natural language and helps developers run commands, generate code, and automate workflows — all from the command line.

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

### Basic natural language command

```bash
$ kirocli
> Delete all `.log` files recursively

[AI] Suggested command:
rm -rf $(find . -name "*.log")
Run? (y/n) y

✔ Command executed successfully!
```

### Spec-driven code generation

Define your project spec in `.kiro/spec.yaml`:

```yaml
goal: Build a React login form
language: TypeScript
framework: React
features:
  - Email and password inputs
  - Validation
  - Submit button
```

Generate code with:

```bash
kirocli spec build
```

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

| Command | Description | Options |
|---------|-------------|---------|
| `kirocli` | Start main menu | |
| `kirocli menu` | Show main menu | |
| `kirocli chat` | Start AI chat | `--model <model>` |
| `kirocli config show` | Show configuration | |
| `kirocli config test` | Test API connections | |
| `kirocli config set-key <provider> <key>` | Set API key | `openai`, `claude`, `gemini` |
| `kirocli spec validate` | Validate spec file | `--file <path>` |
| `kirocli spec build` | Generate code from spec | `--file <path>` |
| `kirocli spec init` | Create new spec | |
| `kirocli hook list` | List available hooks | |
| `kirocli hook run <name>` | Run specific hook | |
| `kirocli hook create` | Create new hook | |

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
