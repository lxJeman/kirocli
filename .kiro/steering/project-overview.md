# 🛠️ Project Guide: AI Dev Terminal Copilot ("KiroCLI")

## 🧩 Goal

Build a **cross-platform terminal app (CLI tool)** that acts as an AI developer assistant. It interprets natural language to:

* Run shell commands
* Generate, edit, and explain code
* Automate tasks via "agent hooks" (or automatons)
* Support spec-driven development (e.g., `.kiro/spec.yaml`)
* Be distributable as `.exe`, `.app`, and ELF binaries (aka be cross-platform)

> Inspired by AWS Kiro, but this project is **not affiliated** with AWS or kiro.dev.

---

## 🎯 Features

| Feature                          | Description                                                   |
| -------------------------------- | ------------------------------------------------------------- |
| 🧠 AI Command Interpretation     | Converts user’s natural input to actionable terminal commands |
| ⚙️ Cross-platform CLI            | Runs on Linux, macOS, and Windows |
| 📂 Hooks System                  | Automates dev workflows, git tasks, and custom shell scripts  |
| 📜 Spec-to-Code Generator        | Accepts `.yaml` specs to auto-generate code using AI          |
| 🧪 Dev Tools Integration         | Wraps LLMs like GPT, Claude, or Gemini for in-terminal use    |
| 🧵 Plugin-ready (optional later) | Extensible system to register new tools or commands           |

---

## ⚒️ Tech Stack Overview

| Component                      | Tool / Stack Used                                                            |
| ------------------------------ | ---------------------------------------------------------------------------- |
| CLI UI framework (React style) | [Ink](https://github.com/vadimdemedes/ink)                                   |
| Shell command runner           | [execa](https://github.com/sindresorhus/execa) (preferred) or shelljs        |
| Cross-platform bundler         | [pkg](https://github.com/vercel/pkg) or [nexe](https://github.com/nexe/nexe) |
| OS detection                   | `os.platform()` or `process.env.SHELL` in Node.js                            |
| Code generation (AI)           | OpenAI GPT, Claude, Gemini APIs (abstracted in one wrapper file)             |
| Prompt templating              | YAML + natural language                                                      |
| Spec parser                    | `js-yaml` to read `.kiro/spec.yaml`                                          |
| Terminal entry point           | `#!/usr/bin/env node` Node CLI using `commander` or `yargs`                  |

---

## 🗂️ Project Structure

```
/KiroCLI
  ├── /src
  │   ├── index.ts         ← Entry CLI file
  │   ├── ai/index.ts      ← Wrapper around GPT/Claude/Gemini
  │   ├── hooks.ts         ← Custom agent hook system
  │   ├── parser/spec.ts   ← Reads YAML spec and converts to code
  │   └── executor.ts      ← Runs safe shell commands via execa
  ├── /.kiro/               ← Spec, hook, and steering configs
  ├── /dist/                ← Compiled CLI files
  ├── package.json
  ├── tsconfig.json
  └── README.md
```

---

## 🧪 Dev & Build Tools

| Purpose         | Tool/Command                                     |
| --------------- | ------------------------------------------------ |
| Dev script      | `ts-node src/index.ts` or `npm run dev`          |
| Build CLI       | `pkg .` or `nexe -i dist/index.js -o KiroCLI` |
| Install         | `npm install`                                    |
| Format/Lint     | `eslint . && prettier --write .`                 |
| Test (optional) | `jest` or `vitest`                               |

---

## 📦 Required NPM Packages

```bash
npm install ink execa commander js-yaml os
npm install -D typescript @types/node
```

Optional:

```bash
npm install openai @anthropic-ai/sdk google-genai
npm install shelljs ora chalk inquirer
```

---

## 📁 Example Usage

```
$ KiroCLI
> How do I delete all .log files recursively?

[AI] Suggested:
rm -rf $(find . -name "*.log")
[Run? y/n]

> y
✔ Command executed!
```

Or via spec:

```yaml
# /.kiro/spec.yaml
goal: "Build a React login form"
language: "TypeScript"
framework: "React"
features:
  - Email + password fields
  - Validation
  - Submit button
```

```
$ KiroCLI spec build
🛠️  Generated code in ./output/LoginForm.tsx
```

---

## ✅ OS Compatibility Notes

| Platform | Test Strategy                                 |
| -------- | --------------------------------------------- |
| Linux    | Native development, default shell: `bash/zsh` |
| Windows  | Test in **WSL**, **Wine**, or real Windows VM |
| macOS    | Use GitHub Actions macOS runner or real Mac   |

---

## ⚠️ Naming/IP Notes

* Do **not** use "KiroCLI" as the final project name to avoid IP conflict.
* Suggested names: `KiroCLI`, `TermFlow`, `DevCom`, `Clairo`, `SmartShell`
* Add disclaimer in README:

  > “This project is inspired by AWS Kiro, but not affiliated with or endorsed by Amazon or kiro.dev.”

---

## 🔒 License

MIT License
Ensure no LLM model output includes copyrighted content.

---

## 📋 Final Notes for AI Copilot (Kiro)

```yaml
project:
  name: KiroCLI
  description: "A cross-platform AI-powered terminal assistant for developers."
  goals:
    - Translate natural language to terminal commands
    - Run cross-platform (Linux, macOS, Windows)
    - Support spec-to-code and agent hooks
    - Work offline (optional)
  tech_stack:
    - Node.js (TypeScript)
    - Ink (CLI UI)
    - execa (safe shell exec)
    - pkg/nexe (distribution)
    - js-yaml, openai/gemini/claude SDKs
  tasks:
    - Create a CLI shell
    - Connect to AI backends
    - Add .kiro YAML spec parser
    - Automate git/workspace tasks via hooks
    - Package for all OSes
```