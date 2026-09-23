import { api } from "@/lib/api-client";

export const getPendingPrescriptions = async () => {
  const res = await api.get<any>('/pharmacy/pending');
  return res?.data ?? res;
};

export const getInventory = async () => {
  const res = await api.get<any>('/pharmacy/inventory');
  return res?.data ?? res;
};

export const dispensePrescription = async (id: string) => {
  const res = await api.post<any>(`/pharmacy/dispense`, { 
    appointmentId: id,
    items: [{ medicineId: 'm1', quantity: 1 }]
  });
  return res?.data ?? res;
};
