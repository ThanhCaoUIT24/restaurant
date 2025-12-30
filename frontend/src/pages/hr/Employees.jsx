import React, { useState } from 'react';
import MainLayout from '../../layouts/MainLayout';
import {
  Paper,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Stack,
  Chip,
  Avatar,
  Box,
  alpha,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
} from '@mui/material';
import { Person, Phone, Badge, Search, Circle } from '@mui/icons-material';
import { useEmployees } from '../../hooks/useHR';

const COLORS = {
  primary: '#0EA5E9',
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
  text: '#1E293B',
  textSecondary: '#64748B',
  border: '#E2E8F0',
  bg: '#F8FAFC',
};

const getRoleColor = (role) => {
  const roles = {
    QUANLY: { bg: '#DBEAFE', color: '#1D4ED8', label: 'Quản lý' },
    PHUCVU: { bg: '#D1FAE5', color: '#059669', label: 'Phục vụ' },
    THUNGAN: { bg: '#FEF3C7', color: '#D97706', label: 'Thu ngân' },
    BEPCHINH: { bg: '#FEE2E2', color: '#DC2626', label: 'Bếp chính' },
    BEPPHU: { bg: '#FFEDD5', color: '#EA580C', label: 'Bếp phụ' },
    THUKHO: { bg: '#E0E7FF', color: '#4F46E5', label: 'Thủ kho' },
  };
  return roles[role] || { bg: '#F1F5F9', color: '#64748B', label: role || 'Nhân viên' };
};

const getStatusColor = (status) => {
  return status === 'HOATDONG' 
    ? { color: COLORS.success, label: 'Đang làm' }
    : { color: COLORS.danger, label: 'Nghỉ việc' };
};

const Employees = () => {
  const { data: employees = [], isLoading } = useEmployees();
  const [search, setSearch] = useState('');

  const filteredEmployees = employees.filter((emp) =>
    emp.hoTen?.toLowerCase().includes(search.toLowerCase()) ||
    emp.soDienThoai?.includes(search) ||
    emp.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <MainLayout title="Quản lý nhân viên">
      <Paper sx={{ p: 3, borderRadius: 3, border: `1px solid ${COLORS.border}` }}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Box>
            <Typography variant="h5" fontWeight={700} color={COLORS.text}>
              👥 Hồ sơ nhân viên
            </Typography>
            <Typography variant="body2" color={COLORS.textSecondary}>
              Quản lý thông tin nhân viên nhà hàng
            </Typography>
          </Box>
          <Chip 
            label={`${filteredEmployees.length} nhân viên`}
            sx={{ bgcolor: alpha(COLORS.primary, 0.1), color: COLORS.primary, fontWeight: 600 }}
          />
        </Stack>

        {/* Search */}
        <TextField
          placeholder="Tìm kiếm theo tên, SĐT, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ mb: 3, width: 300 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: COLORS.textSecondary }} />
              </InputAdornment>
            ),
          }}
        />

        {isLoading ? (
          <Typography color={COLORS.textSecondary}>Đang tải...</Typography>
        ) : (
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: COLORS.bg }}>
                <TableCell sx={{ fontWeight: 600, color: COLORS.text }}>Nhân viên</TableCell>
                <TableCell sx={{ fontWeight: 600, color: COLORS.text }}>Số điện thoại</TableCell>
                <TableCell sx={{ fontWeight: 600, color: COLORS.text }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600, color: COLORS.text }}>Chức vụ</TableCell>
                <TableCell sx={{ fontWeight: 600, color: COLORS.text }}>Trạng thái</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEmployees.map((emp) => {
                const roleConfig = getRoleColor(emp.chucVu);
                const statusConfig = getStatusColor(emp.trangThai);
                return (
                  <TableRow 
                    key={emp.id} 
                    hover
                    sx={{ 
                      '&:hover': { bgcolor: alpha(COLORS.primary, 0.03) },
                      transition: 'all 0.2s',
                    }}
                  >
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar 
                          sx={{ 
                            bgcolor: alpha(COLORS.primary, 0.1),
                            color: COLORS.primary,
                            fontWeight: 700,
                          }}
                        >
                          {emp.hoTen?.charAt(0)?.toUpperCase() || 'N'}
                        </Avatar>
                        <Typography fontWeight={600} color={COLORS.text}>
                          {emp.hoTen || 'N/A'}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Phone sx={{ fontSize: 16, color: COLORS.textSecondary }} />
                        <Typography color={COLORS.text}>
                          {emp.soDienThoai || '---'}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography color={COLORS.textSecondary}>
                        {emp.email || '---'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={roleConfig.label}
                        sx={{
                          bgcolor: roleConfig.bg,
                          color: roleConfig.color,
                          fontWeight: 600,
                          fontSize: '0.75rem',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <Circle sx={{ fontSize: 8, color: statusConfig.color }} />
                        <Typography 
                          variant="body2" 
                          fontWeight={500}
                          color={statusConfig.color}
                        >
                          {statusConfig.label}
                        </Typography>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredEmployees.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography color={COLORS.textSecondary}>
                      Không tìm thấy nhân viên nào
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Paper>
    </MainLayout>
  );
};

export default Employees;
