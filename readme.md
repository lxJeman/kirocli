# KiroCLI — AI Developer Terminal Copilot

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

Clone the repo and install dependencies:

```bash
git clone https://github.com/lxJeman/kirocli.git
cd kirocli
npm install

```

### Running in development

```bash
npm run dev
# or
npx ts-node src/index.ts
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

## 🛠️ Tech Stack & Libraries

- [Node.js](https://nodejs.org/) + [TypeScript](https://www.typescriptlang.org/)
- [Ink](https://github.com/vadimdemedes/ink) — React-style CLI UI
- [execa](https://github.com/sindresorhus/execa) — safe shell command execution
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
│   ├── ai/                 # AI API wrappers
│   ├── hooks.ts            # Agent hook system
│   ├── parser/spec.ts      # Spec parser
│   └── executor.ts         # Shell command executor
├── .kiro/                  # Spec & hook configs
├── package.json
├── tsconfig.json
└── README.md
```

## 📜 License

MIT License © Jeman Alex.

## 🙌 Contributions

Contributions are welcome! Please open issues or pull requests for improvements, bug fixes, or new features.

## 🤝 Disclaimer

This project uses AI APIs which may send your commands or code to third-party services. Use responsibly and avoid sensitive data.

---

## 📞 Contact

For questions or help, reach out at \[[lxjeman@gmail.com](mailto:lxjeman@gmail.com)]

---

**Enjoy building with KiroCLI!** 🚀
