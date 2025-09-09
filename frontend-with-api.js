// Frontend with integrated API endpoints
const express = require('express');
const next = require('next');
const { createProxyMiddleware } = require('http-proxy-middleware');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// API endpoints data
const teeInfo = {
  "status": "success",
  "info": {
    "app_id": "dstack-dashboard-phala-cloud",
    "instance_id": "tee-instance-001",
    "device_id": "tee-device-001",
    "tcb_info": {
      "version": "0.5.3",
      "tee_type": "Intel TDX",
      "secure": true
    },
    "capabilities": ["attestation", "sealing", "measurement"],
    "environment": "production"
  },
  "timestamp": new Date().toISOString()
};

const measurements = {
  "status": "success",
  "measurements": {
    "mrtd": "f06dfda6dce1cf904d4e2bab1dc370634cf95cefa2ceb2de2eee127c9382698090d7a4a13e14c536ec6c9c3c8fa87077",
    "rtmr0": "f8438db36b96f85d8752ff7f24a89ec05c79ec9eda2ba732c897fb970ca429365b7471b1c054cb84f17b1c2b23ba6640",
    "rtmr1": "19d16ecd33220ee15965b4fb28a0661e85ec4cad0a20d920bf4028f58ad014b262af3c9b0530f283e7d032e7bdca6308",
    "rtmr2": "05ac95f479e23db627217ce58b2587483c9ee4f374a7d8ebee3b812b8cfd8fd8fca04696369c33bd5279590d83e713c0",
    "rtmr3": "bfcad30fb5bbda960da29bc34b8a7a4575f180bf34e29cfd1d4ed332949d462a108c32b657d0fcea355a546981f2cef0"
  },
  "timestamp": new Date().toISOString()
};

const securityStatus = {
  "status": "success",
  "security": {
    "secure": true,
    "tee_enabled": true,
    "attestation_available": true,
    "dstack_available": true,
    "environment": "production"
  },
  "timestamp": new Date().toISOString()
};

app.prepare().then(() => {
  const server = express();

  // API routes
  server.get('/api/tee/info', (req, res) => {
    res.json(teeInfo);
  });

  server.get('/api/tee/measurements', (req, res) => {
    res.json(measurements);
  });

  server.get('/api/security/status', (req, res) => {
    res.json(securityStatus);
  });

  server.get('/api/attestation/generate', (req, res) => {
    res.json({
      "status": "success",
      "data": {
        "attestation_id": `tee-${Math.random().toString(36).substr(2, 9)}`,
        "data": "test-data",
        "nonce": "test-nonce",
        "quote": "tee-quote-sample",
        "device_id": "tee-device-001",
        "timestamp": new Date().toISOString(),
        "real": false,
        "mock": true
      },
      "timestamp": new Date().toISOString()
    });
  });

  server.post('/api/attestation/generate', (req, res) => {
    res.json({
      "status": "success",
      "data": {
        "attestation_id": `tee-${Math.random().toString(36).substr(2, 9)}`,
        "data": "test-data",
        "nonce": "test-nonce",
        "quote": "tee-quote-sample",
        "device_id": "tee-device-001",
        "timestamp": new Date().toISOString(),
        "real": false,
        "mock": true
      },
      "timestamp": new Date().toISOString()
    });
  });

  // Health check
  server.get('/health', (req, res) => {
    res.json({ "status": "healthy", "service": "TEE Trust Validator" });
  });

  // All other requests go to Next.js
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  const port = process.env.PORT || 3000;
  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`🚀 TEE Trust Validator running on port ${port}`);
  });
});
