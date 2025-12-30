import api from './client';

// ==================== MATERIALS ====================

export const listMaterials = async () => {
  const { data } = await api.get('/inventory/materials');
  return data.items || [];
};

export const getMaterial = async (id) => {
  const { data } = await api.get(`/inventory/materials/${id}`);
  return data;
};

export const createMaterial = async (payload) => {
  const { data } = await api.post('/inventory/materials', payload);
  return data;
};

export const updateMaterial = async (id, payload) => {
  const { data } = await api.put(`/inventory/materials/${id}`, payload);
  return data;
};

export const deleteMaterial = async (id) => {
  const { data } = await api.delete(`/inventory/materials/${id}`);
  return data;
};

// ==================== ALERTS ====================

export const listAlerts = async () => {
  const { data } = await api.get('/inventory/alerts');
  return data.alerts || [];
};

// ==================== ADJUSTMENTS ====================

export const listAdjustments = async (query = {}) => {
  const { data } = await api.get('/inventory/adjustments', { params: query });
  return data.items || [];
};

export const createAdjustment = async (payload) => {
  const { data } = await api.post('/inventory/adjustments', payload);
  return data;
};

export const createBulkAdjustment = async (payload) => {
  const { data } = await api.post('/inventory/adjustments/bulk', payload);
  return data;
};

export const getAdjustmentOrder = async (adjustmentId) => {
  const { data } = await api.get(`/inventory/adjustments/${adjustmentId}/order`);
  return data;
};

// ==================== RECIPES ====================

export const upsertRecipe = async (payload) => {
  const { data } = await api.post('/inventory/recipes', payload);
  return data;
};

export const getRecipe = async (monAnId) => {
  const { data } = await api.get(`/inventory/recipes/${monAnId}`);
  return data;
};
