# 🚪 docker-entrypoint.sh - Container Entry Point

## Purpose & Overview

The `docker-entrypoint.sh` script is the container entry point that initializes the runtime environment and validates configuration before starting services.

## Context

This script runs **automatically** when the Docker container starts. It's not meant to be executed manually.

## Execution Flow

### 1. Environment Display
```bash
echo "🚀 Starting Algorithm Visualizer + dStack Platform"
echo "Environment: ${NODE_ENV:-production}"
echo "TEE Environment: ${TEE_ENVIRONMENT:-production}"
```

### 2. Production Validation
Checks if running in production mode:
```bash
if [ "$ENABLE_MOCK_MODE" = "false" ] && [ "$REQUIRE_ATTESTATION" = "true" ]; then
    # Validate DSTACK_API_KEY
    # Warn about Phala configuration
fi
```

### 3. TEE Environment Detection
```bash
if [ -f "/dev/attestation/quote" ]; then
    echo "✅ Running in TEE environment"
    export IS_TEE_ENVIRONMENT=true
else
    echo "ℹ️ Not running in TEE environment"
    export IS_TEE_ENVIRONMENT=false
fi
```

### 4. Path Configuration
```bash
export PYTHONPATH="/app/templates/remote-attestation-template/api:$PYTHONPATH"
export PATH="/home/nextjs/.local/bin:$PATH"
```

### 5. Health Check Setup
```bash
touch /tmp/health_status
```

### 6. Service Startup
```bash
exec "$@"  # Execute main command (supervisord)
```

## Environment Variables

### Required in Production
| Variable | Description | Required |
|----------|-------------|----------|
| `DSTACK_API_KEY` | dStack API authentication | Yes (production) |
| `PHALA_CLUSTER_ID` | Phala cluster identifier | Warning if missing |
| `PHALA_CONTRACT_ID` | Phala contract identifier | Warning if missing |

### Configuration Flags
| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | production | Node environment |
| `TEE_ENVIRONMENT` | production | TEE environment mode |
| `ENABLE_MOCK_MODE` | false | Enable mock attestation |
| `REQUIRE_ATTESTATION` | true | Require attestation |
| `IS_TEE_ENVIRONMENT` | auto-detected | TEE availability |

### Service Ports
```bash
PORT=3000        # NextJS port
API_PORT=8000    # Python API port
BUN_PORT=8001    # Bun server port
```

## TEE Detection

The script checks for TEE availability:

### TEE Available
```bash
/dev/attestation/quote exists
IS_TEE_ENVIRONMENT=true
```

### TEE Not Available
```bash
/dev/attestation/quote missing
IS_TEE_ENVIRONMENT=false
```

## Error Handling

### Fatal Errors

#### Missing API Key
```
❌ Error: DSTACK_API_KEY is required in production mode
exit 1
```
**Container stops** - Must provide API key

### Warnings

#### Incomplete Phala Config
```
⚠️ Warning: Phala configuration not complete
```
**Container continues** - Non-fatal warning

## Integration Points

### Called By
- Docker container startup
- `CMD` in Dockerfile.production
- Docker Compose

### Calls
- `supervisord` - Process manager
- Main application command

### Files Created
- `/tmp/health_status` - Health check marker

## Container Lifecycle

### Startup Sequence
1. Container starts
2. `docker-entrypoint.sh` runs
3. Environment validated
4. Paths configured
5. `supervisord` started
6. Services launched

### Shutdown Sequence
1. SIGTERM received
2. Script forwards signal
3. Services stop gracefully
4. Container exits

## Debugging

### View Entry Point Logs
```bash
# During startup
docker logs container-name

# Follow logs
docker logs -f container-name

# Last 50 lines
docker logs --tail 50 container-name
```

### Test Entry Point
```bash
# Run with shell
docker run -it algorithm-visualizer:latest sh

# Test entry point directly
docker run --entrypoint /usr/local/bin/docker-entrypoint.sh \
  algorithm-visualizer:latest echo "test"
```

### Override Entry Point
```bash
# Skip entry point
docker run --entrypoint sh algorithm-visualizer:latest

# Custom entry point
docker run --entrypoint /bin/bash algorithm-visualizer:latest
```

## Security Features

### Validation
- Checks required credentials
- Validates production mode
- Detects TEE environment

### Path Security
- Uses absolute paths
- Controlled PATH export
- Python path isolation

### Process Security
- Runs as non-root user (nextjs)
- Limited permissions
- No shell expansion risks

## Common Issues

### Script Not Found
```
exec: /usr/local/bin/docker-entrypoint.sh: not found
```
**Solution**: Check Dockerfile COPY command

### Permission Denied
```
Permission denied: /usr/local/bin/docker-entrypoint.sh
```
**Solution**: Ensure script is executable in Dockerfile

### Environment Issues
```
Error: DSTACK_API_KEY is required in production mode
```
**Solution**: Pass environment variables to container

## Best Practices

### Environment Variables
```bash
# Docker run
docker run -e DSTACK_API_KEY=xxx algorithm-visualizer:latest

# Docker Compose
environment:
  - DSTACK_API_KEY=${DSTACK_API_KEY}

# Kubernetes
envFrom:
  - secretRef:
      name: app-secrets
```

### Health Checks
The entry point creates `/tmp/health_status` for health monitoring:
```dockerfile
HEALTHCHECK CMD test -f /tmp/health_status
```

### Signal Handling
Uses `exec "$@"` to ensure proper signal forwarding:
- SIGTERM for graceful shutdown
- SIGINT for immediate stop
- Signals reach main process

## Related Files

### Configuration
- `Dockerfile.production` - Copies and sets permissions
- `docker-compose.yml` - Environment variables
- `supervisord.conf` - Process management

### Health Monitoring
- `health-check.sh` - Service health validation
- Docker HEALTHCHECK - Container health

## Troubleshooting

### Container Won't Start

#### Check Logs
```bash
docker logs container-name
```

#### Run Interactively
```bash
docker run -it algorithm-visualizer:latest
```

#### Debug Mode
```bash
docker run -e DEBUG=true algorithm-visualizer:latest
```

### Environment Issues

#### List Environment
```bash
docker exec container-name env
```

#### Test Specific Variable
```bash
docker exec container-name sh -c 'echo $DSTACK_API_KEY'
```

---

**Quick Reference:**
- **Type**: Container entry point
- **Location**: `/usr/local/bin/docker-entrypoint.sh`
- **Runs**: Automatically on container start
- **Purpose**: Initialize and validate environment
- **Output**: Starts supervisord
