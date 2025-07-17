# KiroCLI Installation Guide

This guide covers all installation methods for KiroCLI across different platforms.

## 📋 Requirements

- **Node.js 16+** (required for all installation methods)
- **Operating System**: Linux, macOS, or Windows
- **Terminal**: Any modern terminal (bash, zsh, PowerShell, etc.)

## 🚀 Quick Installation

### Option 1: Portable Packages (Recommended)

Download the pre-built portable package for your platform from the [latest release](https://github.com/your-repo/kirocli/releases/latest):

#### Linux
```bash
# Download and extract
wget https://github.com/your-repo/kirocli/releases/latest/download/kirocli-linux-portable.tar.gz
tar -xzf kirocli-linux-portable.tar.gz
cd kirocli-linux-portable

# Test installation
./kirocli --help

# Optional: Add to PATH
echo 'export PATH="$PATH:$(pwd)"' >> ~/.bashrc
source ~/.bashrc
```

#### macOS
```bash
# Download and extract
curl -L -o kirocli-macos-portable.tar.gz https://github.com/your-repo/kirocli/releases/latest/download/kirocli-macos-portable.tar.gz
tar -xzf kirocli-macos-portable.tar.gz
cd kirocli-macos-portable

# Test installation
./kirocli --help

# Optional: Add to PATH
echo 'export PATH="$PATH:$(pwd)"' >> ~/.zshrc
source ~/.zshrc
```

#### Windows
```powershell
# Download kirocli-windows-portable.tar.gz from releases page
# Extract using 7-Zip or Windows built-in extraction
# Navigate to extracted folder

# Test installation (Command Prompt)
kirocli.bat --help

# Test installation (PowerShell)
.\kirocli.ps1 --help

# Optional: Add to PATH via System Properties > Environment Variables
```

### Option 2: NPM Installation (Coming Soon)

```bash
npm install -g kirocli
```

### Option 3: Build from Source

```bash
# Clone repository
git clone https://github.com/your-repo/kirocli.git
cd kirocli

# Install dependencies
npm install

# Build application
npm run build

# Run directly
node dist/cli.js --help

# Or create distribution packages
npm run dist
```

## ⚙️ Configuration

After installation, configure your AI API keys:

```bash
kirocli config setup
```

This will guide you through setting up API keys for:
- **OpenAI** (GPT-4, GPT-3.5-turbo)
- **Anthropic Claude** (Claude-3-sonnet, Claude-3-haiku)
- **Google Gemini** (Gemini-pro)

### Manual Configuration

You can also set API keys manually:

```bash
# Set OpenAI API key
kirocli config set-key openai your-openai-api-key

# Set Claude API key
kirocli config set-key claude your-claude-api-key

# Set Gemini API key
kirocli config set-key gemini your-gemini-api-key

# Verify configuration
kirocli config show
```

## 🧪 Verify Installation

Test your installation with these commands:

```bash
# Show help
kirocli --help

# Check configuration
kirocli config show

# Test AI providers (requires API keys)
kirocli config test

# Start interactive chat
kirocli chat

# Validate a spec file
kirocli spec validate

# List available hooks
kirocli hook list
```

## 🔧 Platform-Specific Notes

### Linux
- **Shell**: Works with bash, zsh, fish, and other POSIX shells
- **Dependencies**: Requires glibc 2.17+ (most modern distributions)
- **Installation**: Can be installed system-wide in `/usr/local/bin/`

### macOS
- **Shell**: Works with zsh (default), bash, and other shells
- **Dependencies**: Requires macOS 10.13+ (High Sierra)
- **Installation**: Can be installed system-wide in `/usr/local/bin/`

### Windows
- **Shell**: Works with Command Prompt, PowerShell, and WSL
- **Dependencies**: Requires Windows 10+ (x64)
- **Installation**: Can be added to PATH or placed in `%USERPROFILE%\AppData\Local\Microsoft\WindowsApps\`

### WSL (Windows Subsystem for Linux)
KiroCLI automatically detects WSL and adapts command execution accordingly.

## 🚨 Troubleshooting

### Common Issues

#### "Node.js not found"
```bash
# Install Node.js from https://nodejs.org/
# Or use a package manager:

# Ubuntu/Debian
sudo apt install nodejs npm

# macOS (Homebrew)
brew install node

# Windows (Chocolatey)
choco install nodejs
```

#### "Permission denied" (Linux/macOS)
```bash
# Make the binary executable
chmod +x kirocli

# Or run with explicit permissions
bash kirocli --help
```

#### "API key not configured"
```bash
# Run the setup wizard
kirocli config setup

# Or set keys manually
kirocli config set-key openai your-api-key
```

#### "Command not found"
```bash
# Add to PATH (Linux/macOS)
export PATH="$PATH:/path/to/kirocli"

# Or create a symlink
sudo ln -s /path/to/kirocli/kirocli /usr/local/bin/kirocli
```

### Debug Mode

Enable debug mode for detailed logging:

```bash
# Set debug environment variable
export KIROCLI_DEBUG=true
kirocli chat

# Or use verbose flag
kirocli --verbose config test
```

### Getting Help

- **Documentation**: [README.md](README.md)
- **Issues**: [GitHub Issues](https://github.com/your-repo/kirocli/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/kirocli/discussions)

## 🔄 Updates

### Portable Packages
Download the latest release and replace your existing installation.

### NPM Installation
```bash
npm update -g kirocli
```

### Build from Source
```bash
git pull origin main
npm install
npm run build
```

## 🗑️ Uninstallation

### Portable Packages
Simply delete the installation directory and remove from PATH if added.

### NPM Installation
```bash
npm uninstall -g kirocli
```

### Configuration Cleanup
```bash
# Remove configuration directory
rm -rf ~/.kirocli  # Linux/macOS
rmdir /s "%USERPROFILE%\.kirocli"  # Windows
```

---

## 🎉 You're Ready!

Once installed and configured, you can start using KiroCLI:

```bash
# Start with the interactive menu
kirocli

# Or jump straight into AI chat
kirocli chat

# Generate code from specifications
kirocli spec build

# Automate workflows with hooks
kirocli hook list
```

Welcome to the future of AI-powered development! 🚀