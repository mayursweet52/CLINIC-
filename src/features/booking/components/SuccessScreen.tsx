import { CheckCircle2, QrCode } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BookingResponse } from "../types"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import confetti from "canvas-confetti"

interface SuccessScreenProps {
  data: BookingResponse
}

export function SuccessScreen({ data }: SuccessScreenProps) {
  const router = useRouter()

  useEffect(() => {
    const end = Date.now() + 2 * 1000;
    const colors = ['#14b8a6', '#0d9488', '#5eead4'];
    
    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  }, [])

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center space-y-6 animate-in fade-in zoom-in duration-500">
      <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
        <CheckCircle2 className="w-10 h-10" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Booking Confirmed!</h2>
        <p className="text-slate-500 dark:text-slate-400">Your appointment has been successfully scheduled.</p>
      </div>

      <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 w-full max-w-sm space-y-4">
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Token Number</span>
          <span className="text-4xl font-bold text-primary">{data.tokenNumber}</span>
        </div>
        
        <div className="border-t border-dashed border-slate-300 dark:border-slate-700 pt-4 flex justify-center">
          {/* Mock QR Code */}
          <div className="bg-white dark:bg-slate-950 p-2 rounded-lg shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-center">
            <QrCode className="w-32 h-32 text-slate-800 dark:text-slate-200" />
          </div>
        </div>
        <p className="text-xs text-slate-400">Show this QR code at the reception</p>
      </div>

      <div className="flex gap-4 w-full max-w-sm">
        <Button variant="outline" className="flex-1" onClick={() => window.print()}>
          Download
        </Button>
        <Button className="flex-1" onClick={() => router.push('/')}>
          Go Home
        </Button>
      </div>
    </div>
  )
}
