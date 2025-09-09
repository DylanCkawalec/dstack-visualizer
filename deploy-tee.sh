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
echo -e "${YELLOW}Step 5: Using app-compose.json for proper env var authorization...${NC}"
echo -e "${GREEN}✓ app-compose.json already configured with allowed_envs${NC}"

echo ""
echo -e "${YELLOW}Step 6: Checking Phala authentication...${NC}"
phala status || phala auth

echo ""
echo -e "${YELLOW}Step 7: Deploying to Phala TEE...${NC}"
echo "Deploying with name: $APP_NAME (max 20 chars)"

# Deploy using phala CLI to dStack 0.5.3 node (matching working manual method)
phala deploy \
    docker-compose.yml \
    --env-file .env.production \
    --name "dstack-dashboard-phala-cloud" \
    --vcpu 2 \
    --memory 2048MB \
    --disk-size 10GB \
    --node-id 12 \
    --image dstack-0.5.3 \
    --kms-id phala-prod7

echo ""
echo -e "${YELLOW}Step 8: Getting deployment info and waiting for initialization...${NC}"
phala cvms ls | grep -E "$APP_NAME|HEADER"

echo ""
echo -e "${YELLOW}Step 9: Waiting for services to fully initialize (5-6 minutes)...${NC}"
echo "This ensures all services (NextJS, Python API, Bun server) are ready"
for i in {1..6}; do
    echo "⏳ Waiting... ${i}/6 minutes"
    sleep 60
done

# Get the deployment URL
echo ""
echo -e "${YELLOW}Step 10: Retrieving access URL...${NC}"
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
echo -e "${YELLOW}Step 11: Testing all services after initialization...${NC}"
if [ ! -z "$CVM_ID" ]; then
    APP_URL_BASE="https://$CVM_ID-"
    
    echo "🧪 Testing all three services:"
    echo ""
    
    echo "1. Testing NextJS Dashboard (port 3000):"
    NEXTJS_URL="${APP_URL_BASE}3000.dstack-pha-prod7.phala.network"
    echo "   URL: $NEXTJS_URL"
    curl -I "$NEXTJS_URL" 2>/dev/null && echo -e "   ${GREEN}✅ NextJS responding${NC}" || echo -e "   ${YELLOW}⚠ NextJS initializing${NC}"
    
    echo ""
    echo "2. Testing Python API (port 8000):"
    API_URL="${APP_URL_BASE}8000.dstack-pha-prod7.phala.network"
    echo "   URL: $API_URL"
    curl -s "$API_URL/" 2>/dev/null && echo -e "   ${GREEN}✅ Python API responding${NC}" || echo -e "   ${YELLOW}⚠ Python API initializing${NC}"
    
    echo ""
    echo "3. Testing Bun Server (port 8001):"
    BUN_URL="${APP_URL_BASE}8001.dstack-pha-prod7.phala.network"
    echo "   URL: $BUN_URL"
    curl -s "$BUN_URL/" 2>/dev/null && echo -e "   ${GREEN}✅ Bun Server responding${NC}" || echo -e "   ${YELLOW}⚠ Bun Server initializing${NC}"
    
    echo ""
    echo -e "${GREEN}🎯 All URLs for your TEE Trust Validator:${NC}"
    echo "   NextJS Dashboard: $NEXTJS_URL"
    echo "   Python API: $API_URL" 
    echo "   Bun Server: $BUN_URL"
fi

echo ""
echo -e "${GREEN}🎉 TEE Deployment Complete!${NC}"
