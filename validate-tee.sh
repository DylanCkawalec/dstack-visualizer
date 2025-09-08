#!/bin/bash

#############################################
# Phala Network TEE Validation Script
# Author: Dylan Kawalec - Developer Relations
# Tests TEE API connectivity and attestation
#############################################

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔐 Phala Network TEE Validation${NC}"
echo "=================================="

# Load environment variables
if [ -f ".env.production" ]; then
    export $(cat .env.production | grep -v '^#' | xargs)
    echo -e "${GREEN}✓ Loaded production environment${NC}"
else
    echo -e "${RED}Error: .env.production not found${NC}"
    exit 1
fi

# Function to test endpoint
test_endpoint() {
    local endpoint=$1
    local description=$2
    
    echo ""
    echo "Testing: $description"
    echo "Endpoint: $endpoint"
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$endpoint")
    
    if [ "$response" = "200" ] || [ "$response" = "404" ]; then
        echo -e "${GREEN}✓ Endpoint reachable (HTTP $response)${NC}"
        return 0
    else
        echo -e "${RED}✗ Endpoint unreachable (HTTP $response)${NC}"
        return 1
    fi
}

# Test Phala TEE API
echo ""
echo -e "${YELLOW}Testing Phala TEE API...${NC}"
test_endpoint "https://poc6.phala.network/tee-api" "Phala TEE API Base"

# Test local services (if running)
echo ""
echo -e "${YELLOW}Testing Local Services...${NC}"

# Check if services are running
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${GREEN}✓ NextJS Dashboard is running on port 3000${NC}"
    test_endpoint "http://localhost:3000/api/status" "Dashboard API"
else
    echo -e "${YELLOW}⚠ NextJS Dashboard is not running${NC}"
fi

if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${GREEN}✓ Python API is running on port 8000${NC}"
    test_endpoint "http://localhost:8000/api/health" "Python API Health"
else
    echo -e "${YELLOW}⚠ Python API is not running${NC}"
fi

# Validate environment variables
echo ""
echo -e "${YELLOW}Validating Environment Configuration...${NC}"

validate_env() {
    local var_name=$1
    local var_value="${!var_name}"
    
    if [ -z "$var_value" ]; then
        echo -e "${RED}✗ $var_name is not set${NC}"
        return 1
    else
        if [[ "$var_name" == *"API_KEY"* ]]; then
            echo -e "${GREEN}✓ $var_name is set (hidden)${NC}"
        else
            echo -e "${GREEN}✓ $var_name = $var_value${NC}"
        fi
        return 0
    fi
}

validate_env "PHALA_API_KEY"
validate_env "PHALA_ENDPOINT"
validate_env "PHALA_CLUSTER_ID"
validate_env "PHALA_CONTRACT_ID"
validate_env "APP_NAME"
validate_env "DEVELOPER_NAME"
validate_env "ORGANIZATION"

# Generate sample attestation hash
echo ""
echo -e "${YELLOW}Generating Sample Attestation...${NC}"

ATTESTATION_DATA='{
  "app": "remote-attestation-dashboard",
  "version": "1.0.0",
  "developer": "Dylan Kawalec",
  "organization": "Phala Network",
  "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"
}'

HASH=$(echo -n "$ATTESTATION_DATA" | shasum -a 256 | cut -d' ' -f1)
echo "Attestation Data Hash: ${HASH:0:32}..."

# Test Python attestation API (if available)
if command -v python3 &> /dev/null; then
    echo ""
    echo -e "${YELLOW}Testing Python Attestation Module...${NC}"
    
    python3 -c "
import sys
import os
sys.path.append('templates/python-starter')
try:
    from attestation_api import AttestationAPI
    api = AttestationAPI()
    print('✓ Attestation API module loaded successfully')
    
    # Test hash generation
    test_data = {
        'appName': 'test',
        'appVersion': '1.0.0',
        'developer': {'name': 'Dylan Kawalec', 'role': 'Developer Relations', 'organization': 'Phala Network'},
        'environment': {'teeEnvironment': 'production'},
        'codeIntegrity': {}
    }
    hash_result = api._generate_application_hash(test_data)
    print(f'✓ Generated test hash: {hash_result[:32]}...')
except Exception as e:
    print(f'✗ Error: {e}')
" 2>/dev/null || echo -e "${YELLOW}⚠ Python attestation module not available${NC}"
fi

# Test Node.js attestation service (if available)
if command -v node &> /dev/null; then
    echo ""
    echo -e "${YELLOW}Testing Node.js Attestation Module...${NC}"
    
    if [ -f "templates/remote-attestation-template/src/attestation-service.ts" ]; then
        echo -e "${GREEN}✓ Attestation service TypeScript file exists${NC}"
    else
        echo -e "${RED}✗ Attestation service file not found${NC}"
    fi
fi

# Display summary
echo ""
echo "════════════════════════════════════════"
echo -e "${BLUE}Validation Summary${NC}"
echo "════════════════════════════════════════"
echo ""
echo "Application Identity:"
echo "  • Name: ${APP_NAME}"
echo "  • Developer: ${DEVELOPER_NAME}"
echo "  • Organization: ${ORGANIZATION}"
echo ""
echo "TEE Configuration:"
echo "  • Endpoint: ${PHALA_ENDPOINT}"
echo "  • Cluster: ${PHALA_CLUSTER_ID}"
echo "  • Contract: ${PHALA_CONTRACT_ID}"
echo "  • API Key: ***${PHALA_API_KEY: -8}"
echo ""
echo "Attestation Seeds:"
echo "  • Seed: ${ATTESTATION_SEED}"
echo "  • Salt: ${ATTESTATION_SALT}"
echo ""

# Check Git information
if command -v git &> /dev/null && [ -d .git ]; then
    GIT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
    GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
    echo "Git Information:"
    echo "  • Commit: $GIT_COMMIT"
    echo "  • Branch: $GIT_BRANCH"
    echo ""
fi

echo -e "${GREEN}✅ TEE validation complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Run './launch.sh' to start all services"
echo "2. Access http://localhost:8000/api/attestation/generate"
echo "3. Deploy with './deploy-phala.sh'"
