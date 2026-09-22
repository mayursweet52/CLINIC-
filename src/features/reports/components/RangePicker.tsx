"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";

const ranges = [
  { label: "7d", value: "7d" },
  { label: "30d", value: "30d" },
  { label: "90d", value: "90d" },
  { label: "1y", value: "1y" },
];

export const RangePicker = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentRange = searchParams.get("range") || "30d";

  const handleRangeChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("range", value);
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex bg-slate-100 p-1 rounded-lg w-fit">
      {ranges.map((range) => (
        <button
          key={range.value}
          onClick={() => handleRangeChange(range.value)}
          className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
            currentRange === range.value
              ? "bg-primary-600 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          {range.label}
        </button>
      ))}
    </div>
  );
};
