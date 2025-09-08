# 🔐 deploy-tee.sh - Phala TEE Deployment (Production)

## Purpose & Overview

The `deploy-tee.sh` script is the **production deployment script** that deploys the application to Phala Network's TEE using the official `phala` CLI tool and Docker Hub registry.

## Prerequisites

### Required Tools
- Docker and Docker Hub account
- `phala` CLI tool (`npm install -g phala`)
- `.env.production` file with credentials
- Network connectivity

### Permissions
```bash
chmod +x deploy-tee.sh
```

## Usage & Examples

### Basic Deployment
```bash
./deploy-tee.sh
```

### With Docker Password
```bash
export DOCKER_PASSWORD=your-password
./deploy-tee.sh
```

## Deployment Process

### Step 1: Build Docker Image
- Uses `Dockerfile.production`
- Creates optimized production image
- Tags as `algorithm-visualizer:latest`

### Step 2: Docker Hub Push
- Tags image as `dylanckawalec/attestation-dashboard:latest`
- Authenticates with Docker Hub
- Pushes image to public registry

### Step 3: Create TEE Configuration
- Generates `docker-compose.tee.yml`
- Maps port 8000 to gateway port 80
- Mounts TEE socket `/var/run/tappd.sock`
- Sets all environment variables

### Step 4: Phala Authentication
- Checks Phala CLI authentication
- Prompts for auth if needed
- Validates credentials

### Step 5: Deploy to TEE
```bash
phala deploy \
    --compose docker-compose.tee.yml \
    --env-file .env.production \
    --name "attestation-dashboard" \
    --cpu 2 \
    --memory 2048 \
    --disk 10 \
    --wait
```

### Step 6: Retrieve Access Info
- Gets CVM (Confidential VM) ID
- Constructs access URLs
- Displays deployment information

### Step 7: Health Verification
- Waits 2 minutes for initialization
- Tests health endpoint
- Generates test attestation

## Configuration

### Docker Settings
```bash
APP_NAME="attestation-dashboard"  # Max 20 chars
DOCKER_IMAGE="dylanckawalec/attestation-dashboard:latest"
DOCKER_USERNAME="dylanckawalec"
```

### Resource Allocation
- **CPU**: 2 cores
- **Memory**: 2048 MB (2 GB)
- **Disk**: 10 GB
- **Port**: 80 (gateway) → 8000 (internal)

### Environment Variables
All variables from `.env.production` are passed:
- `PHALA_API_KEY`
- `PHALA_ENDPOINT`
- `PHALA_CLUSTER_ID`
- `PHALA_CONTRACT_ID`
- `APP_NAME`
- `DEVELOPER_NAME`
- `ORGANIZATION`
- Attestation seeds and salts

## Access URLs

After successful deployment:
```
Dashboard: https://<cvm-id>.poc6.phala.network
API: https://<cvm-id>.poc6.phala.network/api
Health: https://<cvm-id>.poc6.phala.network/api/health
Attestation: https://<cvm-id>.poc6.phala.network/api/attestation/generate
```

## Output Example

### Success Output
```
🔐 Phala TEE Deployment
==================================
✓ Loaded production environment

Step 1: Building Docker image...
✓ Image built successfully

Step 2: Tagging for Docker Hub...
✓ Tagged as dylanckawalec/attestation-dashboard:latest

Step 3: Logging into Docker Hub...
✓ Login successful

Step 4: Pushing to Docker Hub...
✓ Pushed to registry

Step 5: Creating docker-compose.tee.yml...
✓ Created docker-compose.tee.yml

Step 6: Checking Phala authentication...
✓ Authenticated

Step 7: Deploying to Phala TEE...
✓ Deployment successful

Step 8: Getting deployment info...
✓ CVM ID: abc123def456

✅ Deployment Complete!

Access your application at:
  Dashboard: https://abc123def456.poc6.phala.network
  API: https://abc123def456.poc6.phala.network/api
  Health: https://abc123def456.poc6.phala.network/api/health
  Attestation: https://abc123def456.poc6.phala.network/api/attestation/generate
```

## Phala CLI Commands

### Useful Commands
```bash
# View logs
phala cvms logs attestation-dashboard

# Check status
phala cvms info attestation-dashboard

# List all CVMs
phala cvms ls

# Delete deployment
phala cvms delete attestation-dashboard
```

## Error Handling

### Common Issues

#### Phala CLI Not Installed
```
Error: phala CLI not installed
```
**Solution**: `npm install -g phala`

#### Docker Login Failed
```
Error: Cannot perform an interactive login
```
**Solution**: Set `DOCKER_PASSWORD` environment variable

#### Deployment Failed
```
Error: Deployment failed
```
**Solution**: Check logs with `phala cvms logs`

#### CVM Not Starting
```
⚠ Could not retrieve CVM info
```
**Solution**: Wait 2-3 minutes, check with `phala cvms ls`

## Troubleshooting

### Pre-Deployment Checks
```bash
# Verify environment
./validate-tee.sh

# Test Docker build
./docker-build.sh

# Check Phala auth
phala status
```

### Deployment Issues

#### Resource Limits
If deployment fails due to resources:
```bash
# Reduce resource requirements
--cpu 1 --memory 1024 --disk 5
```

#### Network Issues
```bash
# Check Phala network status
curl https://poc6.phala.network/status
```

#### Image Issues
```bash
# Verify image on Docker Hub
docker pull dylanckawalec/attestation-dashboard:latest
```

### Post-Deployment

#### Check Logs
```bash
phala cvms logs attestation-dashboard --follow
```

#### Monitor Health
```bash
watch curl -s https://<cvm-id>.poc6.phala.network/api/health
```

#### Test Attestation
```bash
curl https://<cvm-id>.poc6.phala.network/api/attestation/generate | jq
```

## Security Considerations

- Docker image is public on Docker Hub
- Environment variables are injected at runtime
- TEE socket provides hardware attestation
- HTTPS enforced by Phala gateway
- Attestation proves code integrity

## Best Practices

1. **Always validate before deployment**:
   ```bash
   ./validate-tee.sh && ./deploy-tee.sh
   ```

2. **Monitor deployment**:
   ```bash
   phala cvms logs attestation-dashboard --follow
   ```

3. **Test after deployment**:
   ```bash
   curl https://<cvm-id>.poc6.phala.network/api/health
   ```

4. **Clean up old deployments**:
   ```bash
   phala cvms ls
   phala cvms delete old-deployment
   ```

## Related Scripts

### Prerequisites
- `./validate-tee.sh` - Validate environment
- `./docker-build.sh` - Build Docker image

### Alternative
- `./deploy-phala.sh` - Legacy deployment script (deprecated)

---

**Quick Reference:**
- **Purpose**: Deploy to Phala TEE production
- **Registry**: Docker Hub (public)
- **CLI Tool**: `phala` (npm package)
- **Resources**: 2 CPU, 2GB RAM, 10GB disk
- **Access**: HTTPS via Phala gateway
