#!/usr/bin/env bun
/**
 * Bun server for dStack Remote Attestation Template
 * Provides high-performance TEE operations
 */

// Mock DStackSDK for demonstration
class DStackSDK {
  private apiKey: string;
  private endpoint: string;

  constructor(config: { apiKey: string; endpoint: string }) {
    this.apiKey = config.apiKey;
    this.endpoint = config.endpoint;
  }

  async generateAttestation(params: any) {
    return { attestationId: `attest-${params.nonce}`, data: params.data };
  }

  async getTEEInfo() {
    return { type: 'SGX', version: '2.0' };
  }

  async getMeasurements() {
    return { mrenclave: 'mock-hash', mrsigner: 'mock-signer' };
  }

  async getSecurityStatus() {
    return { secure: true, teeEnabled: true };
  }
}

const sdk = new DStackSDK({
  apiKey: process.env.PHALA_API_KEY || process.env.DSTACK_API_KEY || 'test-key',
  endpoint: process.env.PHALA_ENDPOINT || process.env.DSTACK_ENDPOINT || 'https://api.dstack.network'
});

const server = (globalThis as any).Bun.serve({
  port: 8001,
  
  async fetch(req: Request) {
    const url = new URL(req.url);
    
    // Enable CORS
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json'
    };

    if (req.method === 'OPTIONS') {
      return new Response(null, { headers });
    }

    try {
      switch (url.pathname) {
        case '/':
          return Response.json({
            message: 'Bun dStack Server',
            status: 'running',
            timestamp: new Date().toISOString()
          }, { headers });

        case '/api/benchmark':
          const start = performance.now();
          const results = await runBenchmark();
          const duration = performance.now() - start;
          return Response.json({
            results,
            totalDuration: duration,
            timestamp: new Date().toISOString()
          }, { headers });

        case '/api/attestation/batch':
          if (req.method === 'POST') {
            const body = await req.json();
            const results = await batchAttestation(body.count || 10);
            return Response.json(results, { headers });
          }
          break;

        case '/api/tee/monitor':
          const monitoring = await monitorTEE();
          return Response.json(monitoring, { headers });

        default:
          return Response.json({ error: 'Not found' }, { status: 404, headers });
      }
    } catch (error) {
      return Response.json({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }, { 
        status: 500, 
        headers 
      });
    }
  }
});

async function runBenchmark() {
  const operations = [
    { name: 'generateAttestation', fn: () => sdk.generateAttestation({ data: 'test', nonce: Date.now().toString() }) },
    { name: 'getTEEInfo', fn: () => sdk.getTEEInfo() },
    { name: 'getMeasurements', fn: () => sdk.getMeasurements() },
  ];

  const results = [];
  
  for (const op of operations) {
    const start = performance.now();
    try {
      await op.fn();
      const duration = performance.now() - start;
      results.push({
        operation: op.name,
        status: 'success',
        duration: duration.toFixed(2) + 'ms'
      });
    } catch (error) {
      results.push({
        operation: op.name,
        status: 'failed',
        error: error
      });
    }
  }

  return results;
}

async function batchAttestation(count: number) {
  const promises = [];
  
  for (let i = 0; i < count; i++) {
    promises.push(
      sdk.generateAttestation({
        data: `batch-data-${i}`,
        nonce: `${Date.now()}-${i}`
      })
    );
  }

  const start = performance.now();
  const results = await Promise.allSettled(promises);
  const duration = performance.now() - start;

  return {
    total: count,
    successful: results.filter(r => r.status === 'fulfilled').length,
    failed: results.filter(r => r.status === 'rejected').length,
    duration: duration.toFixed(2) + 'ms',
    averageTime: (duration / count).toFixed(2) + 'ms'
  };
}

async function monitorTEE() {
  try {
    const [info, measurements, status] = await Promise.all([
      sdk.getTEEInfo(),
      sdk.getMeasurements(),
      sdk.getSecurityStatus()
    ]);

    return {
      healthy: true,
      info,
      measurements,
      securityStatus: status,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      healthy: false,
      error: error,
      timestamp: new Date().toISOString()
    };
  }
}

console.log(`🚀 Bun server running at http://localhost:${server.port}`);
