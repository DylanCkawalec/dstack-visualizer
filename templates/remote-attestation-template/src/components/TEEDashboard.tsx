'use client';

import { useState } from 'react';
// Using API calls to backend instead of direct SDK

interface TEEDashboardProps {
  onVisualize: (data: any) => void;
}

export function TEEDashboard({ onVisualize }: TEEDashboardProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Use API calls to Python backend
  const API_BASE = 'https://55531fcff1d542372a3fb0627f1fc12721f2fa24-8000.dstack-pha-prod7.phala.network';

  const handleGetTEEInfo = async () => {
    setLoading(true);
    setError(null);
    try {
      // Call Python API backend
      const response = await fetch(`${API_BASE}/api/tee/info`);
      const info = await response.json();
      setResult(info);
      onVisualize({
        type: 'backend-tee-info',
        data: info,
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      setError(err.message || 'Failed to get TEE info from backend');
    } finally {
      setLoading(false);
    }
  };

  const handleGetMeasurements = async () => {
    setLoading(true);
    setError(null);
    try {
      // Call Python API backend
      const response = await fetch(`${API_BASE}/api/tee/measurements`);
      const measurements = await response.json();
      setResult(measurements);
      onVisualize({
        type: 'backend-measurements',
        data: measurements,
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      setError(err.message || 'Failed to get measurements from backend');
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteInTEE = async () => {
    setLoading(true);
    setError(null);
    try {
      // Call Python API backend
      const response = await fetch(`${API_BASE}/api/security/status`);
      const status = await response.json();
      setResult(status);
      onVisualize({
        type: 'backend-security-status',
        data: status,
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      setError(err.message || 'Failed to get security status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-2xl font-bold text-white mb-4">TEE Operations</h2>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={handleGetTEEInfo}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            Get TEE Info
          </button>
          
          <button
            onClick={handleGetMeasurements}
            disabled={loading}
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            Get Measurements
          </button>
          
          <button
            onClick={handleExecuteInTEE}
            disabled={loading}
            className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            Execute in TEE
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
