import api from './client';

export const fetchDashboard = async (params = {}) => {
  const { data } = await api.get('/reports/dashboard', { params });
  return data;
};

export const fetchSales = async (params = {}) => {
  const { data } = await api.get('/reports/sales', { params });
  return data.items || [];
};

export const fetchMenuPerformance = async (params = {}) => {
  const { data } = await api.get('/reports/menu-performance', { params });
  return data.items || [];
};

export const fetchInventoryReport = async () => {
  const { data } = await api.get('/reports/inventory');
  return data.items || [];
};

export const fetchAttendanceReport = async () => {
  const { data } = await api.get('/reports/attendance');
  return data.items || [];
};
