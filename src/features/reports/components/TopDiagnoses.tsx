"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export const TopDiagnoses = ({ data }: { data: any[] }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Top Diagnoses</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {data?.map((item, index) => (
            <div key={item.id} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-slate-800 dark:text-slate-200 flex items-center space-x-2">
                  <span className="text-slate-400 font-mono w-4">{index + 1}.</span>
                  <span>{item.name}</span>
                </span>
                <span className="text-slate-500 dark:text-slate-400 font-mono">{item.count}</span>
              </div>
              <Progress value={item.percentage} className="h-2" />
            </div>
          ))}
          {(!data || data.length === 0) && (
            <div className="text-center text-slate-400 py-4">No data available</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
