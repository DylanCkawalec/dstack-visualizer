#!/bin/bash

#############################################
# Algorithm Visualizer & dStack Templates
# Complete Launch Script with Health Checks
# Version: 1.0.0
#############################################

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
NEXTJS_PORT=3000
PYTHON_PORT=8000
BUN_PORT=8001
HEALTH_CHECK_RETRIES=10
HEALTH_CHECK_DELAY=2

# Process IDs
declare -a PIDS=()

# ASCII Art Banner
show_banner() {
    echo -e "${PURPLE}"
    cat << "EOF"
    ╔═══════════════════════════════════════════════════════╗
    ║     Algorithm Visualizer + dStack Templates          ║
    ║                 Launch System                         ║
    ╔═══════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
}

# Log functions
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

info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Cleanup function
cleanup() {
    echo ""
    log "🛑 Shutting down all services..."
    
    # Kill all child processes
    for pid in "${PIDS[@]}"; do
        if kill -0 $pid 2>/dev/null; then
            log "Stopping process $pid..."
            kill $pid 2>/dev/null
        fi
    done
    
    # Kill processes by port
    kill_port $NEXTJS_PORT
    kill_port $PYTHON_PORT
    kill_port $BUN_PORT
    
    # Kill by process name
    pkill -f "next dev" 2>/dev/null || true
    pkill -f "python.*main.py" 2>/dev/null || true
    pkill -f "bun.*index.ts" 2>/dev/null || true
    
    success "All services stopped gracefully"
    exit 0
}

# Set up trap for cleanup
trap cleanup EXIT INT TERM

# Kill processes on specific port
kill_port() {
    local port=$1
    if [[ "$OSTYPE" == "darwin"* ]]; then
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
    else
        fuser -k $port/tcp 2>/dev/null || true
    fi
}

# Check if port is available
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 1  # Port is in use
    else
        return 0  # Port is available
    fi
}

# Wait for service to be ready
wait_for_service() {
    local service_name=$1
    local port=$2
    local url=$3
    local retries=$HEALTH_CHECK_RETRIES
    
    log "⏳ Waiting for $service_name to be ready on port $port..."
    
    while [ $retries -gt 0 ]; do
        if curl -s -o /dev/null -w "%{http_code}" $url | grep -q "200\|301\|302"; then
            success "$service_name is ready!"
            return 0
        fi
        
        sleep $HEALTH_CHECK_DELAY
        ((retries--))
        echo -n "."
    done
    
    echo ""
    error "$service_name failed to start on port $port"
    return 1
}

# Perform system health checks
health_check() {
    log "🏥 Performing system health checks..."
    
    local checks_passed=true
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        error "Node.js is not installed"
        checks_passed=false
    else
        NODE_VERSION=$(node -v)
        success "Node.js: $NODE_VERSION"
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        error "npm is not installed"
        checks_passed=false
    else
        NPM_VERSION=$(npm -v)
        success "npm: $NPM_VERSION"
    fi
    
    # Check Python
    if command -v python3 &> /dev/null; then
        PYTHON_CMD="python3"
        PYTHON_VERSION=$(python3 --version)
    elif command -v python &> /dev/null; then
        PYTHON_CMD="python"
        PYTHON_VERSION=$(python --version)
    else
        error "Python is not installed"
        checks_passed=false
    fi
    
    if [ -n "$PYTHON_VERSION" ]; then
        success "Python: $PYTHON_VERSION"
    fi
    
    # Check Bun (optional)
    if command -v bun &> /dev/null; then
        BUN_VERSION=$(bun -v)
        success "Bun: $BUN_VERSION"
        HAS_BUN=true
    else
        warning "Bun not found - Bun server will be skipped"
        HAS_BUN=false
    fi
    
    # Check for required directories
    if [ ! -d "templates/remote-attestation-template" ]; then
        error "Remote attestation template not found"
        checks_passed=false
    else
        success "Templates directory found"
    fi
    
    # Check for node_modules
    if [ ! -d "templates/remote-attestation-template/node_modules" ]; then
        warning "Node modules not installed in remote-attestation-template"
        info "Run './install.sh' first to install all dependencies"
        checks_passed=false
    fi
    
    if [ "$checks_passed" = false ]; then
        error "Health checks failed. Please fix the issues above and try again."
        exit 1
    fi
    
    success "All health checks passed!"
}

# Clean up ports before starting
cleanup_ports() {
    log "🧹 Cleaning up ports..."
    
    # Check and kill processes on required ports
    if ! check_port $NEXTJS_PORT; then
        warning "Port $NEXTJS_PORT is in use, killing process..."
        kill_port $NEXTJS_PORT
        sleep 1
    fi
    
    if ! check_port $PYTHON_PORT; then
        warning "Port $PYTHON_PORT is in use, killing process..."
        kill_port $PYTHON_PORT
        sleep 1
    fi
    
    if ! check_port $BUN_PORT; then
        warning "Port $BUN_PORT is in use, killing process..."
        kill_port $BUN_PORT
        sleep 1
    fi
    
    success "Ports are ready!"
}

# Start NextJS service
start_nextjs() {
    log "🚀 Starting NextJS Dashboard..."
    
    cd templates/remote-attestation-template
    
    # Start NextJS in background
    npm run dev > /tmp/nextjs.log 2>&1 &
    local pid=$!
    PIDS+=($pid)
    
    cd ../..
    
    # Wait for service to be ready
    if wait_for_service "NextJS Dashboard" $NEXTJS_PORT "http://localhost:$NEXTJS_PORT"; then
        info "NextJS Dashboard: http://localhost:$NEXTJS_PORT (PID: $pid)"
        return 0
    else
        return 1
    fi
}

