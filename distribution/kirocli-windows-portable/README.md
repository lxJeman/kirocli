# KiroCLI Portable Distribution

This is a portable distribution of KiroCLI that includes all dependencies.

## Requirements

- Node.js 16+ (must be installed separately)

## Installation

### Windows


1. Extract this package to your desired location
2. Add the package directory to your PATH, or
3. Run directly using:
   - `kirocli.bat` (Command Prompt)
   - `kirocli.ps1` (PowerShell)

#### Adding to PATH (Windows)
1. Open System Properties > Environment Variables
2. Add the package directory to your PATH
3. Open a new terminal and run `kirocli`


## Usage

After installation, you can use KiroCLI from anywhere:

```bash
# Show help
kirocli --help

# Start AI chat
kirocli chat

# Validate a spec file
kirocli spec validate

# Show configuration
kirocli config show
```

## Configuration

Run the setup command to configure your AI API keys:

```bash
kirocli config setup
```

## Features

- ✅ AI Chat with OpenAI, Claude, and Gemini
- ✅ Spec-driven code generation
- ✅ Agent hooks for workflow automation
- ✅ Cross-platform shell command execution
- ✅ Enhanced terminal UI with syntax highlighting
- ✅ Persistent conversation history

## Support

- **Documentation**: https://github.com/your-repo/kirocli
- **Issues**: https://github.com/your-repo/kirocli/issues

---

Built with ❤️ using Node.js, React, and Ink
