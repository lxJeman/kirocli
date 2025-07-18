#!/bin/bash

# GitHub Actions Setup Script for KiroCLI
# This script helps set up the repository for automated builds

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 KiroCLI GitHub Actions Setup${NC}"
echo "=================================="
echo ""

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo -e "${RED}❌ Error: Not in a git repository${NC}"
    echo "Please run this script from the root of your KiroCLI repository."
    exit 1
fi

# Check if GitHub workflows directory exists
if [ ! -d ".github/workflows" ]; then
    echo -e "${RED}❌ Error: .github/workflows directory not found${NC}"
    echo "Please ensure you have the GitHub Actions workflow files in .github/workflows/"
    exit 1
fi

echo -e "${GREEN}✅ Repository structure looks good${NC}"
echo ""

# List available workflows
echo -e "${BLUE}📋 Available GitHub Actions workflows:${NC}"
for workflow in .github/workflows/*.yml; do
    if [ -f "$workflow" ]; then
        workflow_name=$(basename "$workflow" .yml)
        echo "  • $workflow_name"
    fi
done
echo ""

# Check if remote origin is set
if ! git remote get-url origin > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Warning: No remote origin set${NC}"
    echo "You'll need to set up a GitHub repository first:"
    echo "  git remote add origin https://github.com/your-username/kirocli.git"
    echo ""
else
    REMOTE_URL=$(git remote get-url origin)
    echo -e "${GREEN}✅ Remote origin: ${REMOTE_URL}${NC}"
    echo ""
fi

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)
echo -e "${BLUE}📍 Current branch: ${CURRENT_BRANCH}${NC}"

if [ "$CURRENT_BRANCH" != "main" ] && [ "$CURRENT_BRANCH" != "master" ]; then
    echo -e "${YELLOW}⚠️  Note: You're not on main/master branch${NC}"
    echo "CI builds will trigger when you push to main/master"
    echo ""
fi

# Check if there are uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo -e "${YELLOW}⚠️  You have uncommitted changes${NC}"
    echo "Consider committing your changes before pushing:"
    echo "  git add ."
    echo "  git commit -m 'feat: add GitHub Actions workflows'"
    echo ""
fi

# Test build locally
echo -e "${BLUE}🔨 Testing local build...${NC}"
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Local build successful${NC}"
else
    echo -e "${RED}❌ Local build failed${NC}"
    echo "Please fix build issues before pushing to GitHub"
    exit 1
fi

# Test CLI functionality
echo -e "${BLUE}🧪 Testing CLI functionality...${NC}"
if node dist/cli.js --help > /dev/null 2>&1; then
    echo -e "${GREEN}✅ CLI functionality test passed${NC}"
else
    echo -e "${RED}❌ CLI functionality test failed${NC}"
    echo "Please ensure the CLI works correctly before pushing"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 Setup validation complete!${NC}"
echo ""

# Provide next steps
echo -e "${BLUE}📋 Next Steps:${NC}"
echo ""
echo "1. ${YELLOW}Push to GitHub${NC} (if you haven't already):"
echo "   git add ."
echo "   git commit -m 'feat: add GitHub Actions workflows'"
echo "   git push origin ${CURRENT_BRANCH}"
echo ""

echo "2. ${YELLOW}Monitor the build${NC}:"
echo "   Visit: https://github.com/your-username/kirocli/actions"
echo ""

echo "3. ${YELLOW}Create your first release${NC}:"
echo "   git tag v1.0.0"
echo "   git push origin v1.0.0"
echo ""

echo "4. ${YELLOW}Add status badges${NC} to your README.md:"
echo "   [![CI](https://github.com/your-username/kirocli/actions/workflows/ci.yml/badge.svg)](https://github.com/your-username/kirocli/actions/workflows/ci.yml)"
echo ""

echo -e "${BLUE}📚 Documentation:${NC}"
echo "  • Setup Guide: SETUP.md"
echo "  • Installation: INSTALL.md"
echo "  • Project Status: TODO.md"
echo ""

echo -e "${GREEN}✨ Your GitHub Actions are ready to go!${NC}"
echo "Every commit to master will now automatically build and test KiroCLI."