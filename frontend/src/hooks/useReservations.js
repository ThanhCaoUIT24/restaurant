import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listReservations, createReservation, updateReservation } from '../api/reservations.api';

export const useReservations = (params) =>
  useQuery({
    queryKey: ['reservations', params],
    queryFn: () => listReservations(params),
    staleTime: 10000,
  });

export const useWeekReservations = (startDate, endDate) =>
  useQuery({
    queryKey: ['reservations', 'week', startDate, endDate],
    queryFn: () => listReservations({ startDate, endDate }),
    staleTime: 10000,
    enabled: !!startDate && !!endDate,
  });

export const useCreateReservation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createReservation,
    onSuccess: () => qc.invalidateQueries(['reservations']),
  });
};

export const useUpdateReservation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => updateReservation(id, payload),
    onSuccess: () => qc.invalidateQueries(['reservations']),
  });
};
