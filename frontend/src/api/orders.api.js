import api from './client';

export const listOrders = async (params = {}) => {
  const { data } = await api.get('/orders', { params });
  return data.items || [];
};

export const createOrder = async (payload) => {
  const { data } = await api.post('/orders', payload);
  return data;
};

export const sendOrder = async (orderId) => {
  const { data } = await api.post(`/orders/${orderId}/send`);
  return data;
};

export const voidOrderItem = async (orderId, payload) => {
  const { data } = await api.post(`/orders/${orderId}/void-item`, payload);
  return data;
};

export const createVoidRequest = async (payload) => {
  const { data } = await api.post('/void-requests', payload);
  return data;
};

export const listVoidRequests = async (params = {}) => {
  const { data } = await api.get('/void-requests', { params });
  return data.items || [];
};

export const approveVoidRequest = async (id, payload = {}) => {
  const { data } = await api.post(`/void-requests/${id}/approve`, payload);
  return data;
};

export const rejectVoidRequest = async (id, payload = {}) => {
  const { data } = await api.post(`/void-requests/${id}/reject`, payload);
  return data;
};
