#!/bin/bash

# TEE Trust Validator Service Startup Script
# Starts all services directly for reliable operation

echo "🛡️ TEE Trust Validator - Zero Trust Service Startup"
echo "Trust Mode: Never trust, always verify"

# Change to app directory
cd /app

# Load environment variables
if [ -f "/app/.env" ]; then
    export $(cat /app/.env | grep -v '^#' | xargs)
    echo "✅ Loaded environment variables"
fi

# Start NextJS in background
echo "🚀 Starting NextJS Dashboard on port 3000..."
cd /app/templates/remote-attestation-template
npm start > /tmp/nextjs.log 2>&1 &
NEXTJS_PID=$!
echo "NextJS PID: $NEXTJS_PID"

# Start Python API in background  
echo "🐍 Starting Python API on port 8000..."
cd /app/templates/remote-attestation-template/api
/home/nextjs/.local/bin/uvicorn main:app --host 0.0.0.0 --port 8000 > /tmp/python.log 2>&1 &
PYTHON_PID=$!
echo "Python API PID: $PYTHON_PID"

# Start Bun server in background (if available)
if command -v bun >/dev/null 2>&1; then
    echo "⚡ Starting Bun Server on port 8001..."
    cd /app/templates/remote-attestation-template/bun-server
    bun run index.ts > /tmp/bun.log 2>&1 &
    BUN_PID=$!
    echo "Bun Server PID: $BUN_PID"
else
    echo "ℹ️ Bun not available - skipping Bun server"
fi

echo "✅ All services started!"
echo "📊 Service Status:"
echo "  NextJS Dashboard: http://localhost:3000 (PID: $NEXTJS_PID)"
echo "  Python API: http://localhost:8000 (PID: $PYTHON_PID)"
if [ -n "$BUN_PID" ]; then
    echo "  Bun Server: http://localhost:8001 (PID: $BUN_PID)"
fi

# Keep script running and monitor services
while true; do
    sleep 30
    
    # Check if services are still running
    if ! kill -0 $NEXTJS_PID 2>/dev/null; then
        echo "⚠️ NextJS crashed, restarting..."
        cd /app/templates/remote-attestation-template
        npm start > /tmp/nextjs.log 2>&1 &
        NEXTJS_PID=$!
    fi
    
    if ! kill -0 $PYTHON_PID 2>/dev/null; then
        echo "⚠️ Python API crashed, restarting..."
        cd /app/templates/remote-attestation-template/api
        /home/nextjs/.local/bin/uvicorn main:app --host 0.0.0.0 --port 8000 > /tmp/python.log 2>&1 &
        PYTHON_PID=$!
    fi
    
    if [ -n "$BUN_PID" ] && ! kill -0 $BUN_PID 2>/dev/null; then
        echo "⚠️ Bun Server crashed, restarting..."
        cd /app/templates/remote-attestation-template/bun-server
        bun run index.ts > /tmp/bun.log 2>&1 &
        BUN_PID=$!
    fi
done
