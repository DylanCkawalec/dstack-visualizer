'use client';

import { useState } from 'react';
import { DStackSDK } from '@/lib/dstack-client';

interface AttestationDashboardProps {
  onVisualize: (data: any) => void;
}

export function AttestationDashboard({ onVisualize }: AttestationDashboardProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const sdk = new DStackSDK({
    apiKey: process.env.NEXT_PUBLIC_DSTACK_API_KEY || 'test-key',
    endpoint: process.env.NEXT_PUBLIC_DSTACK_ENDPOINT || 'https://api.dstack.network'
  });

  const handleGenerateAttestation = async () => {
    setLoading(true);
    setError(null);
    try {
      const attestation = await sdk.generateAttestation({
        data: 'test-data-' + Date.now(),
        nonce: Date.now().toString()
      });
      setResult(attestation);
      onVisualize({
        type: 'attestation-generation',
        data: attestation,
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      setError(err.message || 'Failed to generate attestation');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAttestation = async () => {
    setLoading(true);
    setError(null);
    try {
      const verification = await sdk.verifyAttestation({
        attestation: 'sample-attestation-id',
        expectedData: 'test-data'
      });
      setResult(verification);
      onVisualize({
        type: 'attestation-verification',
        data: verification,
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      setError(err.message || 'Failed to verify attestation');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRemoteAttestation = async () => {
    setLoading(true);
    setError(null);
    try {
      const remoteAttestation = await sdk.createRemoteAttestation({
        targetTEE: 'target-tee-' + Date.now(),
        challenge: 'challenge-' + Date.now()
      });
      setResult(remoteAttestation);
      onVisualize({
        type: 'remote-attestation',
        data: remoteAttestation,
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      setError(err.message || 'Failed to create remote attestation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-2xl font-bold text-white mb-4">Attestation Operations</h2>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={handleGenerateAttestation}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            Generate Attestation
          </button>
          
          <button
            onClick={handleVerifyAttestation}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            Verify Attestation
          </button>
          
          <button
            onClick={handleCreateRemoteAttestation}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            Remote Attestation
          </button>
        </div>

        {loading && (
          <div className="text-yellow-400">Processing...</div>
        )}

        {error && (
          <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded">
            Error: {error}
          </div>
        )}

        {result && (
          <div className="bg-gray-900 p-4 rounded">
            <h3 className="text-white font-bold mb-2">Result:</h3>
            <pre className="text-green-400 text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
