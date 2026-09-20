import React, { useEffect, useState } from "react";
import { TrendChart } from "../../../components/charts/TrendChart";
import { apiClient as api } from "@/lib/api/client";

export const FinanceDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    (api.get("/analytics/finance") as Promise<any>)
      .then((res) => {
        setData(res.data.data);
      })
      .catch(console.error);
  }, []);

  if (!data) return <div>Loading Finance Data...</div>;

  const formattedTrends = data.revenueTrends.map((t: any) => ({
    label: `${t._id.year}-${String(t._id.month).padStart(2, "0")}`,
    revenue: t.revenue,
    count: t.count,
  }));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Finance & Subscriptions</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded shadow">
          <span className="text-gray-500">MRR</span>
          <span className="text-2xl block font-bold text-green-600">
            ${data.mrr.toLocaleString()}
          </span>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <span className="text-gray-500">ARR</span>
          <span className="text-2xl block font-bold text-green-600">
            ${data.arr.toLocaleString()}
          </span>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <span className="text-gray-500">Active Subscriptions</span>
          <span className="text-2xl block font-bold text-blue-600">{data.activeSubscriptions}</span>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <span className="text-gray-500">Churn Rate</span>
          <span className="text-2xl block font-bold text-red-600">
            {data.churnRate.toFixed(2)}%
          </span>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow mt-6">
        <h2 className="text-xl font-semibold mb-4">Transaction Volume (Monthly)</h2>
        <TrendChart data={formattedTrends} xKey="label" yKey="count" type="line" color="#3b82f6" />
      </div>
    </div>
  );
};
