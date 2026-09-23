import { api } from "@/lib/api-client";

export const getPendingPrescriptions = async () => {
  const data = await api.get<any>('/pharmacy/pending');
  return data;
};

export const getInventory = async () => {
  const data = await api.get<any>('/pharmacy/inventory');
  return data;
};

export const dispensePrescription = async (id: string) => {
  const data = await api.post<any>(`/pharmacy/dispense`, { 
    appointmentId: id,
    items: [{ medicineId: 'm1', quantity: 1 }]
  });
  return data;
};

