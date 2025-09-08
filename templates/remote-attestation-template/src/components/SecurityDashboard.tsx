'use client';

import { useState } from 'react';
import { DStackSDK } from '@/lib/dstack-client';

interface SecurityDashboardProps {
  onVisualize: (data: any) => void;
}

export function SecurityDashboard({ onVisualize }: SecurityDashboardProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const sdk = new DStackSDK({
    apiKey: process.env.NEXT_PUBLIC_DSTACK_API_KEY || 'test-key',
    endpoint: process.env.NEXT_PUBLIC_DSTACK_ENDPOINT || 'https://api.dstack.network'
  });

  const handleOperation = async (operation: string) => {
    setLoading(true);
    try {
      let res;
      switch(operation) {
        case 'security-status':
          res = await sdk.getSecurityStatus();
          break;
        case 'validate-cert':
          res = await sdk.validateCertificate({ certificate: 'test-cert' });
          break;
        case 'create-policy':
          res = await sdk.createPolicy({ 
            name: 'test-policy', 
            rules: [{ type: 'measurement', value: 'test' }] 
          });
          break;
      }
      setResult(res);
      onVisualize({ type: operation, data: res, timestamp: new Date().toISOString() });
    } catch (err) {
      setResult({ error: err });
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
        {result && (
          <pre className="bg-gray-900 p-4 rounded text-green-400 text-sm overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
