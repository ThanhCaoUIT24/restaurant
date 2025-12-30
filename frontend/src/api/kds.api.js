import api from './client';

export const listTickets = async (station) => {
  const { data } = await api.get('/kds', { params: { station } });
  return data.tickets || [];
};

export const updateItemStatus = async (itemId, status) => {
  const { data } = await api.patch(`/kds/items/${itemId}/status`, { status });
  return data;
};
