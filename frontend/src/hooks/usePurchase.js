import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listPOs, createPO, updatePOStatus, createReceipt, listSuppliers, createSupplier, updateSupplier, deleteSupplier } from '../api/purchase.api';

export const usePOs = () =>
  useQuery({
    queryKey: ['purchaseOrders'],
    queryFn: listPOs,
  });

export const useCreatePO = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createPO,
    onSuccess: () => qc.invalidateQueries(['purchaseOrders']),
  });
};

export const useUpdatePOStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => updatePOStatus(id, status),
    onSuccess: () => qc.invalidateQueries(['purchaseOrders']),
  });
};

export const useCreateReceipt = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createReceipt,
    onSuccess: () => qc.invalidateQueries(['purchaseOrders']),
  });
};

export const useSuppliers = () =>
  useQuery({
    queryKey: ['suppliers'],
    queryFn: listSuppliers,
    staleTime: 60000,
  });

export const useCreateSupplier = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createSupplier,
    onSuccess: () => qc.invalidateQueries(['suppliers']),
  });
};

export const useUpdateSupplier = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) => updateSupplier(id, payload),
    onSuccess: () => qc.invalidateQueries(['suppliers']),
  });
};

export const useDeleteSupplier = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteSupplier,
    onSuccess: () => qc.invalidateQueries(['suppliers']),
  });
};
