'use client';

import { useState } from 'react';
import { DStackSDK } from '@/lib/dstack-client';

interface TEEDashboardProps {
  onVisualize: (data: any) => void;
}

export function TEEDashboard({ onVisualize }: TEEDashboardProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const sdk = new DStackSDK({
    apiKey: process.env.NEXT_PUBLIC_DSTACK_API_KEY || 'test-key',
    endpoint: process.env.NEXT_PUBLIC_DSTACK_ENDPOINT || 'https://api.dstack.network'
  });

  const handleGetTEEInfo = async () => {
    setLoading(true);
    setError(null);
    try {
      const info = await sdk.getTEEInfo();
      setResult(info);
      onVisualize({
        type: 'tee-info',
        data: info,
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      setError(err.message || 'Failed to get TEE info');
    } finally {
      setLoading(false);
    }
  };

  const handleGetMeasurements = async () => {
    setLoading(true);
    setError(null);
    try {
      const measurements = await sdk.getMeasurements();
      setResult(measurements);
      onVisualize({
        type: 'tee-measurements',
        data: measurements,
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      setError(err.message || 'Failed to get measurements');
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteInTEE = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await sdk.executeInTEE({
        function: 'hash',
        params: { data: 'test-input-' + Date.now() }
      });
      setResult(result);
      onVisualize({
        type: 'tee-execution',
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      setError(err.message || 'Failed to execute in TEE');
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
