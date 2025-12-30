import React, { useState, useMemo } from 'react';
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
  TextField,
  Button,
  Chip,
  Avatar,
  Box,
  alpha,
  Grid,
  Card,
} from '@mui/material';
import { AccessTime, Person, Timer, TrendingUp } from '@mui/icons-material';
import { useAttendanceReport, useEmployees } from '../../hooks/useHR';

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

// Get start and end of current month
const getDefaultDates = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  };
};

const StatCard = ({ title, value, subtitle, icon: Icon, color }) => (
  <Card
    elevation={0}
    sx={{
      p: 2.5,
      borderRadius: 3,
      border: `1px solid ${COLORS.border}`,
      background: `linear-gradient(135deg, ${alpha(color, 0.08)} 0%, ${alpha(color, 0.02)} 100%)`,
    }}
  >
    <Stack direction="row" spacing={2} alignItems="center">
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: 2,
          bgcolor: alpha(color, 0.15),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon sx={{ color, fontSize: 24 }} />
      </Box>
      <Box>
        <Typography variant="body2" color={COLORS.textSecondary}>
          {title}
        </Typography>
        <Typography variant="h5" fontWeight={700} color={COLORS.text}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color={COLORS.textSecondary}>
            {subtitle}
          </Typography>
        )}
      </Box>
    </Stack>
  </Card>
);

