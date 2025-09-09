#!/bin/bash

# TEE Trust Validator - Phala Cloud Deployment Script
# Deploy to Phala Network's Confidential Cloud

set -e

echo "🚀 TEE Trust Validator - Phala Cloud Deployment"
echo "================================================"

# Configuration
DOCKER_IMAGE="tee-trust-validator"
DOCKER_TAG="latest"
DOCKER_REGISTRY="${DOCKER_REGISTRY:-}"
NODE_ID="${NODE_ID:-12}"
DSTACK_IMAGE="${DSTACK_IMAGE:-dstack-0.5.3}"
KMS_ID="${KMS_ID:-phala-prod7}"
APP_NAME="${APP_NAME:-tee-trust-validator}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Load environment variables
if [ -f ".env" ]; then
    export $(cat .env | grep -v '^#' | xargs)
    echo -e "${GREEN}✓ Loaded environment variables${NC}"
else
    echo -e "${YELLOW}⚠ No .env file found. Using environment variables.${NC}"
fi

# Validate required environment variables
if [ -z "$PHALA_API_KEY" ]; then
    echo -e "${RED}✗ PHALA_API_KEY is required${NC}"
    echo "Please set PHALA_API_KEY environment variable or create .env file"
    exit 1
fi

# Step 1: Build Docker image
echo ""
echo "📦 Building Docker image..."
docker build --platform linux/amd64 -t ${DOCKER_IMAGE}:${DOCKER_TAG} .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Docker image built successfully${NC}"
else
    echo -e "${RED}✗ Docker build failed${NC}"
    exit 1
fi

# Step 2: Push to registry (if configured)
if [ ! -z "$DOCKER_REGISTRY" ]; then
    echo ""
    echo "📤 Pushing to Docker registry..."
    
    # Tag image
    docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_REGISTRY}/${DOCKER_IMAGE}:${DOCKER_TAG}
    
    # Push image
    docker push ${DOCKER_REGISTRY}/${DOCKER_IMAGE}:${DOCKER_TAG}
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Image pushed to registry${NC}"
    else
        echo -e "${RED}✗ Failed to push image${NC}"
        exit 1
    fi
fi

# Step 3: Deploy to Phala Cloud
echo ""
echo "☁️ Deploying to Phala Cloud..."

# Check if phala CLI is installed
if ! command -v phala &> /dev/null; then
    echo -e "${YELLOW}Installing Phala CLI...${NC}"
    npm install -g @phala/cli
fi

# Login to Phala (if needed)
echo "🔐 Authenticating with Phala Network..."
phala auth login $PHALA_API_KEY

# Deploy using docker-compose
echo "🚀 Deploying application..."
phala deploy --compose docker-compose.yml \
    --name ${APP_NAME} \
    --node-id ${NODE_ID} \
    --image ${DSTACK_IMAGE} \
    --kms-id ${KMS_ID}

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Deployment successful!${NC}"
    
    # Get deployment info
    echo ""
    echo "📊 Deployment Information:"
    phala cvms list | grep ${APP_NAME}
    
    echo ""
    echo "🌐 Access your application:"
    echo "   Dashboard: https://<app-id>-3000.dstack-pha-prod7.phala.network/"
    echo "   API: https://<app-id>-8000.dstack-pha-prod7.phala.network/"
    echo ""
    echo "Run 'phala cvms list' to see your app ID"
else
    echo -e "${RED}✗ Deployment failed${NC}"
    exit 1
fi

# Step 4: Verify deployment
echo ""
echo "🔍 Verifying deployment..."
sleep 30  # Wait for services to start

# Get the app ID (you might need to parse this from phala cvms list)
APP_INFO=$(phala cvms list | grep ${APP_NAME})
echo "App Info: ${APP_INFO}"

echo ""
echo "✅ Deployment Complete!"
echo ""
echo "📝 Next Steps:"
echo "1. Check deployment status: phala cvms list"
echo "2. View logs: phala cvms logs <cvm-id>"
echo "3. Test API: curl https://<app-id>-8000.dstack-pha-prod7.phala.network/api/health"
echo ""
echo "🔗 Resources:"
echo "   Documentation: https://docs.phala.network/"
echo "   Support: https://discord.gg/phala"
echo ""
echo "Thank you for using TEE Trust Validator! 🚀"
