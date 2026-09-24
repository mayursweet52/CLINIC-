"use client";

import { useState, useEffect, use } from "react";
import { Loader2, AlertCircle, CheckCircle2, Clock, MapPin, User, FileText, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { toast } from "sonner";

export default function PublicTrackPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/public/track/${token}`);
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // 30s auto-refresh fallback
    return () => clearInterval(interval);
  }, [token]);

  // Real-time SSE would go here, omitting actual EventSource setup for brevity 
  // but keeping the visual placeholder
  useEffect(() => {
    if (!data?.appointment?.id) return;
    const sse = new EventSource(`/api/realtime?channel=org:dummy:appointment:${data.appointment.id}`);
    sse.onmessage = (e) => {
      toast.info("Update received");
      fetchData();
    };
    return () => sse.close();
  }, [data?.appointment?.id]);

  if (loading && !data) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (error) return <div className="p-8 text-center text-error"><AlertCircle className="w-10 h-10 mx-auto mb-4" />{error}</div>;

  const { appointment, patient, doctor, clinic, timeline, hasPrescription, billToken, billPaid } = data;

  return (
    <div className="min-h-screen bg-surface md:p-4 pb-20">
      <div className="max-w-lg mx-auto md:rounded-2xl shadow-sm border-x border-b md:border border-outline-variant overflow-hidden bg-surface-lowest">
        
        {/* Section A — Token Card */}
        <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <Clock className="w-24 h-24" />
          </div>
          <div className="relative z-10">
            <p className="text-primary-100 uppercase tracking-widest text-sm font-bold mb-2">Your Token</p>
            <h1 className="text-6xl font-mono font-bold mb-4">{appointment.token || "--"}</h1>
            <div className="flex items-center justify-center gap-3">
              <span className="font-medium text-lg">{patient.firstName}</span>
              <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase backdrop-blur-sm">
                {appointment.status.replace("_", " ")}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-8">
          
          {/* Section B — Timeline */}
          <div>
            <h3 className="font-bold text-lg mb-6">Live Status</h3>
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[15px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-outline-variant">
              {timeline.map((step: any, idx: number) => {
                const isActive = step.completed && (!timeline[idx + 1]?.completed);
                return (
                  <div key={step.step} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full border-4 border-surface-lowest bg-surface shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm relative z-10 ml-0 md:ml-0">
                      {step.completed ? (
                        <div className="w-full h-full bg-success rounded-full flex items-center justify-center text-white">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-primary animate-pulse' : 'bg-outline-variant/50'}`} />
                      )}
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] px-4">
                      <h4 className={`font-bold text-sm ${step.completed ? 'text-on-surface' : 'text-on-surface-variant'}`}>{step.label}</h4>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section C — Doctor Card */}
          {doctor && (
            <div className="bg-surface-low rounded-xl p-4 flex items-center gap-4 border border-outline-variant/50">
              <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-lg">
                {doctor.name[0]}
              </div>
              <div>
                <p className="text-xs text-on-surface-variant uppercase font-semibold tracking-wider mb-1">Consulting Doctor</p>
                <h4 className="font-bold text-on-surface">{doctor.name}</h4>
              </div>
            </div>
          )}

          {/* Section D — Appointment Details */}
          <div className="bg-surface-low rounded-xl p-4 space-y-3 border border-outline-variant/50">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">{new Date(appointment.date).toLocaleDateString()} at {appointment.time}</p>
                <p className="text-sm text-on-surface-variant">Scheduled Time</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">{clinic.name}</p>
                <p className="text-sm text-on-surface-variant">{clinic.address}</p>
              </div>
            </div>
          </div>

          {/* Section E — Actions */}
          <div className="space-y-3 pt-4 border-t border-outline-variant">
            {hasPrescription && (
              <Button variant="outline" className="w-full h-12" asChild>
                <a href="#"><FileText className="w-4 h-4 mr-2" /> Download Prescription</a>
              </Button>
            )}
            
            {billToken && !billPaid && (
              <Button className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold shadow-md" asChild>
                <a href={`/pay/${billToken}`}>Pay Bill Now</a>
              </Button>
            )}

            {billToken && billPaid && (
              <Button variant="outline" className="w-full h-12 text-success border-success/30 hover:bg-success/10" asChild>
                <a href={`/receipt/${billToken}`}><Receipt className="w-4 h-4 mr-2" /> Download Receipt</a>
              </Button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
