#!/bin/bash

#############################################
# Algorithm Visualizer & dStack Templates
# Complete Installation Script
# Version: 1.0.0
#############################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ASCII Art Banner
echo -e "${PURPLE}"
cat << "EOF"
    ╔═══════════════════════════════════════════════════════╗
    ║     Algorithm Visualizer + dStack Templates          ║
    ║              Complete Installation                    ║
    ╔═══════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Log function
log() {
    echo -e "${CYAN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check system requirements
check_requirements() {
    log "🔍 Checking system requirements..."
    
    local missing_deps=()
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        missing_deps+=("Node.js")
    else
        NODE_VERSION=$(node -v)
        log "✅ Node.js found: ${NODE_VERSION}"
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        missing_deps+=("npm")
    else
        NPM_VERSION=$(npm -v)
        log "✅ npm found: ${NPM_VERSION}"
    fi
    
    # Check Python
    if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
        missing_deps+=("Python 3")
    else
        if command -v python3 &> /dev/null; then
            PYTHON_CMD="python3"
        else
            PYTHON_CMD="python"
        fi
        PYTHON_VERSION=$($PYTHON_CMD --version 2>&1)
        log "✅ Python found: ${PYTHON_VERSION}"
    fi
    
    # Check pip
    if ! command -v pip3 &> /dev/null && ! command -v pip &> /dev/null; then
        missing_deps+=("pip")
    else
        if command -v pip3 &> /dev/null; then
            PIP_CMD="pip3"
        else
            PIP_CMD="pip"
        fi
        PIP_VERSION=$($PIP_CMD --version)
        log "✅ pip found: ${PIP_VERSION}"
    fi
    
    # Check Bun (optional)
    if command -v bun &> /dev/null; then
        BUN_VERSION=$(bun -v)
        log "✅ Bun found: ${BUN_VERSION}"
        HAS_BUN=true
    else
        warning "Bun not found (optional) - Bun server will be skipped"
        HAS_BUN=false
    fi
    
    # Check Git
    if ! command -v git &> /dev/null; then
        missing_deps+=("Git")
    else
        GIT_VERSION=$(git --version)
        log "✅ Git found: ${GIT_VERSION}"
    fi
    
    # Report missing dependencies
    if [ ${#missing_deps[@]} -gt 0 ]; then
        error "Missing required dependencies:"
        for dep in "${missing_deps[@]}"; do
            echo "  - $dep"
        done
        echo ""
        echo "Please install the missing dependencies and run this script again."
        exit 1
    fi
    
    success "All required dependencies are installed!"
}

# Kill processes on specific ports
kill_port() {
    local port=$1
    log "🔫 Killing processes on port $port..."
    
    # For macOS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
    # For Linux
    else
        fuser -k $port/tcp 2>/dev/null || true
    fi
}

# Clean up old processes and ports
cleanup_ports() {
    log "🧹 Cleaning up ports..."
    
    # Kill processes on our application ports
    kill_port 3000  # NextJS
    kill_port 3001  # Alternative NextJS
    kill_port 3002  # Alternative NextJS
    kill_port 8000  # Python API
    kill_port 8001  # Bun server
    
    # Kill any lingering node processes from our app
    pkill -f "next dev" 2>/dev/null || true
    pkill -f "python.*main.py" 2>/dev/null || true
    pkill -f "bun.*index.ts" 2>/dev/null || true
    
    success "Ports cleaned up!"
}

# Install main repository dependencies
install_main_deps() {
    log "📦 Installing main repository dependencies..."
    
    # Clean npm cache first
    npm cache clean --force 2>/dev/null || true
    
    # Remove old node_modules and package-lock if they exist
    if [ -d "node_modules" ]; then
        log "Removing old node_modules..."
        rm -rf node_modules
    fi
    
    if [ -f "package-lock.json" ]; then
        log "Removing old package-lock.json..."
        rm -f package-lock.json
    fi
    
    # Install main dependencies
    log "Installing npm dependencies for main repository..."
    npm install --legacy-peer-deps
    
    # Install dStack SDKs
    log "Installing dStack SDKs..."
    npm install @phala/dstack-sdk --save --legacy-peer-deps
    
    # Install Python dstack-sdk
    log "Installing Python dStack SDK..."
    $PIP_CMD install dstack-sdk --upgrade
    
    success "Main repository dependencies installed!"
}

# Install template dependencies
install_template() {
    local template_name=$1
    local template_path="templates/$template_name"
    
    echo ""
    log "📦 Installing $template_name dependencies..."
    
    if [ ! -d "$template_path" ]; then
        warning "Template $template_name not found at $template_path"
        return
    fi
    
    cd "$template_path"
    
    # Install Node dependencies if package.json exists
    if [ -f "package.json" ]; then
        log "Installing npm dependencies for $template_name..."
        rm -rf node_modules package-lock.json 2>/dev/null || true
        npm install --legacy-peer-deps
    fi
    
    # Install Python dependencies if requirements.txt exists
    if [ -f "requirements.txt" ]; then
        log "Installing Python dependencies for $template_name..."
        $PIP_CMD install -r requirements.txt --upgrade
    fi
    
    # Install Python dependencies in api folder if exists
    if [ -d "api" ] && [ -f "api/requirements.txt" ]; then
        log "Installing Python API dependencies for $template_name..."
        $PIP_CMD install -r api/requirements.txt --upgrade
    fi
    
    # Install Bun dependencies if bun-server exists
    if [ "$HAS_BUN" = true ] && [ -d "bun-server" ] && [ -f "bun-server/package.json" ]; then
        log "Installing Bun dependencies for $template_name..."
        cd bun-server
        bun install
        cd ..
    fi
    
    cd ../..
    success "$template_name dependencies installed!"
}

# Create environment files
create_env_files() {
    log "🔐 Creating environment files..."
    
    # Main .env file
    if [ ! -f ".env" ]; then
        cat > .env << EOL
# dStack Configuration
DSTACK_API_KEY=your-api-key-here
DSTACK_ENDPOINT=https://api.dstack.network

# Application Configuration
NODE_ENV=development
PORT=3000
EOL
        log "Created main .env file"
    else
        log ".env file already exists, skipping..."
    fi
    
    # Remote attestation template .env
    if [ ! -f "templates/remote-attestation-template/.env.local" ]; then
        cat > templates/remote-attestation-template/.env.local << EOL
# dStack Configuration
NEXT_PUBLIC_DSTACK_API_KEY=your-api-key-here
NEXT_PUBLIC_DSTACK_ENDPOINT=https://api.dstack.network

# Python API Configuration
DSTACK_API_KEY=your-api-key-here
DSTACK_ENDPOINT=https://api.dstack.network
EOL
        log "Created remote-attestation-template .env.local file"
    else
        log "remote-attestation-template .env.local already exists, skipping..."
    fi
    
    success "Environment files created!"
}

# Setup test files
setup_tests() {
    log "🧪 Setting up test files..."
    
    # Make test files executable
    find templates -name "test*.py" -type f -exec chmod +x {} \;
    find templates -name "test*.ts" -type f -exec chmod +x {} \;
    find templates -name "test*.js" -type f -exec chmod +x {} \;
    
    success "Test files configured!"
}

# Verify installations
verify_installation() {
    log "✅ Verifying installations..."
    
    local errors=0
    
    # Check main node_modules
    if [ ! -d "node_modules" ]; then
        error "Main node_modules not found"
        ((errors++))
    fi
    
    # Check each template
    for template in nextJS-starter python-starter bun-starter remote-attestation-template; do
        if [ -d "templates/$template" ]; then
            if [ -f "templates/$template/package.json" ] && [ ! -d "templates/$template/node_modules" ]; then
                warning "$template node_modules not found"
                ((errors++))
            fi
        fi
    done
    
    if [ $errors -eq 0 ]; then
        success "All installations verified successfully!"
        return 0
    else
        warning "Some installations may have issues. Please check the warnings above."
        return 1
    fi
}

# Main installation flow
main() {
    echo ""
    log "🚀 Starting Algorithm Visualizer installation..."
    echo ""
    
    # Save current directory
    INSTALL_DIR=$(pwd)
    
    # Step 1: Check requirements
    check_requirements
    echo ""
    
    # Step 2: Clean up ports
    cleanup_ports
    echo ""
    
    # Step 3: Install main dependencies
    install_main_deps
    echo ""
    
    # Step 4: Install template dependencies
    log "📦 Installing all templates..."
    
    # Install basic templates
    install_template "nextJS-starter"
    install_template "python-starter"
    install_template "bun-starter"
    
    # Install remote attestation template
    install_template "remote-attestation-template"
    
    # Step 5: Create environment files
    create_env_files
    echo ""
    
    # Step 6: Setup tests
    setup_tests
    echo ""
    
    # Step 7: Verify installation
    verify_installation
    echo ""
    
    # Final message
    echo -e "${GREEN}"
    cat << "EOF"
    ╔═══════════════════════════════════════════════════════╗
    ║            Installation Complete! 🎉                  ║
    ╚═══════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
    
    echo "Next steps:"
    echo "1. Update the .env files with your dStack API credentials"
    echo "2. Run './launch.sh' to start all services"
    echo ""
    log "Installation completed at $(date)"
}

# Run main function
main "$@"
