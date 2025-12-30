import api from './client';

export const listPOs = async () => {
  const { data } = await api.get('/purchase/orders');
  return data.items || [];
};

export const createPO = async (payload) => {
  const { data } = await api.post('/purchase/orders', payload);
  return data;
};

export const updatePOStatus = async (id, status) => {
  const { data } = await api.patch(`/purchase/orders/${id}/status`, { status });
  return data;
};

export const createReceipt = async (payload) => {
  const { data } = await api.post('/purchase/receipts', payload);
  return data;
};

export const listSuppliers = async () => {
  const { data } = await api.get('/purchase/suppliers');
  return data.items || data.suppliers || [];
};

export const createSupplier = async (payload) => {
  const { data } = await api.post('/purchase/suppliers', payload);
  return data;
};

export const updateSupplier = async (id, payload) => {
  const { data } = await api.put(`/purchase/suppliers/${id}`, payload);
  return data;
};

export const deleteSupplier = async (id) => {
  const { data } = await api.delete(`/purchase/suppliers/${id}`);
  return data;
};
