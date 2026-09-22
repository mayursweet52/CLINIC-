"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSendOTP, useVerifyOTP } from "@/features/portal/hooks"
import { OTPInput } from "@/features/portal/components/OTPInput"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

export default function PortalLogin() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [phone, setPhone] = useState("+91")
  
  const sendMutation = useSendOTP()
  const verifyMutation = useVerifyOTP()

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (phone.length < 13) return
    await sendMutation.mutateAsync(phone)
    setStep(2)
  }

  const handleVerifyOTP = async (otp: string) => {
    await verifyMutation.mutateAsync({ phone, otp })
    router.push('/portal')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-lg border-slate-200">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Patient Portal</CardTitle>
          <CardDescription>
            {step === 1 ? "Enter your registered phone number" : `Enter OTP sent to ${phone}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 ? (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+919876543210"
                  className="text-lg"
                />
              </div>
              <Button type="submit" className="w-full" disabled={sendMutation.isPending || phone.length < 13}>
                {sendMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Send OTP
              </Button>
            </form>
          ) : (
            <div className="space-y-6">
              <OTPInput length={6} onComplete={handleVerifyOTP} />
              
              <div className="text-center space-y-2 text-sm">
                <Button 
                  variant="link" 
                  className="text-slate-500"
                  onClick={() => setStep(1)}
                >
                  Change phone number
                </Button>
                <div>
                  <Button 
                    variant="link"
                    className="text-primary"
                    disabled={sendMutation.isPending}
                    onClick={() => sendMutation.mutate(phone)}
                  >
                    Resend OTP
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
