import api from './client';

export const listCustomers = async (query = {}) => {
  const { data } = await api.get('/customers', { params: query });
  return data;
};

export const getCustomer = async (id) => {
  const { data } = await api.get(`/customers/${id}`);
  return data;
};

export const findCustomerByPhone = async (phone) => {
  const { data } = await api.get(`/customers/phone/${phone}`);
  return data;
};

export const createCustomer = async (payload) => {
  const { data } = await api.post('/customers', payload);
  return data;
};

export const updateCustomer = async (id, payload) => {
  const { data } = await api.put(`/customers/${id}`, payload);
  return data;
};

export const deleteCustomer = async (id) => {
  const { data } = await api.delete(`/customers/${id}`);
  return data;
};

export const getCustomerPoints = async (id) => {
  const { data } = await api.get(`/customers/${id}/points`);
  return data;
};

export const addPoints = async (id, amount, description) => {
  const { data } = await api.post(`/customers/${id}/points/add`, { amount, description });
  return data;
};

export const usePoints = async (id, points, description) => {
  const { data } = await api.post(`/customers/${id}/points/use`, { points, description });
  return data;
};

export const getMembershipTiers = async () => {
  const { data } = await api.get('/customers/tiers');
  return data;
};
