#!/bin/sh
set -e

echo "🚀 Starting TEE Trust Validator - Zero Trust Application"

# Load environment variables from .env file if it exists
if [ -f "/app/.env" ]; then
    export $(cat /app/.env | grep -v '^#' | xargs)
    echo "✅ Loaded environment variables from .env"
fi

echo "Environment: ${NODE_ENV:-production}"
echo "TEE Environment: ${TEE_ENVIRONMENT:-production}"
echo "Trust Mode: Never trust, always verify"

# Validate required environment variables for Zero Trust
if [ "$ENABLE_MOCK_MODE" = "false" ] && [ "$REQUIRE_ATTESTATION" = "true" ]; then
    if [ -z "$PHALA_API_KEY" ]; then
        echo "❌ Error: PHALA_API_KEY is required for TEE attestation"
        echo "Zero Trust requires hardware-backed verification"
        exit 1
    fi
    
    if [ -z "$PHALA_CLUSTER_ID" ] || [ -z "$PHALA_CONTRACT_ID" ]; then
        echo "⚠️ Warning: Phala configuration incomplete - attestation limited"
    fi
fi

# Check if we're in TEE environment
if [ -f "/dev/attestation/quote" ]; then
    echo "✅ Running in TEE environment"
    export IS_TEE_ENVIRONMENT=true
else
    echo "ℹ️ Not running in TEE environment"
    export IS_TEE_ENVIRONMENT=false
fi

# Wait for database if needed (placeholder for future)
# wait_for_db() { ... }

# Run migrations if needed (placeholder for future)
# run_migrations() { ... }

# Export Python path
export PYTHONPATH="/app/templates/remote-attestation-template/api:$PYTHONPATH"
export PATH="/home/nextjs/.local/bin:$PATH"

# Health check endpoint setup
echo "Setting up health check endpoints..."

# Create a simple health check file that supervisor can update
touch /tmp/health_status

# Log startup
echo "Starting services at $(date)"
echo "Ports: NextJS=$PORT, Python API=$API_PORT, Bun=$BUN_PORT"

# Execute the main command
echo "🎯 Executing command: $@"
exec "$@"
