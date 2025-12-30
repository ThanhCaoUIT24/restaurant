import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listShifts,
  createShift,
  updateShift,
  deleteShift,
  listEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  listSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  createBulkSchedules,
  attendanceReport,
  checkIn,
  checkOut,
  getMyAttendanceRecords,
} from '../api/hr.api';

// ==================== SHIFTS ====================

export const useShifts = () =>
  useQuery({
    queryKey: ['shifts'],
    queryFn: listShifts,
  });

export const useCreateShift = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createShift,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['shifts'] }),
  });
};

export const useUpdateShift = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) => updateShift(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['shifts'] }),
  });
};

export const useDeleteShift = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteShift,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['shifts'] }),
  });
};

// ==================== EMPLOYEES ====================

export const useEmployees = () =>
  useQuery({
    queryKey: ['employees'],
    queryFn: listEmployees,
  });

export const useCreateEmployee = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createEmployee,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['employees'] }),
  });
};

export const useUpdateEmployee = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) => updateEmployee(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['employees'] }),
  });
};

export const useDeleteEmployee = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteEmployee,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['employees'] }),
  });
};

// ==================== SCHEDULES ====================

export const useSchedules = (query = {}) =>
  useQuery({
    queryKey: ['schedules', query],
    queryFn: () => listSchedules(query),
  });

export const useCreateSchedule = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createSchedule,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['schedules'] }),
  });
};

export const useUpdateSchedule = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) => updateSchedule(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['schedules'] }),
  });
};

export const useDeleteSchedule = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteSchedule,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['schedules'] }),
  });
};

export const useCreateBulkSchedules = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createBulkSchedules,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['schedules'] }),
  });
};

// ==================== ATTENDANCE ====================

export const useAttendanceReport = (query = {}) =>
  useQuery({
    queryKey: ['attendanceReport', query],
    queryFn: () => attendanceReport(query),
  });

export const useCheckIn = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: checkIn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['attendanceReport'] });
      qc.invalidateQueries({ queryKey: ['myAttendanceRecords'] });
    },
  });
};

export const useCheckOut = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: checkOut,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['attendanceReport'] });
      qc.invalidateQueries({ queryKey: ['myAttendanceRecords'] });
    },
  });
};

export const useMyAttendanceRecords = (query = {}) =>
  useQuery({
    queryKey: ['myAttendanceRecords', query],
    queryFn: () => getMyAttendanceRecords(query),
  });
