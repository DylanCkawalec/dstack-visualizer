#!/bin/sh

# TEE Trust Validator Service Startup Script
# Handles conditional service startup based on environment

echo "🛡️ TEE Trust Validator - Zero Trust Service Startup"
echo "Trust Mode: Never trust, always verify"

# Check if Bun is available and enable/disable the service
if command -v bun >/dev/null 2>&1; then
    echo "✅ Bun runtime detected - enabling Bun server"
    supervisorctl start bun-server 2>/dev/null || echo "Bun server will start with supervisord"
else
    echo "ℹ️ Bun not available - disabling Bun server"
    supervisorctl stop bun-server 2>/dev/null || echo "Bun server not configured"
fi

# Start supervisord with all services
echo "🚀 Starting all TEE services with supervisord..."
exec supervisord -c /etc/supervisor/conf.d/supervisord.conf
