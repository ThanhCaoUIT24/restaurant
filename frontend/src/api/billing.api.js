import api from './client';

export const listOpenInvoices = async () => {
  const { data } = await api.get('/billing/open');
  return data.invoices || [];
};

export const listPendingOrders = async () => {
  const { data } = await api.get('/billing/pending-orders');
  return data.orders || [];
};

export const checkoutOrder = async (orderId, payload = {}) => {
  const { data } = await api.post(`/billing/orders/${orderId}/checkout`, payload);
  return data;
};

export const payInvoice = async (invoiceId, payload) => {
  const { data } = await api.post(`/billing/invoices/${invoiceId}/pay`, payload);
  return data;
};

export const getInvoiceDetails = async (invoiceId) => {
  const { data } = await api.get(`/billing/invoices/${invoiceId}`);
  return data;
};

export const getInvoicePrintData = async (invoiceId) => {
  const { data } = await api.get(`/billing/invoices/${invoiceId}/print`);
  return data;
};

export const splitBillByItems = async (invoiceId, itemIds) => {
  const { data } = await api.post(`/billing/invoices/${invoiceId}/split-by-items`, { itemIds });
  return data;
};

export const splitBillByPeople = async (invoiceId, numPeople) => {
  const { data } = await api.post(`/billing/invoices/${invoiceId}/split-by-people`, { numPeople });
  return data;
};

export const mergeInvoices = async (invoiceIds) => {
  const { data } = await api.post(`/billing/invoices/merge`, { invoiceIds });
  return data;
};

export const getZReport = async (shiftId) => {
  const { data } = await api.get(`/billing/shifts/${shiftId}/zreport`);
  return data;
};

export const exportZReport = async (shiftId, format = 'csv') => {
  const response = await api.get(`/billing/shifts/${shiftId}/zreport/export?format=${format}`, {
    responseType: format === 'csv' ? 'text' : 'blob',
  });
  return response.data;
};

export const exportInvoices = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.status) params.append('status', filters.status);
  if (filters.format) params.append('format', filters.format);
  
  if (filters.format === 'csv') {
    const response = await api.get(`/billing/export?${params.toString()}`, {
      responseType: 'blob',
    });
    return response.data;
  }
  
  const { data } = await api.get(`/billing/export?${params.toString()}`);
  return data;
};

export const getDailySalesReport = async (date) => {
  const { data } = await api.get(`/billing/daily-report?date=${date || ''}`);
  return data;
};

export const fetchCurrentShift = async () => {
  const { data } = await api.get('/billing/shifts/current');
  return data;
};

export const openShift = async (payload) => {
  const { data } = await api.post('/billing/shifts/open', payload);
  return data;
};

export const closeShift = async (shiftId, payload) => {
  const { data } = await api.post(`/billing/shifts/${shiftId}/close`, payload);
  return data;
};
