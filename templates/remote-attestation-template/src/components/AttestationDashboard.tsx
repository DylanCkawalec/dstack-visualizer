'use client';

import { useState } from 'react';

interface AttestationDashboardProps {
  onVisualize: (data: any) => void;
}

export function AttestationDashboard({ onVisualize }: AttestationDashboardProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Use API calls to Python backend
  const API_BASE = 'https://55531fcff1d542372a3fb0627f1fc12721f2fa24-8000.dstack-pha-prod7.phala.network';

  const handleGenerateAttestation = async () => {
    setLoading(true);
    setError(null);
    try {
      // Call Python API backend
      const response = await fetch(`${API_BASE}/api/attestation/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: `test-${Date.now()}`,
          nonce: Date.now().toString()
        })
      });
      
      const attestation = await response.json();
      setResult(attestation);
      onVisualize({
        type: 'backend-attestation',
        data: attestation,
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      setError(err.message || 'Failed to call backend API');
      console.error('Backend API error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAttestation = async () => {
    setLoading(true);
    setError(null);
    try {
      // Call Python API backend
      const response = await fetch(`${API_BASE}/api/attestation/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attestation_id: 'sample-attestation',
          expected_data: 'test-data'
        })
      });
      
      const verification = await response.json();
      setResult(verification);
      onVisualize({
        type: 'backend-verification',
        data: verification,
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      setError(err.message || 'Failed to verify via backend');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRemoteAttestation = async () => {
    setLoading(true);
    setError(null);
    try {
      // Call Python API backend for TEE info
      const response = await fetch(`${API_BASE}/api/tee/info`);
      const teeInfo = await response.json();
      setResult(teeInfo);
      onVisualize({
        type: 'backend-tee-info',
        data: teeInfo,
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      setError(err.message || 'Failed to get TEE info from backend');
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
