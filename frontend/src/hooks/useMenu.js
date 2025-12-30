import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  fetchDishes,
  getDish,
  createDish,
  updateDish,
  updateDishStatus,
  deleteDish,
  fetchOptions,
  createOption,
  updateOption,
  deleteOption,
} from '../api/menu.api';

// ==================== CATEGORIES ====================

export const useMenuCategories = () =>
  useQuery({
    queryKey: ['menu', 'categories'],
    queryFn: fetchCategories,
    staleTime: 10000,
  });

export const useCategory = (id) =>
  useQuery({
    queryKey: ['menu', 'category', id],
    queryFn: () => getCategory(id),
    enabled: !!id,
  });

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu', 'categories'] });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) => updateCategory(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu', 'categories'] });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu', 'categories'] });
    },
  });
};

// ==================== DISHES ====================

export const useMenuDishes = (query = {}) =>
  useQuery({
    queryKey: ['menu', 'dishes', query],
    queryFn: () => fetchDishes(query),
    staleTime: 5000,
  });

export const useDish = (id) =>
  useQuery({
    queryKey: ['menu', 'dish', id],
    queryFn: () => getDish(id),
    enabled: !!id,
  });

export const useCreateDish = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createDish,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu', 'dishes'] });
      queryClient.invalidateQueries({ queryKey: ['menu', 'categories'] });
    },
  });
};

export const useUpdateDish = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) => updateDish(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu', 'dishes'] });
      queryClient.invalidateQueries({ queryKey: ['menu', 'categories'] });
    },
  });
};

export const useToggleDishStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => updateDishStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu', 'dishes'] });
    },
  });
};

export const useDeleteDish = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteDish,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu', 'dishes'] });
      queryClient.invalidateQueries({ queryKey: ['menu', 'categories'] });
    },
  });
};

// ==================== OPTIONS ====================

export const useMenuOptions = () =>
  useQuery({
    queryKey: ['menu', 'options'],
    queryFn: fetchOptions,
    staleTime: 60000,
  });

export const useCreateOption = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createOption,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu', 'options'] });
    },
  });
};

export const useUpdateOption = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) => updateOption(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu', 'options'] });
    },
  });
};

export const useDeleteOption = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteOption,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu', 'options'] });
    },
  });
};
