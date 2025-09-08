#!/bin/sh

# Health check script for production deployment
# Checks all services are running properly

NEXTJS_PORT=${PORT:-3000}
API_PORT=${API_PORT:-8000}
BUN_PORT=${BUN_PORT:-8001}

# Check NextJS
if ! wget -q --spider http://localhost:${NEXTJS_PORT}; then
    echo "NextJS not responding on port ${NEXTJS_PORT}"
    exit 1
fi

# Check Python API
if ! wget -q --spider http://localhost:${API_PORT}; then
    echo "Python API not responding on port ${API_PORT}"
    exit 1
fi

# Check Bun server (optional, don't fail if not running)
if [ "$ENABLE_BUN_SERVER" = "true" ]; then
    if ! wget -q --spider http://localhost:${BUN_PORT}; then
        echo "Warning: Bun server not responding on port ${BUN_PORT}"
    fi
fi

echo "All services healthy"
exit 0
