# 📦 Deployment Guide

This guide covers deploying the TEE Trust Validator to Phala Cloud.

## 🚀 Quick Deploy

### Option 1: One-Click Deploy

[![Deploy to Phala Cloud](https://cloud.phala.network/deploy-button.svg)](https://cloud.phala.network/templates/tee-trust-validator)

### Option 2: CLI Deployment

```bash
# 1. Clone the repository
git clone https://github.com/DylanCkawalec/awesome-phala-cloud.git
cd awesome-phala-cloud/templates/tee-trust-validator

# 2. Configure environment
cp .env.example .env
nano .env  # Add your API keys

# 3. Deploy
./deploy-phala.sh
```

## 📋 Prerequisites

1. **Phala Account & API Key**
   - Sign up at [Phala Network](https://phala.network)
   - Get your API key from the dashboard

2. **Docker Hub Account** (for custom deployments)
   - Create account at [hub.docker.com](https://hub.docker.com)
   - Login: `docker login`

3. **System Requirements**
   - Docker 20.10+
   - 4GB RAM minimum
   - 10GB disk space

## 🔧 Configuration

### Environment Variables

```env
# Required
PHALA_API_KEY=your-phala-api-key
DSTACK_API_KEY=your-dstack-api-key

# Optional
NODE_ENV=production
PORT=8000
DEVELOPER_NAME=Your Name
ORGANIZATION=Your Organization
```

### Docker Compose

The `docker-compose.yml` configures:
- Service ports (3000, 8000)
- TEE socket mounts
- Environment variables
- Network settings

## 📝 Step-by-Step Deployment

### 1. Prepare Environment

```bash
# Clone repository
git clone https://github.com/DylanCkawalec/awesome-phala-cloud.git
cd awesome-phala-cloud/templates/tee-trust-validator

# Setup environment
cp .env.example .env
# Edit .env with your credentials
```

### 2. Build Docker Image

```bash
# Build for AMD64 architecture (required for Phala)
docker build --platform linux/amd64 -t tee-trust-validator .

# Tag for registry
docker tag tee-trust-validator:latest your-dockerhub/tee-trust-validator:latest

# Push to registry
docker push your-dockerhub/tee-trust-validator:latest
```

### 3. Deploy to Phala Cloud

```bash
# Using Phala CLI
phala deploy --compose docker-compose.yml \
  --name tee-trust-validator \
  --node-id 12 \
  --image dstack-0.5.3 \
  --kms-id phala-prod7
```

### 4. Verify Deployment

```bash
# Check deployment status
phala cvms list

# Test endpoints
curl https://your-app-id-3000.dstack-pha-prod7.phala.network/
curl https://your-app-id-8000.dstack-pha-prod7.phala.network/api/health
```

## 🐳 Docker Commands

### Local Testing

```bash
# Run locally
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production Build

```bash
# Build with platform specification
docker build --platform linux/amd64 -t tee-trust-validator .

# Run with environment variables
docker run -d \
  --name tee-validator \
  -p 3000:3000 \
  -p 8000:8000 \
  -e PHALA_API_KEY=$PHALA_API_KEY \
  -e DSTACK_API_KEY=$DSTACK_API_KEY \
  tee-trust-validator
```

## 🔍 Monitoring

### Health Checks

```bash
# API Health
curl https://your-app-8000.dstack-pha-prod7.phala.network/api/health

# TEE Info
curl https://your-app-8000.dstack-pha-prod7.phala.network/api/tee/info

# Generate Test Attestation
curl -X POST https://your-app-8000.dstack-pha-prod7.phala.network/api/attestation/generate \
  -H "Content-Type: application/json" \
  -d '{"data":"test"}'
```

### Logs

```bash
# Phala CLI logs
phala cvms logs your-cvm-id

# Docker logs
docker-compose logs -f
```

## 🚨 Troubleshooting

### Common Issues

1. **Port conflicts**
   ```bash
   # Kill processes on ports
   lsof -ti:3000,8000 | xargs kill -9
   ```

2. **Build failures**
   ```bash
   # Clean and rebuild
   docker system prune -a
   docker build --no-cache --platform linux/amd64 -t tee-trust-validator .
   ```

3. **Deployment failures**
   - Verify API key is valid
   - Check Docker image is AMD64
   - Ensure sufficient resources

## 📊 Production Checklist

- [ ] Environment variables configured
- [ ] Docker image built for AMD64
- [ ] Image pushed to registry
- [ ] Phala API key valid
- [ ] Deployment successful
- [ ] Health checks passing
- [ ] All endpoints responding
- [ ] TEE attestation working

## 🔗 Resources

- [Phala Network Documentation](https://docs.phala.network/)
- [dStack SDK Documentation](https://github.com/Phala-Network/dstack-sdk)
- [Docker Documentation](https://docs.docker.com/)
- [Support Discord](https://discord.gg/phala)

---

*For additional help, please refer to the [main README](README.md) or contact support.*