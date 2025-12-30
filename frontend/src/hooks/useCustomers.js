import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listCustomers,
  getCustomer,
  findCustomerByPhone,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerPoints,
  addPoints,
  usePoints,
  getMembershipTiers,
} from '../api/customers.api';

export const useCustomers = (query = {}) =>
  useQuery({
    queryKey: ['customers', query],
    queryFn: () => listCustomers(query),
  });

export const useCustomer = (id) =>
  useQuery({
    queryKey: ['customer', id],
    queryFn: () => getCustomer(id),
    enabled: !!id,
  });

export const useFindCustomerByPhone = (phone) =>
  useQuery({
    queryKey: ['customerByPhone', phone],
    queryFn: () => findCustomerByPhone(phone),
    enabled: !!phone && phone.length >= 10,
  });

export const useCreateCustomer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createCustomer,
    onSuccess: () => qc.invalidateQueries(['customers']),
  });
};

export const useUpdateCustomer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => updateCustomer(id, payload),
    onSuccess: () => qc.invalidateQueries(['customers']),
  });
};

export const useDeleteCustomer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => qc.invalidateQueries(['customers']),
  });
};

export const useCustomerPoints = (id) =>
  useQuery({
    queryKey: ['customerPoints', id],
    queryFn: () => getCustomerPoints(id),
    enabled: !!id,
  });

export const useAddPoints = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, amount, description }) => addPoints(id, amount, description),
    onSuccess: (_, variables) => {
      qc.invalidateQueries(['customerPoints', variables.id]);
      qc.invalidateQueries(['customers']);
    },
  });
};

export const useUsePoints = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, points, description }) => usePoints(id, points, description),
    onSuccess: (_, variables) => {
      qc.invalidateQueries(['customerPoints', variables.id]);
      qc.invalidateQueries(['customers']);
    },
  });
};

export const useMembershipTiers = () =>
  useQuery({
    queryKey: ['membershipTiers'],
    queryFn: getMembershipTiers,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
