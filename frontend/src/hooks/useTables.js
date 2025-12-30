import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchTables,
  getTable,
  createTable,
  updateTable,
  deleteTable,
  updateTableStatus,
  updateTablePosition,
  mergeTables,
  splitTable,
  unmergeTables,
  fetchAreas,
  createArea,
  updateArea,
  deleteArea,
} from '../api/tables.api';

export const useTables = () => {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ['tables'],
    queryFn: fetchTables,
    staleTime: 5000,
    refetchInterval: 10000, // Poll every 10 seconds instead of SSE
  });

  // SSE disabled - EventSource doesn't support Authorization header
  // TODO: Implement token-based SSE or WebSocket
  
  return query;
};

export const useTable = (id) =>
  useQuery({
    queryKey: ['table', id],
    queryFn: () => getTable(id),
    enabled: !!id,
  });

export const useCreateTable = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createTable,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tables'] }),
  });
};

export const useUpdateTable = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) => updateTable(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tables'] }),
  });
};

export const useDeleteTable = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteTable,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tables'] }),
  });
};

export const useUpdateTableStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => updateTableStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tables'] }),
  });
};

export const useUpdateTablePosition = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...position }) => updateTablePosition(id, position),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tables'] }),
  });
};

// ==================== MERGE / SPLIT ====================

export const useMergeTables = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: mergeTables,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tables'] });
      qc.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useSplitTable = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: splitTable,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tables'] });
      qc.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useUnmergeTables = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: unmergeTables,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tables'] }),
  });
};

// ==================== AREAS ====================

export const useAreas = () =>
  useQuery({
    queryKey: ['tableAreas'],
    queryFn: fetchAreas,
  });

export const useCreateArea = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createArea,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tables'] });
      qc.invalidateQueries({ queryKey: ['tableAreas'] });
    },
  });
};

export const useUpdateArea = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) => updateArea(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tables'] });
      qc.invalidateQueries({ queryKey: ['tableAreas'] });
    },
  });
};

export const useDeleteArea = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteArea,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tables'] });
      qc.invalidateQueries({ queryKey: ['tableAreas'] });
    },
  });
};
