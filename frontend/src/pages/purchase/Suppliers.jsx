import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import {
  Paper,
  Typography,
  Stack,
  Button,
  TextField,
  Divider,
  Alert,
  Chip,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  InputAdornment,
  Tooltip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Grid,
  Snackbar,
  Avatar,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Add,
  Edit,
  Delete,
  Warning,
  Phone,
  Email,
  LocationOn,
  Business,
  Person,
  LocalShipping,
  TrendingUp,
  Refresh,
  Star,
  StarBorder,
} from '@mui/icons-material';
import {
  useSuppliers,
  useCreateSupplier,
  useUpdateSupplier,
  useDeleteSupplier,
} from '../../hooks/usePurchase';
import { usePOs, useUpdatePOStatus } from '../../hooks/usePurchase';

import { usePermissions } from '../../hooks/usePermissions';
import { useNotifications } from '../../hooks/useNotifications';

const shortId = (id) => (id ? String(id).slice(0, 8) : '');

const PO_STATUS_LABEL = {
  MOITAO: 'Mới tạo',
  DAGUI: 'Chờ duyệt',
  DADUYET: 'Đã duyệt',
  DAHUY: 'Đã hủy',
  DANHANMOTPHAN: 'Đã nhận một phần',
  DANHANDU: 'Đã nhận đủ',
};

const formatMoney = (v) => {
  const n = Number(v || 0);
  return n.toLocaleString('vi-VN');
};

const formatDateTime = (d) => {
  if (!d) return '';
  try {
    return new Date(d).toLocaleString('vi-VN');
  } catch {
    return '';
  }
};

const calcPOTotal = (po) => {
  const lines = po?.chiTiet || [];
  return lines.reduce((sum, l) => sum + Number(l.soLuong || 0) * Number(l.donGia || 0), 0);
};

// ==================== PREMIUM COLORS ====================
const COLORS = {
  primary: '#6366F1',
  primaryLight: '#818CF8',
  primaryDark: '#4F46E5',
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  info: '#3B82F6',
  infoLight: '#DBEAFE',
  background: '#F8FAFC',
  cardBg: '#FFFFFF',
  surfaceHover: '#F1F5F9',
  textPrimary: '#1E293B',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  border: '#E2E8F0',
};

// ==================== STATS CARD ====================
const StatsCard = ({ icon, label, value, color, subValue }) => (
  <motion.div whileHover={{ scale: 1.02, y: -2 }} transition={{ duration: 0.2 }}>
    <Paper
      sx={{
        p: 2.5,
        borderRadius: 3,
        background: `linear-gradient(135deg, ${color}08, ${color}03)`,
        border: `1px solid ${color}20`,
        height: '100%',
      }}
    >
      <Stack direction="row" alignItems="center" spacing={2}>
        <Box
          sx={{
            width: 50,
            height: 50,
            borderRadius: 2.5,
            background: `linear-gradient(135deg, ${color}, ${color}CC)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 4px 14px ${color}40`,
          }}
        >
          {icon}
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" color={COLORS.textSecondary} fontWeight={500}>
            {label}
          </Typography>
          <Typography variant="h5" fontWeight={700} color={COLORS.textPrimary}>
            {value}
          </Typography>
          {subValue && (
            <Typography variant="caption" color={color}>
              {subValue}
            </Typography>
          )}
        </Box>
      </Stack>
    </Paper>
  </motion.div>
);

