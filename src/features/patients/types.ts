import { z } from "zod";

export const PatientSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().regex(/^\+91[0-9]{10}$/, "Invalid phone number"),
  age: z.number().min(0).max(120),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  bloodGroup: z.string().optional(),
  address: z.string().optional(),
});

export type PatientInput = z.infer<typeof PatientSchema>;

export interface Patient extends PatientInput {
  id: string;
  uhid: string;
  createdAt: string;
  updatedAt: string;
}
