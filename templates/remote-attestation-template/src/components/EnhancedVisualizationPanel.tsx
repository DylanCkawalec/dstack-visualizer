'use client';

import { useEffect, useState, useRef } from 'react';

interface VisualizationPanelProps {
  data: any;
}

// Algorithm Visualizer-style visualization with TEE attestation flow
export function EnhancedVisualizationPanel({ data }: VisualizationPanelProps) {
  const [flowSteps, setFlowSteps] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [graphData, setGraphData] = useState<any>(null);
  const [arrayData, setArrayData] = useState<number[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const graphCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (data) {
      const steps = generateFlowSteps(data.type);
      setFlowSteps(steps);
      setCurrentStep(0);
      
      // Generate visualization data based on type
      if (data.type === 'api-test') {
        generateAPITestVisualization(data);
      } else {
        animateFlow(steps.length);
        generateGraphVisualization(data);
      }
    }
  }, [data]);

  const generateAPITestVisualization = (data: any) => {
    // Create array visualization for API response times
    const responseTimes = [
      Math.random() * 200 + 50,  // Generate
      Math.random() * 150 + 30,  // Verify
      Math.random() * 100 + 20,  // Info
      Math.random() * 180 + 40,  // Security
      Math.random() * 120 + 25,  // Key
      Math.random() * 160 + 35,  // Quote
      Math.random() * 80 + 15,   // Health
    ];
    setArrayData(responseTimes);
    drawBarChart(responseTimes);
  };

  const drawBarChart = (data: number[]) => {
    const canvas = graphCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const barWidth = canvas.width / data.length - 10;
    const maxValue = Math.max(...data);
    
    data.forEach((value, index) => {
      const barHeight = (value / maxValue) * (canvas.height - 40);
      const x = index * (barWidth + 10) + 5;
      const y = canvas.height - barHeight - 20;
      
      // Draw bar with gradient
      const gradient = ctx.createLinearGradient(0, y, 0, canvas.height - 20);
      gradient.addColorStop(0, '#8b5cf6');
      gradient.addColorStop(1, '#3b82f6');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, barWidth, barHeight);
      
      // Draw value label
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${Math.round(value)}ms`, x + barWidth/2, y - 5);
    });
    
    // Draw axis
    ctx.strokeStyle = '#6b7280';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - 20);
    ctx.lineTo(canvas.width, canvas.height - 20);
    ctx.stroke();
  };

  const generateGraphVisualization = (data: any) => {
    // Create graph/network visualization for attestation flow
    const nodes = [
      { id: 'client', x: 50, y: 100, label: 'Client' },
      { id: 'tee', x: 200, y: 50, label: 'TEE' },
      { id: 'attestation', x: 350, y: 100, label: 'Attestation' },
      { id: 'verifier', x: 200, y: 150, label: 'Verifier' },
    ];
    
    const edges = [
      { from: 'client', to: 'tee', label: 'Request' },
      { from: 'tee', to: 'attestation', label: 'Generate' },
      { from: 'attestation', to: 'verifier', label: 'Verify' },
      { from: 'verifier', to: 'client', label: 'Result' },
    ];
    
    setGraphData({ nodes, edges });
    drawGraph(nodes, edges);
  };

  const drawGraph = (nodes: any[], edges: any[]) => {
    const canvas = graphCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw edges
    ctx.strokeStyle = '#6b7280';
    ctx.lineWidth = 2;
    edges.forEach(edge => {
      const fromNode = nodes.find(n => n.id === edge.from);
      const toNode = nodes.find(n => n.id === edge.to);
      if (fromNode && toNode) {
        ctx.beginPath();
        ctx.moveTo(fromNode.x, fromNode.y);
        ctx.lineTo(toNode.x, toNode.y);
        ctx.stroke();
        
        // Draw arrow
        const angle = Math.atan2(toNode.y - fromNode.y, toNode.x - fromNode.x);
        const arrowLength = 10;
        ctx.beginPath();
        ctx.moveTo(toNode.x, toNode.y);
        ctx.lineTo(
          toNode.x - arrowLength * Math.cos(angle - Math.PI / 6),
          toNode.y - arrowLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(toNode.x, toNode.y);
        ctx.lineTo(
          toNode.x - arrowLength * Math.cos(angle + Math.PI / 6),
          toNode.y - arrowLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.stroke();
      }
    });
    
    // Draw nodes
    nodes.forEach((node, index) => {
      const isActive = index <= currentStep;
      
      // Node circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, 20, 0, 2 * Math.PI);
      ctx.fillStyle = isActive ? '#10b981' : '#374151';
      ctx.fill();
      ctx.strokeStyle = isActive ? '#34d399' : '#6b7280';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Node label
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(node.label, node.x, node.y + 35);
    });
  };

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

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Enhanced circular flow visualization
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 80;
    
    // Draw background circles
    for (let i = 3; i > 0; i--) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * (i / 3), 0, 2 * Math.PI);
      ctx.strokeStyle = `rgba(147, 51, 234, ${0.1 * i})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    
    // Draw main circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    const gradient = ctx.createLinearGradient(centerX - radius, centerY, centerX + radius, centerY);
    gradient.addColorStop(0, '#8b5cf6');
    gradient.addColorStop(1, '#3b82f6');
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Draw progress arc
    const progress = (step / total) * 2 * Math.PI - Math.PI / 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius - 10, -Math.PI / 2, progress);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.stroke();
    
    // Draw step nodes with connections
    for (let i = 0; i < total; i++) {
      const angle = (i / total) * 2 * Math.PI - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      // Draw connection lines
      if (i < step) {
        const nextAngle = ((i + 1) / total) * 2 * Math.PI - Math.PI / 2;
        const nextX = centerX + Math.cos(nextAngle) * radius;
        const nextY = centerY + Math.sin(nextAngle) * radius;
        
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(nextX, nextY);
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      
      // Draw node
      ctx.beginPath();
      ctx.arc(x, y, i === step ? 12 : 8, 0, 2 * Math.PI);
      ctx.fillStyle = i <= step ? '#10b981' : '#6b7280';
      ctx.fill();
      
      if (i === step) {
        // Pulse effect for current step
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, 2 * Math.PI);
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.5;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }
    
    // Draw center info
    ctx.font = 'bold 20px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.round((step + 1) / total * 100)}%`, centerX, centerY - 5);
    
    ctx.font = '12px sans-serif';
    ctx.fillStyle = '#9ca3af';
    ctx.fillText(`Step ${step + 1}/${total}`, centerX, centerY + 15);
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
      case 'api-test':
        return ['Initialize Tests', 'Execute Endpoints', 'Collect Metrics', 'Analyze Results'];
      default:
        return ['Initialize', 'Process', 'Validate', 'Complete'];
    }
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-800/50 p-6 h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
          Attestation Flow Visualizer
        </h2>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          <span className="text-green-400 text-sm">Live</span>
        </div>
      </div>
      
      {data ? (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 p-4 rounded-xl border border-purple-700/30">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-white font-semibold">Operation: {data.type}</p>
                <p className="text-gray-300 text-sm">Endpoint: {data.endpoint || 'N/A'}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-xs">Timestamp</p>
                <p className="text-gray-300 text-sm font-mono">{new Date().toLocaleTimeString()}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {/* Main Flow Visualization */}
            <div className="bg-gray-800/50 p-4 rounded-xl">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Flow Progress
              </h3>
              <canvas 
                ref={canvasRef}
                width={280}
                height={220}
                className="mx-auto rounded-lg"
                style={{ backgroundColor: 'rgba(17, 24, 39, 0.3)' }}
              />
            </div>

            {/* Graph/Chart Visualization */}
            {(data.type === 'api-test' || graphData) && (
              <div className="bg-gray-800/50 p-4 rounded-xl">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {data.type === 'api-test' ? 'Response Times' : 'Network Graph'}
                </h3>
                <canvas 
                  ref={graphCanvasRef}
                  width={280}
                  height={180}
                  className="mx-auto rounded-lg"
                  style={{ backgroundColor: 'rgba(17, 24, 39, 0.3)' }}
                />
              </div>
            )}
          </div>

          {/* Flow Steps */}
          <div className="space-y-2">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Execution Steps
            </h3>
            <div className="space-y-1">
              {flowSteps.map((step, index) => (
                <div key={index} className="flex items-center gap-3 group">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold transition-all duration-300
                    ${index === currentStep ? 'bg-gradient-to-r from-green-500 to-emerald-500 scale-110 shadow-lg shadow-green-500/30' : 
                      index < currentStep ? 'bg-green-600' : 'bg-gray-700'}`}>
                    {index < currentStep ? '✓' : index + 1}
                  </div>
                  <div className={`flex-1 px-3 py-2 rounded-lg transition-all duration-300 ${
                    index === currentStep ? 'bg-gradient-to-r from-purple-700/50 to-indigo-700/50 border border-purple-600/30' : 
                    index < currentStep ? 'bg-gray-800/50' : 'bg-gray-800/30'
                  }`}>
                    <p className={`text-sm ${index <= currentStep ? 'text-white' : 'text-gray-400'}`}>{step}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Data Preview */}
          {data.result && (
            <div className="mt-4">
              <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                Response Data
              </h3>
              <pre className="bg-gray-900/50 border border-gray-700/50 p-3 rounded-lg text-green-400 text-xs font-mono overflow-auto max-h-32">
                {JSON.stringify(data.result || data.data || data, null, 2).substring(0, 300)}...
              </pre>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-96">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-2xl flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <p className="text-gray-400 text-center">Execute an operation to visualize<br/>the attestation flow</p>
          <p className="text-gray-500 text-sm mt-2">Algorithm Visualizer Enhanced</p>
        </div>
      )}
    </div>
  );
}
