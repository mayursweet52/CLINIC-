export const getAvailability = async () => {
  return [
    { id: '1', dayOfWeek: 'Monday', startTime: '09:00', endTime: '13:00', duration: 15 },
    { id: '2', dayOfWeek: 'Monday', startTime: '14:00', endTime: '18:00', duration: 15 },
    { id: '3', dayOfWeek: 'Tuesday', startTime: '10:00', endTime: '16:00', duration: 20 },
  ];
};

export const createSlot = async (data: any) => ({ success: true });
export const deleteSlot = async (id: string) => ({ success: true });

export const getTimeOff = async () => {
  return [
    { id: '1', startDate: '2026-10-15', endDate: '2026-10-18', reason: 'Vacation', status: 'Approved' }
  ];
};

export const markLeave = async (data: any) => ({ success: true });
export const deleteLeave = async (id: string) => ({ success: true });
