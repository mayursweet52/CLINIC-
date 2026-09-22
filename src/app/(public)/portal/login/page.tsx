'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';

export default function PortalLogin() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/portal/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success('OTP sent to your phone');
        setStep(2);
        if (data.otp) {
          toast.info(`[DEV] OTP auto-filled: ${data.otp}`);
          setOtp(data.otp);
        }
      } else {
        toast.error(data.error || 'Failed to send OTP');
      }
    } catch (err) {
      toast.error('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      toast.error('Please enter the 6-digit OTP');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/portal/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success('Login successful!');
        router.push('/portal');
        router.refresh();
      } else {
        toast.error(data.error || 'Invalid OTP');
      }
    } catch (err) {
      toast.error('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-[70vh]">
      <Card className="w-full max-w-md shadow-lg border-0 ring-1 ring-black/5">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Patient Login</CardTitle>
          <CardDescription>
            {step === 1 ? 'Enter your phone number to continue' : `Enter the OTP sent to ${phone}`}
          </CardDescription>
        </CardHeader>
        
        {step === 1 ? (
          <form onSubmit={handleSendOtp}>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="e.g. 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={isLoading}
                    className="text-center text-lg h-12"
                    required
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full h-12 text-lg" disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send OTP'}
              </Button>
            </CardFooter>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Input
                    id="otp"
                    type="text"
                    placeholder="••••••"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    disabled={isLoading}
                    className="text-center text-2xl tracking-[0.5em] font-mono h-14"
                    maxLength={6}
                    required
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-3">
              <Button type="submit" className="w-full h-12 text-lg" disabled={isLoading}>
                {isLoading ? 'Verifying...' : 'Verify & Login'}
              </Button>
              <button 
                type="button"
                onClick={() => setStep(1)}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Change phone number
              </button>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}
