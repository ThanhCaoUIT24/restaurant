import api from './client';

// ==================== TABLES ====================

export const fetchTables = async () => {
  const { data } = await api.get('/tables');
  return { items: data.items || [], areas: data.areas || [] };
};

export const getTable = async (id) => {
  const { data } = await api.get(`/tables/${id}`);
  return data;
};

export const createTable = async (payload) => {
  const { data } = await api.post('/tables', payload);
  return data;
};

export const updateTable = async (id, payload) => {
  const { data } = await api.put(`/tables/${id}`, payload);
  return data;
};

export const deleteTable = async (id) => {
  const { data } = await api.delete(`/tables/${id}`);
  return data;
};

export const updateTableStatus = async (id, status) => {
  const { data } = await api.patch(`/tables/${id}/status`, { status });
  return data;
};

export const updateTablePosition = async (id, position) => {
  const { data } = await api.patch(`/tables/${id}/position`, position);
  return data;
};

// ==================== MERGE / SPLIT ====================

export const mergeTables = async (payload) => {
  const { data } = await api.post('/tables/merge', payload);
  return data;
};

export const splitTable = async (payload) => {
  const { data } = await api.post('/tables/split', payload);
  return data;
};

export const unmergeTables = async (payload) => {
  const { data } = await api.post('/tables/unmerge', payload);
  return data;
};

// ==================== AREAS ====================

export const fetchAreas = async () => {
  const { data } = await api.get('/tables/areas/list');
  return data.items || [];
};

export const createArea = async (payload) => {
  const { data } = await api.post('/tables/areas', payload);
  return data;
};

export const updateArea = async (id, payload) => {
  const { data } = await api.put(`/tables/areas/${id}`, payload);
  return data;
};

export const deleteArea = async (id) => {
  const { data } = await api.delete(`/tables/areas/${id}`);
  return data;
};
