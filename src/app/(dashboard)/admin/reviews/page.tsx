"use client";

import { useState, useEffect } from "react";
import { Loader2, Star, MessageSquare } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";

export default function AdminReviewsPage() {
  // Mock data for now since we don't have an API
  // In a real app, we'd fetch this from /api/admin/reviews
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Patient Reviews" 
        description="Monitor clinic ratings and patient feedback."
      />

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="bg-surface-lowest rounded-xl shadow-sm border border-outline-variant/20 p-8 text-center text-on-surface-variant">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <h3 className="font-bold text-lg mb-2">No Reviews Yet</h3>
          <p className="text-sm max-w-sm mx-auto">
            Once patients submit feedback via the tracking page, their reviews will appear here.
          </p>
        </div>
      )}
    </div>
  );
}
