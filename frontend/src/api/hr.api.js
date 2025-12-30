import api from './client';

// ==================== SHIFTS ====================

export const listShifts = async () => {
  const { data } = await api.get('/hr/shifts');
  return data.items || [];
};

export const createShift = async (payload) => {
  const { data } = await api.post('/hr/shifts', payload);
  return data;
};

export const updateShift = async (id, payload) => {
  const { data } = await api.put(`/hr/shifts/${id}`, payload);
  return data;
};

export const deleteShift = async (id) => {
  const { data } = await api.delete(`/hr/shifts/${id}`);
  return data;
};

// ==================== EMPLOYEES ====================

export const listEmployees = async () => {
  const { data } = await api.get('/hr/employees');
  return data.items || [];
};

export const createEmployee = async (payload) => {
  const { data } = await api.post('/hr/employees', payload);
  return data;
};

export const updateEmployee = async (id, payload) => {
  const { data } = await api.put(`/hr/employees/${id}`, payload);
  return data;
};

export const deleteEmployee = async (id) => {
  const { data } = await api.delete(`/hr/employees/${id}`);
  return data;
};

// ==================== SCHEDULES ====================

export const listSchedules = async (query = {}) => {
  const { data } = await api.get('/hr/schedules', { params: query });
  return data.items || [];
};

export const createSchedule = async (payload) => {
  const { data } = await api.post('/hr/schedules', payload);
  return data;
};

export const updateSchedule = async (id, payload) => {
  const { data } = await api.put(`/hr/schedules/${id}`, payload);
  return data;
};

export const deleteSchedule = async (id) => {
  const { data } = await api.delete(`/hr/schedules/${id}`);
  return data;
};

export const createBulkSchedules = async (payload) => {
  const { data } = await api.post('/hr/schedules/bulk', payload);
  return data;
};

// ==================== ATTENDANCE ====================

export const attendanceReport = async (query = {}) => {
  const { data } = await api.get('/hr/attendance/report', { params: query });
  return data.items || [];
};

export const checkIn = async (payload) => {
  const { data } = await api.post('/hr/attendance/checkin', payload);
  return data;
};

export const checkOut = async (payload) => {
  const { data } = await api.post('/hr/attendance/checkout', payload);
  return data;
};

export const getMyAttendanceRecords = async (query = {}) => {
  const { data } = await api.get('/hr/attendance/my-records', { params: query });
  return data.items || [];
};
