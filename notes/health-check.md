# 🏥 health-check.sh - Container Health Monitor

## Purpose & Overview

The `health-check.sh` script is used by Docker's HEALTHCHECK instruction to monitor container service health. It runs automatically at intervals to determine if the container is healthy.

## Context

This script runs **automatically** inside the Docker container. It's not meant to be executed manually.

## Health Checks Performed

### 1. NextJS Service
```bash
wget -q --spider http://localhost:${NEXTJS_PORT}
```
- **Port**: 3000 (default)
- **Required**: Yes
- **Failure**: Container marked unhealthy

### 2. Python API Service
```bash
wget -q --spider http://localhost:${API_PORT}
```
- **Port**: 8000 (default)
- **Required**: Yes
- **Failure**: Container marked unhealthy

### 3. Bun Server (Optional)
```bash
if [ "$ENABLE_BUN_SERVER" = "true" ]; then
    wget -q --spider http://localhost:${BUN_PORT}
fi
```
- **Port**: 8001 (default)
- **Required**: No
- **Failure**: Warning only

## Configuration

### Environment Variables
```bash
PORT=${PORT:-3000}           # NextJS port
API_PORT=${API_PORT:-8000}   # Python API port
BUN_PORT=${BUN_PORT:-8001}   # Bun server port
ENABLE_BUN_SERVER=true       # Enable Bun check
```

### Docker HEALTHCHECK
In `Dockerfile.production`:
```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD /usr/local/bin/health-check.sh || exit 1
```

### Parameters
- **interval**: 30s between checks
- **timeout**: 10s per check
- **start-period**: 60s grace period
- **retries**: 3 failures before unhealthy

## Exit Codes

| Code | Status | Description |
|------|--------|-------------|
| 0 | Healthy | All required services responding |
| 1 | Unhealthy | One or more services not responding |

## Output Messages

### Success
```
All services healthy
```

### Failures
```
NextJS not responding on port 3000
Python API not responding on port 8000
Warning: Bun server not responding on port 8001
```

## Container Health States

### Healthy
- All required services responding
- Exit code 0
- Container continues running

### Unhealthy
- One or more services failed
- Exit code 1
- Container may be restarted

### Starting
- Within start-period grace time
- Health checks running but not enforced
- Container initializing

## Integration

### Docker Compose
```yaml
healthcheck:
  test: ["CMD", "/usr/local/bin/health-check.sh"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 60s
```

### Kubernetes
```yaml
livenessProbe:
  exec:
    command:
    - /usr/local/bin/health-check.sh
  initialDelaySeconds: 60
  periodSeconds: 30
  timeoutSeconds: 10
  failureThreshold: 3
```

## Monitoring

### Check Container Health
```bash
# Docker
docker ps --format "table {{.Names}}\t{{.Status}}"
docker inspect container-name --format='{{.State.Health.Status}}'

# Docker Compose
docker-compose ps

# View health check logs
docker inspect container-name --format='{{json .State.Health}}' | jq
```

### Health History
```bash
# Last 5 health checks
docker inspect container-name | jq '.[] | .State.Health.Log[-5:]'
```

## Debugging

### Manual Health Check
```bash
# Inside container
docker exec container-name /usr/local/bin/health-check.sh
echo $?  # Check exit code

# From outside
docker exec container-name wget -q --spider http://localhost:3000
docker exec container-name wget -q --spider http://localhost:8000
```

### Service-Specific Checks
```bash
# Check NextJS
docker exec container-name curl -I http://localhost:3000

# Check Python API
docker exec container-name curl http://localhost:8000/api/health

# Check Bun
docker exec container-name curl http://localhost:8001
```

## Common Issues

### False Positives
**Problem**: Services starting slowly
**Solution**: Increase `start_period` in HEALTHCHECK

### Network Issues
**Problem**: wget fails with network error
**Solution**: Check container networking

### Port Mismatch
**Problem**: Services on different ports
**Solution**: Set correct environment variables

## Troubleshooting

### Container Constantly Restarting

#### Check Logs
```bash
docker logs container-name --tail 50
```

#### Disable Health Check Temporarily
```bash
docker run --no-healthcheck algorithm-visualizer:latest
```

#### Increase Start Period
```dockerfile
HEALTHCHECK --start-period=120s ...
```

### Services Not Starting

#### Check Process List
```bash
docker exec container-name ps aux
```

#### Check Service Logs
```bash
docker exec container-name cat /tmp/nextjs.log
docker exec container-name cat /tmp/python_api.log
```

### Health Check Timeout

#### Increase Timeout
```dockerfile
HEALTHCHECK --timeout=30s ...
```

#### Simplify Check
```bash
# Just check if process exists
pgrep -f "next" && pgrep -f "python"
```

## Best Practices

### Efficient Checks
- Use `wget --spider` for minimal overhead
- Check only critical services
- Avoid complex logic

### Appropriate Timeouts
- Start period: 60-120s for initialization
- Interval: 30-60s for regular checks
- Timeout: 10-30s per check
- Retries: 3-5 attempts

### Error Handling
- Exit immediately on critical failure
- Log warnings for optional services
- Provide clear error messages

## Alternative Implementations

### Process-Based Check
```bash
#!/bin/sh
pgrep -f "next" > /dev/null || exit 1
pgrep -f "python.*main.py" > /dev/null || exit 1
exit 0
```

### Endpoint-Based Check
```bash
#!/bin/sh
curl -f http://localhost:3000/api/status || exit 1
curl -f http://localhost:8000/api/health || exit 1
exit 0
```

### File-Based Check
```bash
#!/bin/sh
test -f /tmp/nextjs.pid || exit 1
test -f /tmp/python.pid || exit 1
exit 0
```

## Related Files

### Configuration
- `Dockerfile.production` - HEALTHCHECK instruction
- `docker-compose.yml` - Health check config
- `docker-entrypoint.sh` - Creates health markers

### Monitoring
- `supervisord.conf` - Process management
- Service log files in `/tmp/`

---

**Quick Reference:**
- **Type**: Docker health check
- **Location**: `/usr/local/bin/health-check.sh`
- **Runs**: Every 30 seconds in container
- **Checks**: NextJS (3000), Python (8000), Bun (8001)
- **Result**: Container healthy/unhealthy status
