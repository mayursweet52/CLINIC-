"use client";

import { useState, useEffect, use } from "react";
import { Loader2, AlertCircle, CheckCircle2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FeedbackPage({ params }: { params: Promise<{ appointmentId: string }> }) {
  const { appointmentId } = use(params);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch(`/api/public/feedback/${appointmentId}`)
      .then(res => res.json())
      .then(json => {
        if (json.error) throw new Error(json.error);
        setData(json);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [appointmentId]);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/public/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId, rating, comment }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to submit");
      setSuccess(true);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  
  if (success) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-4">
        <div className="bg-surface-lowest rounded-2xl shadow-sm border border-outline-variant p-10 max-w-md w-full text-center">
          <CheckCircle2 className="w-20 h-20 text-success mx-auto mb-6 animate-in zoom-in" />
          <h1 className="text-2xl font-bold mb-3">Thank you!</h1>
          <p className="text-on-surface-variant mb-8">
            Your feedback helps us improve our services for {data?.clinic?.name || "the clinic"}.
          </p>
          <Button onClick={() => window.close()} className="w-full h-12 text-lg">Close Tab</Button>
        </div>
      </div>
    );
  }

  if (error) return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-surface">
      <div className="bg-surface-lowest rounded-2xl shadow-sm border border-outline-variant p-8 max-w-md w-full text-center">
        <AlertCircle className="w-16 h-16 text-error mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Oops!</h2>
        <p className="text-on-surface-variant">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4 py-12">
      <div className="max-w-lg w-full bg-surface-lowest rounded-2xl shadow-sm border border-outline-variant overflow-hidden">
        
        <div className="bg-primary/5 p-6 text-center border-b border-outline-variant">
          <div className="w-16 h-16 bg-primary text-white rounded-xl mx-auto flex items-center justify-center font-bold text-2xl mb-4">
            {data.clinic.name[0]}
          </div>
          <h1 className="text-xl font-bold">{data.clinic.name}</h1>
        </div>

        <div className="p-8">
          <h2 className="text-2xl font-bold text-center mb-6">How was your visit?</h2>
          
          <div className="bg-surface-low rounded-xl p-4 flex items-center gap-4 border border-outline-variant/50 mb-8">
            <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-lg">
              {data.doctorName[0]}
            </div>
            <div>
              <p className="text-xs text-on-surface-variant uppercase tracking-wider mb-1">Consulted with</p>
              <h4 className="font-bold text-on-surface">{data.doctorName}</h4>
            </div>
          </div>

          <div className="flex justify-center gap-2 mb-8">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
              >
                <Star
                  className={`w-12 h-12 ${
                    star <= (hoverRating || rating)
                      ? "fill-warning text-warning"
                      : "text-outline-variant/50"
                  }`}
                />
              </button>
            ))}
          </div>

          <div className="space-y-2 mb-8">
            <label className="text-sm font-medium text-on-surface">Care to share more? (Optional)</label>
            <textarea
              className="w-full bg-surface-low border border-outline-variant/50 rounded-xl p-4 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              placeholder="Tell us what you loved, or what we could do better..."
              value={comment}
              onChange={(e) => setComment(e.target.value.slice(0, 500))}
            />
            <p className="text-xs text-on-surface-variant text-right">{comment.length}/500</p>
          </div>

          <Button 
            className="w-full h-14 text-lg font-bold shadow-md"
            disabled={rating === 0 || submitting}
            onClick={handleSubmit}
          >
            {submitting ? "Submitting..." : "Submit Feedback"}
          </Button>
        </div>

      </div>
    </div>
  );
}
