# 🛠️ Algorithm Visualizer Shell Scripts Guide

**Complete reference for all shell scripts and their execution order**

go to the notes/ to read which shells you need to go deploy in what order to launch this tool for yourself on phala cloud. Make sure to get your own AI API's and your own PHALA API for deployment. This entire repository is just to showoff how the entire dstack API can be leveraged, visualized and seen in order to prove what goes on with the Prover, when or if programs run inside a TEE. There's lot of things to prove, but not usually anything the public see's. So this is a tool to help get some of those nitty gritty meta proofs that come from the TEE, (Phala TDX) where we can actually attest to the Operating system, the Applications configuration, and it's network domain to prove code, agents, and websites are trusted under that domain. Makes for a much easier, containerize docker workflow. This tool gives you some visualization aid over the dstack.tee to ensure you have what you need to validate the archiecture, the attestations or your CICD pipeline is verifiably on. Test any endpoint, and visualize the endpoint's health, monitor your data with dstack, and go deeper in to the layers of trust you can pull. 

Check out idea's like RA- TLS, or RA - HTTPS... verify everything trust nothing. #zero Trust movement 

## 📋 Table of Contents

- [Overview](#overview)
- [Script Execution Order](#script-execution-order)
- [Script Categories](#script-categories)
- [Individual Script Documentation](#individual-script-documentation)
- [Environment Variable Management](#environment-variable-management)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

## 🎯 Overview

This repository contains **9 shell scripts** that handle different aspects of the Algorithm Visualizer deployment pipeline. Each script serves a specific purpose in the development, testing, building, and deployment workflow.

### Script Categories

| Category | Scripts | Purpose |
|----------|---------|---------|
| **Setup & Installation** | `install.sh` | Install dependencies and setup environment |
| **Development** | `launch.sh`, `templates/remote-attestation-template/start.sh` | Launch services for development |
| **Testing & Validation** | `test-system.sh`, `validate-tee.sh` | System testing and TEE validation |
| **Building & Deployment** | `docker-build.sh`, `deploy-tee.sh` | Build Docker images and deploy to TEE |
| **Runtime** | `docker-entrypoint.sh`, `health-check.sh` | Container runtime and health monitoring |

## 🔄 Script Execution Order

### **Phase 1: Initial Setup**
```bash
1. install.sh          # First run - installs all dependencies
2. test-system.sh       # Optional - verify system requirements
```

### **Phase 2: Development Workflow**
```bash
3. validate-tee.sh      # Validate TEE configuration and environment
4. launch.sh            # Start all development services
```

### **Phase 3: Production Deployment**
```bash
5. docker-build.sh      # Build production Docker image
6. deploy-tee.sh        # Deploy to Phala TEE using phala CLI
```

### **Phase 4: Runtime (Automated)**
```bash
7. docker-entrypoint.sh # Container initialization (automatic)
8. health-check.sh      # Health monitoring (automatic)
```

### **Phase 5: Template-Specific**
```bash
9. start.sh             # Alternative launcher for remote-attestation-template
```

## 📖 Individual Script Documentation

### 🔧 Setup & Installation

#### [`install.sh`](notes/install.md)
**Purpose**: Complete system setup and dependency installation
- **Dependencies**: Node.js, Python, npm, pip, Git, Bun (optional)
- **Actions**: 
  - System requirements check
  - Port cleanup
  - Install main repository dependencies
  - Install all template dependencies
  - Create environment files
  - Setup test files
  - Verification

**Usage**:
```bash
./install.sh
```

### 🚀 Development

#### [`launch.sh`](notes/launch.md)
**Purpose**: Launch all services for development with health monitoring
- **Services**: NextJS (3000), Python API (8000), Bun Server (8001)
- **Features**:
  - Health checks before startup
  - Port conflict resolution
  - Service monitoring and auto-restart
  - Graceful shutdown handling

**Usage**:
```bash
./launch.sh
```

#### [`templates/remote-attestation-template/start.sh`](notes/start.md)
**Purpose**: Simple launcher for remote attestation template only
- **Services**: NextJS, Python API, Bun Server (if available)
- **Use Case**: When working specifically on the remote attestation template

**Usage**:
```bash
cd templates/remote-attestation-template
./start.sh
```

### 🧪 Testing & Validation

#### [`test-system.sh`](notes/test-system.md)
**Purpose**: System requirements and installation verification
- **Tests**:
  - Script existence and permissions
  - Template directory structure
  - Runtime dependencies (Node.js, Python, Bun)
  - Port availability
  - Component integrity

**Usage**:
```bash
./test-system.sh
```

#### [`validate-tee.sh`](notes/validate-tee.md)
**Purpose**: TEE environment and attestation validation
- **Validations**:
  - Phala TEE API connectivity
  - Local service health checks
  - Environment variable validation
  - Attestation module testing
  - Sample attestation generation

**Usage**:
```bash
./validate-tee.sh
```

### 🐳 Building & Deployment

#### [`docker-build.sh`](notes/docker-build.md)
**Purpose**: Build production Docker image
- **Features**:
  - Multi-tag image creation
  - Build metadata injection
  - Git commit tracking
  - Build verification

**Usage**:
```bash
./docker-build.sh
```

#### [`deploy-tee.sh`](notes/deploy-tee.md)
**Purpose**: Deploy application to Phala TEE using phala CLI
- **Process**:
  - Environment validation
  - Docker image building
  - Docker Hub push
  - Phala CLI deployment
  - CVM status verification
  - Attestation testing

**Usage**:
```bash
./deploy-tee.sh
```

### 🏃 Runtime

#### [`docker-entrypoint.sh`](notes/docker-entrypoint.md)
**Purpose**: Container initialization and runtime setup
- **Functions**:
  - Environment validation
  - TEE environment detection
  - Python path configuration
  - Health check setup
  - Service startup

**Usage**: Automatic (Docker container entry point)

#### [`health-check.sh`](notes/health-check.md)
**Purpose**: Container health monitoring
- **Checks**:
  - NextJS service health
  - Python API health
  - Bun server health (optional)
  - Service responsiveness

**Usage**: Automatic (Docker health check)

## 🔐 Environment Variable Management

### Environment File Hierarchy

1. **`.env.production`** - Local development (gitignored)
2. **Docker environment variables** - Container runtime
3. **Kubernetes ConfigMaps/Secrets** - K8s deployment

### Key Variables

| Variable | Purpose | Required | Scripts Using |
|----------|---------|----------|---------------|
| `PHALA_API_KEY` | Phala Network API access | Yes | validate-tee.sh, deploy-phala.sh |
| `PHALA_CLUSTER_ID` | Phala cluster identifier | Yes | deploy-phala.sh, docker-entrypoint.sh |
| `PHALA_CONTRACT_ID` | Phala contract identifier | Yes | deploy-phala.sh, docker-entrypoint.sh |
| `PHALA_ENDPOINT` | Phala TEE API endpoint | No | All TEE scripts |
| `DSTACK_API_KEY` | dStack API key | Yes | docker-entrypoint.sh |
| `NODE_ENV` | Node environment | No | All scripts |
| `TEE_ENVIRONMENT` | TEE environment mode | No | TEE scripts |

### Environment Loading Pattern

All scripts follow this pattern:
```bash
# Load environment from .env.production if exists
if [ -f ".env.production" ]; then
    export $(cat .env.production | grep -v '^#' | xargs)
    echo "✓ Loaded production environment"
fi
```

## 🚨 Troubleshooting

### Common Issues

#### Port Conflicts
**Problem**: Services fail to start due to port conflicts
**Solution**: Scripts automatically kill conflicting processes
```bash
# Manual port cleanup
lsof -ti:3000,8000,8001 | xargs kill -9
```

#### Missing Dependencies
**Problem**: Scripts fail due to missing system dependencies
**Solution**: Run system checks and install missing components
```bash
./test-system.sh  # Check what's missing
./install.sh      # Install dependencies
```

#### Environment Variables
**Problem**: Scripts fail due to missing environment variables
**Solution**: Create and configure `.env.production`
```bash
cp .env.production.example .env.production
# Edit with your actual values
```

#### Docker Build Failures
**Problem**: Docker build fails or images are corrupted
**Solution**: Clean and rebuild
```bash
docker system prune -a
./docker-build.sh --no-cache
```

### Script Debugging

Enable debug mode in any script:
```bash
# Add to beginning of script
set -x  # Enable debug output
set -e  # Exit on error
```

View script logs:
```bash
# Development logs
tail -f /tmp/nextjs.log
tail -f /tmp/python_api.log
tail -f /tmp/bun_server.log

# Docker logs
docker-compose logs -f
```

## 💡 Best Practices

### Script Execution

1. **Always run from repository root**:
   ```bash
   cd /path/to/algorithm-visualizer
   ./script-name.sh
   ```

2. **Make scripts executable**:
   ```bash
   chmod +x *.sh
   ```

3. **Check environment before running**:
   ```bash
   ./test-system.sh     # System check
   ./validate-tee.sh    # Environment check
   ```

### Development Workflow

1. **Initial setup** (once):
   ```bash
   ./install.sh
   ```

2. **Daily development**:
   ```bash
   ./validate-tee.sh    # Check configuration
   ./launch.sh          # Start services
   ```

3. **Before deployment**:
   ```bash
   ./test-system.sh     # Verify system
   ./docker-build.sh    # Build image
   ./deploy-phala.sh    # Deploy
   ```

### Security Considerations

1. **Never commit `.env.production`** - Already in `.gitignore`
2. **Use environment variables in production** - Not `.env` files
3. **Rotate API keys regularly**
4. **Monitor script logs** for security events
5. **Validate inputs** in custom scripts

### Performance Optimization

1. **Parallel operations** where possible
2. **Cache Docker layers** effectively
3. **Clean up resources** after script completion
4. **Monitor resource usage** during development

## 📚 Additional Resources

- [Individual Shell Script Documentation](notes/)
- [Docker Configuration Guide](DEPLOYMENT.md)
- [Phala Network TEE Documentation](https://docs.phala.network/)
- [Environment Setup Guide](README.md#environment-setup)
- [Zero Trust Architecture](https://www.nist.gov/publications/zero-trust-architecture)

---

**Need Help?**
- Check individual script documentation in [`notes/`](notes/)
- Review troubleshooting section above
- Run `./test-system.sh` for system diagnostics
- Check service logs in `/tmp/` directory
- Learn about RA-TLS and RA-HTTPS for trust verification

*This guide demonstrates Zero Trust principles: "Never trust, always verify" using hardware attestation.*
