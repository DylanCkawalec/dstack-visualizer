'use client';

import { useState } from 'react';

interface SecurityDashboardProps {
  onVisualize: (data: any) => void;
}

export function SecurityDashboard({ onVisualize }: SecurityDashboardProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Use API calls to Python backend (WORKING!)
  const API_BASE = typeof window !== 'undefined' && window.location.hostname === 'localhost' 
    ? 'http://localhost:8000'
    : 'https://55531fcff1d542372a3fb0627f1fc12721f2fa24-8000.dstack-pha-prod7.phala.network';

  const handleOperation = async (operation: string) => {
    setLoading(true);
    setError(null);
    try {
      let response;
      switch(operation) {
        case 'security-status':
          response = await fetch(`${API_BASE}/api/security/status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
          });
          break;
        case 'validate-cert':
          response = await fetch(`${API_BASE}/api/tee/key`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              path: 'cert-validation', 
              purpose: 'certificate' 
            })
          });
          break;
        case 'create-policy':
          response = await fetch(`${API_BASE}/api/tee/quote`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              data: 'policy-creation' 
            })
          });
          break;
      }
      
      if (!response) {
        throw new Error('No response received');
      }
      
      const res = await response.json();
      setResult(res);
      onVisualize({ type: operation, data: res, timestamp: new Date().toISOString() });
    } catch (err: any) {
      setError(err.message || 'Failed to call backend API');
      setResult({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-2xl font-bold text-white mb-4">Security Operations</h2>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['security-status', 'validate-cert', 'create-policy'].map(op => (
            <button
              key={op}
              onClick={() => handleOperation(op)}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
              {op.replace('-', ' ').toUpperCase()}
            </button>
          ))}
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
