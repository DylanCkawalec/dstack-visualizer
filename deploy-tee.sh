#!/bin/bash

#############################################
# Phala TEE Deployment Script
# Author: Dylan Kawalec - Developer Relations
# Deploys to Phala Cloud TEE using phala CLI
#############################################

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔐 Phala TEE Deployment${NC}"
echo "=================================="

# Configuration
APP_NAME="attestation-dashboard"
DOCKER_IMAGE="dylanckawalec/attestation-dashboard:latest"
DOCKER_USERNAME="dylanckawalec"

# Load environment
if [ -f ".env.production" ]; then
    export $(cat .env.production | grep -v '^#' | xargs)
    echo -e "${GREEN}✓ Loaded production environment${NC}"
else
    echo -e "${RED}Error: .env.production not found${NC}"
    exit 1
fi

# Check phala CLI
if ! command -v phala &> /dev/null; then
    echo -e "${RED}Error: phala CLI not installed${NC}"
    echo "Install with: npm install -g phala"
    exit 1
fi

echo ""
echo -e "${YELLOW}Step 1: Building Docker image for AMD64...${NC}"
docker build --platform linux/amd64 -f Dockerfile.production -t algorithm-visualizer:latest .

echo ""
echo -e "${YELLOW}Step 2: Tagging for Docker Hub...${NC}"
docker tag algorithm-visualizer:latest $DOCKER_IMAGE

echo ""
echo -e "${YELLOW}Step 3: Logging into Docker Hub...${NC}"
if [ -z "$DOCKER_PASSWORD" ]; then
    echo "Please enter your Docker Hub password:"
    docker login -u $DOCKER_USERNAME
else
    echo "$DOCKER_PASSWORD" | docker login -u $DOCKER_USERNAME --password-stdin
fi

echo ""
echo -e "${YELLOW}Step 4: Pushing to Docker Hub...${NC}"
docker push $DOCKER_IMAGE

echo ""
echo -e "${YELLOW}Step 5: Creating docker-compose.yml for TEE...${NC}"
cat > docker-compose.tee.yml << EOF
version: '3.8'

services:
  app:
    image: $DOCKER_IMAGE
    container_name: attestation-dashboard
    ports:
      - "80:8000"  # Map internal port 8000 to gateway port 80
    volumes:
      - /var/run/tappd.sock:/var/run/tappd.sock  # TEE socket
      - ./logs:/app/logs
    environment:
      PHALA_API_KEY: \${PHALA_API_KEY}
      PHALA_ENDPOINT: \${PHALA_ENDPOINT}
      PHALA_CLUSTER_ID: \${PHALA_CLUSTER_ID}
      PHALA_CONTRACT_ID: \${PHALA_CONTRACT_ID}
      APP_NAME: \${APP_NAME}
      DEVELOPER_NAME: \${DEVELOPER_NAME}
      DEVELOPER_ROLE: \${DEVELOPER_ROLE}
      ORGANIZATION: \${ORGANIZATION}
      NODE_ENV: production
      TEE_ENVIRONMENT: production
      ENABLE_MOCK_MODE: "false"
      REQUIRE_ATTESTATION: "true"
      ATTESTATION_SEED: \${ATTESTATION_SEED}
      ATTESTATION_SALT: \${ATTESTATION_SALT}
      PORT: "8000"
      API_PORT: "8000"
    restart: always
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
EOF

echo -e "${GREEN}✓ Created docker-compose.tee.yml${NC}"

echo ""
echo -e "${YELLOW}Step 6: Checking Phala authentication...${NC}"
phala status || phala auth

echo ""
echo -e "${YELLOW}Step 7: Deploying to Phala TEE...${NC}"
echo "Deploying with name: $APP_NAME (max 20 chars)"

# Deploy using phala CLI to dStack 0.5.3 node with env file
phala deploy \
    docker-compose.yml \
    --env-file .env.production \
    --name "attestation-dashboard" \
    --vcpu 2 \
    --memory 2048MB \
    --disk-size 10GB \
    --node-id 12 \
    --image dstack-0.5.3 \
    --kms-id phala-prod7

echo ""
echo -e "${YELLOW}Step 8: Getting deployment info...${NC}"
phala cvms ls | grep -E "$APP_NAME|HEADER"

# Get the deployment URL
echo ""
echo -e "${YELLOW}Step 9: Retrieving access URL...${NC}"
CVM_INFO=$(phala cvms ls | grep "$APP_NAME" | head -1)
if [ ! -z "$CVM_INFO" ]; then
    CVM_ID=$(echo "$CVM_INFO" | awk '{print $1}')
    echo -e "${GREEN}✓ CVM ID: $CVM_ID${NC}"
    
    # Get detailed info
    phala cvms get $CVM_ID
    
    # The URL format is typically: https://<cvm-id>.<region>.phala.network
    REGION="poc6"  # Default region
    BASE_URL="https://$CVM_ID.$REGION.phala.network"
    
    echo ""
    echo -e "${GREEN}✅ Deployment Complete!${NC}"
    echo ""
    echo "Access your application at:"
    echo "  Dashboard: $BASE_URL"
    echo "  API: $BASE_URL/api"
    echo "  Health: $BASE_URL/api/health"
    echo "  Attestation: $BASE_URL/api/attestation/generate"
    echo ""
    echo "Note: It may take 2-3 minutes for the CVM to fully initialize"
else
    echo -e "${YELLOW}⚠ Could not retrieve CVM info. Check manually with:${NC}"
    echo "  phala cvms ls"
fi

echo ""
echo -e "${BLUE}Useful commands:${NC}"
echo "  View logs:     phala cvms logs $APP_NAME"
echo "  Check status:  phala cvms info $APP_NAME"
echo "  List CVMs:     phala cvms ls"
echo "  Delete CVM:    phala cvms delete $APP_NAME"

echo ""
echo -e "${YELLOW}Testing attestation after 2 minutes...${NC}"
echo "Waiting for CVM to initialize..."
sleep 120

echo ""
echo -e "${YELLOW}Testing attestation endpoint...${NC}"
if [ ! -z "$BASE_URL" ]; then
    curl -s "$BASE_URL/api/health" && echo -e "\n${GREEN}✓ API is healthy${NC}" || echo -e "${RED}✗ API not responding yet${NC}"
    
    echo ""
    echo "Testing attestation generation..."
    ATTESTATION=$(curl -s "$BASE_URL/api/attestation/generate")
    if [ ! -z "$ATTESTATION" ]; then
        echo -e "${GREEN}✓ Attestation generated successfully!${NC}"
        echo "$ATTESTATION" | jq '.report' -r 2>/dev/null || echo "$ATTESTATION"
    else
        echo -e "${YELLOW}⚠ Attestation not available yet. Try again in a minute.${NC}"
    fi
fi

echo ""
echo -e "${GREEN}🎉 TEE Deployment Complete!${NC}"
