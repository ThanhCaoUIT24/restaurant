import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  listEmployeesWithoutAccount,
  listRoles,
  listPermissions,
  createRole,
  updateRole,
  deleteRole,
  listAuditLogs,
  getConfigs,
  updateConfig,
  batchUpdateConfigs,
  listLoyaltyTiers,
  createLoyaltyTier,
  updateLoyaltyTier,
  deleteLoyaltyTier,
  listPromotions,
  getPromotion,
  createPromotion,
  updatePromotion,
  deletePromotion,
  updateCategoryPrices,
} from '../api/admin.api';

// ==================== USER HOOKS ====================

export const useUsers = (query = {}) =>
  useQuery({
    queryKey: ['users', query],
    queryFn: () => listUsers(query),
  });

export const useUser = (id) =>
  useQuery({
    queryKey: ['user', id],
    queryFn: () => getUser(id),
    enabled: !!id,
  });

export const useCreateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createUser,
    onSuccess: () => qc.invalidateQueries(['users']),
  });
};

export const useUpdateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => updateUser(id, payload),
    onSuccess: () => qc.invalidateQueries(['users']),
  });
};

export const useDeleteUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => qc.invalidateQueries(['users']),
  });
};

export const useEmployeesWithoutAccount = () =>
  useQuery({
    queryKey: ['employeesWithoutAccount'],
    queryFn: listEmployeesWithoutAccount,
  });

// ==================== ROLE HOOKS ====================

export const useRoles = () =>
  useQuery({
    queryKey: ['roles'],
    queryFn: listRoles,
  });

export const usePermissions = () =>
  useQuery({
    queryKey: ['permissions'],
    queryFn: listPermissions,
  });

export const useCreateRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createRole,
    onSuccess: () => qc.invalidateQueries(['roles']),
  });
};

export const useUpdateRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => updateRole(id, payload),
    onSuccess: () => {
      qc.invalidateQueries(['roles']);
      qc.invalidateQueries(['users']);
      // Force current user to refetch permissions if they were affected
      qc.invalidateQueries(['auth', 'me']);
    },
  });
};

export const useDeleteRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteRole,
    onSuccess: () => qc.invalidateQueries(['roles']),
  });
};

// ==================== AUDIT LOG HOOKS ====================

export const useAuditLogs = (query = {}) =>
  useQuery({
    queryKey: ['auditLogs', query],
    queryFn: () => listAuditLogs(query),
  });

// ==================== CONFIG HOOKS ====================

export const useConfigs = () =>
  useQuery({
    queryKey: ['configs'],
    queryFn: getConfigs,
  });

export const useUpdateConfig = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ key, value }) => updateConfig(key, value),
    onSuccess: () => qc.invalidateQueries(['configs']),
  });
};

export const useBatchUpdateConfigs = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: batchUpdateConfigs,
    onSuccess: () => qc.invalidateQueries(['configs']),
  });
};

// ==================== LOYALTY TIER HOOKS ====================

export const useLoyaltyTiers = () =>
  useQuery({
    queryKey: ['loyaltyTiers'],
    queryFn: listLoyaltyTiers,
  });

export const useCreateLoyaltyTier = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createLoyaltyTier,
    onSuccess: () => qc.invalidateQueries(['loyaltyTiers']),
  });
};

export const useUpdateLoyaltyTier = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => updateLoyaltyTier(id, payload),
    onSuccess: () => qc.invalidateQueries(['loyaltyTiers']),
  });
};

export const useDeleteLoyaltyTier = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteLoyaltyTier,
    onSuccess: () => qc.invalidateQueries(['loyaltyTiers']),
  });
};

// ==================== PROMOTION HOOKS ====================

export const usePromotions = (query = {}) =>
  useQuery({
    queryKey: ['promotions', query],
    queryFn: () => listPromotions(query),
  });

export const usePromotion = (id) =>
  useQuery({
    queryKey: ['promotion', id],
    queryFn: () => getPromotion(id),
    enabled: !!id,
  });

export const useCreatePromotion = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createPromotion,
    onSuccess: () => qc.invalidateQueries(['promotions']),
  });
};

export const useUpdatePromotion = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => updatePromotion(id, payload),
    onSuccess: () => qc.invalidateQueries(['promotions']),
  });
};

export const useDeletePromotion = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deletePromotion,
    onSuccess: () => qc.invalidateQueries(['promotions']),
  });
};

// ==================== BULK PRICE UPDATE ====================

export const useUpdateCategoryPrices = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ danhMucId, adjustment }) => updateCategoryPrices(danhMucId, adjustment),
    onSuccess: () => qc.invalidateQueries(['dishes']),
  });
};
