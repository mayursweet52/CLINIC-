export interface PatientDashboard {
  id: string
  name: string
  avatar: string
  upcomingAppointment: {
    id: string
    doctorName: string
    specialty: string
    date: string
    time: string
    status: string
  } | null
  recentPrescriptions: {
    id: string
    date: string
    doctorName: string
    medicines: number
  }[]
  pendingBills: {
    id: string
    amount: number
    date: string
  }[]
}
