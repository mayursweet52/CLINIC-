"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { HeartPulse, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function PatientLoginOTPPage() {
  const router = useRouter();
  
  const [step, setStep] = useState<"PHONE" | "OTP">("PHONE");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(30);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === "OTP" && countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) {
      return toast.error("Please enter a valid phone number");
    }

    setLoading(true);
    try {
      const res = await fetch("/api/portal/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to send OTP");
      
      toast.success("OTP sent to your number", {
        description: `Dev Mode: Your OTP is ${data.otp}`,
        duration: 5000,
      });
      
      setStep("OTP");
      setCountdown(30);
      
      // Focus first input
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length < 6) return toast.error("Please enter complete OTP");

    setLoading(true);
    try {
      const res = await fetch("/api/portal/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp: otpCode }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to verify OTP");
      
      toast.success("Login successful!");
      router.push("/portal");
    } catch (err: any) {
      toast.error(err.message);
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-advance
    if (value !== "" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length > 0) {
      const newOtp = [...otp];
      for (let i = 0; i < pasted.length; i++) {
        newOtp[i] = pasted[i];
      }
      setOtp(newOtp);
      inputRefs.current[Math.min(pasted.length, 5)]?.focus();
    }
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center p-4 bg-surface-low">
      <div className="w-full max-w-sm bg-surface-lowest rounded-3xl p-8 shadow-xl border border-outline-variant/20 flex flex-col items-center">
        <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-6 shadow-md shadow-primary/20">
          <HeartPulse className="w-8 h-8 text-white" />
        </div>
        
        <h1 className="text-2xl font-bold text-on-surface mb-2 tracking-tight">Welcome back</h1>
        <p className="text-on-surface-variant text-center text-sm mb-8">
          {step === "PHONE" 
            ? "Enter your phone number to access your medical records and appointments." 
            : `We've sent a 6-digit code to +91 ${phone}`}
        </p>

        {step === "PHONE" ? (
          <form onSubmit={handleSendOTP} className="w-full space-y-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-on-surface-variant font-medium">+91</span>
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                className="w-full h-14 pl-12 pr-4 bg-surface-low border border-outline-variant/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-lg font-medium tracking-wide"
                placeholder="9876543210"
                autoComplete="tel"
                autoFocus
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-14 rounded-xl text-base font-bold shadow-sm"
              disabled={loading || phone.length < 10}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send OTP"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="w-full space-y-8 flex flex-col items-center">
            <div className="flex gap-2 w-full justify-between" onPaste={handleOtpPaste}>
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => { inputRefs.current[idx] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  className="w-12 h-14 text-center text-2xl font-bold bg-surface-low border border-outline-variant/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-primary"
                />
              ))}
            </div>

            <div className="w-full flex flex-col gap-4">
              <Button 
                type="submit" 
                className="w-full h-14 rounded-xl text-base font-bold shadow-sm"
                disabled={loading || otp.join("").length < 6}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Login"}
              </Button>
              
              <div className="text-center text-sm font-medium">
                {countdown > 0 ? (
                  <span className="text-on-surface-variant">Resend OTP in {countdown}s</span>
                ) : (
                  <button 
                    type="button" 
                    onClick={handleSendOTP}
                    className="text-primary hover:underline focus:outline-none"
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
