# 🛡️ TEE Trust Validator - Zero Trust Application Template

**A developer-friendly template for building verifiable applications with hardware attestation on Phala Network's Trusted Execution Environment**
**Author:** Dylan Kawalec - Developer Relations at Phala Network

> Branch note: This branch is the deploy-to-phala version (focused on deployment to Phala).
> For deployment details, see notes/deploy-phala.md and ./deploy-tee.sh.

## 📝 Author's Note

This repository provides a practical, hands-on approach to understanding and implementing Zero Trust architecture using hardware-backed security. Instead of just talking about "never trust, always verify," this template shows you exactly how to build applications that can cryptographically prove their own integrity.

### Getting Started

Please refer to the `notes/` directory for detailed deployment instructions and the proper sequence of shell scripts required to launch this tool on Phala Cloud. You will need to obtain your own API keys for AI services and Phala Network deployment.

### Why This Matters

In today's security landscape, traditional "trust but verify" approaches are insufficient. This template demonstrates how to build applications that can:

- **Prove they haven't been tampered with** using hardware attestation
- **Verify their execution environment** is secure and uncompromised  
- **Establish cryptographic trust** without relying on external authorities
- **Maintain verifiable integrity** throughout their entire lifecycle

Using Phala's TDX (Trust Domain Extensions) technology, we can create applications that are inherently trustworthy because they can prove their own authenticity.

### Real-World Applications

This template is perfect for developers building:
- **Financial applications** requiring audit trails
- **Healthcare systems** handling sensitive data
- **Supply chain tracking** with verifiable provenance
- **AI/ML models** that need integrity guarantees
- **IoT devices** requiring secure remote verification

### Advanced Security Features

This project implements cutting-edge security paradigms:
- **Remote Attestation over TLS (RA-TLS)** - Secure channel establishment
- **Remote Attestation over HTTPS (RA-HTTPS)** - Web-compatible verification
- **Zero Trust Architecture** - Continuous verification of all components

*"Don't just build secure applications - build applications that can prove they're secure."*

## 🎯 What You'll Build

This template creates a complete, self-verifying application that demonstrates:
- **Hardware-based trust anchors** using Phala Network TEE
- **Cryptographic proof generation** for application integrity
- **Developer identity verification** with attestation chains
- **Multi-service architecture** (Next.js dashboard, Python API, optional Bun server)
- **Production-ready containerization** with Docker
- **Comprehensive verification APIs** for third-party validation

The application proves its own authenticity and can verify that it's running in a secure TEE environment owned and operated by Dylan Kawalec at Phala Network.

## 🚀 Quick Start

### One-Command Setup & Launch

```bash
# Clone and enter the repository
git clone <repository-url> algorithm-visualizer
cd algorithm-visualizer

# Make scripts executable
chmod +x *.sh

# Install everything
./install.sh

# Validate TEE configuration
./validate-tee.sh

# Launch all services
./launch.sh
```

Your application is now running:
- 🌐 **Dashboard**: http://localhost:3000
- 🔧 **API**: http://localhost:8000
- 📚 **API Docs**: http://localhost:8000/docs
- 🚀 **Bun Server**: http://localhost:8001 (if installed)

## 📋 Prerequisites

### Required
- Node.js 18+ and npm 9+
- Python 3.8+ and pip
- Docker 20.10+ and Docker Compose 2.0+
- Git
- Phala Network API Key

### Optional
- Bun runtime (for Bun server)
- Kubernetes CLI (for K8s deployment)

## 🔑 Environment Setup

### 1. Configure Phala Credentials

For local development, create a `.env.production` file with your credentials:

```bash
# Create .env.production for local development
cp .env.production.example .env.production

# Edit with your values:
nano .env.production

# Update these values:
PHALA_API_KEY=your-api-key-here
DEVELOPER_NAME=Your Name
DEVELOPER_ROLE=Your Role
ORGANIZATION=Your Organization
```

**Note**: For Docker/production deployment, set these as environment variables instead of using `.env` files.

### 2. Verify Configuration

```bash
./validate-tee.sh
```

