#!/bin/bash

# KiroCLI Auto-Update Script
# This script automates the process of updating and maintaining KiroCLI

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "\n${BLUE}================================${NC}"
    echo -e "${BLUE} $1${NC}"
    echo -e "${BLUE}================================${NC}\n"
}

# Check if we're in the right directory
check_project_directory() {
    if [[ ! -f "package.json" ]] || [[ ! -d "src" ]]; then
        print_error "This doesn't appear to be a KiroCLI project directory."
        print_error "Please run this script from the KiroCLI project root."
        exit 1
    fi
    
    if ! grep -q "kirocli" package.json; then
        print_warning "This might not be a KiroCLI project."
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
}

# Check Node.js version
check_node_version() {
    print_status "Checking Node.js version..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 16+ first."
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [[ $NODE_VERSION -lt 16 ]]; then
        print_error "Node.js version 16+ is required. Current version: $(node -v)"
        exit 1
    fi
    
    print_success "Node.js version: $(node -v)"
}

# Install dependencies
install_dependencies() {
    print_header "Installing Dependencies"
    
    print_status "Installing npm dependencies..."
    npm install
    
    print_success "Dependencies installed successfully!"
}

# Build the project
build_project() {
    print_header "Building Project"
    
    print_status "Compiling TypeScript..."
    npm run build
    
    if [[ $? -eq 0 ]]; then
        print_success "Build completed successfully!"
    else
        print_error "Build failed. Please check the errors above."
        exit 1
    fi
}

# Test the CLI
test_cli() {
    print_header "Testing CLI"
    
    print_status "Testing basic CLI functionality..."
    
    # Test help command
    if node dist/index.js --help > /dev/null 2>&1; then
        print_success "✓ Help command works"
    else
        print_error "✗ Help command failed"
        return 1
    fi
    
    # Test config command
    if node dist/index.js config --help > /dev/null 2>&1; then
        print_success "✓ Config command works"
    else
        print_error "✗ Config command failed"
        return 1
    fi
    
    # Test spec command
    if node dist/index.js spec --help > /dev/null 2>&1; then
        print_success "✓ Spec command works"
    else
        print_error "✗ Spec command failed"
        return 1
    fi
    
    # Test hook command
    if node dist/index.js hook --help > /dev/null 2>&1; then
        print_success "✓ Hook command works"
    else
        print_error "✗ Hook command failed"
        return 1
    fi
    
    print_success "All CLI tests passed!"
}

# Setup API keys interactively
setup_api_keys() {
    print_header "API Key Setup"
    
    print_status "Checking current API key configuration..."
    
    # Check if any API keys are already configured
    if node dist/index.js config show | grep -q "✅ Configured"; then
        print_success "Some API keys are already configured."
        read -p "Do you want to update API keys? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            return 0
        fi
    fi
    
    echo
    print_status "You can set up API keys for the following providers:"
    echo "  1. OpenAI (GPT-4, GPT-3.5) - https://platform.openai.com/api-keys"
    echo "  2. Anthropic Claude - https://console.anthropic.com/"
    echo "  3. Google Gemini - https://makersuite.google.com/app/apikey"
    echo
    
    # OpenAI setup
    read -p "Do you want to set up OpenAI API key? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -n "Enter your OpenAI API key: "
        read -s OPENAI_KEY
        echo
        if [[ -n "$OPENAI_KEY" ]]; then
            node dist/index.js config set-key openai "$OPENAI_KEY"
            print_success "OpenAI API key configured!"
        fi
    fi
    
    # Claude setup
    read -p "Do you want to set up Claude API key? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -n "Enter your Claude API key: "
        read -s CLAUDE_KEY
        echo
        if [[ -n "$CLAUDE_KEY" ]]; then
            node dist/index.js config set-key claude "$CLAUDE_KEY"
            print_success "Claude API key configured!"
        fi
    fi
    
    # Gemini setup
    read -p "Do you want to set up Gemini API key? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -n "Enter your Gemini API key: "
        read -s GEMINI_KEY
        echo
        if [[ -n "$GEMINI_KEY" ]]; then
            node dist/index.js config set-key gemini "$GEMINI_KEY"
            print_success "Gemini API key configured!"
        fi
    fi
}

