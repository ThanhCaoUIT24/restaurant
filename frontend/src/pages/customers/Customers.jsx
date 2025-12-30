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
  Button,
  TextField,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Alert,
  Box,
  InputAdornment,
  MenuItem,
} from '@mui/material';
import { Add, Edit, Delete, Search, Star, History } from '@mui/icons-material';
import {
  useCustomers,
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
  useCustomerPoints,
} from '../../hooks/useCustomers';

const tierColors = {
  'Thường': 'default',
  'Bạc': 'info',
  'Vàng': 'warning',
  'VIP': 'error',
};

const Customers = () => {
  const [search, setSearch] = useState('');
  const [filterTier, setFilterTier] = useState('');
  const { data, isLoading, refetch } = useCustomers({ q: search, hangThe: filterTier || undefined });
  const customers = data?.items || [];

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [form, setForm] = useState({ hoTen: '', soDienThoai: '', hangThe: 'Thường' });
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const [pointsDialogOpen, setPointsDialogOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);

  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  const deleteCustomer = useDeleteCustomer();

  const handleOpenDialog = (customer = null) => {
    if (customer) {
      setEditingCustomer(customer);
      setForm({ hoTen: customer.hoTen, soDienThoai: customer.soDienThoai, hangThe: customer.hangThe });
    } else {
      setEditingCustomer(null);
      setForm({ hoTen: '', soDienThoai: '', hangThe: 'Thường' });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCustomer(null);
    setForm({ hoTen: '', soDienThoai: '', hangThe: 'Thường' });
  };

  const handleSubmit = async () => {
    try {
      if (editingCustomer) {
        await updateCustomer.mutateAsync({ id: editingCustomer.id, payload: form });
        setFeedback({ type: 'success', message: 'Cập nhật thành công!' });
      } else {
        await createCustomer.mutateAsync(form);
        setFeedback({ type: 'success', message: 'Thêm khách hàng thành công!' });
      }
      handleCloseDialog();
      refetch();
    } catch (err) {
      setFeedback({ type: 'error', message: err?.response?.data?.message || 'Có lỗi xảy ra' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa khách hàng này?')) return;
    try {
      await deleteCustomer.mutateAsync(id);
      setFeedback({ type: 'success', message: 'Xóa thành công!' });
      refetch();
    } catch (err) {
      setFeedback({ type: 'error', message: err?.response?.data?.message || 'Không thể xóa' });
    }
  };

  const handleOpenPoints = (customerId) => {
    setSelectedCustomerId(customerId);
    setPointsDialogOpen(true);
  };

  return (
    <MainLayout title="Quản lý Khách hàng">
      <Stack spacing={2}>
        {feedback.message && (
          <Alert severity={feedback.type} onClose={() => setFeedback({ type: '', message: '' })}>
            {feedback.message}
          </Alert>
        )}

        <Paper sx={{ p: 2 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
            <Stack direction="row" spacing={2} sx={{ flex: 1 }}>
              <TextField
                placeholder="Tìm theo tên hoặc SĐT..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: 250 }}
              />
              <TextField
                select
                label="Hạng thẻ"
                value={filterTier}
                onChange={(e) => setFilterTier(e.target.value)}
                size="small"
                sx={{ minWidth: 120 }}
              >
                <MenuItem value="">Tất cả</MenuItem>
                <MenuItem value="Thường">Thường</MenuItem>
                <MenuItem value="Bạc">Bạc</MenuItem>
                <MenuItem value="Vàng">Vàng</MenuItem>
                <MenuItem value="VIP">VIP</MenuItem>
              </TextField>
            </Stack>
            <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>
              Thêm khách hàng
            </Button>
          </Stack>
        </Paper>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Họ tên</TableCell>
                <TableCell>Số điện thoại</TableCell>
                <TableCell>Hạng thẻ</TableCell>
                <TableCell align="right">Điểm tích lũy</TableCell>
                <TableCell align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">Đang tải...</TableCell>
                </TableRow>
              ) : customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">Không có khách hàng nào</TableCell>
                </TableRow>
              ) : (
                customers.map((customer) => (
                  <TableRow key={customer.id} hover>
                    <TableCell>{customer.hoTen}</TableCell>
                    <TableCell>{customer.soDienThoai}</TableCell>
                    <TableCell>
                      <Chip
                        icon={customer.hangThe === 'VIP' ? <Star /> : undefined}
                        label={customer.hangThe}
                        color={tierColors[customer.hangThe] || 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight="bold" color="primary">
                        {customer.diemTichLuy?.toLocaleString() || 0}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton size="small" onClick={() => handleOpenPoints(customer.id)} title="Lịch sử điểm">
                        <History />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleOpenDialog(customer)} title="Sửa">
                        <Edit />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(customer.id)} title="Xóa">
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingCustomer ? 'Sửa khách hàng' : 'Thêm khách hàng mới'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Họ tên"
              value={form.hoTen}
              onChange={(e) => setForm({ ...form, hoTen: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Số điện thoại"
              value={form.soDienThoai}
              onChange={(e) => setForm({ ...form, soDienThoai: e.target.value })}
              fullWidth
              required
            />
            <TextField
              select
              label="Hạng thẻ"
              value={form.hangThe}
              onChange={(e) => setForm({ ...form, hangThe: e.target.value })}
              fullWidth
            >
              <MenuItem value="Thường">Thường</MenuItem>
              <MenuItem value="Bạc">Bạc</MenuItem>
              <MenuItem value="Vàng">Vàng</MenuItem>
              <MenuItem value="VIP">VIP</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!form.hoTen || !form.soDienThoai || createCustomer.isLoading || updateCustomer.isLoading}
          >
            {editingCustomer ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Points History Dialog */}
      <PointsHistoryDialog
        open={pointsDialogOpen}
        onClose={() => setPointsDialogOpen(false)}
        customerId={selectedCustomerId}
      />
    </MainLayout>
  );
};

// Points History Dialog Component
const PointsHistoryDialog = ({ open, onClose, customerId }) => {
  const { data, isLoading } = useCustomerPoints(customerId);

  if (!customerId) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Lịch sử điểm - {data?.hoTen || ''}
        <Chip label={`${data?.points || 0} điểm`} color="primary" sx={{ ml: 2 }} />
      </DialogTitle>
      <DialogContent>
        {isLoading ? (
          <Typography>Đang tải...</Typography>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Thời gian</TableCell>
                <TableCell>Mô tả</TableCell>
                <TableCell align="right">Điểm cộng</TableCell>
                <TableCell align="right">Điểm trừ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data?.history?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">Chưa có lịch sử</TableCell>
                </TableRow>
              ) : (
                data?.history?.map((h) => (
                  <TableRow key={h.id}>
                    <TableCell>{new Date(h.createdAt).toLocaleString('vi-VN')}</TableCell>
                    <TableCell>{h.moTa}</TableCell>
                    <TableCell align="right" sx={{ color: 'success.main' }}>
                      {h.diemCong > 0 ? `+${h.diemCong}` : ''}
                    </TableCell>
                    <TableCell align="right" sx={{ color: 'error.main' }}>
                      {h.diemTru > 0 ? `-${h.diemTru}` : ''}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
};

export default Customers;
