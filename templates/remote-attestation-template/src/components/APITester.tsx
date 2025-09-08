'use client';

import { useState } from 'react';
import { DStackSDK } from '@/lib/dstack-client';

interface APITesterProps {
  onVisualize: (data: any) => void;
}

const API_ENDPOINTS = [
  'generateAttestation', 'verifyAttestation', 'getTEEInfo', 'getMeasurements',
  'createSecureSession', 'executeInTEE', 'getAttestationReport', 'validateCertificate',
  'createRemoteAttestation', 'secureDataTransfer', 'getEnclaveQuote', 'getSecurityStatus',
  'createPolicy', 'getTEECapabilities', 'createChallenge', 'monitorTEEHealth'
];

export function APITester({ onVisualize }: APITesterProps) {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  const sdk = new DStackSDK({
    apiKey: process.env.NEXT_PUBLIC_DSTACK_API_KEY || 'test-key',
    endpoint: process.env.NEXT_PUBLIC_DSTACK_ENDPOINT || 'https://api.dstack.network'
  });

  const runAllTests = async () => {
    setRunning(true);
    setTestResults([]);
    setProgress(0);

    const results = [];
    for (let i = 0; i < API_ENDPOINTS.length; i++) {
      const endpoint = API_ENDPOINTS[i];
      const result = await testEndpoint(endpoint);
      results.push(result);
      setTestResults([...results]);
      setProgress((i + 1) / API_ENDPOINTS.length * 100);
      
      onVisualize({
        type: 'api-test',
        endpoint,
        result,
        progress: (i + 1) / API_ENDPOINTS.length * 100
      });
    }

    setRunning(false);
  };

  const testEndpoint = async (endpoint: string) => {
    const startTime = Date.now();
    try {
      // Mock API call - replace with actual SDK methods
      await new Promise(resolve => setTimeout(resolve, Math.random() * 500));
      const endTime = Date.now();
      return {
        endpoint,
        status: 'success',
        responseTime: endTime - startTime,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        endpoint,
        status: 'failed',
        error: error,
        timestamp: new Date().toISOString()
      };
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-2xl font-bold text-white mb-4">Comprehensive API Testing</h2>
      
      <div className="space-y-4">
        <button
          onClick={runAllTests}
          disabled={running}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-4 rounded disabled:opacity-50"
        >
          {running ? `Testing... ${Math.round(progress)}%` : 'Run All API Tests'}
        </button>

        {running && (
          <div className="w-full bg-gray-700 rounded-full h-2.5">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 h-2.5 rounded-full transition-all duration-300"
                 style={{ width: `${progress}%` }}></div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
          {API_ENDPOINTS.map(endpoint => {
            const result = testResults.find(r => r.endpoint === endpoint);
            return (
              <div key={endpoint} 
                   className={`p-2 rounded text-xs font-mono ${
                     result ? (result.status === 'success' ? 'bg-green-900' : 'bg-red-900') : 'bg-gray-700'
                   }`}>
                <p className="text-white truncate">{endpoint}</p>
                {result && (
                  <p className="text-gray-300">{result.responseTime}ms</p>
                )}
              </div>
            );
          })}
        </div>

        {testResults.length > 0 && (
          <div className="mt-4">
            <h3 className="text-white font-bold mb-2">Test Summary:</h3>
            <div className="bg-gray-900 p-4 rounded">
              <p className="text-green-400">✅ Passed: {testResults.filter(r => r.status === 'success').length}</p>
              <p className="text-red-400">❌ Failed: {testResults.filter(r => r.status === 'failed').length}</p>
              <p className="text-blue-400">📊 Total: {testResults.length}</p>
              <p className="text-yellow-400">⏱️ Avg Response: {
                Math.round(testResults.reduce((acc, r) => acc + (r.responseTime || 0), 0) / testResults.length)
              }ms</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
