# KiroCLI Portable Distribution

This is a portable distribution of KiroCLI that includes all dependencies.

## Requirements

- Node.js 16+ (must be installed separately)

## Installation

### Linux/macOS


1. Extract this package to your desired location (e.g., /opt/kirocli)
2. Add to your PATH or create a symlink:
   ```bash
   # Option 1: Add to PATH
   echo 'export PATH="$PATH:/path/to/kirocli-macos-portable"' >> ~/.bashrc
   source ~/.bashrc
   
   # Option 2: Create symlink
   sudo ln -s /path/to/kirocli-macos-portable/kirocli /usr/local/bin/kirocli
   ```
3. Run `kirocli --help` to verify installation


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
