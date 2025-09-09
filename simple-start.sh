#!/bin/bash

echo "🛡️ Simple TEE Service Startup"
echo "=============================="

# Start Python API directly (simple approach)
cd /app/templates/remote-attestation-template/api
echo "Starting Python API on port 8000..."
python3 -c "
import uvicorn
from main import app
print('Starting uvicorn server...')
uvicorn.run(app, host='0.0.0.0', port=8000)
" &

# Start NextJS  
cd /app/templates/remote-attestation-template
echo "Starting NextJS on port 3000..."
npm start &

# Start Bun server if available
cd /app/templates/remote-attestation-template/bun-server
echo "Starting Bun server on port 8001..."
if command -v bun >/dev/null 2>&1; then
    bun run index.ts &
    echo "Bun server started"
else
    echo "Bun not available"
fi

echo "All services started!"

# Keep container running
wait
