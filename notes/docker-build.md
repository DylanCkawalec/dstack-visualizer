# 🐳 docker-build.sh - Docker Image Builder

## Purpose & Overview

The `docker-build.sh` script builds the production Docker image for the Algorithm Visualizer application with proper tagging and metadata.

## Prerequisites

### System Requirements
- Docker 20.10+ installed and running
- Git (for commit hash metadata)
- `.env.production` file (optional, created if missing)

### Permissions
```bash
chmod +x docker-build.sh
```

## Usage & Examples

### Basic Build
```bash
./docker-build.sh
```

### With Version Override
```bash
VERSION=2.0.0 ./docker-build.sh
```

## Build Process

### 1. Environment Check
- Checks for `.env.production` file
- Creates from template if missing
- Warns if environment file not found

### 2. Metadata Collection
```bash
BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ')
GIT_COMMIT=$(git rev-parse --short HEAD)
VERSION=${VERSION:-"1.0.0"}
```

### 3. Docker Build
```bash
docker build \
    --build-arg BUILD_DATE="$BUILD_DATE" \
    --build-arg VCS_REF="$GIT_COMMIT" \
    --build-arg VERSION="$VERSION" \
    --tag algorithm-visualizer:latest \
    --tag algorithm-visualizer:$VERSION \
    --tag algorithm-visualizer:$GIT_COMMIT \
    --file Dockerfile.production \
    .
```

### 4. Image Tagging
Creates three tags:
- `algorithm-visualizer:latest` - Latest build
- `algorithm-visualizer:1.0.0` - Version tag
- `algorithm-visualizer:abc1234` - Git commit tag

## Configuration Options

### Build Arguments
| Argument | Description | Default |
|----------|-------------|---------|
| `BUILD_DATE` | ISO 8601 build timestamp | Current UTC time |
| `VCS_REF` | Git commit short hash | Current HEAD |
| `VERSION` | Application version | 1.0.0 |

### Environment Variables
```bash
# Override version
export VERSION=2.0.0
./docker-build.sh

# Custom tags
export IMAGE_TAG=production
./docker-build.sh
```

## Dockerfile Details

Uses `Dockerfile.production` with:
- Multi-stage build for optimization
- Node.js 20 Alpine base
- Python 3.11 for API
- Bun runtime (optional)
- Non-root user execution
- Health check configuration

## Output

### Success Output
```
🐳 Building Algorithm Visualizer Docker Image
Warning: .env.production not found
Creating from template...

Building Docker image...
[+] Building 120.5s (23/23) FINISHED
 => [base 1/1] FROM node:20-alpine
 => [deps 2/2] RUN npm ci --only=production
 => [builder 3/3] RUN npm run build
 => exporting to image
 => => writing image sha256:abc123...
 => => naming to algorithm-visualizer:latest
 => => naming to algorithm-visualizer:1.0.0
 => => naming to algorithm-visualizer:abc1234

✅ Docker image built successfully!

Tagged as:
  - algorithm-visualizer:latest
  - algorithm-visualizer:1.0.0
  - algorithm-visualizer:abc1234

To run locally:
  docker-compose up

To push to registry:
  docker tag algorithm-visualizer:latest your-registry/algorithm-visualizer:latest
  docker push your-registry/algorithm-visualizer:latest
```

### Failure Output
```
❌ Docker build failed
```

## Error Handling

### Common Issues

#### Docker Not Running
```
Cannot connect to the Docker daemon
```
**Solution**: Start Docker Desktop or Docker service

#### Missing Dockerfile
```
unable to prepare context: unable to evaluate symlinks
```
**Solution**: Ensure `Dockerfile.production` exists

#### Build Cache Issues
```
ERROR: failed to solve: error getting credentials
```
**Solution**: Clear Docker cache
```bash
docker system prune -a
./docker-build.sh
```

#### Out of Space
```
ERROR: no space left on device
```
**Solution**: Clean up Docker resources
```bash
docker system df
docker system prune --volumes
```

## Image Inspection

### View Image Details
```bash
# List images
docker images | grep algorithm-visualizer

# Inspect image
docker inspect algorithm-visualizer:latest

# View image layers
docker history algorithm-visualizer:latest

# Check image size
docker images algorithm-visualizer --format "table {{.Tag}}\t{{.Size}}"
```

### Test Image Locally
```bash
# Run with docker-compose
docker-compose up

# Run standalone
docker run -p 3000:3000 -p 8000:8000 algorithm-visualizer:latest

# Run with shell access
docker run -it algorithm-visualizer:latest sh
```

## Build Optimization

### Cache Management
```bash
# Build without cache
docker build --no-cache -f Dockerfile.production -t algorithm-visualizer:latest .

# Use specific cache
docker build --cache-from algorithm-visualizer:latest -f Dockerfile.production .
```

### Size Optimization
- Multi-stage build reduces final size
- Alpine Linux base for minimal footprint
- Production-only dependencies
- No development tools in final image

### Build Performance
- Leverages Docker layer caching
- Parallel stage execution
- Optimized COPY operations
- Minimal rebuild on code changes

## Security Considerations

- No secrets in Docker image
- Non-root user execution
- Minimal attack surface with Alpine
- Production dependencies only
- Health check endpoint included

## Related Scripts

### Prerequisites
- `./validate-tee.sh` - Validate environment
- `.env.production` - Environment configuration

### Next Steps
- `./deploy-tee.sh` - Deploy to Phala TEE
- `docker-compose up` - Run locally

## Troubleshooting

### Build Failures

#### Check Docker Version
```bash
docker --version  # Should be 20.10+
```

#### Verbose Build
```bash
docker build --progress=plain -f Dockerfile.production .
```

#### Build Specific Stage
```bash
docker build --target deps -f Dockerfile.production .
docker build --target builder -f Dockerfile.production .
```

### Image Issues

#### Remove Corrupted Images
```bash
docker rmi algorithm-visualizer:latest
./docker-build.sh
```

#### Export/Import Image
```bash
# Export
docker save algorithm-visualizer:latest > algorithm-visualizer.tar

# Import
docker load < algorithm-visualizer.tar
```

## Best Practices

1. **Always tag with version**:
   ```bash
   VERSION=$(git describe --tags) ./docker-build.sh
   ```

2. **Clean before production build**:
   ```bash
   docker system prune -a
   ./docker-build.sh
   ```

3. **Verify image after build**:
   ```bash
   docker run --rm algorithm-visualizer:latest echo "OK"
   ```

4. **Scan for vulnerabilities**:
   ```bash
   docker scan algorithm-visualizer:latest
   ```

---

**Quick Reference:**
- **Purpose**: Build production Docker image
- **Output**: Multi-tagged Docker image
- **Size**: ~500MB (optimized)
- **Base**: Node.js 20 Alpine
- **Next**: Deploy with `./deploy-tee.sh`
