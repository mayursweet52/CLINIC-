"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { CheckCircle, Download, Mail } from "lucide-react";
import { MarkPaidDialog } from "./MarkPaidDialog";

export const BillDetail = ({ bill }: { bill: any }) => {
  const [isMarkPaidOpen, setIsMarkPaidOpen] = useState(false);

  if (!bill) return null;

  return (
    <>
      <div className="grid gap-6">
        {/* Actions */}
        <div className="flex justify-end gap-3">
          {bill.status !== "Paid" && (
            <Button onClick={() => setIsMarkPaidOpen(true)}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Mark Paid
            </Button>
          )}
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
          <Button variant="outline">
            <Mail className="mr-2 h-4 w-4" />
            Email
          </Button>
        </div>

        <Card className="max-w-4xl mx-auto w-full">
          <CardHeader className="border-b pb-6 flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-2xl font-bold tracking-tight">Invoice</CardTitle>
              <p className="text-sm text-slate-500 mt-1"># {bill.id}</p>
            </div>
            <div className="text-right space-y-1">
              <StatusBadge
                status={bill.status}
                color={bill.status === "Paid" ? "emerald" : bill.status === "Partial" ? "amber" : "slate"}
              />
              <p className="text-sm text-slate-500">Date: {bill.date}</p>
              <p className="text-sm text-slate-500">Due: {bill.dueDate}</p>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex justify-between mb-8">
              <div>
                <h3 className="font-semibold text-slate-800 mb-2">Clinic Info</h3>
                <div className="text-sm text-slate-600 space-y-1">
                  <p className="font-medium">Peaceful Fermi Clinic</p>
                  <p>123 Health Street</p>
                  <p>Medical District, MD 12345</p>
                </div>
              </div>
              <div className="text-right">
                <h3 className="font-semibold text-slate-800 mb-2">Billed To</h3>
                <div className="text-sm text-slate-600 space-y-1">
                  <p className="font-medium text-slate-900">{bill.patientName}</p>
                  <p>{bill.patientEmail}</p>
                  <p>{bill.patientPhone}</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="text-left font-medium p-3 text-slate-500">Description</th>
                    <th className="text-right font-medium p-3 text-slate-500">Qty</th>
                    <th className="text-right font-medium p-3 text-slate-500">Rate</th>
                    <th className="text-right font-medium p-3 text-slate-500">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {bill.items.map((item: any) => (
                    <tr key={item.id}>
                      <td className="p-3 font-medium text-slate-900">{item.description}</td>
                      <td className="p-3 text-right">{item.qty}</td>
                      <td className="p-3 text-right font-mono tabular-nums">₹{item.rate.toLocaleString()}</td>
                      <td className="p-3 text-right font-mono tabular-nums">₹{item.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex justify-end">
              <div className="w-64 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="font-mono tabular-nums">₹{bill.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Tax</span>
                  <span className="font-mono tabular-nums">₹{bill.tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-3">
                  <span>Total</span>
                  <span className="font-mono tabular-nums">₹{bill.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <MarkPaidDialog
        open={isMarkPaidOpen}
        onOpenChange={setIsMarkPaidOpen}
        invoiceId={bill.id}
        amount={bill.total}
      />
    </>
  );
};
