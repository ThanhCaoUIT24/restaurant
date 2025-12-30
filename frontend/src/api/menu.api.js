import api from './client';

// ==================== CATEGORIES ====================

export const fetchCategories = async () => {
  const { data } = await api.get('/menu/categories');
  return data.items || [];
};

export const getCategory = async (id) => {
  const { data } = await api.get(`/menu/categories/${id}`);
  return data;
};

export const createCategory = async (payload) => {
  const { data } = await api.post('/menu/categories', payload);
  return data;
};

export const updateCategory = async (id, payload) => {
  const { data } = await api.put(`/menu/categories/${id}`, payload);
  return data;
};

export const deleteCategory = async (id) => {
  const { data } = await api.delete(`/menu/categories/${id}`);
  return data;
};

// ==================== DISHES ====================

export const fetchDishes = async (query = {}) => {
  const params = {};
  if (query.categoryId) params.categoryId = query.categoryId;
  if (query.activeOnly !== undefined) params.activeOnly = query.activeOnly;
  if (query.q) params.q = query.q;
  const { data } = await api.get('/menu/dishes', { params });
  return data.items || [];
};

export const getDish = async (id) => {
  const { data } = await api.get(`/menu/dishes/${id}`);
  return data;
};

export const createDish = async (payload) => {
  const { data } = await api.post('/menu/dishes', payload);
  return data;
};

export const updateDish = async (id, payload) => {
  const { data } = await api.put(`/menu/dishes/${id}`, payload);
  return data;
};

export const updateDishStatus = async (id, status) => {
  const { data } = await api.patch(`/menu/dishes/${id}/status`, { status });
  return data;
};

export const deleteDish = async (id) => {
  const { data } = await api.delete(`/menu/dishes/${id}`);
  return data;
};

// ==================== OPTIONS ====================

export const fetchOptions = async () => {
  const { data } = await api.get('/menu/options');
  return data.items || [];
};

export const createOption = async (payload) => {
  const { data } = await api.post('/menu/options', payload);
  return data;
};

export const updateOption = async (id, payload) => {
  const { data } = await api.put(`/menu/options/${id}`, payload);
  return data;
};

export const deleteOption = async (id) => {
  const { data } = await api.delete(`/menu/options/${id}`);
  return data;
};
