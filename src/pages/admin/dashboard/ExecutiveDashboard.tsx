import React, { useEffect, useState } from 'react';
import { TrendChart } from '../../../components/charts/TrendChart';
import { apiClient as api } from '@/lib/api/client'; // assuming standard axios instance

export const ExecutiveDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [liveMetrics, setLiveMetrics] = useState({ activeUsers: 0, pendingPayments: 0 });

  useEffect(() => {
    // 1. Fetch historical dashboard data
    (api.get('/analytics/executive') as Promise<any>).then(res => {
      setData(res.data.data);
    }).catch(console.error);

    // 2. Connect to SSE for real-time updates
    const sse = new EventSource(`${process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1'}/analytics/live`, {
      withCredentials: true
    });
    
    sse.onmessage = (event) => {
      const parsed = JSON.parse(event.data);
      if (parsed.activeUsers) {
        setLiveMetrics({
          activeUsers: parsed.activeUsers,
          pendingPayments: parsed.pendingPayments
        });
      }
    };

    return () => sse.close();
  }, []);

  const handleExport = () => {
    window.open(`${process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1'}/analytics/executive?format=csv`, '_blank');
  };

  if (!data) return <div>Loading BI Dashboard...</div>;

  const formattedTrends = data.trends.map((t: any) => ({
    label: `${t._id.year}-${String(t._id.month).padStart(2, '0')}`,
    revenue: t.revenue
  }));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Executive BI Dashboard</h1>
        <button onClick={handleExport} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Export to CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Live Active Users" value={liveMetrics.activeUsers} live />
        <MetricCard title="MRR" value={`$${data.kpis.mrr.toLocaleString()}`} />
        <MetricCard title="ARR" value={`$${data.kpis.arr.toLocaleString()}`} />
        <MetricCard title="Storage Usage" value={`${(data.kpis.storageUsage / 1024).toFixed(1)} TB`} />
      </div>

      <div className="bg-white p-6 rounded-lg shadow mt-6">
        <h2 className="text-xl font-semibold mb-4">Revenue Growth (Monthly)</h2>
        <TrendChart data={formattedTrends} xKey="label" yKey="revenue" color="#10b981" />
      </div>

      <div className="bg-white p-6 rounded-lg shadow mt-6">
        <h2 className="text-xl font-semibold mb-4">System Health</h2>
        <ul className="space-y-2">
          <li><strong>PDFs Optimized:</strong> {data.systemHealth.linearizedPdfRatio}%</li>
          <li><strong>Streaming Cache Hit Ratio:</strong> {data.systemHealth.cacheHitRatio}%</li>
          <li><strong>Pending Transactions:</strong> {liveMetrics.pendingPayments}</li>
        </ul>
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, live = false }: { title: string, value: string | number, live?: boolean }) => (
  <div className="bg-white p-6 rounded-lg shadow flex flex-col">
    <span className="text-gray-500 text-sm">{title}</span>
    <span className="text-3xl font-bold mt-2 flex items-center gap-2">
      {value} 
      {live && <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>}
    </span>
  </div>
);
