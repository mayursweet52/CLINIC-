export const getPendingPrescriptions = async () => {
  return [
    {
      id: 'RX-1001',
      patientName: 'John Doe',
      doctorId: 'DR-001',
      doctorName: 'Dr. Smith',
      date: '2026-09-22',
      status: 'Pending',
      medicines: [
        { id: 'm1', name: 'Paracetamol 500mg', dose: '1 tab', frequency: 'BID', duration: '5 days', stockStatus: 'In Stock' },
        { id: 'm2', name: 'Amoxicillin 250mg', dose: '1 cap', frequency: 'TID', duration: '7 days', stockStatus: 'Low Stock' },
      ]
    }
  ];
};

export const getInventory = async () => {
  return [
    { id: 'm1', name: 'Paracetamol 500mg', batch: 'B123', qty: 500, price: 10, expiry: '2027-10-01', status: 'In Stock' },
    { id: 'm2', name: 'Amoxicillin 250mg', batch: 'B124', qty: 20, price: 50, expiry: '2026-12-01', status: 'Low Stock' },
    { id: 'm3', name: 'Vitamin C', batch: 'B125', qty: 0, price: 25, expiry: '2028-01-01', status: 'Out of Stock' },
  ];
};

export const dispensePrescription = async (id: string) => {
  return { success: true };
};
