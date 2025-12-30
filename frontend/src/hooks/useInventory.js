import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listMaterials,
  getMaterial,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  listAlerts,
  listAdjustments,
  createAdjustment,
  createBulkAdjustment,
  upsertRecipe,
  getRecipe,
} from '../api/inventory.api';

// ==================== MATERIALS ====================

export const useMaterials = () =>
  useQuery({
    queryKey: ['materials'],
    queryFn: listMaterials,
  });

export const useMaterial = (id) =>
  useQuery({
    queryKey: ['material', id],
    queryFn: () => getMaterial(id),
    enabled: !!id,
  });

export const useCreateMaterial = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createMaterial,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['materials'] });
      qc.invalidateQueries({ queryKey: ['inventoryAlerts'] });
    },
  });
};

export const useUpdateMaterial = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) => updateMaterial(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['materials'] });
      qc.invalidateQueries({ queryKey: ['inventoryAlerts'] });
    },
  });
};

export const useDeleteMaterial = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteMaterial,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['materials'] });
    },
  });
};

// ==================== ALERTS ====================

export const useInventoryAlerts = (options = {}) =>
  useQuery({
    queryKey: ['inventoryAlerts'],
    queryFn: listAlerts,
    refetchInterval: 10000,
    ...options,
  });

// ==================== ADJUSTMENTS ====================

export const useAdjustments = (query = {}) =>
  useQuery({
    queryKey: ['adjustments', query],
    queryFn: () => listAdjustments(query),
  });

export const useCreateAdjustment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createAdjustment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['materials'] });
      qc.invalidateQueries({ queryKey: ['adjustments'] });
      qc.invalidateQueries({ queryKey: ['inventoryAlerts'] });
    },
  });
};

export const useCreateBulkAdjustment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createBulkAdjustment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['materials'] });
      qc.invalidateQueries({ queryKey: ['adjustments'] });
      qc.invalidateQueries({ queryKey: ['inventoryAlerts'] });
    },
  });
};

// ==================== RECIPES ====================

export const useUpsertRecipe = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: upsertRecipe,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['materials'] });
    },
  });
};

export const useRecipe = (monAnId) =>
  useQuery({
    queryKey: ['recipe', monAnId],
    queryFn: () => getRecipe(monAnId),
    enabled: !!monAnId,
  });
