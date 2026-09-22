"use client";

import React, { use } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useBill } from "@/features/billing/hooks";
import { BillDetail } from "@/features/billing/components/BillDetail";
import { Skeleton } from "@/components/ui/skeleton";

export default function BillDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { data: bill, isLoading } = useBill(resolvedParams.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
        <Link href="/billing" className="hover:text-slate-900 dark:text-slate-100 transition-colors">Billing</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-slate-900 dark:text-slate-100">{resolvedParams.id}</span>
      </div>

      {isLoading ? (
        <div className="space-y-4 max-w-4xl mx-auto">
          <Skeleton className="h-[200px] rounded-xl" />
          <Skeleton className="h-[400px] rounded-xl" />
        </div>
      ) : (
        <BillDetail bill={bill} />
      )}
    </div>
  );
}
