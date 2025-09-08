# ⚠️ deploy-phala.sh - DEPRECATED

## Status: REPLACED by deploy-tee.sh

This script has been **deprecated** in favor of `deploy-tee.sh` which uses the actual Phala CLI tool for deployment.

## Why Deprecated?

1. **Theoretical Implementation**: Used hypothetical Phala registry that doesn't exist
2. **No CLI Integration**: Didn't use the official `phala` CLI tool  
3. **Complex Configuration**: Required manual JSON configuration
4. **No Docker Hub**: Attempted to use non-existent Phala registry

## Migration Guide

### Old Approach (deploy-phala.sh)
```bash
# Theoretical registry push
docker push registry.phala.network/$CLUSTER_ID/image:latest

# Manual JSON configuration
cat > phala-deployment.json << EOF
{...complex config...}
EOF

# Hypothetical deployment
curl -X POST $PHALA_ENDPOINT/deploy
```

### New Approach (deploy-tee.sh)
```bash
# Real Docker Hub push
docker push dylanckawalec/attestation-dashboard:latest

# Phala CLI deployment
phala deploy \
    --compose docker-compose.tee.yml \
    --env-file .env.production \
    --name "attestation-dashboard"
```

## Key Differences

| Feature | deploy-phala.sh | deploy-tee.sh |
|---------|-----------------|---------------|
| **Registry** | Phala (theoretical) | Docker Hub (real) |
| **CLI Tool** | curl/API calls | phala CLI |
| **Configuration** | JSON file | docker-compose.yml |
| **Authentication** | Bearer token | phala auth |
| **Deployment** | API endpoint | phala deploy |
| **Monitoring** | API calls | phala cvms commands |

## What to Use Instead

Use `deploy-tee.sh` for all Phala TEE deployments:

```bash
# Ensure phala CLI is installed
npm install -g phala

# Run the new deployment script
./deploy-tee.sh
```

## Features in deploy-tee.sh

The new script provides:
- ✅ Real Docker Hub integration
- ✅ Official phala CLI usage
- ✅ CVM (Confidential VM) management
- ✅ Proper TEE socket mounting
- ✅ Health check verification
- ✅ Attestation testing

## If You Have deploy-phala.sh

### Remove It
```bash
rm deploy-phala.sh
```

### Use deploy-tee.sh
```bash
./deploy-tee.sh
```

## Historical Reference

The original `deploy-phala.sh` attempted to:
1. Build Docker image locally
2. Tag for hypothetical Phala registry
3. Push to non-existent registry endpoint
4. Create JSON deployment configuration
5. Deploy via API calls

This approach was based on early documentation but has been superseded by the official Phala CLI tool.

## Related Documentation

- [deploy-tee.md](deploy-tee.md) - Current deployment script
- [docker-build.md](docker-build.md) - Docker image building
- [Phala CLI Documentation](https://docs.phala.network/cli)

---

**Status**: ❌ DEPRECATED - Use `deploy-tee.sh` instead