# Start Python API service
start_python_api() {
    log "🐍 Starting Python API Server..."
    
    cd templates/remote-attestation-template/api
    
    # Start Python API in background
    $PYTHON_CMD main.py > /tmp/python_api.log 2>&1 &
    local pid=$!
    PIDS+=($pid)
    
    cd ../../..
    
    # Wait for service to be ready
    if wait_for_service "Python API" $PYTHON_PORT "http://localhost:$PYTHON_PORT"; then
        info "Python API: http://localhost:$PYTHON_PORT (PID: $pid)"
        info "API Docs: http://localhost:$PYTHON_PORT/docs"
        return 0
    else
        return 1
    fi
}

# Start Bun service
start_bun_server() {
    if [ "$HAS_BUN" != true ]; then
        warning "Skipping Bun server (Bun not installed)"
        return 0
    fi
    
    log "⚡ Starting Bun Server..."
    
    cd templates/remote-attestation-template/bun-server
    
    # Start Bun server in background
    bun run index.ts > /tmp/bun_server.log 2>&1 &
    local pid=$!
    PIDS+=($pid)
    
    cd ../../..
    
    # Wait for service to be ready
    if wait_for_service "Bun Server" $BUN_PORT "http://localhost:$BUN_PORT"; then
        info "Bun Server: http://localhost:$BUN_PORT (PID: $pid)"
        return 0
    else
        warning "Bun server failed to start, but continuing..."
        return 0  # Don't fail if Bun doesn't start
    fi
}

# Show service status
show_status() {
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║             All Services Running Successfully! 🎉          ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "📍 Service URLs:"
    echo "   • NextJS Dashboard:  ${CYAN}http://localhost:$NEXTJS_PORT${NC}"
    echo "   • Python API:        ${CYAN}http://localhost:$PYTHON_PORT${NC}"
    echo "   • API Documentation: ${CYAN}http://localhost:$PYTHON_PORT/docs${NC}"
    if [ "$HAS_BUN" = true ]; then
        echo "   • Bun Server:        ${CYAN}http://localhost:$BUN_PORT${NC}"
    fi
    echo ""
    echo "📊 Service Status:"
    
    # Check each service
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:$NEXTJS_PORT | grep -q "200"; then
        echo "   • NextJS:     ${GREEN}✅ Running${NC}"
    else
        echo "   • NextJS:     ${RED}❌ Not responding${NC}"
    fi
    
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:$PYTHON_PORT | grep -q "200"; then
        echo "   • Python API: ${GREEN}✅ Running${NC}"
    else
        echo "   • Python API: ${RED}❌ Not responding${NC}"
    fi
    
    if [ "$HAS_BUN" = true ]; then
        if curl -s -o /dev/null -w "%{http_code}" http://localhost:$BUN_PORT | grep -q "200"; then
            echo "   • Bun Server: ${GREEN}✅ Running${NC}"
        else
            echo "   • Bun Server: ${YELLOW}⚠️  Not responding${NC}"
        fi
    fi
    
    echo ""
    echo "📝 Logs:"
    echo "   • NextJS:     /tmp/nextjs.log"
    echo "   • Python API: /tmp/python_api.log"
    if [ "$HAS_BUN" = true ]; then
        echo "   • Bun Server: /tmp/bun_server.log"
    fi
    echo ""
    echo "🛑 To stop all services: Press ${RED}Ctrl+C${NC}"
    echo ""
}

# Monitor services
monitor_services() {
    log "👁️  Monitoring services..."
    
    while true; do
        sleep 30
        
        # Check if services are still running
        local all_running=true
        
        if ! curl -s -o /dev/null -w "%{http_code}" http://localhost:$NEXTJS_PORT | grep -q "200"; then
            warning "NextJS Dashboard is not responding, attempting restart..."
            start_nextjs
        fi
        
        if ! curl -s -o /dev/null -w "%{http_code}" http://localhost:$PYTHON_PORT | grep -q "200"; then
            warning "Python API is not responding, attempting restart..."
            start_python_api
        fi
        
        if [ "$HAS_BUN" = true ]; then
            if ! curl -s -o /dev/null -w "%{http_code}" http://localhost:$BUN_PORT | grep -q "200"; then
                warning "Bun Server is not responding, attempting restart..."
                start_bun_server
            fi
        fi
    done
}

# Main launch sequence
main() {
    # Show banner
    show_banner
    
    # Save current directory
    LAUNCH_DIR=$(pwd)
    
    echo ""
    log "🚀 Starting Algorithm Visualizer Launch Sequence..."
    echo ""
    
    # Step 1: Health checks
    health_check
    echo ""
    
    # Step 2: Clean up ports
    cleanup_ports
    echo ""
    
    # Step 3: Start services
    log "🎯 Starting all services..."
    echo ""
    
    # Start NextJS
    if ! start_nextjs; then
        error "Failed to start NextJS Dashboard"
        exit 1
    fi
    echo ""
    
    # Start Python API
    if ! start_python_api; then
        error "Failed to start Python API"
        exit 1
    fi
    echo ""
    
    # Start Bun Server (optional)
    start_bun_server
    echo ""
    
    # Step 4: Show status
    show_status
    
    # Step 5: Monitor services
    log "Services are running. Monitoring for issues..."
    
    # Keep script running and monitor
    while true; do
        sleep 10
    done
}

# Check if we're in the correct directory
if [ ! -f "package.json" ] || [ ! -d "templates" ]; then
    error "This script must be run from the algorithm-visualizer root directory"
    exit 1
fi

# Run main function
main "$@"