const AttendanceReport = () => {
  const defaults = getDefaultDates();
  const [filters, setFilters] = useState(defaults);
  const { data: records = [], isLoading, refetch } = useAttendanceReport(filters);

  // Group records by employee and calculate totals
  const summary = useMemo(() => {
    const byEmployee = new Map();
    
    records.forEach((record) => {
      const empId = record.lichPhanCa?.nhanVien?.id;
      const empName = record.lichPhanCa?.nhanVien?.hoTen || 'Unknown';
      
      if (!byEmployee.has(empId)) {
        byEmployee.set(empId, {
          id: empId,
          hoTen: empName,
          totalHours: 0,
          sessions: 0,
          records: [],
        });
      }
      
      const emp = byEmployee.get(empId);
      emp.sessions += 1;
      emp.totalHours += record.hours || 0;
      emp.records.push(record);
    });

    return Array.from(byEmployee.values()).sort((a, b) => b.totalHours - a.totalHours);
  }, [records]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalHours = summary.reduce((sum, emp) => sum + emp.totalHours, 0);
    const totalSessions = summary.reduce((sum, emp) => sum + emp.sessions, 0);
    const avgHoursPerEmployee = summary.length > 0 ? totalHours / summary.length : 0;
    
    return {
      totalEmployees: summary.length,
      totalHours: totalHours.toFixed(1),
      totalSessions,
      avgHours: avgHoursPerEmployee.toFixed(1),
    };
  }, [summary]);

  const handleFilter = () => refetch();

  const formatDate = (date) => {
    if (!date) return '---';
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <MainLayout title="Báo cáo chấm công">
      <Stack spacing={3}>
        {/* Filter Section */}
        <Paper sx={{ p: 3, borderRadius: 3, border: `1px solid ${COLORS.border}` }}>
          <Typography variant="h6" fontWeight={700} color={COLORS.text} sx={{ mb: 2 }}>
            📅 Chọn kỳ lương
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <TextField
              label="Từ ngày"
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
            <TextField
              label="Đến ngày"
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
            <Button variant="contained" onClick={handleFilter} sx={{ px: 4 }}>
              Xem báo cáo
            </Button>
          </Stack>
        </Paper>

        {/* Stats Cards */}
        <Grid container spacing={2}>
          <Grid item xs={6} md={3}>
            <StatCard
              title="Nhân viên làm việc"
              value={stats.totalEmployees}
              subtitle="trong kỳ"
              icon={Person}
              color={COLORS.primary}
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <StatCard
              title="Tổng giờ làm"
              value={`${stats.totalHours}h`}
              subtitle="tất cả NV"
              icon={Timer}
              color={COLORS.success}
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <StatCard
              title="Số lần chấm công"
              value={stats.totalSessions}
              subtitle="check-in/out"
              icon={AccessTime}
              color={COLORS.warning}
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <StatCard
              title="TB giờ/nhân viên"
              value={`${stats.avgHours}h`}
              subtitle="trong kỳ"
              icon={TrendingUp}
              color={COLORS.danger}
            />
          </Grid>
        </Grid>

        {/* Summary by Employee */}
        <Paper sx={{ p: 3, borderRadius: 3, border: `1px solid ${COLORS.border}` }}>
          <Typography variant="h6" fontWeight={700} color={COLORS.text} sx={{ mb: 2 }}>
            👤 Tổng hợp theo nhân viên
          </Typography>
          
          {isLoading ? (
            <Typography color={COLORS.textSecondary}>Đang tải...</Typography>
          ) : summary.length === 0 ? (
            <Typography color={COLORS.textSecondary} sx={{ py: 4, textAlign: 'center' }}>
              Không có dữ liệu chấm công trong kỳ này
            </Typography>
          ) : (
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: COLORS.bg }}>
                  <TableCell sx={{ fontWeight: 600 }}>Nhân viên</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Số buổi làm</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Tổng giờ làm</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>TB giờ/buổi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {summary.map((emp) => (
                  <TableRow key={emp.id} hover>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar sx={{ bgcolor: alpha(COLORS.primary, 0.1), color: COLORS.primary }}>
                          {emp.hoTen?.charAt(0)?.toUpperCase()}
                        </Avatar>
                        <Typography fontWeight={600}>{emp.hoTen}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={emp.sessions} 
                        size="small"
                        sx={{ bgcolor: alpha(COLORS.primary, 0.1), color: COLORS.primary }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Typography fontWeight={700} color={COLORS.success}>
                        {emp.totalHours.toFixed(1)}h
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography color={COLORS.textSecondary}>
                        {emp.sessions > 0 ? (emp.totalHours / emp.sessions).toFixed(1) : 0}h
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Paper>

        {/* Detailed Records */}
        <Paper sx={{ p: 3, borderRadius: 3, border: `1px solid ${COLORS.border}` }}>
          <Typography variant="h6" fontWeight={700} color={COLORS.text} sx={{ mb: 2 }}>
            📋 Chi tiết chấm công
          </Typography>
          
          {records.length === 0 ? (
            <Typography color={COLORS.textSecondary} sx={{ py: 4, textAlign: 'center' }}>
              Không có dữ liệu
            </Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: COLORS.bg }}>
                  <TableCell sx={{ fontWeight: 600 }}>Nhân viên</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Ca làm</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Check-in</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Check-out</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Số giờ</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Trạng thái</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id} hover>
                    <TableCell>
                      <Typography fontWeight={500}>
                        {record.lichPhanCa?.nhanVien?.hoTen || '---'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography color={COLORS.textSecondary}>
                        {record.lichPhanCa?.caLamViec?.ten || '---'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color={COLORS.success}>
                        {formatDate(record.thoiGianVao)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color={record.thoiGianRa ? COLORS.danger : COLORS.textSecondary}>
                        {formatDate(record.thoiGianRa)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={record.hours ? `${record.hours.toFixed(1)}h` : '---'}
                        size="small"
                        sx={{
                          bgcolor: record.hours ? alpha(COLORS.success, 0.1) : alpha(COLORS.textSecondary, 0.1),
                          color: record.hours ? COLORS.success : COLORS.textSecondary,
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={record.trangThai === 'DAXONG' ? 'Hoàn thành' : 'Đang làm'}
                        size="small"
                        sx={{
                          bgcolor: record.trangThai === 'DAXONG' 
                            ? alpha(COLORS.success, 0.1) 
                            : alpha(COLORS.warning, 0.1),
                          color: record.trangThai === 'DAXONG' 
                            ? COLORS.success 
                            : COLORS.warning,
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Paper>
      </Stack>
    </MainLayout>
  );
};

export default AttendanceReport;
