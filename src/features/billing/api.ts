export const getBills = async () => {
  const res = await fetch('/api/billing');
  if (!res.ok) throw new Error('Failed to fetch bills');
  const data = await res.json();
  
  // Format for UI
  return data.map((b: any) => ({
    id: b.id,
    patientName: b.appointment?.patient?.name || 'Unknown',
    amount: b.totalAmount,
    date: new Date(b.createdAt).toISOString().split('T')[0],
    status: b.paymentStatus === 'PAID' ? 'Paid' : b.paymentStatus === 'PARTIAL' ? 'Partial' : 'Pending',
    raw: b
  }));
};

export const getBill = async (id: string) => {
  const res = await fetch(`/api/billing/${id}`);
  if (!res.ok) throw new Error('Failed to fetch bill details');
  const b = await res.json();

  return {
    id: b.id,
    patientName: b.appointment?.patient?.name || 'Unknown',
    patientEmail: b.appointment?.patient?.email || 'N/A',
    patientPhone: b.appointment?.patient?.phone || 'N/A',
    date: new Date(b.createdAt).toISOString().split('T')[0],
    dueDate: new Date(b.createdAt).toISOString().split('T')[0], // same for now
    status: b.paymentStatus === 'PAID' ? 'Paid' : b.paymentStatus === 'PARTIAL' ? 'Partial' : 'Pending',
    items: [
      { id: '1', description: 'Consultation', qty: 1, rate: b.consultationFee, amount: b.consultationFee },
      ...(b.medicineCharges > 0 ? [{ id: '2', description: 'Medicines', qty: 1, rate: b.medicineCharges, amount: b.medicineCharges }] : [])
    ],
    subtotal: b.totalAmount,
    tax: 0,
    total: b.totalAmount,
    raw: b
  };
};

export const markBillPaid = async (data: { id: string, method: string }) => {
  const res = await fetch(`/api/billing`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ billId: data.id, paymentStatus: 'PAID' })
  });
  if (!res.ok) throw new Error('Failed to mark paid');
  return res.json();
};

export const createBill = async () => {
  return { success: true };
};
