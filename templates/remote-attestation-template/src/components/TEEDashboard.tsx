'use client';

import { useState } from 'react';
import { DstackClient } from '@phala/dstack-sdk';

interface TEEDashboardProps {
  onVisualize: (data: any) => void;
}

export function TEEDashboard({ onVisualize }: TEEDashboardProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Use real dStack SDK client
  const sdk = new DstackClient();

  const handleGetTEEInfo = async () => {
    setLoading(true);
    setError(null);
    try {
      // Use real dStack SDK info method
      const info = await sdk.info();
      setResult(info);
      onVisualize({
        type: 'real-tee-info',
        data: info,
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      setError(err.message || 'Failed to get real TEE info');
      console.error('Real TEE info error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGetMeasurements = async () => {
    setLoading(true);
    setError(null);
    try {
      // Generate quote to get measurements
      const testData = `measurements-${Date.now()}`;
      const quote = await sdk.getQuote(testData.slice(0, 64));
      const rtmrs = quote.replayRtmrs();
      setResult({ quote: quote.quote, rtmrs, event_log: quote.event_log });
      onVisualize({
        type: 'real-tee-measurements',
        data: { rtmrs, quote: quote.quote },
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      setError(err.message || 'Failed to get real measurements');
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteInTEE = async () => {
    setLoading(true);
    setError(null);
    try {
      // Use real dStack key derivation
      const keyResult = await sdk.getKey('test-execution', 'demo');
      setResult({ key: keyResult.key, signature_chain: keyResult.signature_chain });
      onVisualize({
        type: 'real-tee-key-derivation',
        data: keyResult,
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      setError(err.message || 'Failed to derive key in TEE');
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
