'use client';

import { useEffect, useState, useRef } from 'react';

interface VisualizationPanelProps {
  data: any;
}

export function VisualizationPanel({ data }: VisualizationPanelProps) {
  const [flowSteps, setFlowSteps] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (data) {
      const steps = generateFlowSteps(data.type);
      setFlowSteps(steps);
      setCurrentStep(0);
      animateFlow(steps.length);
    }
  }, [data]);

  const animateFlow = (totalSteps: number) => {
    let step = 0;
    const interval = setInterval(() => {
      if (step < totalSteps) {
        setCurrentStep(step);
        drawVisualization(step, totalSteps);
        step++;
      } else {
        clearInterval(interval);
      }
    }, 1000);
  };

  const drawVisualization = (step: number, total: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw flow diagram
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 80;
    
    // Draw outer circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#9333ea';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Draw progress arc
    const progress = (step / total) * 2 * Math.PI - Math.PI / 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius - 10, -Math.PI / 2, progress);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 5;
    ctx.stroke();
    
    // Draw step nodes
    for (let i = 0; i < total; i++) {
      const angle = (i / total) * 2 * Math.PI - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, 2 * Math.PI);
      ctx.fillStyle = i <= step ? '#10b981' : '#6b7280';
      ctx.fill();
    }
    
    // Draw center text
    ctx.font = 'bold 16px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(`Step ${step + 1}/${total}`, centerX, centerY);
  };

  const generateFlowSteps = (type: string): string[] => {
    switch(type) {
      case 'attestation-generation':
        return ['Initialize TEE', 'Generate Nonce', 'Create Measurement', 'Sign Attestation', 'Return Report'];
      case 'attestation-verification':
        return ['Receive Attestation', 'Validate Signature', 'Check Measurements', 'Verify TEE State', 'Return Result'];
      case 'remote-attestation':
        return ['Establish Channel', 'Exchange Challenges', 'Generate Quote', 'Verify Quote', 'Establish Trust'];
      case 'tee-execution':
        return ['Load Code', 'Enter Enclave', 'Execute Function', 'Generate Proof', 'Return Result'];
      default:
        return ['Initialize', 'Process', 'Validate', 'Complete'];
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 h-full">
      <h2 className="text-2xl font-bold text-white mb-4">Attestation Flow Visualization</h2>
      
      {data ? (
        <div className="space-y-4">
          <div className="bg-purple-900 p-3 rounded">
            <p className="text-white font-semibold">Operation: {data.type}</p>
            <p className="text-gray-300 text-sm">Time: {data.timestamp}</p>
          </div>

          <div className="bg-gray-900 p-4 rounded">
            <h3 className="text-white font-semibold mb-2">Attestation Flow Visualization</h3>
            <canvas 
              ref={canvasRef}
              width={250}
              height={200}
              className="mx-auto"
              style={{ backgroundColor: 'rgba(17, 24, 39, 0.5)' }}
            />
          </div>

          <div className="space-y-2">
            <h3 className="text-white font-semibold">Flow Steps:</h3>
            {flowSteps.map((step, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold transition-all
                  ${index === currentStep ? 'bg-green-600 scale-110' : index < currentStep ? 'bg-green-600' : 'bg-gray-600'}`}>
                  {index + 1}
                </div>
                <div className={`flex-1 p-2 rounded transition-all ${
                  index === currentStep ? 'bg-purple-700' : 'bg-gray-700'
                }`}>
                  <p className="text-white text-sm">{step}</p>
                </div>
              </div>
            ))}
          </div>

          {data.data && (
            <div className="mt-4">
              <h3 className="text-white font-semibold mb-2">Data Preview:</h3>
              <pre className="bg-gray-900 p-3 rounded text-green-400 text-xs overflow-auto max-h-40">
                {JSON.stringify(data.data, null, 2).substring(0, 500)}...
              </pre>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-400">Execute an operation to see the attestation flow</p>
        </div>
      )}
    </div>
  );
}