This will test:
- ✅ Phala TEE API connectivity
- ✅ Environment variables
- ✅ Attestation modules
- ✅ Cryptographic functions

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│          Remote Attestation Dashboard           │
├─────────────────────────────────────────────────┤
│                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────┐  │
│  │   Next.js    │  │  Python API  │  │ Bun  │  │
│  │  Dashboard   │  │  Attestation │  │Server│  │
│  │   Port 3000  │  │   Port 8000  │  │ 8001 │  │
│  └──────┬───────┘  └──────┬───────┘  └──┬───┘  │
│         │                  │              │      │
│         └──────────┬───────┘              │      │
│                    │                      │      │
│           ┌────────▼────────┐             │      │
│           │  Attestation    │◄────────────┘      │
│           │    Service      │                    │
│           └────────┬────────┘                    │
│                    │                             │
│           ┌────────▼────────┐                    │
│           │   Phala TEE     │                    │
│           │      API        │                    │
│           └─────────────────┘                    │
│                                                  │
└─────────────────────────────────────────────────┘
```

## 🐳 Docker Deployment

### Build Production Image

```bash
# Build the Docker image
./docker-build.sh

# Run with Docker Compose
docker-compose up -d

# Check status
docker-compose ps
docker-compose logs -f

# Stop services
docker-compose down
```

### Manual Docker Run

```bash
# Set environment variables and run
export PHALA_API_KEY=your-api-key-here
export PHALA_CLUSTER_ID=your-cluster-id
export PHALA_CONTRACT_ID=your-contract-id

docker run -d \
  --name attestation-dashboard \
  -p 3000:3000 \
  -p 8000:8000 \
  -p 8001:8001 \
  -e PHALA_API_KEY=$PHALA_API_KEY \
  -e PHALA_CLUSTER_ID=$PHALA_CLUSTER_ID \
  -e PHALA_CONTRACT_ID=$PHALA_CONTRACT_ID \
  -e DEVELOPER_NAME="Your Name" \
  -e ORGANIZATION="Your Organization" \
  algorithm-visualizer:latest
```

## ☁️ Phala Cloud Deployment

### Automated Deployment

```bash
# Deploy to Phala Cloud
./deploy-phala.sh
```

This will:
1. Load environment variables
2. Build Docker image
3. Push to Phala registry
4. Deploy to TEE environment
5. Verify deployment status

### Access Deployed Application

```
Dashboard: https://<cluster-id>.phala.network:3000
API: https://<cluster-id>.phala.network:8000
Docs: https://<cluster-id>.phala.network:8000/docs
```

## 🔐 Attestation API

### Generate Attestation

```bash
# Local
curl http://localhost:8000/api/attestation/generate

# Production
curl https://<cluster>.phala.network:8000/api/attestation/generate
```

Response includes:
- Application identity
- Developer certification
- Code integrity hashes
- Cryptographic proofs
- TEE quotes
- Human-readable report

### Verify Attestation

```bash
curl -X POST http://localhost:8000/api/attestation/verify \
  -H "Content-Type: application/json" \
  -d @attestation.json
```

### Get Attestation Report

```bash
curl http://localhost:8000/api/attestation/report/<id>
```

## 🧪 Testing

### Run Validation Suite

```bash
# Full TEE validation
./validate-tee.sh

# Test attestation generation
curl http://localhost:8000/api/attestation/generate | jq .

