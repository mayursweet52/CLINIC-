export const APP_NAME = "Clinic Enterprise"
export const APP_DESCRIPTION = "Enterprise Clinic Management System"

export const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrator",
  DOCTOR: "Doctor",
  NURSE: "Nurse",
  RECEPTIONIST: "Receptionist",
  PHARMACIST: "Pharmacist",
  PATIENT: "Patient",
}

export const STATUS_COLORS: Record<string, "default" | "secondary" | "destructive" | "outline" | "success" | "warning"> = {
  scheduled: "default",
  confirmed: "success",
  arrived: "warning",
  "in-progress": "warning",
  completed: "success",
  cancelled: "destructive",
  "no-show": "destructive",
  pending: "secondary",
  paid: "success",
  partial: "warning",
  refunded: "destructive",
  dispensed: "success",
  "in-stock": "success",
  "low-stock": "warning",
  "out-of-stock": "destructive",
  active: "success",
  inactive: "secondary",
}

export const ROUTES = {
  LOGIN: "/login",
  DASHBOARD: "/",
  PATIENTS: "/patients",
  STAFF: "/staff",
  INVENTORY: "/inventory",
  ANALYTICS: "/analytics",
  AUDIT: "/audit",
  PROFILE: "/profile",
  SETTINGS: "/settings",
}
