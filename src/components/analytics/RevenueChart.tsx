"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { BarChart3 } from "lucide-react";

interface RevenueChartProps {
  data: { date: string; amount: number }[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Revenue Over Time</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <EmptyState 
            icon={BarChart3} 
            title="No data" 
            description="No data in this range"
            className="border-none min-h-[200px]"
          />
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (value: number) => `Rs. ${value.toLocaleString("en-IN")}`;
  const formatDate = (dateStr: string) => format(new Date(dateStr), "dd MMM");

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Revenue Over Time</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
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
              tickFormatter={(value) => `Rs.${value > 1000 ? (value / 1000) + 'k' : value}`}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12 }}
              dx={-10}
            />
            <Tooltip 
              formatter={(value: any) => [formatCurrency(Number(value)), "Revenue"]}
              labelFormatter={(label) => formatDate(label as string)}
              contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)' }}
            />
            <Line 
              type="monotone" 
              dataKey="amount" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
