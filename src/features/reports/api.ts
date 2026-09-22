export const getAnalytics = async (range: string) => {
  return {
    stats: {
      revenue: 450000,
      appointments: 1250,
      newPatients: 145,
      noShowRate: '4.2%'
    },
    revenueData: [
      { name: 'Mon', value: 12000 },
      { name: 'Tue', value: 19000 },
      { name: 'Wed', value: 15000 },
      { name: 'Thu', value: 22000 },
      { name: 'Fri', value: 25000 },
      { name: 'Sat', value: 30000 },
      { name: 'Sun', value: 18000 },
    ],
    appointmentsData: [
      { name: 'Mon', value: 45 },
      { name: 'Tue', value: 52 },
      { name: 'Wed', value: 48 },
      { name: 'Thu', value: 61 },
      { name: 'Fri', value: 59 },
      { name: 'Sat', value: 75 },
      { name: 'Sun', value: 40 },
    ],
    doctorPerformance: [
      { id: '1', name: 'Dr. Smith', appointments: 150, rating: 4.8, revenue: 120000 },
      { id: '2', name: 'Dr. Jones', appointments: 120, rating: 4.9, revenue: 95000 },
      { id: '3', name: 'Dr. Davis', appointments: 110, rating: 4.7, revenue: 85000 },
    ],
    topDiagnoses: [
      { id: '1', name: 'Hypertension', count: 450, percentage: 85 },
      { id: '2', name: 'Type 2 Diabetes', count: 320, percentage: 65 },
      { id: '3', name: 'Upper Respiratory Infection', count: 280, percentage: 55 },
      { id: '4', name: 'Osteoarthritis', count: 190, percentage: 40 },
      { id: '5', name: 'Asthma', count: 150, percentage: 30 },
    ]
  };
};
