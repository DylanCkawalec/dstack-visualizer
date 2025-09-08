# 🔐 validate-tee.sh - TEE Environment Validation

## Purpose & Overview

The `validate-tee.sh` script validates the Phala Network TEE (Trusted Execution Environment) configuration and tests attestation capabilities.

## Prerequisites

### Environment Setup
- `.env.production` file with Phala credentials
- Network connectivity to Phala TEE endpoints
- Python 3 with attestation_api module (optional)
- Node.js with TypeScript support (optional)

### Permissions
```bash
chmod +x validate-tee.sh
```

## Usage & Examples

### Basic Validation
```bash
./validate-tee.sh
```

## What It Validates

### 1. Environment Configuration
- Loads `.env.production` file
- Validates all required environment variables
- Checks API keys (shows last 8 chars only)

### 2. Phala TEE API Connectivity
- Tests connection to `https://poc6.phala.network/tee-api`
- Validates endpoint reachability
- Reports HTTP response codes

### 3. Local Service Health
- Checks if NextJS Dashboard is running (port 3000)
- Checks if Python API is running (port 8000)
- Tests service API endpoints

### 4. Environment Variables
Required variables checked:
- `PHALA_API_KEY` - API authentication
- `PHALA_ENDPOINT` - TEE API endpoint
- `PHALA_CLUSTER_ID` - Cluster identifier
- `PHALA_CONTRACT_ID` - Contract identifier
- `APP_NAME` - Application name
- `DEVELOPER_NAME` - Developer identity
- `ORGANIZATION` - Organization name

### 5. Attestation Testing
- Generates sample attestation data
- Creates SHA256 hash of attestation
- Tests Python attestation module
- Validates TypeScript attestation service

## Configuration Options

### Environment Variables
```bash
# Required for validation
PHALA_API_KEY=your-api-key
PHALA_ENDPOINT=https://poc6.phala.network/tee-api
PHALA_CLUSTER_ID=your-cluster-id
PHALA_CONTRACT_ID=your-contract-id

# Application identity
APP_NAME=remote-attestation-dashboard
DEVELOPER_NAME=Dylan Kawalec
ORGANIZATION=Phala Network

# Attestation seeds
ATTESTATION_SEED=phala-attestation-dashboard-2025
ATTESTATION_SALT=dylan-kawalec-phala-devrel
```

## Output & Reports

### Validation Summary
```
════════════════════════════════════════
Validation Summary
════════════════════════════════════════

Application Identity:
  • Name: remote-attestation-dashboard
  • Developer: Dylan Kawalec
  • Organization: Phala Network

TEE Configuration:
  • Endpoint: https://poc6.phala.network/tee-api
  • Cluster: 0x0001
  • Contract: 0x0001
  • API Key: ***3RR9myNw

Attestation Seeds:
  • Seed: phala-attestation-dashboard-2025
  • Salt: dylan-kawalec-phala-devrel

Git Information:
  • Commit: abc1234
  • Branch: main

✅ TEE validation complete!
```

## Error Handling

### Common Issues

#### Missing Environment File
```
Error: .env.production not found
```
**Solution**: Create `.env.production` from template

#### Invalid API Key
```
✗ PHALA_API_KEY is not set
```
**Solution**: Set valid API key in environment

#### Network Connectivity
```
✗ Endpoint unreachable (HTTP 000)
```
**Solution**: Check network connection and firewall

#### Service Not Running
```
⚠ NextJS Dashboard is not running
```
**Solution**: Run `./launch.sh` first

## Testing Components

### Sample Attestation Generation
```json
{
  "app": "remote-attestation-dashboard",
  "version": "1.0.0",
  "developer": "Dylan Kawalec",
  "organization": "Phala Network",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### Python Module Testing
- Imports `AttestationAPI` class
- Tests hash generation
- Validates attestation functions

### TypeScript Service Check
- Verifies attestation service file exists
- Checks for proper module structure

## Related Scripts

### Prerequisites
- `./install.sh` - Install dependencies first
- `.env.production` - Must exist with valid values

### Run After Validation
- `./launch.sh` - Start development services
- `./deploy-tee.sh` - Deploy to TEE environment

### Related Files
- `templates/python-starter/attestation_api.py`
- `templates/remote-attestation-template/src/attestation-service.ts`

## Troubleshooting

### Environment Issues

#### Create Environment File
```bash
cp .env.production.example .env.production
nano .env.production  # Add your credentials
```

#### Export Variables Manually
```bash
export PHALA_API_KEY=your-key
export PHALA_CLUSTER_ID=your-cluster
./validate-tee.sh
```

### Network Issues

#### Test Connectivity
```bash
curl -I https://poc6.phala.network/tee-api
ping poc6.phala.network
```

#### Check DNS
```bash
nslookup poc6.phala.network
```

### Module Issues

#### Python Module Not Found
```bash
cd templates/python-starter
pip install -r requirements.txt
cd ../..
./validate-tee.sh
```

#### TypeScript Issues
```bash
cd templates/remote-attestation-template
npm install
cd ../..
./validate-tee.sh
```

## Security Notes

- API keys are partially hidden in output
- Environment variables are loaded securely
- No sensitive data is logged
- Attestation uses cryptographic hashing

## Next Steps

After successful validation:
1. Run `./launch.sh` to start services
2. Access `http://localhost:8000/api/attestation/generate`
3. Deploy with `./deploy-tee.sh`

---

**Quick Reference:**
- **Purpose**: Validate TEE environment
- **Prerequisites**: `.env.production` file
- **Output**: Validation summary and next steps
- **Next**: `./launch.sh` or `./deploy-tee.sh`
