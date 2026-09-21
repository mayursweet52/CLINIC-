import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { eventBus } from '@/lib/events';
import logger from '@/lib/logger';

export interface LabTestItem {
  id: string;
  tokenNumber: number;
  patientName: string;
  patientPhone: string;
  doctorName: string;
  testName: string;
  category: string;
  status: 'PENDING' | 'SAMPLE_COLLECTED' | 'REPORT_READY';
  createdAt: string;
  results?: Record<string, { value: string; unit: string; normalRange: string; status: 'NORMAL' | 'HIGH' | 'LOW' }>;
  notes?: string;
}

// In-memory resilient lab orders store
export let LAB_ORDERS_STORE: LabTestItem[] = [
  {
    id: 'LAB-101',
    tokenNumber: 101,
    patientName: 'Sunil Deshmukh',
    patientPhone: '+91 98220 12345',
    doctorName: 'Dr. Rajesh Sharma',
    testName: 'Complete Blood Count (CBC)',
    category: 'Hematology',
    status: 'REPORT_READY',
    createdAt: new Date().toISOString(),
    results: {
      'Hemoglobin (Hb)': { value: '14.2', unit: 'g/dL', normalRange: '13.0 - 17.0', status: 'NORMAL' },
      'Total WBC Count': { value: '7,800', unit: '/cumm', normalRange: '4,000 - 11,000', status: 'NORMAL' },
      'Platelet Count': { value: '2.4', unit: 'Lakhs/cumm', normalRange: '1.5 - 4.5', status: 'NORMAL' },
      'RBC Count': { value: '4.9', unit: 'mil/cumm', normalRange: '4.5 - 5.5', status: 'NORMAL' },
      'ESR (1st Hour)': { value: '12', unit: 'mm/hr', normalRange: '0 - 15', status: 'NORMAL' }
    },
    notes: 'All hematological parameters are within normal biological reference limits.'
  },
  {
    id: 'LAB-102',
    tokenNumber: 102,
    patientName: 'Aarti Kulkarni',
    patientPhone: '+91 98221 54321',
    doctorName: 'Dr. Priya Desai',
    testName: 'Fasting Blood Sugar (FBS) & HbA1c',
    category: 'Biochemistry',
    status: 'SAMPLE_COLLECTED',
    createdAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'LAB-103',
    tokenNumber: 103,
    patientName: 'Mahesh Patil',
    patientPhone: '+91 98222 98765',
    doctorName: 'Dr. Rajesh Sharma',
    testName: 'Lipid Profile (Cholesterol & Triglycerides)',
    category: 'Biochemistry',
    status: 'PENDING',
    createdAt: new Date(Date.now() - 7200000).toISOString()
  }
];

export async function GET(req: NextRequest) {
  try {
    // Try database lab reports if available
    try {
      const dbReports = await prisma.labReport.findMany({
        take: 30,
        orderBy: { createdAt: 'desc' },
        include: { patient: true }
      });

      if (dbReports && dbReports.length > 0) {
        const mapped = dbReports.map((r, i) => ({
          id: r.id,
          tokenNumber: 200 + i,
          patientName: r.patient.name,
          patientPhone: r.patient.phone,
          doctorName: 'Consultant Pathologist',
          testName: r.testName,
          category: 'Pathology',
          status: (r.results ? 'REPORT_READY' : 'PENDING') as any,
          createdAt: r.createdAt.toISOString(),
          results: r.results as any,
          notes: r.interpretation || ''
        }));
        return NextResponse.json(mapped);
      }
    } catch (dbErr) {
      logger.warn('DB offline for Lab reports, serving fallback in-memory store');
    }

    return NextResponse.json(LAB_ORDERS_STORE);
  } catch (error: any) {
    logger.error('Error in lab GET API:', error);
    return NextResponse.json(LAB_ORDERS_STORE);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, orderId, results, status, notes, newOrder } = body;

    if (action === 'CREATE' && newOrder) {
      const order: LabTestItem = {
        id: `LAB-${Math.floor(1000 + Math.random() * 9000)}`,
        tokenNumber: newOrder.tokenNumber || Math.floor(100 + Math.random() * 899),
        patientName: newOrder.patientName,
        patientPhone: newOrder.patientPhone || '',
        doctorName: newOrder.doctorName || 'Dr. Rajesh Sharma',
        testName: newOrder.testName || 'Diagnostic Test',
        category: newOrder.category || 'Clinical Pathology',
        status: 'PENDING',
        createdAt: new Date().toISOString()
      };
      LAB_ORDERS_STORE.unshift(order);
      return NextResponse.json({ success: true, order }, { status: 201 });
    }

    if (action === 'UPDATE_STATUS' && orderId) {
      const existing = LAB_ORDERS_STORE.find(o => o.id === orderId);
      if (existing) {
        existing.status = status || existing.status;
        if (results) existing.results = results;
        if (notes) existing.notes = notes;

        // Broadcast real-time lab event
        if (status === 'REPORT_READY') {
          eventBus.broadcast('lab.report_ready', {
            orderId: existing.id,
            patientName: existing.patientName,
            testName: existing.testName
          });
        }

        return NextResponse.json({ success: true, order: existing });
      }
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ error: 'Invalid lab action' }, { status: 400 });
  } catch (err: any) {
    logger.error('Error in lab POST API:', err);
    return NextResponse.json({ error: err.message || 'Lab API failed' }, { status: 500 });
  }
}
