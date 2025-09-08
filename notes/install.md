# 📦 install.sh - Complete Installation Script

## Purpose & Overview

The `install.sh` script is the **primary setup script** that installs all dependencies and prepares the development environment for the Algorithm Visualizer project.

## Prerequisites

### System Requirements
- **Node.js 18+** and npm 9+
- **Python 3.8+** and pip
- **Git**
- **Bun** (optional - for Bun server functionality)

### Permissions
```bash
chmod +x install.sh
```

## Usage & Examples

### Basic Installation
```bash
./install.sh
```

### What It Does

1. **System Requirements Check**
   - Validates Node.js, npm, Python, pip, Git installations
   - Checks for optional Bun runtime
   - Reports missing dependencies

2. **Port Cleanup**
   - Kills processes on ports 3000, 3001, 3002, 8000, 8001
   - Cleans up lingering Node.js and Python processes

3. **Main Dependencies Installation**
   - Installs main repository npm dependencies
   - Installs @phala/dstack-sdk
   - Installs Python dstack-sdk

4. **Template Dependencies**
   - `nextJS-starter` - Next.js dependencies
   - `python-starter` - Python dependencies
   - `bun-starter` - Bun dependencies (if Bun available)
   - `remote-attestation-template` - Full stack dependencies

5. **Environment File Creation**
   - Creates main `.env` file
   - Creates `templates/remote-attestation-template/.env.local`
   - Pre-populates with placeholder values

6. **Test Setup**
   - Makes test files executable
   - Configures test environment

7. **Installation Verification**
   - Checks all node_modules directories
   - Reports any missing installations

## Configuration Options

### Environment Variables
The script creates these environment files:

#### Main `.env`
```env
DSTACK_API_KEY=your-api-key-here
DSTACK_ENDPOINT=https://api.dstack.network
NODE_ENV=development
PORT=3000
```

#### Template `.env.local`
```env
NEXT_PUBLIC_DSTACK_API_KEY=your-api-key-here
NEXT_PUBLIC_DSTACK_ENDPOINT=https://api.dstack.network
DSTACK_API_KEY=your-api-key-here
DSTACK_ENDPOINT=https://api.dstack.network
```

### Customization
Modify these variables in the script:
- `INSTALL_DIR` - Installation directory
- Package versions and sources
- Environment file templates

## Error Handling

### Common Errors

#### Missing System Dependencies
```bash
Error: Missing required dependencies:
  - Node.js
  - Python 3
```
**Solution**: Install missing system dependencies

#### Port Conflicts
```bash
Warning: Port 3000 is in use
```
**Solution**: Script automatically kills conflicting processes

#### Network Issues
```bash
npm ERR! network request failed
```
**Solution**: Check internet connection, try again

#### Permission Issues
```bash
Permission denied: ./install.sh
```
**Solution**: `chmod +x install.sh`

## Output & Logging

### Success Output
```
╔═══════════════════════════════════════════════════════╗
║            Installation Complete! 🎉                  ║
╚═══════════════════════════════════════════════════════╝

Next steps:
1. Update the .env files with your dStack API credentials
2. Run './launch.sh' to start all services
```

### Progress Indicators
- ✅ **Green** - Success
- ⚠️ **Yellow** - Warnings
- ❌ **Red** - Errors
- ℹ️ **Blue** - Information

## Related Scripts

### Run After Installation
1. `./test-system.sh` - Verify installation
2. `./validate-tee.sh` - Configure TEE environment
3. `./launch.sh` - Start development services

### Dependencies
- Called by: Manual execution only
- Calls: None (standalone)

## Troubleshooting

### Installation Fails Midway
```bash
# Clean and retry
rm -rf node_modules
rm -rf templates/*/node_modules
./install.sh
```

### Bun Installation Issues
```bash
# Install Bun separately
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc
./install.sh
```

### Python Package Issues
```bash
# Upgrade pip and retry
python3 -m pip install --upgrade pip
./install.sh
```

### Network/Registry Issues
```bash
# Clear npm cache
npm cache clean --force
./install.sh
```

### Verification Failures
```bash
# Manual verification
ls -la node_modules/
ls -la templates/*/node_modules/
npm list --depth=0
```

## Performance Notes

- **Installation time**: 2-5 minutes depending on network
- **Disk space**: ~500MB for all dependencies
- **Network usage**: ~200MB download

## Security Considerations

- Creates environment files with placeholder values
- Does not store real API keys
- Cleans up potentially conflicting processes
- Uses `--legacy-peer-deps` for compatibility

---

**Next Steps After Installation:**
1. Update `.env` files with real API credentials
2. Run `./test-system.sh` to verify
3. Run `./launch.sh` to start development
