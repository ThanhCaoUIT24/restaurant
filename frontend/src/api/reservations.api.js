import api from './client';

export const listReservations = async (params = {}) => {
  const { data } = await api.get('/reservations', { params });
  return data.items || [];
};

export const createReservation = async (payload) => {
  const { data } = await api.post('/reservations', payload);
  return data;
};

export const updateReservation = async (id, payload) => {
  const { data } = await api.patch(`/reservations/${id}/status`, payload);
  return data;
};