// ==================== SUPPLIER ROW ====================
const SupplierRow = ({ supplier, onEdit, onDelete }) => {
  const getInitials = (name) => {
    return name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'NCC';
  };

  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      whileHover={{ backgroundColor: `${COLORS.primary}05` }}
    >
      <TableCell>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar
            sx={{
              width: 44,
              height: 44,
              background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryLight})`,
              fontWeight: 700,
              fontSize: '0.9rem',
            }}
          >
            {getInitials(supplier.ten)}
          </Avatar>
          <Box>
            <Typography fontWeight={600} color={COLORS.textPrimary}>
              {supplier.ten}
            </Typography>
            <Typography variant="caption" color={COLORS.textSecondary}>
              {supplier.maNCC || `NCC-${supplier.id?.slice(0, 6)}`}
            </Typography>
          </Box>
        </Stack>
      </TableCell>
      <TableCell>
        <Stack spacing={0.5}>
          {supplier.nguoiLienHe && (
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Person sx={{ fontSize: 14, color: COLORS.textMuted }} />
              <Typography variant="body2">{supplier.nguoiLienHe}</Typography>
            </Stack>
          )}
          {supplier.soDienThoai && (
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Phone sx={{ fontSize: 14, color: COLORS.textMuted }} />
              <Typography variant="body2">{supplier.soDienThoai}</Typography>
            </Stack>
          )}
        </Stack>
      </TableCell>
      <TableCell>
        {supplier.email && (
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Email sx={{ fontSize: 14, color: COLORS.textMuted }} />
            <Typography variant="body2" color={COLORS.info}>
              {supplier.email}
            </Typography>
          </Stack>
        )}
      </TableCell>
      <TableCell>
        {supplier.diaChi && (
          <Stack direction="row" alignItems="flex-start" spacing={0.5}>
            <LocationOn sx={{ fontSize: 14, color: COLORS.textMuted, mt: 0.3 }} />
            <Typography variant="body2" sx={{ maxWidth: 200 }}>
              {supplier.diaChi}
            </Typography>
          </Stack>
        )}
      </TableCell>
      <TableCell>
        <Chip
          size="small"
          label={supplier.trangThai === 'active' || !supplier.trangThai ? 'Hoạt động' : 'Ngừng'}
          sx={{
            background: supplier.trangThai === 'active' || !supplier.trangThai
              ? COLORS.successLight
              : COLORS.errorLight,
            color: supplier.trangThai === 'active' || !supplier.trangThai
              ? COLORS.success
              : COLORS.error,
            fontWeight: 600,
          }}
        />
      </TableCell>
      <TableCell align="right">
        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
          <Tooltip title="Chỉnh sửa">
            <IconButton
              size="small"
              onClick={() => onEdit(supplier)}
              sx={{
                background: `${COLORS.info}10`,
                '&:hover': { background: `${COLORS.info}20` },
              }}
            >
              <Edit sx={{ fontSize: 18, color: COLORS.info }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Xóa">
            <IconButton
              size="small"
              onClick={() => onDelete(supplier)}
              sx={{
                background: `${COLORS.error}10`,
                '&:hover': { background: `${COLORS.error}20` },
              }}
            >
              <Delete sx={{ fontSize: 18, color: COLORS.error }} />
            </IconButton>
          </Tooltip>
        </Stack>
      </TableCell>
    </motion.tr>
  );
};

// ==================== MAIN COMPONENT ====================
const Suppliers = () => {
  const { data: suppliers = [], isLoading, refetch } = useSuppliers();
  const createSupplier = useCreateSupplier();
  const updateSupplier = useUpdateSupplier();
  const deleteSupplier = useDeleteSupplier();
  const { data: pos = [], refetch: refetchPOs } = usePOs();
  const updatePOStatus = useUpdatePOStatus();
  const { hasPermission } = usePermissions();

  const canApprove = hasPermission('PO_APPROVE'); // Manager
  const canReceive = hasPermission('PO_CREATE'); // Stock Keeper (ThuKho)

  // Real-time updates via notifications
  const { data: notificationData } = useNotifications();
  const lastNotification = notificationData?.notifications?.[0];

  React.useEffect(() => {
    if (lastNotification?.loai === 'PO') {
      refetchPOs();
    }
  }, [lastNotification, refetchPOs]);

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [selectedPO, setSelectedPO] = useState(null);
  const [formData, setFormData] = useState({
    ten: '',
    maNCC: '',
    nguoiLienHe: '',
    soDienThoai: '',
    email: '',
    diaChi: '',
    ghiChu: '',
  });

  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Filter suppliers
  const filteredSuppliers = useMemo(() => {
    if (!searchQuery) return suppliers;
    const query = searchQuery.toLowerCase();
    return suppliers.filter(s =>
      s.ten?.toLowerCase().includes(query) ||
      s.maNCC?.toLowerCase().includes(query) ||
      s.nguoiLienHe?.toLowerCase().includes(query) ||
      s.soDienThoai?.includes(query)
    );
  }, [suppliers, searchQuery]);

  // Stats
  const stats = useMemo(() => {
    const total = suppliers.length;
    const active = suppliers.filter(s => s.trangThai === 'active' || !s.trangThai).length;
    return { total, active };
  }, [suppliers]);

  const monthlyPOs = useMemo(() => {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    const allowed = new Set(['DAGUI', 'DADUYET', 'DANHANDU', 'DANHANMOTPHAN']);

    return (pos || []).filter((po) => {
      if (!allowed.has(po.trangThai)) return false;
      const d = new Date(po.createdAt);
      return d.getMonth() === month && d.getFullYear() === year;
    });
  }, [pos]);

  const monthlyPOTotal = useMemo(() => monthlyPOs.reduce((sum, po) => sum + calcPOTotal(po), 0), [monthlyPOs]);

  // Handlers
  const handleOpenDialog = (supplier = null) => {
    if (supplier) {
      setEditingSupplier(supplier);
      setFormData({
        ten: supplier.ten || '',
        maNCC: supplier.maNCC || '',
        nguoiLienHe: supplier.nguoiLienHe || '',
        soDienThoai: supplier.soDienThoai || '',
        email: supplier.email || '',
        diaChi: supplier.diaChi || '',
        ghiChu: supplier.ghiChu || '',
      });
    } else {
      setEditingSupplier(null);
      setFormData({
        ten: '',
        maNCC: '',
        nguoiLienHe: '',
        soDienThoai: '',
        email: '',
        diaChi: '',
        ghiChu: '',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingSupplier(null);
  };

  const handleSave = async () => {
    try {
      if (editingSupplier) {
        await updateSupplier.mutateAsync({ id: editingSupplier.id, ...formData });
        setSnackbar({ open: true, message: '✅ Cập nhật nhà cung cấp thành công!', severity: 'success' });
      } else {
        await createSupplier.mutateAsync(formData);
        setSnackbar({ open: true, message: '✅ Thêm nhà cung cấp thành công!', severity: 'success' });
      }
      handleCloseDialog();
      refetch();
    } catch (err) {
      setSnackbar({
        open: true,
        message: `❌ ${err?.response?.data?.message || 'Có lỗi xảy ra'}`,
        severity: 'error',
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteSupplier.mutateAsync(deleteConfirm.id);
      setSnackbar({ open: true, message: '✅ Xóa nhà cung cấp thành công!', severity: 'success' });
      setDeleteConfirm(null);
      refetch();
    } catch (err) {
      setSnackbar({
        open: true,
        message: `❌ ${err?.response?.data?.message || 'Không thể xóa'}`,
        severity: 'error',
      });
    }
  };

  const handleStatusUpdate = async (po, newStatus) => {
    try {
      await updatePOStatus.mutateAsync({ id: po.id, status: newStatus });
      setSnackbar({ open: true, message: '✅ Cập nhật trạng thái thành công!', severity: 'success' });
      refetchPOs();
      if (selectedPO?.id === po.id) {
        setSelectedPO((prev) => ({ ...prev, trangThai: newStatus }));
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: `❌ ${err?.response?.data?.message || 'Không thể cập nhật trạng thái'}`,
        severity: 'error',
      });
    }
  };

  return (
    <MainLayout title="Quản lý Nhà cung cấp">
      <Box sx={{ background: COLORS.background, minHeight: '100vh', mx: -3, mt: -2, px: 3, py: 2 }}>
        {/* ==================== HEADER STATS ==================== */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={4}>
            <StatsCard
              icon={<Business sx={{ color: '#fff', fontSize: 24 }} />}
              label="Tổng nhà cung cấp"
              value={stats.total}
              color={COLORS.primary}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatsCard
              icon={<LocalShipping sx={{ color: '#fff', fontSize: 24 }} />}
              label="Đang hoạt động"
              value={stats.active}
              color={COLORS.success}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatsCard
              icon={<TrendingUp sx={{ color: '#fff', fontSize: 24 }} />}
              label="Đơn hàng tháng này"
              value={monthlyPOs.length}
              color={COLORS.info}
              subValue={`Tổng: ${formatMoney(monthlyPOTotal)} đ`}
            />
          </Grid>
        </Grid>

        {/* ==================== MONTHLY PO LIST ==================== */}
        <Paper
          sx={{
            borderRadius: 4,
            overflow: 'hidden',
            border: `1px solid ${COLORS.border}`,
            mb: 3,
          }}
        >
          <Box
            sx={{
              p: 2,
              background: `linear-gradient(135deg, ${COLORS.info}08, ${COLORS.infoLight}40)`,
              borderBottom: `1px solid ${COLORS.border}`,
            }}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography fontWeight={700} color={COLORS.textPrimary}>
                Đơn hàng tháng này
              </Typography>
              <Button
                size="small"
                variant="outlined"
                onClick={() => refetchPOs()}
                sx={{ borderRadius: 2, textTransform: 'none' }}
              >
                Làm mới
              </Button>
            </Stack>
          </Box>
          <TableContainer sx={{ maxHeight: 420 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, background: COLORS.surfaceHover }}>Mã Đơn hàng</TableCell>
                  <TableCell sx={{ fontWeight: 700, background: COLORS.surfaceHover }}>Nhà cung cấp</TableCell>
                  <TableCell sx={{ fontWeight: 700, background: COLORS.surfaceHover }}>Ngày</TableCell>
                  <TableCell sx={{ fontWeight: 700, background: COLORS.surfaceHover }}>Trạng thái</TableCell>
                  <TableCell sx={{ fontWeight: 700, background: COLORS.surfaceHover }} align="right">
                    Thao tác
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {monthlyPOs.map((po) => {
                  const isReceived = po.trangThai === 'DANHANDU' || po.trangThai === 'DANHANMOTPHAN';
                  return (
                    <TableRow
                      key={po.id}
                      hover
                      sx={{ cursor: 'pointer' }}
                      onClick={() => setSelectedPO(po)}
                    >
                      <TableCell>{`#${shortId(po.id)}`}</TableCell>
                      <TableCell>{po.nhaCungCap?.ten || ''}</TableCell>
                      <TableCell>{formatDateTime(po.createdAt)}</TableCell>
                      <TableCell>{PO_STATUS_LABEL[po.trangThai] || po.trangThai}</TableCell>
                      <TableCell align="right">
                        {/* Status: DAGUI (Sent/Pending Approval) */}
                        {po.trangThai === 'DAGUI' && (
                          canApprove ? (
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusUpdate(po, 'DADUYET');
                              }}
                              sx={{ borderRadius: 2, textTransform: 'none' }}
                            >
                              Duyệt
                            </Button>
                          ) : (
                            <Chip label="Chờ duyệt" size="small" color="warning" variant="outlined" />
                          )
                        )}

                        {/* Status: DADUYET (Approved) -> Allow Receive for Stock Keeper */}
                        {po.trangThai === 'DADUYET' && (
                          canReceive ? (
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.location.href = `/purchase/receipts?poId=${po.id}`;
                              }}
                              sx={{ borderRadius: 2, textTransform: 'none' }}
                            >
                              Nhận hàng
                            </Button>
                          ) : (
                            <Chip label="Đã duyệt" size="small" color="success" variant="outlined" />
                          )
                        )}

                        {/* Status: Received */}
                        {(po.trangThai === 'DANHANDU' || po.trangThai === 'DANHANMOTPHAN') && (
                          <Chip label="Đã nhận" size="small" color="success" />
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {monthlyPOs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Typography color={COLORS.textSecondary} sx={{ py: 2 }}>
                        Chưa có đơn hàng nào đã gửi trong tháng này.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* ==================== MAIN CONTENT ==================== */}
        <Paper
          sx={{
            borderRadius: 4,
            overflow: 'hidden',
            border: `1px solid ${COLORS.border}`,
          }}
        >
          {/* Toolbar */}
          <Box
            sx={{
              p: 2,
              background: `linear-gradient(135deg, ${COLORS.primary}08, ${COLORS.primaryLight}05)`,
              borderBottom: `1px solid ${COLORS.border}`,
            }}
          >
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={2}
              alignItems={{ md: 'center' }}
              justifyContent="space-between"
            >
              {/* Search */}
              <TextField
                size="small"
                placeholder="Tìm kiếm nhà cung cấp..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ color: COLORS.textMuted, mr: 1 }} />,
                }}
                sx={{
                  minWidth: 300,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    background: COLORS.cardBg,
                  },
                }}
              />

              {/* Actions */}
              <Stack direction="row" spacing={1}>
                <Tooltip title="Làm mới">
                  <IconButton onClick={() => refetch()} sx={{ background: `${COLORS.primary}10` }}>
                    <Refresh sx={{ color: COLORS.primary }} />
                  </IconButton>
                </Tooltip>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => handleOpenDialog()}
                  sx={{
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryLight})`,
                    textTransform: 'none',
                    fontWeight: 600,
                    boxShadow: `0 4px 14px ${COLORS.primary}40`,
                  }}
                >
                  Thêm nhà cung cấp
                </Button>
              </Stack>
            </Stack>
          </Box>

          {/* Table */}
          {isLoading && <LinearProgress />}
          <TableContainer sx={{ maxHeight: 'calc(100vh - 380px)' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, background: COLORS.surfaceHover }}>
                    Nhà cung cấp
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, background: COLORS.surfaceHover }}>
                    Liên hệ
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, background: COLORS.surfaceHover }}>
                    Email
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, background: COLORS.surfaceHover }}>
                    Địa chỉ
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, background: COLORS.surfaceHover }}>
                    Trạng thái
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, background: COLORS.surfaceHover }}>
                    Thao tác
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <AnimatePresence>
                  {filteredSuppliers.map((supplier) => (
                    <SupplierRow
                      key={supplier.id}
                      supplier={supplier}
                      onEdit={handleOpenDialog}
                      onDelete={setDeleteConfirm}
                    />
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          </TableContainer>

          {!isLoading && filteredSuppliers.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Business sx={{ fontSize: 80, color: COLORS.textMuted, opacity: 0.3, mb: 2 }} />
              <Typography variant="h6" color={COLORS.textSecondary}>
                {searchQuery ? 'Không tìm thấy nhà cung cấp' : 'Chưa có nhà cung cấp nào'}
              </Typography>
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={() => handleOpenDialog()}
                sx={{ mt: 2, borderRadius: 2 }}
              >
                Thêm nhà cung cấp đầu tiên
              </Button>
            </Box>
          )}
        </Paper>

        {/* ==================== ADD/EDIT DIALOG ==================== */}
        <Dialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: 4 } }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              {editingSupplier ? (
                <Edit sx={{ color: COLORS.info }} />
              ) : (
                <Add sx={{ color: COLORS.success }} />
              )}
              <Typography variant="h6" fontWeight={700}>
                {editingSupplier ? 'Chỉnh sửa nhà cung cấp' : 'Thêm nhà cung cấp mới'}
              </Typography>
            </Stack>
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Tên nhà cung cấp"
                  value={formData.ten}
                  onChange={(e) => setFormData({ ...formData, ten: e.target.value })}
                  fullWidth
                  required
                />
                <TextField
                  label="Mã NCC"
                  value={formData.maNCC}
                  onChange={(e) => setFormData({ ...formData, maNCC: e.target.value })}
                  sx={{ width: 150 }}
                />
              </Stack>
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Người liên hệ"
                  value={formData.nguoiLienHe}
                  onChange={(e) => setFormData({ ...formData, nguoiLienHe: e.target.value })}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person sx={{ color: COLORS.textMuted }} />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  label="Số điện thoại"
                  value={formData.soDienThoai}
                  onChange={(e) => setFormData({ ...formData, soDienThoai: e.target.value })}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone sx={{ color: COLORS.textMuted }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Stack>
              <TextField
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: COLORS.textMuted }} />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="Địa chỉ"
                value={formData.diaChi}
                onChange={(e) => setFormData({ ...formData, diaChi: e.target.value })}
                fullWidth
                multiline
                rows={2}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOn sx={{ color: COLORS.textMuted }} />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="Ghi chú"
                value={formData.ghiChu}
                onChange={(e) => setFormData({ ...formData, ghiChu: e.target.value })}
                fullWidth
                multiline
                rows={2}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={handleCloseDialog} sx={{ borderRadius: 2 }}>
              Hủy
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={!formData.ten || createSupplier.isLoading || updateSupplier.isLoading}
              sx={{
                borderRadius: 2,
                background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryLight})`,
              }}
            >
              {editingSupplier ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* ==================== PO DETAIL DIALOG ==================== */}
        <Dialog
          open={!!selectedPO}
          onClose={() => setSelectedPO(null)}
          maxWidth="md"
          fullWidth
          PaperProps={{ sx: { borderRadius: 4 } }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            {selectedPO
              ? `Chi tiết đơn #${shortId(selectedPO.id)} - ${selectedPO.nhaCungCap?.ten || ''}`
              : 'Chi tiết đơn hàng'}
          </DialogTitle>
          <DialogContent dividers>
            {selectedPO && (
              <Stack spacing={2}>
                <Typography variant="body2" color={COLORS.textSecondary}>
                  Ngày tạo: {formatDateTime(selectedPO.createdAt)} | Trạng thái: {PO_STATUS_LABEL[selectedPO.trangThai] || selectedPO.trangThai}
                </Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Nguyên liệu</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Số lượng</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Đơn giá</TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align="right">Thành tiền</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(selectedPO.chiTiet || []).map((l) => (
                      <TableRow key={l.id}>
                        <TableCell>{l.nguyenVatLieu?.ten || l.nguyenVatLieuId}</TableCell>
                        <TableCell>{Number(l.soLuong || 0)}</TableCell>
                        <TableCell>{formatMoney(l.donGia)} đ</TableCell>
                        <TableCell align="right">
                          {formatMoney(Number(l.soLuong || 0) * Number(l.donGia || 0))} đ
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!selectedPO.chiTiet || selectedPO.chiTiet.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={4}>
                          <Typography color={COLORS.textSecondary}>Đơn hàng chưa có dòng nguyên liệu.</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                <Typography fontWeight={700} color={COLORS.textPrimary}>
                  Tổng tiền: {formatMoney(calcPOTotal(selectedPO))} đ
                </Typography>
              </Stack>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            {/* Approve Button (Manager) */}
            {selectedPO && canApprove && selectedPO.trangThai === 'DAGUI' && (
              <Button
                variant="contained"
                color="success"
                onClick={() => handleStatusUpdate(selectedPO, 'DADUYET')}
                sx={{ borderRadius: 2 }}
              >
                Duyệt đơn
              </Button>
            )}

            {/* Receive Button (Stock Keeper) */}
            {selectedPO && canReceive && selectedPO.trangThai === 'DADUYET' && (
              <Button
                variant="outlined"
                onClick={() => handleStatusUpdate(selectedPO, 'DANHANDU')}
                sx={{ borderRadius: 2 }}
              >
                Nhận hàng
              </Button>
            )}
            <Button onClick={() => setSelectedPO(null)} sx={{ borderRadius: 2 }}>
              Đóng
            </Button>
          </DialogActions>
        </Dialog>

        {/* ==================== DELETE CONFIRM DIALOG ==================== */}
        <Dialog
          open={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          PaperProps={{ sx: { borderRadius: 4 } }}
        >
          <DialogTitle>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Warning sx={{ color: COLORS.error }} />
              <Typography fontWeight={700}>Xác nhận xóa</Typography>
            </Stack>
          </DialogTitle>
          <DialogContent>
            <Typography>
              Bạn có chắc muốn xóa nhà cung cấp <strong>{deleteConfirm?.ten}</strong>?
            </Typography>
            <Alert severity="warning" sx={{ mt: 2, borderRadius: 2 }}>
              Hành động này không thể hoàn tác!
            </Alert>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setDeleteConfirm(null)} sx={{ borderRadius: 2 }}>
              Hủy
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleDelete}
              disabled={deleteSupplier.isLoading}
              sx={{ borderRadius: 2 }}
            >
              Xóa
            </Button>
          </DialogActions>
        </Dialog>

        {/* ==================== SNACKBAR ==================== */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            severity={snackbar.severity}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            sx={{
              borderRadius: 3,
              fontWeight: 600,
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </MainLayout >
  );
};

export default Suppliers;
