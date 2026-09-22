"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Download, IndianRupee, Calendar, UserPlus, UserX, ArrowUpDown } from "lucide-react";
import { DateRangePicker } from "@/components/analytics/DateRangePicker";
import { StatCard } from "@/components/shared/StatCard";
import { RevenueChart } from "@/components/analytics/RevenueChart";
import { AppointmentsChart } from "@/components/analytics/AppointmentsChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";

export default function ReportsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const range = searchParams.get("range") || "30d";

  const setRange = (newRange: string) => {
    router.push(`/admin/reports?range=${newRange}`);
  };

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc'|'desc' }>({ key: 'revenue', direction: 'desc' });

  const fetchData = async (r: string) => {
    try {
      setLoading(true);
      setError(false);
      const res = await fetch(`/api/analytics?range=${r}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(range);
  }, [range]);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const getSortedDoctors = () => {
    if (!data?.doctors) return [];
    return [...data.doctors].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const handleExport = () => {
    window.location.href = `/api/analytics/export?range=${range}&format=csv`;
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <PageHeader
        title="Reports & Analytics"
        action={
          <Button onClick={handleExport} variant="outline" className="gap-2">
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        }
      />
      
      <div className="flex items-center justify-between pb-4 border-b">
        <DateRangePicker value={range} onChange={setRange} />
      </div>

      {loading ? (
        <div className="space-y-4 mt-6">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {Array(4).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-[120px] w-full" />
            ))}
          </div>
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 mt-4">
            <Skeleton className="h-[400px] w-full" />
            <Skeleton className="h-[400px] w-full" />
          </div>
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-3 mt-4">
            <div className="lg:col-span-2">
               <TableSkeleton rows={5} cols={3} />
            </div>
            <Skeleton className="h-[300px] w-full" />
          </div>
        </div>
      ) : error ? (
        <EmptyState
          icon={Calendar}
          title="Error loading data"
          description="There was a problem fetching the analytics data. Please try again."
          action={<Button onClick={() => fetchData(range)}>Retry</Button>}
        />
      ) : !data ? (
        <EmptyState
          icon={Calendar}
          title="No data"
          description="No data in this range"
        />
      ) : (
        <div className="space-y-6 mt-6">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Revenue"
              value={`Rs. ${(data.revenue?.total || 0).toLocaleString("en-IN")}`}
              icon={IndianRupee}
              iconColor="text-primary"
            />
            <StatCard
              title="Appointments"
              value={data.appointments?.total || 0}
              icon={Calendar}
            />
            <StatCard
              title="New Patients"
              value={data.patients?.new || 0}
              icon={UserPlus}
            />
            <StatCard
              title="No-show Rate"
              value={`${((data.noShowRate || 0) * 100).toFixed(1)}%`}
              icon={UserX}
              iconColor="text-destructive"
            />
          </div>

          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            <RevenueChart data={data.revenue?.byDay || []} />
            <AppointmentsChart data={data.appointments?.byDay || []} />
          </div>

          <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Doctor Performance</CardTitle>
              </CardHeader>
              <CardContent>
                {getSortedDoctors().length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">No doctor data in this range.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead onClick={() => handleSort('name')} className="cursor-pointer hover:bg-muted/50">
                          <div className="flex items-center">Name <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground" /></div>
                        </TableHead>
                        <TableHead onClick={() => handleSort('appointments')} className="cursor-pointer hover:bg-muted/50 text-right">
                          <div className="flex items-center justify-end">Appointments <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground" /></div>
                        </TableHead>
                        <TableHead onClick={() => handleSort('revenue')} className="cursor-pointer hover:bg-muted/50 text-right">
                          <div className="flex items-center justify-end">Revenue <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground" /></div>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getSortedDoctors().map((d: any) => (
                        <TableRow key={d.id}>
                          <TableCell className="font-medium">{d.name}</TableCell>
                          <TableCell className="text-right">{d.appointments}</TableCell>
                          <TableCell className="text-right">Rs. {d.revenue.toLocaleString("en-IN")}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Diagnoses</CardTitle>
              </CardHeader>
              <CardContent>
                {(!data.topDiagnoses || data.topDiagnoses.length === 0) ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">No diagnoses in this range.</p>
                ) : (
                  <div className="space-y-4">
                    {data.topDiagnoses.map((td: any, i: number) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{td.name}</span>
                        <Badge variant="secondary">{td.count}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
