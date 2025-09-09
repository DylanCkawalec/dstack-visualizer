'use client';

import { useState } from 'react';

interface AttestationExplorerProps {
  onVisualize: (data: any) => void;
}

export function AttestationExplorer({ onVisualize }: AttestationExplorerProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [quoteData, setQuoteData] = useState('');

  // Use API calls to Python backend
  const API_BASE = typeof window !== 'undefined' && window.location.hostname === 'localhost' 
    ? 'http://localhost:8000'
    : 'https://55531fcff1d542372a3fb0627f1fc12721f2fa24-8000.dstack-pha-prod7.phala.network';

  const handleSubmitQuote = async () => {
    if (!quoteData) {
      setError('Please enter quote data');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/api/attestation/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quote: quoteData })
      });
      
      const result = await response.json();
      setResult(result);
      onVisualize({
        type: 'attestation-submission',
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      setError(err.message || 'Failed to submit attestation');
    } finally {
      setLoading(false);
    }
  };

  const handleGetNodeInfo = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/api/node/info`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      
      const info = await response.json();
      setResult(info);
      onVisualize({
        type: 'node-info',
        data: info,
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      setError(err.message || 'Failed to get node info');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-2xl font-bold text-white mb-4">TEE Attestation Explorer</h2>
      
      <div className="space-y-4">
        <div className="bg-gray-900 p-4 rounded">
          <h3 className="text-white font-bold mb-2">Submit Attestation Quote</h3>
          <textarea
            value={quoteData}
            onChange={(e) => setQuoteData(e.target.value)}
            placeholder="Enter hex quote data..."
            className="w-full p-2 bg-gray-700 text-white rounded mb-2"
            rows={4}
          />
          <button
            onClick={handleSubmitQuote}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            Submit to Explorer
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={handleGetNodeInfo}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            Get Node Info
          </button>
          
          <a
            href="https://proof.t16z.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-center inline-block"
          >
            Open TEE Explorer ↗
          </a>
        </div>

        <div className="bg-gray-900 p-4 rounded">
          <h3 className="text-white font-bold mb-2">Node Dashboard</h3>
          <a
            href="https://6de516cec046f6e4a301d45ead2bde6e83fd6ed0-8090.dstack-pha-prod7.phala.network/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline"
          >
            View Live Node Information ↗
          </a>
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
