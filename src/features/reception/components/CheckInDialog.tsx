'use client';
import React, { useState } from 'react';
import { useCheckIn, useCancel } from '../hooks';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';

export function CheckInDialog({ appointmentId, open, onOpenChange }: { appointmentId: string, open: boolean, onOpenChange: (open: boolean) => void }) {
  const checkIn = useCheckIn();
  
  const handleConfirm = async () => {
    await checkIn.mutateAsync(appointmentId);
    onOpenChange(false);
  };

  return (
    <ConfirmDialog 
      title="Check In Patient"
      description="Has the patient arrived at the clinic? This will notify the doctor."
      confirmText="Check In"
      loading={checkIn.isPending}
      onConfirm={handleConfirm}
      open={open}
      onOpenChange={onOpenChange}
    />
  );
}
