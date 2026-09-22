"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { Calendar } from "lucide-react";

interface AppointmentsChartProps {
  data: { date: string; count: number }[];
}

export function AppointmentsChart({ data }: AppointmentsChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Appointments Over Time</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <EmptyState 
            icon={Calendar} 
            title="No data" 
            description="No data in this range"
            className="border-none min-h-[200px]"
          />
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateStr: string) => format(new Date(dateStr), "dd MMM");

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Appointments Over Time</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatDate}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12 }}
              dy={10}
            />
            <YAxis 
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12 }}
              dx={-10}
            />
            <Tooltip 
              formatter={(value: any) => [Number(value), "Appointments"]}
              labelFormatter={(label) => formatDate(label as string)}
              contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)' }}
              cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
            />
            <Bar 
              dataKey="count" 
              fill="hsl(var(--muted-foreground))" 
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
