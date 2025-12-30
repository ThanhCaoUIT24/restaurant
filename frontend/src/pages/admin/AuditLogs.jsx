import React, { useState } from 'react';
import MainLayout from '../../layouts/MainLayout';
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  TextField,
  Chip,
  Box,
  Pagination,
  InputAdornment,
} from '@mui/material';
import { History, Search, FilterList } from '@mui/icons-material';
import { useAuditLogs } from '../../hooks/useAdmin';

const actionColors = {
  CREATE: 'success',
  UPDATE: 'info',
  DELETE: 'error',
  LOGIN: 'primary',
  LOGOUT: 'default',
  VOID: 'warning',
};

const getActionColor = (action) => {
  const key = Object.keys(actionColors).find((k) => action?.toUpperCase().includes(k));
  return actionColors[key] || 'default';
};

const AuditLogs = () => {
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { data, isLoading } = useAuditLogs({
    page,
    limit: 50,
    action: actionFilter || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  const logs = data?.items || [];
  const pagination = data?.pagination || { totalPages: 1 };

  const parseDetails = (details) => {
    try {
      return typeof details === 'string' ? JSON.parse(details) : details;
    } catch {
      return details;
    }
  };

  return (
    <MainLayout title="Nhật ký Hệ thống">
      <Stack spacing={2}>
        <Paper sx={{ p: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <History />
            <Typography variant="h6">Lịch sử hoạt động</Typography>
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              placeholder="Lọc theo hành động..."
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FilterList />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Từ ngày"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Đến ngày"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        </Paper>

        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell width={180}>Thời gian</TableCell>
                <TableCell width={200}>Hành động</TableCell>
                <TableCell>Chi tiết</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} align="center">Đang tải...</TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center">Không có nhật ký nào</TableCell>
                </TableRow>
              ) : (
                logs.map((log) => {
                  const details = parseDetails(log.thongTinBoSung);
                  return (
                    <TableRow key={log.id} hover>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(log.createdAt).toLocaleString('vi-VN')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={log.hanhDong}
                          color={getActionColor(log.hanhDong)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {typeof details === 'object' ? (
                          <Box sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                            {Object.entries(details).map(([key, value]) => (
                              <Box key={key}>
                                <strong>{key}:</strong> {String(value)}
                              </Box>
                            ))}
                          </Box>
                        ) : (
                          <Typography variant="body2">{details}</Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {pagination.totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Pagination
              count={pagination.totalPages}
              page={page}
              onChange={(e, value) => setPage(value)}
              color="primary"
            />
          </Box>
        )}
      </Stack>
    </MainLayout>
  );
};

export default AuditLogs;
