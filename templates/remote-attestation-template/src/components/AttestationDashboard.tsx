'use client';

import { useState } from 'react';
import { DstackClient } from '@phala/dstack-sdk';

interface AttestationDashboardProps {
  onVisualize: (data: any) => void;
}

export function AttestationDashboard({ onVisualize }: AttestationDashboardProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Use real dStack SDK client (connects to /var/run/dstack.sock)
  const sdk = new DstackClient();

  const handleGenerateAttestation = async () => {
    setLoading(true);
    setError(null);
    try {
      // Use real dStack SDK methods
      const info = await sdk.info();
      const testData = `attestation-test-${Date.now()}`;
      const quote = await sdk.getQuote(testData.slice(0, 64)); // Max 64 bytes
      
      const attestation = {
        attestation_id: `real-tee-${Date.now()}`,
        app_id: info.app_id,
        instance_id: info.instance_id,
        device_id: info.device_id,
        quote: quote.quote,
        event_log: quote.event_log,
        rtmrs: quote.replayRtmrs(),
        tcb_info: info.tcb_info,
        data: testData,
        timestamp: new Date().toISOString(),
        real_tee: true,
        source: "Real dStack SDK"
      };
      
      setResult(attestation);
      onVisualize({
        type: 'real-attestation-generation',
        data: attestation,
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      setError(err.message || 'Failed to generate real attestation');
      console.error('Real attestation error:', err);
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
