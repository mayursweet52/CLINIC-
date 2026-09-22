'use client';
import React from 'react';
import { usePatients } from '../hooks';
import { DataTable } from '@/components/shared/DataTable';
import { useRouter } from 'next/navigation';
import { StatusBadge } from '@/components/shared/StatusBadge';

export function PatientTable() {
  const { data: patients = [], isLoading } = usePatients();
  const router = useRouter();

  const columns = [
    {
      header: 'Patient',
      accessorFn: (row: any) => row.name,
      cell: (info: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-sm font-medium text-slate-600 dark:text-slate-400">
            {info.getValue().charAt(0)}
          </div>
          <div>
            <div className="font-medium text-slate-900 dark:text-slate-100">{info.getValue()}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">{info.row.original.patientCode}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Age/Gender',
      accessorFn: (row: any) => `${row.age || 30} / ${row.gender}`,
      cell: (info: any) => <span className="text-sm text-slate-600 dark:text-slate-400">{info.getValue()}</span>
    },
    {
      header: 'Phone',
      accessorKey: 'phone',
      cell: (info: any) => <span className="text-sm text-slate-600 dark:text-slate-400">{info.getValue()}</span>
    },
    {
      header: 'Last Visit',
      accessorFn: (row: any) => row.lastVisit ? new Date(row.lastVisit).toLocaleDateString() : 'N/A',
      cell: (info: any) => <span className="text-sm text-slate-600 dark:text-slate-400">{info.getValue()}</span>
    },
    {
      header: 'Actions',
      id: 'actions',
      cell: (info: any) => (
        <button 
          onClick={(e) => { e.stopPropagation(); router.push(`/patients/${info.row.original.id}`); }}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          View Record
        </button>
      )
    }
  ];

  return (
    <DataTable 
      columns={columns} 
      data={patients} 
      loading={isLoading} 
    />
  );
}
