export const getOverview = async () => {
  const res = await fetch('/api/admin/stats');
  if (!res.ok) throw new Error('Failed to fetch admin stats');
  return res.json();
};
