import { useState, useRef, KeyboardEvent } from "react"
import { Input } from "@/components/ui/input"

interface OTPInputProps {
  length?: number
  onComplete: (otp: string) => void
}

export function OTPInput({ length = 6, onComplete }: OTPInputProps) {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(""))
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pasted = value.slice(0, length).split("")
      const newOtp = [...otp]
      pasted.forEach((char, i) => {
        if (index + i < length) newOtp[index + i] = char
      })
      setOtp(newOtp)
      
      const nextIndex = Math.min(index + pasted.length, length - 1)
      inputRefs.current[nextIndex]?.focus()
      
      if (newOtp.join("").length === length) {
        onComplete(newOtp.join(""))
      }
      return
    }

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    if (value !== "" && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }

    if (newOtp.join("").length === length) {
      onComplete(newOtp.join(""))
    }
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  return (
    <div className="flex gap-2 justify-center">
      {otp.map((digit, index) => (
        <Input
          key={index}
          ref={(el) => { inputRefs.current[index] = el }}
          type="text"
          inputMode="numeric"
          maxLength={length}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          className="w-12 h-14 text-center text-2xl font-bold bg-white dark:bg-slate-950"
        />
      ))}
    </div>
  )
}
