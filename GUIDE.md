# 📖 TEE Trust Validator - Quick Start Guide

## 🚀 Getting Started in 3 Steps

### Step 1: Get Your API Keys

1. **Phala Network API Key**
   - Sign up at [Phala Network](https://phala.network)
   - Go to Dashboard → API Keys
   - Create new API key

2. **dStack API Key** (Optional)
   - Visit [dStack Documentation](https://github.com/Phala-Network/dstack-sdk)
   - Follow setup instructions

### Step 2: Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit with your credentials
nano .env
```

Add your keys:
```env
PHALA_API_KEY=your-phala-api-key-here
DSTACK_API_KEY=your-dstack-api-key-here
```

### Step 3: Deploy

#### Option A: One-Click Deploy
[![Deploy to Phala Cloud](https://cloud.phala.network/deploy-button.svg)](https://cloud.phala.network/templates/tee-trust-validator)

#### Option B: Manual Deploy
```bash
./deploy-phala.sh
```

## ✅ That's It!

Your TEE Trust Validator is now deployed! Access it at:
- **Dashboard**: `https://<your-app-id>-3000.dstack-pha-prod7.phala.network/`
- **API**: `https://<your-app-id>-8000.dstack-pha-prod7.phala.network/`

## 🧪 Test Your Deployment

### Check Health
```bash
curl https://<your-app-id>-8000.dstack-pha-prod7.phala.network/api/health
```

### Generate Attestation
```bash
curl -X POST https://<your-app-id>-8000.dstack-pha-prod7.phala.network/api/attestation/generate \
  -H "Content-Type: application/json" \
  -d '{"data":"test","nonce":"123"}'
```

## 📊 What You Get

- ✅ **11 Working API Endpoints** - All fully operational
- ✅ **Interactive Dashboard** - Beautiful UI for attestation operations
- ✅ **Real TEE Integration** - Hardware-backed security with Intel TDX
- ✅ **Zero Trust Architecture** - Continuous verification
- ✅ **Production Ready** - < 200ms response times

## 🔍 Monitor Your App

### View Logs
```bash
phala cvms logs <your-cvm-id>
```

### Check Status
```bash
phala cvms list
```

## 🆘 Need Help?

- 📚 [Full Documentation](README.md)
- 💬 [Discord Support](https://discord.gg/phala)
- 🐛 [Report Issues](https://github.com/DylanCkawalec/awesome-phala-cloud/issues)

## 🎯 What is Zero Trust?

**"Never trust, always verify"** - Every component in this system can cryptographically prove its integrity using hardware attestation. This means:

- The code running is exactly what you deployed
- The environment hasn't been tampered with
- All operations are verifiable and auditable
- Hardware-backed security guarantees

## 🛡️ Security Features

| Feature | Description |
|---------|-------------|
| **Hardware Attestation** | Intel TDX provides cryptographic proof |
| **Secure Enclaves** | Code runs in isolated TEE environment |
| **Continuous Verification** | Every request is verified |
| **Immutable Audit Trail** | All operations are logged and verifiable |

---

**Ready to build trustless applications?** Start with the TEE Trust Validator! 🚀