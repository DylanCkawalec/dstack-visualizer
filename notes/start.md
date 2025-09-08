# 🎯 start.sh - Template Quick Launcher

## Purpose & Overview

The `start.sh` script is a **simple launcher** specifically for the remote-attestation-template. It's a lightweight alternative to the main `launch.sh` script when working only with the template.

## Location

```
templates/remote-attestation-template/start.sh
```

## Prerequisites

### System Requirements
- Node.js and npm installed
- Python 3 installed
- Bun (optional)
- Dependencies installed in template

### Setup
```bash
cd templates/remote-attestation-template
npm install
cd api && pip install -r requirements.txt && cd ..
chmod +x start.sh
```

## Usage & Examples

### Basic Usage
```bash
cd templates/remote-attestation-template
./start.sh
```

## What It Starts

### 1. NextJS Dashboard
```bash
npm run dev &
```
- **Port**: 3000
- **Process**: Background
- **PID**: Tracked as `$NEXTJS_PID`

### 2. Python API Server
```bash
cd api && python main.py &
```
- **Port**: 8000
- **Process**: Background
- **PID**: Tracked as `$PYTHON_PID`

### 3. Bun Server (Optional)
```bash
if command -v bun &> /dev/null; then
    cd bun-server && bun run index.ts &
fi
```
- **Port**: 8001
- **Process**: Background (if Bun installed)
- **PID**: Tracked as `$BUN_PID`

## Features

### Process Management
- Starts all services in background
- Tracks process IDs
- Cleanup on exit (Ctrl+C)

### Graceful Shutdown
```bash
cleanup() {
    echo "Stopping all services..."
    kill $NEXTJS_PID $PYTHON_PID $BUN_PID 2>/dev/null
    exit
}
trap cleanup EXIT INT TERM
```

## Output

### Startup Output
```
🚀 Starting dStack Remote Attestation Template Services...
Starting NextJS Dashboard...
Starting Python API Server...
Starting Bun Server...
✅ All services started!

📍 Services running at:
   - NextJS Dashboard: http://localhost:3000
   - Python API: http://localhost:8000
   - Bun Server: http://localhost:8001

Press Ctrl+C to stop all services
```

## Differences from launch.sh

| Feature | start.sh | launch.sh |
|---------|----------|-----------|
| **Scope** | Template only | Entire project |
| **Health Checks** | No | Yes |
| **Auto-Restart** | No | Yes |
| **Port Cleanup** | Basic | Comprehensive |
| **Monitoring** | No | Yes |
| **Logging** | Console only | File logging |
| **Error Recovery** | No | Yes |

## When to Use

### Use start.sh When:
- Working only on remote-attestation-template
- Need quick startup without checks
- Testing template in isolation
- Simple development workflow

### Use launch.sh When:
- Working on full project
- Need health monitoring
- Want auto-restart capability
- Production-like development

## Process Control

### Stop Services
```bash
# Ctrl+C triggers cleanup
^C
Stopping all services...
```

### Manual Process Management
```bash
# Check running processes
ps aux | grep -E "(next|python|bun)"

# Kill specific service
kill $NEXTJS_PID
kill $PYTHON_PID
kill $BUN_PID

# Kill all
pkill -f "next dev"
pkill -f "python.*main.py"
pkill -f "bun.*index.ts"
```

## Troubleshooting

### Services Don't Start

#### Check Dependencies
```bash
# From template directory
npm list
pip list
bun pm ls
```

#### Check Ports
```bash
lsof -i :3000
lsof -i :8000
lsof -i :8001
```

### Script Not Found

#### Wrong Directory
```bash
# Must be in template directory
cd templates/remote-attestation-template
./start.sh
```

#### Not Executable
```bash
chmod +x start.sh
./start.sh
```

### Services Crash

#### Check Console Output
Services output directly to console in start.sh

#### Run Services Individually
```bash
# Test NextJS
npm run dev

# Test Python API (in new terminal)
cd api && python main.py

# Test Bun (in new terminal)
cd bun-server && bun run index.ts
```

## Limitations

### No Health Monitoring
- Services may fail silently
- No automatic restart
- No health endpoints checked

### Basic Error Handling
- No retry logic
- No detailed error messages
- Console output only

### No Log Files
- All output to console
- No persistent logs
- Debugging limited

## Best Practices

### Development Workflow

1. **Install dependencies first**:
   ```bash
   npm install
   cd api && pip install -r requirements.txt
   ```

2. **Check ports before starting**:
   ```bash
   lsof -i :3000,8000,8001
   ```

3. **Run from template directory**:
   ```bash
   cd templates/remote-attestation-template
   ./start.sh
   ```

### When Issues Occur

1. Stop with Ctrl+C
2. Check for lingering processes
3. Clear ports if needed
4. Restart script

## Alternative Commands

### Manual Service Start
```bash
# Terminal 1 - NextJS
npm run dev

# Terminal 2 - Python API
cd api && python main.py

# Terminal 3 - Bun Server
cd bun-server && bun run index.ts
```

### Using npm Scripts
```bash
# If package.json has scripts
npm run start:all
npm run dev:all
```

### Using Process Managers
```bash
# With PM2
pm2 start ecosystem.config.js

# With Supervisor
supervisord -c supervisord.conf
```

## Related Scripts

### Main Launcher
- `../../launch.sh` - Full project launcher with monitoring

### Installation
- `../../install.sh` - Install all dependencies

### Testing
- `../../test-system.sh` - Verify system requirements

---

**Quick Reference:**
- **Purpose**: Quick template launcher
- **Location**: `templates/remote-attestation-template/`
- **Services**: NextJS, Python API, Bun (optional)
- **Features**: Basic start/stop
- **Alternative**: Use `launch.sh` for full features
