"use client";

import { useState, useEffect } from "react";
import { X, Bot, Zap, Stethoscope, AlertTriangle, FileText, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface AIAssistantPanelProps {
  patientId: string;
  isOpen: boolean;
  onClose: () => void;
  soap: any;
  medicines: any[];
}

export function AIAssistantPanel({ patientId, isOpen, onClose, soap, medicines }: AIAssistantPanelProps) {
  const [activeTab, setActiveTab] = useState("shorthand");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Shorthand State
  const [shorthandText, setShorthandText] = useState("");

  // Auto-check drug interactions when medicines change
  useEffect(() => {
    if (activeTab === "interaction" && medicines.length >= 2) {
      const names = medicines.map(m => m.name).filter(Boolean);
      if (names.length >= 2) {
        handleAction("interaction", { medicines: names });
      }
    }
  }, [medicines, activeTab]);

  const handleAction = async (action: string, payload: any) => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch("/api/doctor/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, payload })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "AI unavailable");
      }
      setResult(data.result);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="w-80 bg-surface-lowest border-l border-outline-variant/30 flex flex-col h-full shadow-lg shrink-0">
      <div className="h-14 flex items-center justify-between px-4 border-b border-outline-variant/20 bg-primary/5">
        <div className="flex items-center gap-2 text-primary font-bold">
          <Bot className="w-5 h-5" />
          AI Assistant
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-4 h-auto p-1 bg-surface-low">
            <TabsTrigger value="shorthand" className="py-2 text-xs"><FileText className="w-4 h-4" /></TabsTrigger>
            <TabsTrigger value="triage" className="py-2 text-xs"><AlertTriangle className="w-4 h-4" /></TabsTrigger>
            <TabsTrigger value="diagnosis" className="py-2 text-xs"><Stethoscope className="w-4 h-4" /></TabsTrigger>
            <TabsTrigger value="interaction" className="py-2 text-xs"><Zap className="w-4 h-4" /></TabsTrigger>
          </TabsList>

          <div className="mt-4 flex-1">
            <TabsContent value="shorthand" className="mt-0 space-y-3">
              <h3 className="text-sm font-bold text-on-surface">Expand Shorthand</h3>
              <Textarea 
                placeholder="e.g., c/o SOB, CP x 2 days. Hx HTN." 
                value={shorthandText}
                onChange={e => setShorthandText(e.target.value)}
                className="text-sm min-h-[100px]"
              />
              <Button 
                className="w-full" 
                onClick={() => handleAction("shorthand", { text: shorthandText })}
                disabled={!shorthandText || loading}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                Expand Note
              </Button>
            </TabsContent>

            <TabsContent value="triage" className="mt-0 space-y-3">
              <h3 className="text-sm font-bold text-on-surface">Patient Triage</h3>
              <div className="text-xs text-on-surface-variant bg-surface-low p-2 rounded">
                <strong>Symptoms:</strong> {soap.chiefComplaint || "None recorded"}<br/>
                <strong>BP:</strong> {soap.vitalsBP || "N/A"} 
                <strong> PR:</strong> {soap.vitalsPulse || "N/A"} 
                <strong> Temp:</strong> {soap.vitalsTemp || "N/A"}
              </div>
              <Button 
                className="w-full" 
                onClick={() => handleAction("triage", { 
                  symptoms: soap.chiefComplaint, 
                  vitals: { BP: soap.vitalsBP, Pulse: soap.vitalsPulse, Temp: soap.vitalsTemp }
                })}
                disabled={!soap.chiefComplaint || loading}
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Analyze Severity
              </Button>
            </TabsContent>

            <TabsContent value="diagnosis" className="mt-0 space-y-3">
              <h3 className="text-sm font-bold text-on-surface">Differential Diagnosis</h3>
              <div className="text-xs text-on-surface-variant bg-surface-low p-2 rounded">
                Based on current symptoms: {soap.chiefComplaint || "None recorded"}
              </div>
              <Button 
                className="w-full" 
                onClick={() => handleAction("diagnosis", { 
                  symptoms: soap.chiefComplaint,
                  age: 45, // default since we don't have patient age directly in this context easily
                  gender: "patient"
                })}
                disabled={!soap.chiefComplaint || loading}
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Suggest Diagnoses
              </Button>
            </TabsContent>

            <TabsContent value="interaction" className="mt-0 space-y-3">
              <h3 className="text-sm font-bold text-on-surface">Drug Interactions</h3>
              <div className="text-xs text-on-surface-variant bg-surface-low p-2 rounded">
                Checking: {medicines.map(m => m.name).filter(Boolean).join(", ") || "No medicines added"}
              </div>
              <Button 
                className="w-full" 
                onClick={() => handleAction("interaction", { medicines: medicines.map(m => m.name).filter(Boolean) })}
                disabled={medicines.filter(m => m.name).length < 2 || loading}
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Check Now
              </Button>
            </TabsContent>
          </div>
        </Tabs>

        {/* Results Area */}
        <div className="mt-4">
          {error ? (
            <div className="p-3 bg-error/10 text-error text-sm rounded-lg border border-error/20">
              {error}
            </div>
          ) : result !== null ? (
            <div className="p-3 bg-primary-container/20 text-on-surface text-sm rounded-lg border border-primary/20 space-y-2">
              <div className="font-bold text-xs text-primary uppercase tracking-wider mb-1">Result</div>
              {activeTab === "shorthand" && <p className="whitespace-pre-wrap">{result}</p>}
              {activeTab === "triage" && (
                <>
                  <div className="font-bold text-lg">{result.severity}</div>
                  <p className="text-xs">{result.reason}</p>
                </>
              )}
              {activeTab === "diagnosis" && (
                <ul className="list-disc pl-4 space-y-1 text-xs">
                  {result.map((d: string, i: number) => <li key={i}>{d}</li>)}
                </ul>
              )}
              {activeTab === "interaction" && (
                result.length > 0 ? (
                  <ul className="list-disc pl-4 space-y-1 text-xs text-error font-medium">
                    {result.map((w: any, i: number) => <li key={i}>{w.warning}</li>)}
                  </ul>
                ) : (
                  <div className="text-medical-green font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> No severe interactions found.
                  </div>
                )
              )}
            </div>
          ) : null}
        </div>
      </div>

      <div className="p-3 border-t border-outline-variant/20 bg-surface-low mt-auto">
        <p className="text-[10px] text-on-surface-variant text-center">
          AI suggestions only. Clinical judgment required. Do not enter PII.
        </p>
      </div>
    </div>
  );
}
