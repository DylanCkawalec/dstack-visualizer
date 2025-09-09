#!/bin/sh

# Health check script for production deployment
# Checks critical services are running properly

NEXTJS_PORT=${PORT:-3000}
API_PORT=${API_PORT:-8000}

# Check if at least NextJS is responding (primary service)
if wget -q --spider --timeout=5 http://localhost:${NEXTJS_PORT} 2>/dev/null; then
    echo "NextJS healthy on port ${NEXTJS_PORT}"
    
    # If Python API is also responding, that's great
    if wget -q --spider --timeout=3 http://localhost:${API_PORT} 2>/dev/null; then
        echo "Python API healthy on port ${API_PORT}"
    else
        echo "Warning: Python API not responding on port ${API_PORT}"
    fi
    
    echo "Health check passed (NextJS responding)"
    exit 0
else
    echo "NextJS not responding on port ${NEXTJS_PORT}"
    exit 1
fi