# Test API connections
test_api_connections() {
    print_header "Testing API Connections"
    
    print_status "Testing configured API providers..."
    node dist/index.js config test
    
    echo
    print_status "Running comprehensive AI provider tests..."
    if [[ -f "dist/ai/test-providers.js" ]]; then
        node dist/ai/test-providers.js
    else
        print_warning "Comprehensive test not available."
    fi
}

# Create global symlink (optional)
setup_global_access() {
    print_header "Global Access Setup"
    
    read -p "Do you want to install KiroCLI globally for easy access? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Installing globally..."
        npm install -g .
        print_success "KiroCLI installed globally! You can now use 'kirocli' from anywhere."
    else
        print_status "You can run KiroCLI with: node dist/index.js"
        print_status "Or add an alias: alias kirocli='node $(pwd)/dist/index.js'"
    fi
}

# Show usage instructions
show_usage_instructions() {
    print_header "Usage Instructions"
    
    echo -e "${GREEN}🎉 KiroCLI is ready to use!${NC}\n"
    
    echo "Basic commands:"
    echo "  kirocli                    # Start AI chat mode (with improved UI)"
    echo "  kirocli chat               # Start AI chat mode (with improved UI)"
    echo "  kirocli config show        # Show configuration"
    echo "  kirocli config test        # Test API connections"
    echo "  kirocli spec build         # Generate code from specs"
    echo "  kirocli hook list          # List available hooks"
    echo
    
    echo "Configuration:"
    echo "  kirocli config set-key openai \"your-key\"   # Set OpenAI API key"
    echo "  kirocli config set-key claude \"your-key\"   # Set Claude API key"
    echo "  kirocli config set-key gemini \"your-key\"   # Set Gemini API key"
    echo
    
    echo "Examples:"
    echo "  kirocli                                      # Start chatting (improved UI)"
    echo "  kirocli chat --model=claude-3-sonnet-20240229  # Use specific model"
    echo "  kirocli spec init                            # Create new spec file"
    echo ""
    echo "Chat Features:"
    echo "  • Enter key sends messages"
    echo "  • Backspace key edits messages"
    echo "  • Beautiful bordered interface"
    echo "  • Differentiated user vs AI messages"
    echo "  • Loading indicators and visual feedback"
    echo
    
    print_success "Happy coding with KiroCLI! 🚀"
}

# Main execution
main() {
    print_header "KiroCLI Auto-Update Script"
    
    print_status "Starting KiroCLI update process..."
    
    # Run all steps
    check_project_directory
    check_node_version
    install_dependencies
    build_project
    test_cli
    
    # Interactive steps
    setup_api_keys
    test_api_connections
    setup_global_access
    show_usage_instructions
    
    print_success "KiroCLI update completed successfully! 🎉"
}

# Handle script arguments
case "${1:-}" in
    --help|-h)
        echo "KiroCLI Auto-Update Script"
        echo
        echo "Usage: $0 [options]"
        echo
        echo "Options:"
        echo "  --help, -h     Show this help message"
        echo "  --build-only   Only build the project (skip interactive setup)"
        echo "  --test-only    Only run tests (skip build and setup)"
        echo
        echo "This script will:"
        echo "  1. Check Node.js version and project structure"
        echo "  2. Install dependencies"
        echo "  3. Build the TypeScript project"
        echo "  4. Test CLI functionality"
        echo "  5. Interactively set up API keys"
        echo "  6. Test API connections"
        echo "  7. Optionally install globally"
        exit 0
        ;;
    --build-only)
        check_project_directory
        check_node_version
        install_dependencies
        build_project
        test_cli
        print_success "Build completed successfully!"
        exit 0
        ;;
    --test-only)
        check_project_directory
        test_cli
        test_api_connections
        exit 0
        ;;
    "")
        main
        ;;
    *)
        print_error "Unknown option: $1"
        print_status "Use --help for usage information"
        exit 1
        ;;
esac