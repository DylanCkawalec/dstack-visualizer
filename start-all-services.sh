#!/bin/bash
set -e

echo "🛡️ TEE Trust Validator - Starting All Services"
echo "============================================="

# Load environment variables
cd /app
if [ -f ".env" ]; then
    source .env
    echo "✅ Environment variables loaded"
    echo "PHALA_API_KEY: ${PHALA_API_KEY:0:10}..."
else
    echo "❌ .env file not found"
fi

# Ensure we're running as the right user and paths are set
export PATH="/home/nextjs/.local/bin:/usr/local/bin:/usr/bin:/bin"
export PYTHONPATH="/app/templates/remote-attestation-template/api"

echo "Starting services..."
echo "PATH: $PATH"
echo "PYTHONPATH: $PYTHONPATH"

# Start Python API
echo "🐍 Starting Python API on port 8000..."
cd /app/templates/remote-attestation-template/api
echo "Current directory: $(pwd)"
echo "Python location: $(which python3)"
echo "Uvicorn location: $(which uvicorn || echo 'not in PATH, trying /home/nextjs/.local/bin/uvicorn')"

# Start Python API with full path
if [ -f "/home/nextjs/.local/bin/uvicorn" ]; then
    /home/nextjs/.local/bin/uvicorn main:app --host 0.0.0.0 --port 8000 &
    PYTHON_PID=$!
    echo "Python API started with PID: $PYTHON_PID"
else
    echo "❌ uvicorn not found"
    exit 1
fi

# Start NextJS
echo "🚀 Starting NextJS on port 3000..."
cd /app/templates/remote-attestation-template
echo "Current directory: $(pwd)"
echo "Node location: $(which node)"
echo "NPM location: $(which npm)"

npm start &
NEXTJS_PID=$!
echo "NextJS started with PID: $NEXTJS_PID"

# Start Bun server
echo "⚡ Starting Bun server on port 8001..."
cd /app/templates/remote-attestation-template/bun-server
echo "Current directory: $(pwd)"
echo "Bun location: $(which bun || echo 'Bun not available')"

if command -v bun >/dev/null 2>&1; then
    bun run index.ts &
    BUN_PID=$!
    echo "Bun server started with PID: $BUN_PID"
else
    echo "ℹ️ Bun not available, skipping"
fi

echo ""
echo "✅ All services started successfully!"
echo "📊 Process Status:"
echo "  NextJS PID: $NEXTJS_PID"
echo "  Python API PID: $PYTHON_PID"
if [ -n "$BUN_PID" ]; then
    echo "  Bun Server PID: $BUN_PID"
fi

# Wait for services to initialize
echo "⏳ Waiting 30 seconds for services to initialize..."
sleep 30

# Test services locally
echo "🧪 Testing services locally..."
echo "Testing Python API..."
if curl -f http://localhost:8000/ >/dev/null 2>&1; then
    echo "✅ Python API responding"
else
    echo "❌ Python API not responding"
    echo "Python API logs:"
    ps aux | grep uvicorn || echo "No uvicorn process found"
fi

echo "Testing NextJS..."
if curl -f http://localhost:3000/ >/dev/null 2>&1; then
    echo "✅ NextJS responding"
else
    echo "❌ NextJS not responding"
    echo "NextJS logs:"
    ps aux | grep node || echo "No node process found"
fi

if [ -n "$BUN_PID" ]; then
    echo "Testing Bun server..."
    if curl -f http://localhost:8001/ >/dev/null 2>&1; then
        echo "✅ Bun server responding"
    else
        echo "❌ Bun server not responding"
        echo "Bun logs:"
        ps aux | grep bun || echo "No bun process found"
    fi
fi

# Keep script running and monitor
echo "🔄 Monitoring services..."
while true; do
    sleep 60
    
    # Check if processes are still alive
    if ! kill -0 $PYTHON_PID 2>/dev/null; then
        echo "⚠️ Python API died, restarting..."
        cd /app/templates/remote-attestation-template/api
        /home/nextjs/.local/bin/uvicorn main:app --host 0.0.0.0 --port 8000 &
        PYTHON_PID=$!
    fi
    
    if ! kill -0 $NEXTJS_PID 2>/dev/null; then
        echo "⚠️ NextJS died, restarting..."
        cd /app/templates/remote-attestation-template
        npm start &
        NEXTJS_PID=$!
    fi
    
    if [ -n "$BUN_PID" ] && ! kill -0 $BUN_PID 2>/dev/null; then
        echo "⚠️ Bun server died, restarting..."
        cd /app/templates/remote-attestation-template/bun-server
        bun run index.ts &
        BUN_PID=$!
    fi
    
    echo "📊 Services status check complete at $(date)"
done
