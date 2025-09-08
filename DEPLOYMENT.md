# 🚀 Algorithm Visualizer - Phala Cloud Deployment Guide

## Table of Contents
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Local Development](#local-development)
- [Docker Deployment](#docker-deployment)
- [Phala Cloud Deployment](#phala-cloud-deployment)
- [Kubernetes Deployment](#kubernetes-deployment)
- [Monitoring & Maintenance](#monitoring--maintenance)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements
- Node.js 18+ and npm 9+
- Python 3.8+ and pip
- Docker 20.10+ and Docker Compose 2.0+
- Git
- Optional: Bun runtime for Bun server
- Optional: Kubernetes CLI (kubectl) for K8s deployment

### Phala Network Requirements
- Phala Network account
- dStack API key
- Phala Cluster ID
- Phala Contract ID

## Environment Setup

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/algorithm-visualizer.git
cd algorithm-visualizer
```

### 2. Set Environment Variables
Export required environment variables:
```bash
export DSTACK_API_KEY="your-dstack-api-key"
export PHALA_CLUSTER_ID="your-cluster-id"
export PHALA_CONTRACT_ID="your-contract-id"
export PHALA_ENDPOINT="https://poc6.phala.network/tee-api"
```

Or create a `.env.production` file for local development:
```env
# Phala Network Configuration
DSTACK_API_KEY=your-dstack-api-key
PHALA_CLUSTER_ID=your-cluster-id
PHALA_CONTRACT_ID=your-contract-id
PHALA_ENDPOINT=https://poc6.phala.network/tee-api

# Security Settings
NODE_ENV=production
TEE_ENVIRONMENT=production
ENABLE_MOCK_MODE=false
REQUIRE_ATTESTATION=true

# Optional: Redis for session storage
REDIS_URL=redis://localhost:6379
```

## Local Development

### Quick Start with Scripts

1. **Install all dependencies:**
```bash
chmod +x install.sh
./install.sh
```

2. **Launch all services:**
```bash
chmod +x launch.sh
./launch.sh
```

3. **Access the application:**
- Dashboard: http://localhost:3000
- Python API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Bun Server: http://localhost:8001 (if installed)

### Manual Installation

1. **Install main dependencies:**
```bash
npm install
```

2. **Install template dependencies:**
```bash
# NextJS Dashboard
cd templates/nextJS-starter && npm install && cd ../..

# Python API
cd templates/python-starter && pip install -r requirements.txt && cd ../..

# Bun Server (optional)
cd templates/bun-starter && bun install && cd ../..
```

3. **Start services individually:**
```bash
# Terminal 1: NextJS Dashboard
cd templates/nextJS-starter && npm run dev

# Terminal 2: Python API
cd templates/python-starter && python main.py

# Terminal 3: Bun Server (optional)
cd templates/bun-starter && bun run index.ts
```

## Docker Deployment

### Build Production Image

1. **Set environment variables with your credentials**

2. **Build the Docker image:**
```bash
chmod +x docker-build.sh
./docker-build.sh
```

### Run with Docker Compose

1. **Start the containerized application:**
```bash
docker-compose up -d
```

2. **Check health status:**
```bash
docker-compose ps
docker-compose logs -f
```

3. **Stop the application:**
```bash
docker-compose down
```

### Run with Docker (standalone)

```bash
docker run -d \
  --name algorithm-visualizer \
  -p 3000:3000 \
  -p 8000:8000 \
  -p 8001:8001 \
  -e PHALA_API_KEY=$PHALA_API_KEY \
  -e PHALA_CLUSTER_ID=$PHALA_CLUSTER_ID \
  -e PHALA_CONTRACT_ID=$PHALA_CONTRACT_ID \
  algorithm-visualizer:latest
```

## Phala Cloud Deployment

### Automated Deployment

1. **Ensure environment variables are set**

2. **Run the deployment script:**
```bash
chmod +x deploy-phala.sh
./deploy-phala.sh
```

This script will:
- Validate environment variables
- Build and tag the Docker image
- Push to Phala registry
- Deploy to Phala Cloud
- Verify deployment status

### Manual Deployment Steps

1. **Build and tag image:**
```bash
docker build -f Dockerfile.production -t algorithm-visualizer:latest .
docker tag algorithm-visualizer:latest registry.phala.network/$PHALA_CLUSTER_ID/algorithm-visualizer:latest
```

2. **Push to Phala registry:**
```bash
docker push registry.phala.network/$PHALA_CLUSTER_ID/algorithm-visualizer:latest
```

3. **Deploy using Phala CLI:**
```bash
phala deploy \
  --image registry.phala.network/$PHALA_CLUSTER_ID/algorithm-visualizer:latest \
  --cluster $PHALA_CLUSTER_ID \
  --contract $PHALA_CONTRACT_ID \
  --env PHALA_API_KEY=$PHALA_API_KEY
```

### Access Deployed Application

Once deployed, your application will be available at:
- Dashboard: `https://<cluster-id>.phala.network:3000`
- API: `https://<cluster-id>.phala.network:8000`
- API Docs: `https://<cluster-id>.phala.network:8000/docs`

## Kubernetes Deployment

### Deploy to Kubernetes Cluster

1. **Replace environment variables in manifest:**
```bash
envsubst < k8s-phala-deployment.yaml > k8s-deployment-configured.yaml
```

2. **Apply the configuration:**
```bash
kubectl apply -f k8s-deployment-configured.yaml
```

3. **Check deployment status:**
```bash
kubectl get pods -n algorithm-visualizer
kubectl get svc -n algorithm-visualizer
kubectl get ingress -n algorithm-visualizer
```

4. **View logs:**
```bash
kubectl logs -f deployment/algorithm-visualizer -n algorithm-visualizer
```

### Scale the Deployment

```bash
# Manual scaling
kubectl scale deployment algorithm-visualizer --replicas=5 -n algorithm-visualizer

# Autoscaling is configured by default (2-10 replicas)
kubectl get hpa -n algorithm-visualizer
```

## Monitoring & Maintenance

### Health Checks

1. **Check API health:**
```bash
curl https://<your-domain>:8000/api/health
```

2. **Verify TEE attestation:**
```bash
curl https://<your-domain>:8000/api/attestation/verify
```

3. **Check dashboard status:**
```bash
curl https://<your-domain>:3000/api/status
```

### View Logs

**Docker:**
```bash
docker logs -f algorithm-visualizer
```

**Phala Cloud:**
```bash
phala logs --app algorithm-visualizer --follow
```

**Kubernetes:**
```bash
kubectl logs -f deployment/algorithm-visualizer -n algorithm-visualizer
```

### Update Deployment

1. **Build new image:**
```bash
./docker-build.sh
```

2. **Push updated image:**
```bash
docker push registry.phala.network/$PHALA_CLUSTER_ID/algorithm-visualizer:latest
```

3. **Trigger rolling update:**
```bash
# Phala Cloud
phala update --app algorithm-visualizer

# Kubernetes
kubectl rollout restart deployment/algorithm-visualizer -n algorithm-visualizer
```

## Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Kill processes on required ports
lsof -ti:3000,8000,8001 | xargs kill -9
```

#### Docker Build Fails
```bash
# Clean Docker cache
docker system prune -a
docker volume prune

# Rebuild without cache
docker build --no-cache -f Dockerfile.production -t algorithm-visualizer:latest .
```

#### TEE Attestation Fails
1. Verify environment variables are set correctly
2. Check DSTACK_API_KEY is valid
3. Ensure PHALA_CLUSTER_ID and PHALA_CONTRACT_ID match your Phala account
4. Verify ENABLE_MOCK_MODE is set to "false" in production

#### Connection Refused
1. Check all services are running:
```bash
docker-compose ps
# or
kubectl get pods -n algorithm-visualizer
```

2. Verify port forwarding:
```bash
# For Kubernetes
kubectl port-forward svc/algorithm-visualizer-service 3000:3000 8000:8000 -n algorithm-visualizer
```

### Debug Mode

Enable debug logging:
```bash
export DEBUG=true
export LOG_LEVEL=debug
```

### Support

For issues specific to:
- **Phala Network**: Visit [Phala Documentation](https://docs.phala.network)
- **dStack SDK**: Check [dStack GitHub](https://github.com/Phala-Network/dstack-sdk)
- **Application**: Open an issue in the repository

## Security Considerations

1. **Never commit secrets to version control**
2. **Always use HTTPS in production**
3. **Keep TEE attestation enabled in production**
4. **Regularly update dependencies and base images**
5. **Monitor security advisories for all components**
6. **Use network policies in Kubernetes to restrict traffic**
7. **Enable audit logging for compliance**

## Performance Optimization

1. **Enable caching:**
   - Redis for session storage
   - CDN for static assets
   - API response caching

2. **Optimize Docker images:**
   - Use multi-stage builds
   - Minimize layer count
   - Use alpine-based images where possible

3. **Resource allocation:**
   - Set appropriate CPU/memory limits
   - Configure horizontal pod autoscaling
   - Use pod disruption budgets

## Backup and Recovery

1. **Backup configuration:**
```bash
# Export Kubernetes resources
kubectl get all -n algorithm-visualizer -o yaml > backup.yaml

# Backup Docker volumes
docker run --rm -v algorithm-visualizer_logs:/data -v $(pwd):/backup alpine tar czf /backup/logs-backup.tar.gz /data
```

2. **Restore from backup:**
```bash
# Restore Kubernetes resources
kubectl apply -f backup.yaml

# Restore Docker volumes
docker run --rm -v algorithm-visualizer_logs:/data -v $(pwd):/backup alpine tar xzf /backup/logs-backup.tar.gz -C /
```

---

## Quick Reference

### Essential Commands

```bash
# Local development
./install.sh          # Install dependencies
./launch.sh           # Start all services

# Docker deployment
./docker-build.sh     # Build production image
docker-compose up -d  # Run with Docker Compose

# Phala deployment
./deploy-phala.sh     # Deploy to Phala Cloud

# Kubernetes
kubectl apply -f k8s-phala-deployment.yaml  # Deploy to K8s
kubectl get pods -n algorithm-visualizer    # Check status
```

### URLs

- **Local Development:**
  - Dashboard: http://localhost:3000
  - API: http://localhost:8000
  - Docs: http://localhost:8000/docs

- **Production (Phala):**
  - Dashboard: https://<cluster-id>.phala.network:3000
  - API: https://<cluster-id>.phala.network:8000
  - Docs: https://<cluster-id>.phala.network:8000/docs

---

*Last updated: December 2024*
