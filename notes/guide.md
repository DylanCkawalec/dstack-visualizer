# 📖 TEE Trust Validator - Developer Guide

This directory contains detailed documentation for deploying and operating the TEE Trust Validator on Phala Cloud.

## 🔐 Zero Trust Philosophy

This project embodies the Zero Trust security model: "Never trust, always verify." Every component can cryptographically prove its integrity using hardware attestation.

## 📁 Directory Structure

```
notes/
├── guide.md              # This file - main developer guide
├── install.md            # install.sh documentation
├── launch.md             # launch.sh documentation  
├── validate-tee.md       # validate-tee.sh documentation
├── test-system.md        # test-system.sh documentation
├── docker-build.md       # docker-build.sh documentation
├── deploy-tee.md         # deploy-tee.sh documentation (PRIMARY)
├── deploy-phala.md       # deploy-phala.sh (DEPRECATED)
├── docker-entrypoint.md  # docker-entrypoint.sh documentation
├── health-check.md       # health-check.sh documentation
└── start.md              # start.sh documentation
```

## 🎯 Quick Navigation

### For New Developers
1. Read the main [README.md](../README.md)
2. Check the [GUIDE.md](../GUIDE.md) for shell script overview
3. Run `./test-system.sh` to check your environment
4. Follow the installation guide: `./install.sh`

### For Deployment (Zero Trust Production)
1. Review [DEPLOYMENT.md](../DEPLOYMENT.md)
2. **IMPORTANT**: Use [deploy-tee.md](deploy-tee.md) for production
3. Understand [docker-build.md](docker-build.md) for image creation
4. Validate with [validate-tee.md](validate-tee.md) before deployment

### For Development (Trust Verification)
1. See [launch.md](launch.md) for development workflow
2. Check [validate-tee.md](validate-tee.md) for TEE attestation setup
3. Test trust chains with [test-system.md](test-system.md)

## 📚 Documentation Standards

Each shell script documentation follows this structure:

1. **Purpose & Overview**
2. **Prerequisites**
3. **Usage & Examples**
4. **Configuration Options**
5. **Error Handling**
6. **Related Scripts**
7. **Troubleshooting**

## 🛡️ Zero Trust Implementation

### Key Concepts
- **RA-TLS**: Remote Attestation over TLS for secure channels
- **RA-HTTPS**: Remote Attestation over HTTPS for web verification
- **Hardware Root of Trust**: Intel TDX provides the trust anchor
- **Continuous Verification**: Every request is verified, nothing is assumed

### Trust Chain
1. **Hardware** → Intel TDX provides secure enclave
2. **Firmware** → Measured boot ensures integrity
3. **OS/Kernel** → Attested by hardware measurements
4. **Application** → Cryptographically verified code
5. **Network** → RA-TLS/HTTPS for secure communication

## 🔗 External Resources

- [Phala Network Documentation](https://docs.phala.network/)
- [Intel TDX Documentation](https://www.intel.com/content/www/us/en/developer/tools/trust-domain-extensions/overview.html)
- [Zero Trust Architecture (NIST)](https://www.nist.gov/publications/zero-trust-architecture)
- [Remote Attestation Protocols](https://arxiv.org/abs/2109.05790)
- [Docker Documentation](https://docs.docker.com/)

---

*For the complete Zero Trust deployment guide, see [GUIDE.md](../GUIDE.md)*
*Remember: "Never trust, always verify" - every component must prove its integrity.*
