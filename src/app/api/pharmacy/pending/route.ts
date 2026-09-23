import { NextResponse } from 'next/server';
import { withPermission } from '@/lib/withPermission';

export const GET = withPermission('pharmacy:dispense', async (request: Request) => {
  return NextResponse.json([
    {
      id: 'RX-1001',
      patientName: 'John Doe',
      doctorId: 'DR-001',
      doctorName: 'Dr. Smith',
      date: new Date().toISOString().split('T')[0],
      status: 'Pending',
      medicines: [
        { id: 'm1', name: 'Paracetamol 500mg', dose: '1 tab', frequency: 'BID', duration: '5 days', stockStatus: 'In Stock' },
        { id: 'm2', name: 'Amoxicillin 250mg', dose: '1 cap', frequency: 'TID', duration: '7 days', stockStatus: 'Low Stock' },
      ]
    }
  ]);
});
