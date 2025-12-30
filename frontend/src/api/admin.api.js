import api from './client';

// User Management
export const listUsers = async (query = {}) => {
  const { data } = await api.get('/admin/users', { params: query });
  return data;
};

export const getUser = async (id) => {
  const { data } = await api.get(`/admin/users/${id}`);
  return data;
};

export const createUser = async (payload) => {
  const { data } = await api.post('/admin/users', payload);
  return data;
};

export const updateUser = async (id, payload) => {
  const { data } = await api.put(`/admin/users/${id}`, payload);
  return data;
};

export const deleteUser = async (id) => {
  const { data } = await api.delete(`/admin/users/${id}`);
  return data;
};

export const listEmployeesWithoutAccount = async () => {
  const { data } = await api.get('/admin/users/employees-available');
  return data;
};

// Role Management
export const listRoles = async () => {
  const { data } = await api.get('/admin/roles');
  return data;
};

export const listPermissions = async () => {
  const { data } = await api.get('/admin/permissions');
  return data;
};

export const createRole = async (payload) => {
  const { data } = await api.post('/admin/roles', payload);
  return data;
};

export const updateRole = async (id, payload) => {
  const { data } = await api.put(`/admin/roles/${id}`, payload);
  return data;
};

export const deleteRole = async (id) => {
  const { data } = await api.delete(`/admin/roles/${id}`);
  return data;
};

// Audit Logs
export const listAuditLogs = async (query = {}) => {
  const { data } = await api.get('/admin/audit', { params: query });
  return data;
};

// System Config
export const getConfigs = async () => {
  const { data } = await api.get('/admin/config');
  return data;
};

export const updateConfig = async (key, value) => {
  const { data } = await api.post('/admin/config', { key, value });
  return data;
};

export const batchUpdateConfigs = async (configs) => {
  const { data } = await api.post('/admin/config/batch', { configs });
  return data;
};

// Loyalty Tiers
export const listLoyaltyTiers = async () => {
  const { data } = await api.get('/admin/loyalty-tiers');
  return data;
};

export const createLoyaltyTier = async (payload) => {
  const { data } = await api.post('/admin/loyalty-tiers', payload);
  return data;
};

export const updateLoyaltyTier = async (id, payload) => {
  const { data } = await api.put(`/admin/loyalty-tiers/${id}`, payload);
  return data;
};

export const deleteLoyaltyTier = async (id) => {
  const { data } = await api.delete(`/admin/loyalty-tiers/${id}`);
  return data;
};

// Promotions
export const listPromotions = async (query = {}) => {
  const { data } = await api.get('/admin/promotions', { params: query });
  return data;
};

export const getPromotion = async (id) => {
  const { data } = await api.get(`/admin/promotions/${id}`);
  return data;
};

export const createPromotion = async (payload) => {
  const { data } = await api.post('/admin/promotions', payload);
  return data;
};

export const updatePromotion = async (id, payload) => {
  const { data } = await api.put(`/admin/promotions/${id}`, payload);
  return data;
};

export const deletePromotion = async (id) => {
  const { data } = await api.delete(`/admin/promotions/${id}`);
  return data;
};

// Bulk Price Update
export const updateCategoryPrices = async (danhMucId, adjustment) => {
  const { data } = await api.post(`/admin/categories/${danhMucId}/update-prices`, adjustment);
  return data;
};
