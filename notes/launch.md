# 🚀 launch.sh - Development Services Launcher

## Purpose & Overview

The `launch.sh` script is the **primary development launcher** that starts all services with comprehensive health monitoring, automatic restarts, and graceful shutdown handling.

## Prerequisites

### System Requirements
- Completed installation (`./install.sh`)
- Node.js, Python, and optionally Bun installed
- All template dependencies installed

### Environment Setup
- `.env.production` file (optional, for local development)
- Template-specific environment files

### Permissions
```bash
chmod +x launch.sh
```

## Usage & Examples

### Basic Launch
```bash
./launch.sh
```

### What It Launches

#### Services Started
1. **NextJS Dashboard** (Port 3000)
   - React-based frontend
   - Development server with hot reload
   - API status endpoints

2. **Python API Server** (Port 8000)
   - FastAPI-based backend
   - Attestation endpoints
   - Interactive API documentation

3. **Bun Server** (Port 8001) - Optional
   - High-performance JavaScript runtime
   - Alternative API implementation
   - Only if Bun is installed

## Configuration Options

### Port Configuration
```bash
NEXTJS_PORT=3000
PYTHON_PORT=8000
BUN_PORT=8001
```

### Health Check Settings
```bash
HEALTH_CHECK_RETRIES=10    # Number of retry attempts
HEALTH_CHECK_DELAY=2       # Seconds between retries
```

### Service URLs
After successful launch:
- **NextJS Dashboard**: http://localhost:3000
- **Python API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Bun Server**: http://localhost:8001 (if available)

## Features

### 1. Pre-Launch Health Checks
- System dependency verification
- Port availability checking
- Template directory validation
- Node modules verification

### 2. Port Conflict Resolution
- Automatically detects port conflicts
- Kills conflicting processes
- Waits for ports to become available

### 3. Service Health Monitoring
- Waits for each service to become responsive
- HTTP health checks with retry logic
- Visual progress indicators

### 4. Background Process Management
- Starts services in background
- Tracks process IDs (PIDs)
- Handles process lifecycle

### 5. Automatic Service Recovery
- Monitors service health every 30 seconds
- Automatically restarts failed services
- Maintains service availability

### 6. Graceful Shutdown
- Handles Ctrl+C signal
- Stops all services cleanly
- Cleans up background processes

## Error Handling

### Common Issues

#### Port Already in Use
```
Warning: Port 3000 is in use, killing process...
```
**Solution**: Script automatically resolves port conflicts

#### Service Failed to Start
```
ERROR: NextJS Dashboard failed to start on port 3000
```
**Solution**: Check logs, verify dependencies

#### Health Check Timeout
```
NextJS Dashboard failed to start on port 3000
```
**Solution**: Check service logs, verify configuration

### Log Files
Service logs are written to:
- NextJS: `/tmp/nextjs.log`
- Python API: `/tmp/python_api.log`
- Bun Server: `/tmp/bun_server.log`

## Service Status Display

### Success Output
```
╔════════════════════════════════════════════════════════════╗
║             All Services Running Successfully! 🎉          ║
╚════════════════════════════════════════════════════════════╝

📍 Service URLs:
   • NextJS Dashboard:  http://localhost:3000
   • Python API:        http://localhost:8000
   • API Documentation: http://localhost:8000/docs
   • Bun Server:        http://localhost:8001

📊 Service Status:
   • NextJS:     ✅ Running
   • Python API: ✅ Running
   • Bun Server: ✅ Running

📝 Logs:
   • NextJS:     /tmp/nextjs.log
   • Python API: /tmp/python_api.log
   • Bun Server: /tmp/bun_server.log

🛑 To stop all services: Press Ctrl+C
```

## Monitoring & Recovery

### Automatic Health Monitoring
The script continuously monitors service health:

```bash
# Every 30 seconds, checks:
curl -s http://localhost:3000  # NextJS health
curl -s http://localhost:8000  # Python API health
curl -s http://localhost:8001  # Bun server health
```

### Auto-Recovery Process
1. Detects service failure
2. Logs warning message
3. Attempts service restart
4. Continues monitoring

### Manual Service Restart
If a service fails repeatedly:
```bash
# Kill and restart manually
pkill -f "next dev"
pkill -f "python.*main.py"
./launch.sh
```

## Related Scripts

### Prerequisites
- `./install.sh` - Must be run first
- `./test-system.sh` - Recommended before launch
- `./validate-tee.sh` - TEE environment setup

### Alternative Launchers
- `templates/remote-attestation-template/start.sh` - Template-only launcher

### Monitoring
- `./health-check.sh` - Standalone health checker

## Troubleshooting

### Services Won't Start

#### Check Dependencies
```bash
./test-system.sh
```

#### Check Environment
```bash
./validate-tee.sh
```

#### Manual Port Cleanup
```bash
lsof -ti:3000,8000,8001 | xargs kill -9
```

### Service Crashes

#### Check Logs
```bash
tail -f /tmp/nextjs.log
tail -f /tmp/python_api.log
tail -f /tmp/bun_server.log
```

#### Check Process Status
```bash
ps aux | grep -E "(next|python|bun)"
```

### Performance Issues

#### Memory Usage
```bash
top -p $(pgrep -f "next dev")
top -p $(pgrep -f "python.*main.py")
```

#### Port Conflicts
```bash
lsof -i :3000
lsof -i :8000
lsof -i :8001
```

### Development Workflow Issues

#### Hot Reload Not Working
- Check NextJS log: `/tmp/nextjs.log`
- Verify file watching permissions
- Restart NextJS service

#### API Changes Not Reflected
- Check Python API log: `/tmp/python_api.log`
- Verify Python module reloading
- Restart Python API service

## Best Practices

### Development Workflow
1. **Always run from project root**:
   ```bash
   cd /path/to/algorithm-visualizer
   ./launch.sh
   ```

2. **Check system first**:
   ```bash
   ./test-system.sh && ./launch.sh
   ```

3. **Monitor logs during development**:
   ```bash
   # In separate terminal
   tail -f /tmp/*.log
   ```

### Performance Optimization
- Close unnecessary browser tabs
- Monitor memory usage with `top` or `htop`
- Use `Ctrl+C` for clean shutdown

### Security Notes
- Services run on localhost only
- No external network exposure by default
- Environment variables loaded securely

---

**Quick Commands:**
- **Start**: `./launch.sh`
- **Stop**: `Ctrl+C`
- **Logs**: `tail -f /tmp/*.log`
- **Status**: Check URLs in browser
