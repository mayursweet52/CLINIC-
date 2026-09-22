export const getOverview = async () => {
  // Mock data for Admin Dashboard
  return {
    stats: {
      totalStaff: 42,
      totalPatients: 1250,
      revenueMonth: 450000,
      activeDoctors: 8
    },
    recentActivity: [
      { id: '1', action: 'Patient registered', user: 'Receptionist', timeAgo: '5 mins ago' },
      { id: '2', action: 'Appointment booked', user: 'Dr. Smith', timeAgo: '15 mins ago' },
      { id: '3', action: 'Invoice generated', user: 'Billing Dept', timeAgo: '1 hour ago' },
      { id: '4', action: 'Lab results uploaded', user: 'Lab Tech', timeAgo: '2 hours ago' },
      { id: '5', action: 'Settings updated', user: 'Admin', timeAgo: '5 hours ago' }
    ]
  };
};
