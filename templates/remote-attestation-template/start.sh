#!/bin/bash

echo "🚀 Starting dStack Remote Attestation Template Services..."

# Function to kill all services on exit
cleanup() {
    echo "Stopping all services..."
    kill $NEXTJS_PID $PYTHON_PID $BUN_PID 2>/dev/null
    exit
}

trap cleanup EXIT

# Start NextJS in background
echo "Starting NextJS Dashboard..."
npm run dev &
NEXTJS_PID=$!

# Start Python API
echo "Starting Python API Server..."
cd api && python main.py &
PYTHON_PID=$!
cd ..

# Start Bun server (optional - check if bun is installed)
if command -v bun &> /dev/null; then
    echo "Starting Bun Server..."
    cd bun-server && bun run index.ts &
    BUN_PID=$!
    cd ..
else
    echo "Bun not installed, skipping Bun server"
fi

echo "✅ All services started!"
echo ""
echo "📍 Services running at:"
echo "   - NextJS Dashboard: http://localhost:3000"
echo "   - Python API: http://localhost:8000"
if command -v bun &> /dev/null; then
    echo "   - Bun Server: http://localhost:8001"
fi
echo ""
echo "Press Ctrl+C to stop all services"

# Keep script running
wait
