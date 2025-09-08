#!/bin/bash

#############################################
# Algorithm Visualizer System Test Script
# Tests installation and services
#############################################

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}=== Algorithm Visualizer System Test ===${NC}"
echo ""

# Test 1: Check if install script exists
echo -n "1. Checking install script... "
if [ -f "./install.sh" ] && [ -x "./install.sh" ]; then
    echo -e "${GREEN}✅ Pass${NC}"
else
    echo -e "${RED}❌ Fail${NC}"
fi

# Test 2: Check if launch script exists
echo -n "2. Checking launch script... "
if [ -f "./launch.sh" ] && [ -x "./launch.sh" ]; then
    echo -e "${GREEN}✅ Pass${NC}"
else
    echo -e "${RED}❌ Fail${NC}"
fi

# Test 3: Check templates directory
echo -n "3. Checking templates directory... "
if [ -d "templates" ]; then
    echo -e "${GREEN}✅ Pass${NC}"
    echo "   Found templates:"
    for template in templates/*/; do
        if [ -d "$template" ]; then
            echo "   - $(basename $template)"
        fi
    done
else
    echo -e "${RED}❌ Fail${NC}"
fi

# Test 4: Check Node.js
echo -n "4. Checking Node.js... "
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✅ Pass${NC} ($NODE_VERSION)"
else
    echo -e "${RED}❌ Fail${NC}"
fi

# Test 5: Check Python
echo -n "5. Checking Python... "
if command -v python3 &> /dev/null || command -v python &> /dev/null; then
    if command -v python3 &> /dev/null; then
        PYTHON_VERSION=$(python3 --version)
    else
        PYTHON_VERSION=$(python --version)
    fi
    echo -e "${GREEN}✅ Pass${NC} ($PYTHON_VERSION)"
else
    echo -e "${RED}❌ Fail${NC}"
fi

# Test 6: Check Bun (optional)
echo -n "6. Checking Bun (optional)... "
if command -v bun &> /dev/null; then
    BUN_VERSION=$(bun -v)
    echo -e "${GREEN}✅ Pass${NC} ($BUN_VERSION)"
else
    echo -e "${YELLOW}⚠️ Not installed${NC} (optional)"
fi

# Test 7: Check port availability
echo "7. Checking port availability:"
for port in 3000 8000 8001; do
    echo -n "   Port $port: "
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${YELLOW}In use${NC}"
    else
        echo -e "${GREEN}Available${NC}"
    fi
done

# Test 8: Check remote-attestation-template
echo -n "8. Checking remote-attestation-template... "
if [ -d "templates/remote-attestation-template" ]; then
    echo -e "${GREEN}✅ Pass${NC}"
    
    # Check subdirectories
    echo "   Components:"
    [ -d "templates/remote-attestation-template/src" ] && echo "   ✓ src/"
    [ -d "templates/remote-attestation-template/api" ] && echo "   ✓ api/"
    [ -d "templates/remote-attestation-template/bun-server" ] && echo "   ✓ bun-server/"
    [ -f "templates/remote-attestation-template/package.json" ] && echo "   ✓ package.json"
else
    echo -e "${RED}❌ Fail${NC}"
fi

echo ""
echo -e "${CYAN}=== Test Summary ===${NC}"
echo "To install all dependencies: ${GREEN}./install.sh${NC}"
echo "To launch all services: ${GREEN}./launch.sh${NC}"
echo ""
