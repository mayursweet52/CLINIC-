"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Download,
  IndianRupee,
  Calendar,
  UserPlus,
  UserX,
  ArrowUpDown,
} from "lucide-react";
import { StatCard } from "@/components/shared/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";

export default function ReportsPage() {
  const [range, setRange] = useState("30d");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  }>({ key: "revenue", direction: "desc" });

  useEffect(() => {
    setLoading(true);
    // Mock data for new UI
    setTimeout(() => {
      const mockData = {
        revenueTotal: 1250000,
        appointments: 450,
        newPatients: 120,
        noShowRate: 0.08,
        revenueData: Array.from({ length: 14 }).map((_, i) => ({
          date: new Date(Date.now() - (13 - i) * 86400000).toISOString(),
          value: Math.floor(10000 + Math.random() * 20000),
        })),
        appointmentsData: Array.from({ length: 14 }).map((_, i) => ({
          date: new Date(Date.now() - (13 - i) * 86400000).toISOString(),
          value: Math.floor(20 + Math.random() * 30),
        })),
        doctors: [
          {
            id: "1",
            name: "Dr. Rajesh Sharma",
            appointments: 120,
            revenue: 60000,
            rating: 4.8,
          },
          {
            id: "2",
            name: "Dr. Anjali Patil",
            appointments: 95,
            revenue: 38000,
            rating: 4.9,
          },
          {
            id: "3",
            name: "Dr. Vikram Kulkarni",
            appointments: 85,
            revenue: 51000,
            rating: 4.7,
          },
        ],
        diagnoses: [
          { name: "Viral Fever", count: 145 },
          { name: "Hypertension", count: 98 },
          { name: "Type 2 Diabetes", count: 76 },
          { name: "Osteoarthritis", count: 45 },
          { name: "Migraine", count: 32 },
        ],
      };
      setData(mockData);
      setLoading(false);
    }, 800);
  }, [range]);

  const handleSort = (key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "desc" ? "asc" : "desc",
    }));
  };

  const getSortedDoctors = () => {
    if (!data?.doctors) return [];
    return [...data.doctors].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key])
        return sortConfig.direction === "asc" ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key])
        return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  };

  const handleExport = () => {
    window.location.href = `/api/analytics/export?range=${range}&format=csv`;
  };

  const maxDiagnosisCount = data?.diagnoses
    ? Math.max(...data.diagnoses.map((d: any) => d.count))
    : 100;

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="Reports & Analytics"
        action={
          <Button
            onClick={handleExport}
            variant="outline"
            className="bg-white hover:bg-slate-50 border-slate-200"
          >
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        }
      />

      {/* Date Range Pills */}
      <div className="flex gap-2 mb-6">
        {["7d", "30d", "90d", "1y"].map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
              range === r
                ? "bg-primary-600 text-white shadow-sm"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array(4)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="h-[120px] bg-slate-100 rounded-xl animate-pulse"
                />
              ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="h-[400px] bg-slate-100 rounded-xl animate-pulse" />
            <div className="h-[400px] bg-slate-100 rounded-xl animate-pulse" />
          </div>
        </div>
      ) : !data ? (
        <EmptyState
          icon={Calendar}
          title="No data"
          description="No data in this range"
        />
      ) : (
        <div className="space-y-6">
          {/* 4 StatCards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Revenue"
              value={`₹${(data.revenueTotal / 1000).toFixed(1)}k`}
              icon={IndianRupee}
              iconColor="text-emerald-600"
            />
            <StatCard
              title="Appointments"
              value={data.appointments}
              icon={Calendar}
              iconColor="text-blue-600"
            />
            <StatCard
              title="New Patients"
              value={data.newPatients}
              icon={UserPlus}
              iconColor="text-purple-600"
            />
            <StatCard
              title="No-show Rate"
              value={`${(data.noShowRate * 100).toFixed(1)}%`}
              icon={UserX}
              iconColor={
                data.noShowRate > 0.05 ? "text-red-500" : "text-amber-500"
              }
            />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Revenue Line Chart */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <h3 className="font-semibold text-slate-900 mb-6">
                Revenue Trend
              </h3>
              <div className="h-[300px] w-full">
                {data.revenueData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={data.revenueData}
                      margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#e2e8f0"
                      />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(val) => format(new Date(val as string | number), "MMM dd")}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "#64748b" }}
                        dy={10}
                      />
                      <YAxis
                        tickFormatter={(val) => `₹${val / 1000}k`}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "#64748b" }}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "8px",
                          border: "1px solid #e2e8f0",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        }}
                        labelFormatter={(val) =>
                          format(new Date(val as string | number), "dd MMM yyyy")
                        }
                        formatter={(val: any) => [`₹${val}`, "Revenue"]}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#14b8a6"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{
                          r: 4,
                          fill: "#14b8a6",
                          stroke: "#fff",
                          strokeWidth: 2,
                        }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-sm text-slate-500">
                    No data in this range
                  </div>
                )}
              </div>
            </div>

            {/* Appointments Bar Chart */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <h3 className="font-semibold text-slate-900 mb-6">
                Appointments Volume
              </h3>
              <div className="h-[300px] w-full">
                {data.appointmentsData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.appointmentsData}
                      margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#e2e8f0"
                      />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(val) => format(new Date(val as string | number), "MMM dd")}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "#64748b" }}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "#64748b" }}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "8px",
                          border: "1px solid #e2e8f0",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        }}
                        labelFormatter={(val) =>
                          format(new Date(val as string | number), "dd MMM yyyy")
                        }
                        formatter={(val: any) => [val, "Appointments"]}
                        cursor={{ fill: "#f1f5f9" }}
                      />
                      <Bar
                        dataKey="value"
                        fill="#94a3b8"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-sm text-slate-500">
                    No data in this range
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Doctor Performance Table */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-200">
                <h3 className="font-semibold text-slate-900">
                  Doctor Performance
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th
                        className="px-6 py-4 font-semibold cursor-pointer hover:bg-slate-100"
                        onClick={() => handleSort("name")}
                      >
                        <div className="flex items-center gap-1">
                          Doctor <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </th>
                      <th
                        className="px-6 py-4 font-semibold cursor-pointer hover:bg-slate-100"
                        onClick={() => handleSort("appointments")}
                      >
                        <div className="flex items-center gap-1">
                          Appointments <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </th>
                      <th
                        className="px-6 py-4 font-semibold cursor-pointer hover:bg-slate-100"
                        onClick={() => handleSort("revenue")}
                      >
                        <div className="flex items-center gap-1">
                          Revenue <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </th>
                      <th
                        className="px-6 py-4 font-semibold cursor-pointer hover:bg-slate-100"
                        onClick={() => handleSort("rating")}
                      >
                        <div className="flex items-center gap-1">
                          Avg Rating <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {getSortedDoctors().map((d: any) => (
                      <tr
                        key={d.id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center text-xs">
                              {d.name.charAt(4)}
                            </div>
                            <span className="font-medium text-slate-900">
                              {d.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-700">
                          {d.appointments}
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-900">
                          ₹{d.revenue.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-amber-600 font-semibold flex items-center gap-1">
                          ★ {d.rating}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Diagnoses */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
              <div className="p-5 border-b border-slate-200">
                <h3 className="font-semibold text-slate-900">Top Diagnoses</h3>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-center space-y-5">
                {data.diagnoses.map((diag: any, idx: number) => (
                  <div key={idx} className="relative">
                    <div className="flex justify-between text-sm mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-[10px] font-bold">
                          {idx + 1}
                        </span>
                        <span className="font-medium text-slate-900">
                          {diag.name}
                        </span>
                      </div>
                      <span className="text-slate-500">{diag.count}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-500 rounded-full"
                        style={{
                          width: `${(diag.count / maxDiagnosisCount) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
