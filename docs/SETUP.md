# KiroCLI Development Setup Guide

This guide covers setting up the development environment and CI/CD pipeline for KiroCLI.

## 🚀 Quick Start

### Prerequisites

- **Node.js 16+** (18+ recommended)
- **npm** or **yarn**
- **Git**

### Local Development Setup

```bash
# Clone the repository
git clone https://github.com/your-username/kirocli.git
cd kirocli

# Install dependencies
npm install

# Build the project
npm run build

# Test the CLI
node dist/cli.js --help

# Start development mode (watch for changes)
npm run dev
```

### Available Scripts

```bash
# Development
npm run dev          # Watch mode compilation
npm run build        # Production build
npm run start        # Run the built CLI
npm run dev:run      # Build and run

# Testing & Quality
npm test            # Run all tests (prettier, xo, ava)
npm run lint        # Run linting only
npm run lint:fix    # Fix linting issues automatically

# Distribution
npm run dist        # Create all platform packages
npm run dist:linux  # Create Linux package only
npm run dist:macos  # Create macOS package only
npm run dist:windows # Create Windows package only
npm run clean:dist  # Clean distribution directory

# Legacy binary packaging (experimental)
npm run package:all     # Create binaries with pkg
npm run clean:binaries  # Clean binaries directory
```

## 🔧 GitHub Actions Setup

The project includes three GitHub Actions workflows:

### 1. Continuous Integration (`ci.yml`)

**Triggers**: Push to `main`/`master` branches
**Purpose**: Full testing and cross-platform package creation

**What it does**:

- ✅ Tests on Node.js 16, 18, and 20
- ✅ Runs linting and tests
- ✅ Builds TypeScript
- ✅ Creates distribution packages for all platforms
- ✅ Tests packages on Linux, macOS, and Windows
- ✅ Uploads artifacts for 30 days

### 2. Development Build (`dev-build.yml`)

**Triggers**: Push to feature branches, PRs
**Purpose**: Quick validation for development

**What it does**:

- ✅ Quick test and build validation
- ✅ Creates Linux package for testing
- ✅ Uploads development artifacts for 7 days

### 3. Release (`release.yml`)

**Triggers**: Git tags (`v*`), manual dispatch
**Purpose**: Create GitHub releases with downloadable packages

**What it does**:

- ✅ Creates full cross-platform packages
- ✅ Creates GitHub release with changelog
- ✅ Uploads packages as release assets
- ✅ Supports both stable and pre-releases

## 📋 Setting Up GitHub Actions

### Step 1: Repository Setup

1. **Push your code to GitHub**:

   ```bash
   git add .
   git commit -m "feat: add GitHub Actions workflows"
   git push origin main
   ```

2. **Enable GitHub Actions** (usually enabled by default):
   - Go to your repository on GitHub
   - Click on the "Actions" tab
   - GitHub Actions should be automatically enabled

### Step 2: Verify Workflows

After pushing, you should see:

1. **CI Workflow** running on the main branch
2. **Artifacts** being created and uploaded
3. **Status badges** showing build status

### Step 3: Create Your First Release

```bash
# Create and push a version tag
git tag v1.0.0
git push origin v1.0.0
```

This will trigger the release workflow and create:

- GitHub release with changelog
- Downloadable packages for all platforms
- Release assets attached to the release

## 🔍 Monitoring Builds

### GitHub Actions Dashboard

Visit `https://github.com/your-username/kirocli/actions` to see:

- ✅ Build status for all workflows
- 📦 Downloadable artifacts
- 📊 Build history and performance
- 🐛 Error logs and debugging info

### Build Artifacts

After successful builds, you can download:

**From CI builds**:

- `kirocli-linux-portable-{commit-sha}`
- `kirocli-macos-portable-{commit-sha}`
- `kirocli-windows-portable-{commit-sha}`
- `kirocli-all-platforms-{commit-sha}`

**From releases**:

- `kirocli-linux-portable.tar.gz`
- `kirocli-macos-portable.tar.gz`
- `kirocli-windows-portable.tar.gz`

## 🐛 Troubleshooting

### Common Issues

#### Build Fails on Dependencies

```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

#### TypeScript Compilation Errors

```bash
# Check TypeScript configuration
npx tsc --noEmit
npm run lint
```

#### Package Creation Fails

```bash
# Test distribution creation locally
npm run build
npm run dist:linux
```

#### GitHub Actions Permission Issues

- Ensure `GITHUB_TOKEN` has proper permissions
- Check repository settings > Actions > General
- Verify workflow permissions are set to "Read and write"

### Debug Mode

Enable debug logging in GitHub Actions by setting repository secrets:

- `ACTIONS_STEP_DEBUG`: `true`
- `ACTIONS_RUNNER_DEBUG`: `true`

### Local Testing

Test the exact same commands that run in CI:

```bash
# Simulate CI environment
npm ci                    # Clean install
npm run lint             # Linting
npm run build            # Build
node dist/cli.js --help  # Test CLI
npm run dist             # Create packages
```

## 🔄 Workflow Customization

### Modify Build Triggers

Edit `.github/workflows/ci.yml`:

```yaml
on:
  push:
    branches: [main, master, develop] # Add more branches
  pull_request:
    branches: [main, master]
  schedule:
    - cron: '0 2 * * 0' # Weekly builds
```

### Add Environment Variables

```yaml
env:
  NODE_ENV: production
  CUSTOM_VAR: value
```

### Add Secrets

For API keys or sensitive data:

1. Go to repository Settings > Secrets and variables > Actions
2. Add repository secrets
3. Use in workflows: `${{ secrets.SECRET_NAME }}`

## 📊 Status Badges

Add to your README.md:

```markdown
[![CI](https://github.com/your-username/kirocli/actions/workflows/ci.yml/badge.svg)](https://github.com/your-username/kirocli/actions/workflows/ci.yml)
[![Release](https://github.com/your-username/kirocli/actions/workflows/release.yml/badge.svg)](https://github.com/your-username/kirocli/actions/workflows/release.yml)
```

## 🚀 Advanced Configuration

### Matrix Builds

Test on multiple Node.js versions and operating systems:

```yaml
strategy:
  matrix:
    node-version: [16, 18, 20]
    os: [ubuntu-latest, macos-latest, windows-latest]
```

### Conditional Steps

```yaml
- name: Linux-specific step
  if: runner.os == 'Linux'
  run: echo "Running on Linux"
```

### Artifact Management

```yaml
- name: Upload with custom retention
  uses: actions/upload-artifact@v4
  with:
    name: my-artifact
    path: dist/
    retention-days: 90 # Keep for 90 days
```

## 📝 Best Practices

1. **Keep workflows fast**: Use caching and parallel jobs
2. **Test locally first**: Always test changes locally before pushing
3. **Use semantic versioning**: Follow `v1.0.0` format for releases
4. **Monitor build times**: Optimize slow steps
5. **Keep secrets secure**: Never commit API keys or passwords
6. **Use descriptive commit messages**: Helps with automated changelogs

## 🎯 Next Steps

1. **Push your code** to trigger the first build
2. **Monitor the Actions tab** for build results
3. **Create a release tag** to test the release workflow
4. **Download and test** the generated packages
5. **Customize workflows** as needed for your specific requirements

---

Your GitHub Actions setup is now complete! Every commit to master will automatically build and test your KiroCLI application across all platforms. 🎉
