import React, { useEffect, useState } from 'react';
import { apiClient as api } from '@/lib/api/client';

export const InfrastructureDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    // Re-using the executive endpoint which returns system health
    (api.get('/analytics/executive') as Promise<any>).then(res => {
      setData(res.data.data.systemHealth);
    }).catch(console.error);
  }, []);

  if (!data) return <div>Loading Storage Stats...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Infrastructure & Storage</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded shadow border-l-4 border-indigo-500">
          <h3 className="text-lg font-semibold text-gray-700">Total Archive Storage</h3>
          <p className="text-4xl font-bold mt-2">{(data.totalStorageGB / 1024).toFixed(2)} <span className="text-xl">TB</span></p>
        </div>
        
        <div className="bg-white p-6 rounded shadow border-l-4 border-blue-500">
          <h3 className="text-lg font-semibold text-gray-700">Total PDFs Hosted</h3>
          <p className="text-4xl font-bold mt-2">{data.pdfCount.toLocaleString()}</p>
        </div>

        <div className="bg-white p-6 rounded shadow border-l-4 border-green-500">
          <h3 className="text-lg font-semibold text-gray-700">Average PDF Size</h3>
          <p className="text-4xl font-bold mt-2">{data.averagePdfSizeMB} <span className="text-xl">MB</span></p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow mt-6">
        <h2 className="text-xl font-semibold mb-4">Performance Metrics</h2>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="font-medium text-gray-700">Streaming Cache Hit Ratio</span>
              <span>{data.cacheHitRatio}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${data.cacheHitRatio}%` }}></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="font-medium text-gray-700">Linearized PDF Optimization</span>
              <span>{data.linearizedPdfRatio}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${data.linearizedPdfRatio}%` }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
