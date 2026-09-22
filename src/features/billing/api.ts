export const getBills = async () => {
  return [
    { id: 'INV-1001', patientName: 'John Doe', amount: 1500, date: '2026-09-22', status: 'Pending' },
    { id: 'INV-1002', patientName: 'Jane Smith', amount: 2000, date: '2026-09-21', status: 'Paid' },
    { id: 'INV-1003', patientName: 'Mike Johnson', amount: 500, date: '2026-09-20', status: 'Partial' },
  ];
};

export const getBill = async (id: string) => {
  return {
    id,
    patientName: 'John Doe',
    patientEmail: 'john@example.com',
    patientPhone: '+91 9876543210',
    date: '2026-09-22',
    dueDate: '2026-09-29',
    status: 'Pending',
    items: [
      { id: '1', description: 'Consultation', qty: 1, rate: 500, amount: 500 },
      { id: '2', description: 'Blood Test', qty: 1, rate: 1000, amount: 1000 },
    ],
    subtotal: 1500,
    tax: 0,
    total: 1500,
  };
};

export const markBillPaid = async (data: { id: string, method: string }) => {
  return { success: true };
};

export const createBill = async () => {
  return { success: true };
};
