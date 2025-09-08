#!/bin/bash

#############################################
# Docker Build Script for Production
# Builds and tags the Docker image
#############################################

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🐳 Building Algorithm Visualizer Docker Image${NC}"

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo -e "${YELLOW}Warning: .env.production not found${NC}"
    echo "Creating from template..."
    cp .env.production.example .env.production 2>/dev/null || echo "No template found"
fi

# Set build arguments
BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ')
GIT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
VERSION=${VERSION:-"1.0.0"}

# Build the Docker image for AMD64 (Phala TEE architecture)
echo "Building Docker image for AMD64 (Phala TEE)..."
docker build \
    --platform linux/amd64 \
    --build-arg BUILD_DATE="$BUILD_DATE" \
    --build-arg VCS_REF="$GIT_COMMIT" \
    --build-arg VERSION="$VERSION" \
    --tag algorithm-visualizer:latest \
    --tag algorithm-visualizer:$VERSION \
    --tag algorithm-visualizer:$GIT_COMMIT \
    --file Dockerfile.production \
    .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Docker image built successfully!${NC}"
    echo ""
    echo "Tagged as:"
    echo "  - algorithm-visualizer:latest"
    echo "  - algorithm-visualizer:$VERSION"
    echo "  - algorithm-visualizer:$GIT_COMMIT"
    echo ""
    echo "To run locally:"
    echo "  docker-compose up"
    echo ""
    echo "To push to registry:"
    echo "  docker tag algorithm-visualizer:latest your-registry/algorithm-visualizer:latest"
    echo "  docker push your-registry/algorithm-visualizer:latest"
else
    echo -e "${RED}❌ Docker build failed${NC}"
    exit 1
fi
