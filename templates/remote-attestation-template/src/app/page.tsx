'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AttestationDashboard } from '@/components/AttestationDashboard';
import { TEEDashboard } from '@/components/TEEDashboard';
import { SecurityDashboard } from '@/components/SecurityDashboard';
import { VisualizationPanel } from '@/components/VisualizationPanel';
import { APITester } from '@/components/APITester';

export default function Home() {
  const [activeTab, setActiveTab] = useState('attestation');
  const [visualizationData, setVisualizationData] = useState<any>(null);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            dStack Remote Attestation Dashboard
          </h1>
          <p className="text-gray-300">
            Interactive API testing and visualization for TEE attestation
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-gray-800">
                <TabsTrigger value="attestation" className="text-white data-[state=active]:bg-purple-600">
                  Attestation
                </TabsTrigger>
                <TabsTrigger value="tee" className="text-white data-[state=active]:bg-purple-600">
                  TEE Info
                </TabsTrigger>
                <TabsTrigger value="security" className="text-white data-[state=active]:bg-purple-600">
                  Security
                </TabsTrigger>
                <TabsTrigger value="api-test" className="text-white data-[state=active]:bg-purple-600">
                  API Test
                </TabsTrigger>
              </TabsList>

              <TabsContent value="attestation" className="mt-4">
                <AttestationDashboard onVisualize={setVisualizationData} />
              </TabsContent>

              <TabsContent value="tee" className="mt-4">
                <TEEDashboard onVisualize={setVisualizationData} />
              </TabsContent>

              <TabsContent value="security" className="mt-4">
                <SecurityDashboard onVisualize={setVisualizationData} />
              </TabsContent>

              <TabsContent value="api-test" className="mt-4">
                <APITester onVisualize={setVisualizationData} />
              </TabsContent>
            </Tabs>
          </div>

          <div className="lg:col-span-1">
            <VisualizationPanel data={visualizationData} />
          </div>
        </div>

        <footer className="mt-12 text-center text-gray-400">
          <p>Powered by dStack SDK | TEE Remote Attestation Template</p>
        </footer>
      </div>
    </main>
  );
}