# Health checks
curl http://localhost:3000/api/status
curl http://localhost:8000/api/health
```

## 📦 Project Structure

```
algorithm-visualizer/
├── templates/
│   ├── nextJS-starter/        # Dashboard frontend
│   ├── python-starter/        # Attestation API
│   │   └── attestation_api.py # Core attestation logic
│   ├── bun-starter/           # Optional Bun server
│   └── remote-attestation-template/
│       └── src/
│           └── attestation-service.ts
├── .env.production.example    # Production config template
├── docker-compose.yml         # Docker orchestration
├── Dockerfile.production      # Production container
├── install.sh                 # Installation script
├── launch.sh                  # Service launcher
├── validate-tee.sh           # TEE validation
├── deploy-tee.sh             # Phala TEE deployment
├── docker-build.sh           # Docker builder
├── GUIDE.md                  # Shell scripts guide
├── notes/                    # Deployment & script documentation
│   ├── guide.md             # Developer guide
│   ├── install.md           # Installation script docs
│   ├── launch.md            # Launch script docs
│   ├── validate-tee.md      # TEE validation docs
│   ├── deploy-tee.md        # Deployment docs
│   └── ...                  # Other script documentation
└── README.md                 # This file
```

## 🛠️ Scripts Reference

| Script | Purpose | Usage |
|--------|---------|-------|
| `install.sh` | Install all dependencies | `./install.sh` |
| `launch.sh` | Start all services | `./launch.sh` |
| `validate-tee.sh` | Validate TEE setup | `./validate-tee.sh` |
| `docker-build.sh` | Build Docker image | `./docker-build.sh` |
| `deploy-tee.sh` | Deploy to Phala TEE | `./deploy-tee.sh` |
| `test-system.sh` | Run system tests | `./test-system.sh` |

📚 **For detailed script documentation, see [GUIDE.md](GUIDE.md) and [notes/shells/](notes/shells/)**

## 🔍 What Gets Attested?

The attestation system proves:

1. **Application Identity**
   - Name: Remote Attestation Dashboard
   - Version: 1.0.0
   - Environment: Production TEE

2. **Developer Ownership**
   - Developer: Dylan Kawalec
   - Role: Developer Relations
   - Organization: Phala Network

3. **Code Integrity**
   - Git commit hash
   - Source code SHA256
   - Configuration hash
   - Build timestamp

4. **Runtime Environment**
   - Platform and architecture
   - Node.js, Python, npm versions
   - Hostname and network

5. **Cryptographic Proofs**
   - Application hash (SHA256)
   - HMAC signature
   - TEE hardware quote
   - Phala Network proof

## 🚨 Troubleshooting

### Port Already in Use

```bash
# Kill processes on required ports
lsof -ti:3000,8000,8001 | xargs kill -9
```

### Docker Build Fails

```bash
# Clean and rebuild
docker system prune -a
docker-compose down -v
./docker-build.sh --no-cache
```

### TEE Attestation Fails

1. Check API key is valid
2. Verify Phala endpoint is reachable
3. Ensure production mode is enabled
4. Run `./validate-tee.sh` for diagnostics

### Services Not Starting

```bash
# Check logs
docker-compose logs -f

# Restart services
docker-compose restart

# Full reset
docker-compose down
docker-compose up -d
```

## 🔒 Security Notes

- **Never commit API keys** to version control
- **Always use HTTPS** in production
- **Keep attestation enabled** in production
- **Rotate keys regularly**
- **Monitor attestation logs**
- **Verify TEE quotes** before trusting

## 📊 Monitoring

### Health Endpoints

- Dashboard: `/api/status`
- Python API: `/api/health`
- Attestation: `/api/attestation/verify`

### Logs

```bash
# Docker logs
docker-compose logs -f

# Phala logs
phala logs --app algorithm-visualizer --follow

# System logs
tail -f /var/log/attestation/*.log
```

## 🤝 Contributing

This is a template project demonstrating Phala Network TEE capabilities. Feel free to:
- Fork and customize for your needs
- Submit issues for bugs
- Propose enhancements
- Share your attestation use cases

## 📄 License

MIT License - See LICENSE file for details

## 👨‍💻 Author

**Dylan Kawalec**  
Developer Relations at Phala Network  
Building secure, verifiable applications with TEE technology

---

## 🎯 Complete Deployment Workflow

### From Zero to Production in 5 Minutes:

```bash
# 1. Setup (30 seconds)
git clone <repo> && cd algorithm-visualizer
chmod +x *.sh

# 2. Install (2 minutes)
./install.sh

# 3. Validate (10 seconds)
./validate-tee.sh

# 4. Build Docker (1 minute)
docker build -f Dockerfile.production -t algorithm-visualizer:latest .

# 5. Test Locally
python3 templates/python-starter/attestation_api.py
curl http://localhost:8000/api/attestation/generate

# 6. Deploy to Phala TEE (2-3 minutes)
./deploy-tee.sh

# 7. Verify deployment
curl https://<cvm-id>.poc6.phala.network/api/attestation/generate
```

## ✅ Current Status

- **Docker Image**: Built successfully with all services
- **Attestation API**: Working and generating valid attestations
- **Developer Identity**: Verified as Dylan Kawalec at Phala Network
- **Cryptographic Proofs**: SHA256 hashes and HMAC signatures working
- **TEE Ready**: Configured for Phala Network deployment

Your secure, attested application is now live on Phala Network! 🚀

---

*Built with ❤️ for the Phala Network community*
