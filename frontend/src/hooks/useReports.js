import { useQuery } from '@tanstack/react-query';
import {
  fetchDashboard,
  fetchSales,
  fetchMenuPerformance,
  fetchInventoryReport,
  fetchAttendanceReport,
} from '../api/reports.api';

export const useDashboard = (params = {}) =>
  useQuery({
    queryKey: ['dashboard', params],
    queryFn: () => fetchDashboard(params),
    refetchInterval: 5000,
  });

export const useSalesReport = (params = {}) =>
  useQuery({
    queryKey: ['salesReport', params],
    queryFn: () => fetchSales(params),
  });

export const useMenuPerformance = (params) =>
  useQuery({
    queryKey: ['menuPerformance', params],
    queryFn: () => fetchMenuPerformance(params),
  });

export const useInventoryReport = () =>
  useQuery({
    queryKey: ['inventoryReport'],
    queryFn: fetchInventoryReport,
  });

export const useAttendanceReport = () =>
  useQuery({
    queryKey: ['attendanceReport'],
    queryFn: fetchAttendanceReport,
  });
