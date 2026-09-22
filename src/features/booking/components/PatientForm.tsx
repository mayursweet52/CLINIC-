import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { BookingSchema, BookingInput } from "../types"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface PatientFormProps {
  initialData?: Partial<BookingInput>
  onSubmit: (data: BookingInput) => void
  isSubmitting?: boolean
  onBack: () => void
}

export function PatientForm({ initialData, onSubmit, isSubmitting, onBack }: PatientFormProps) {
  const form = useForm<BookingInput>({
    resolver: zodResolver(BookingSchema),
    defaultValues: {
      departmentId: initialData?.departmentId || "",
      doctorId: initialData?.doctorId || "",
      date: initialData?.date || "",
      timeSlot: initialData?.timeSlot || "",
      patientName: "",
      patientPhone: "+91",
      reason: "",
    }
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="patientName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter patient's name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="patientPhone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="+91..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reason for visit (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Briefly describe your symptoms" className="resize-none" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onBack} className="flex-1" disabled={isSubmitting}>
            Back
          </Button>
          <Button type="submit" className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Booking...</> : "Confirm Booking"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
