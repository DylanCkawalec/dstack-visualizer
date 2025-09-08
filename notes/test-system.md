# 🧪 test-system.sh - System Requirements Test

## Purpose & Overview

The `test-system.sh` script performs a comprehensive system check to verify all requirements are met for running the Algorithm Visualizer project.

## Prerequisites

None - this is the first script to run for system verification.

### Permissions
```bash
chmod +x test-system.sh
```

## Usage & Examples

### Basic Test
```bash
./test-system.sh
```

## What It Tests

### 1. Script Availability
- Checks if `install.sh` exists and is executable
- Checks if `launch.sh` exists and is executable
- Reports missing or non-executable scripts

### 2. Directory Structure
- Verifies `templates` directory exists
- Lists all available templates:
  - nextJS-starter
  - python-starter
  - bun-starter
  - remote-attestation-template

### 3. Runtime Dependencies
- **Node.js**: Checks installation and version
- **Python**: Checks Python 3 or Python installation
- **Bun**: Optional check for Bun runtime

### 4. Port Availability
Checks if required ports are available:
- **Port 3000**: NextJS Dashboard
- **Port 8000**: Python API
- **Port 8001**: Bun Server

### 5. Template Validation
Specifically checks `remote-attestation-template`:
- `src/` directory
- `api/` directory
- `bun-server/` directory
- `package.json` file

## Output Format

### Test Results
```
=== Algorithm Visualizer System Test ===

1. Checking install script... ✅ Pass
2. Checking launch script... ✅ Pass
3. Checking templates directory... ✅ Pass
   Found templates:
   - nextJS-starter
   - python-starter
   - bun-starter
   - remote-attestation-template
4. Checking Node.js... ✅ Pass (v20.10.0)
5. Checking Python... ✅ Pass (Python 3.11.5)
6. Checking Bun (optional)... ⚠️ Not installed (optional)
7. Checking port availability:
   Port 3000: Available
   Port 8000: Available
   Port 8001: In use
8. Checking remote-attestation-template... ✅ Pass
   Components:
   ✓ src/
   ✓ api/
   ✓ bun-server/
   ✓ package.json

=== Test Summary ===
To install all dependencies: ./install.sh
To launch all services: ./launch.sh
```

## Test Categories

### Critical Tests (Must Pass)
- Install script existence
- Launch script existence
- Templates directory
- Node.js installation
- Python installation
- Remote attestation template

### Optional Tests
- Bun runtime installation
- Port availability (can be cleaned up)

## Error Indicators

### Pass States
- ✅ **Pass** - Test successful
- ✓ **Check** - Component found

### Warning States
- ⚠️ **Warning** - Optional component missing
- **In use** - Port occupied (can be cleaned)

### Fail States
- ❌ **Fail** - Critical test failed

## Common Issues & Solutions

### Missing Scripts
```
1. Checking install script... ❌ Fail
```
**Solution**: Ensure you're in the project root directory

### Missing Node.js
```
4. Checking Node.js... ❌ Fail
```
**Solution**: Install Node.js 18+ from nodejs.org

### Missing Python
```
5. Checking Python... ❌ Fail
```
**Solution**: Install Python 3.8+ from python.org

### Port Conflicts
```
Port 3000: In use
```
**Solution**: Kill process or let `install.sh` handle it

### Missing Templates
```
3. Checking templates directory... ❌ Fail
```
**Solution**: Clone complete repository

## Next Steps

Based on test results:

### All Tests Pass
```bash
./install.sh  # Install dependencies
./launch.sh   # Start development
```

### Some Tests Fail
1. Fix critical failures first
2. Install missing system dependencies
3. Re-run test to verify fixes
4. Proceed with installation

### Port Issues Only
```bash
# Ports will be cleaned by install.sh
./install.sh
```

## Related Scripts

### Run After System Test
- `./install.sh` - Install all dependencies
- `./validate-tee.sh` - Validate TEE environment
- `./launch.sh` - Start development services

## Troubleshooting

### Script Not Executable
```bash
chmod +x test-system.sh
chmod +x *.sh  # Make all scripts executable
```

### Wrong Directory
```bash
# Ensure you're in project root
ls -la | grep package.json
cd /path/to/algorithm-visualizer
./test-system.sh
```

### Detailed Dependency Check
```bash
# Check Node.js
node --version
npm --version

# Check Python
python3 --version
pip3 --version

# Check Bun
bun --version

# Check ports
lsof -i :3000
lsof -i :8000
lsof -i :8001
```

## System Requirements Summary

### Minimum Requirements
- **OS**: Linux, macOS, or Windows with WSL
- **Node.js**: 18.0.0 or higher
- **Python**: 3.8.0 or higher
- **RAM**: 4GB minimum
- **Disk**: 1GB free space

### Recommended
- **OS**: macOS or Ubuntu 20.04+
- **Node.js**: 20.0.0 or higher
- **Python**: 3.11.0 or higher
- **Bun**: Latest version
- **RAM**: 8GB or more
- **Disk**: 2GB free space

---

**Quick Reference:**
- **Purpose**: Verify system requirements
- **No prerequisites**: First script to run
- **Output**: Pass/Fail for each component
- **Next step**: Run `./install.sh` if tests pass
