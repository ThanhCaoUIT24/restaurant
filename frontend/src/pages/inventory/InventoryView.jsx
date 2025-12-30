import React, { useState, useMemo } from 'react';
import MainLayout from '../../layouts/MainLayout';
import {
  Paper,
  Typography,
  Stack,
  Button,
  TextField,
  MenuItem,
  Divider,
  Alert,
  Chip,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tabs,
  Tab,
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
  Card,
  CardContent,
  Snackbar,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Inventory2,
  Search,
  Add,
  Edit,
  Delete,
  Warning,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  LocalShipping,
  Category,
  FilterList,
  Refresh,
  Download,
  KeyboardArrowUp,
  KeyboardArrowDown,
  ExpandMore,
  ExpandLess,
  Warehouse,
  ShoppingCart,
  ErrorOutline,
  Info,
} from '@mui/icons-material';
import {
  useMaterials,
  useInventoryAlerts,
  useCreateMaterial,
  useUpdateMaterial,
  useDeleteMaterial,
} from '../../hooks/useInventory';
import { useSuppliers } from '../../hooks/usePurchase';

// ==================== PREMIUM INVENTORY COLORS ====================
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

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
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

// ==================== MATERIAL ROW ====================
const MaterialRow = ({ material, onEdit, onDelete, alerts }) => {
  const hasAlert = alerts.some(a => a.nguyenVatLieuId === material.id);
  const isLow = Number(material.soLuongTon) <= Number(material.mucToiThieu);

  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        background: isLow ? `${COLORS.errorLight}50` : 'transparent',
      }}
    >
      <TableCell>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${COLORS.primary}15, ${COLORS.primaryLight}10)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Inventory2 sx={{ color: COLORS.primary, fontSize: 20 }} />
          </Box>
          <Box>
            <Typography fontWeight={600} color={COLORS.textPrimary}>
              {material.ten}
            </Typography>
            <Typography variant="caption" color={COLORS.textSecondary}>
              {material.maSKU || 'N/A'}
            </Typography>
          </Box>
        </Stack>
      </TableCell>
      <TableCell>
        <Chip
          size="small"
          label={material.danhMuc?.ten || 'Chung'}
          sx={{
            background: `${COLORS.info}15`,
            color: COLORS.info,
            fontWeight: 600,
          }}
        />
      </TableCell>
      <TableCell>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography fontWeight={600} color={isLow ? COLORS.error : COLORS.textPrimary}>
            {Number(material.soLuongTon || 0).toLocaleString('vi-VN')}
          </Typography>
          <Typography variant="caption" color={COLORS.textSecondary}>
            {material.donViTinh}
          </Typography>
          {isLow && (
            <Tooltip title="Dưới mức tồn kho tối thiểu">
              <Warning sx={{ color: COLORS.error, fontSize: 18 }} />
            </Tooltip>
          )}
        </Stack>
      </TableCell>

      <TableCell>
        <Chip
          size="small"
          label={isLow ? 'Thấp' : 'Đủ'}
          sx={{
            background: isLow ? COLORS.errorLight : COLORS.successLight,
            color: isLow ? COLORS.error : COLORS.success,
            fontWeight: 700,
          }}
        />
      </TableCell>
      <TableCell>
        <Typography color={COLORS.textSecondary}>
          {Number(material.mucToiThieu || 0).toLocaleString('vi-VN')} {material.donViTinh}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography fontWeight={600} color={COLORS.textPrimary}>
          {formatCurrency(material.giaNhap)}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography fontWeight={600} color={COLORS.primary}>
          {formatCurrency(Number(material.soLuongTon || 0) * Number(material.giaNhap || 0))}
        </Typography>
      </TableCell>
      <TableCell align="right">
        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
          <Tooltip title="Chỉnh sửa">
            <IconButton
              size="small"
              onClick={() => onEdit(material)}
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
              onClick={() => onDelete(material)}
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
const InventoryView = () => {
  const { data: materials = [], isLoading, refetch } = useMaterials();
  const { data: alerts = [] } = useInventoryAlerts();
  const { data: suppliers = [] } = useSuppliers();
  const createMaterial = useCreateMaterial();
  const updateMaterial = useUpdateMaterial();
  const deleteMaterial = useDeleteMaterial();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({
    ten: '',
    maSKU: '',
    donViTinh: '',
    soLuongTon: 0,
    mucToiThieu: 0,
    giaNhap: 0,
    nhaCungCapId: '',
  });

  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Get unique categories
  const categories = useMemo(() => {
    const cats = [...new Set(materials.map(m => m.danhMuc?.ten).filter(Boolean))];
    return cats;
  }, [materials]);

  // Filter and sort materials
  const filteredMaterials = useMemo(() => {
    let result = [...materials];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(m =>
        m.ten?.toLowerCase().includes(query) ||
        m.maSKU?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      result = result.filter(m => m.danhMuc?.ten === categoryFilter);
    }

    // Stock filter
    if (stockFilter === 'low') {
      result = result.filter(m => Number(m.soLuongTon) <= Number(m.mucToiThieu));
    } else if (stockFilter === 'ok') {
      result = result.filter(m => Number(m.soLuongTon) > Number(m.mucToiThieu));
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = (a.ten || '').localeCompare(b.ten || '');
          break;
        case 'stock':
          comparison = Number(a.soLuongTon) - Number(b.soLuongTon);
          break;
        case 'value':
          comparison = (Number(a.soLuongTon) * Number(a.giaNhap)) - (Number(b.soLuongTon) * Number(b.giaNhap));
          break;
        default:
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [materials, searchQuery, categoryFilter, stockFilter, sortBy, sortOrder]);

  // Stats
  const stats = useMemo(() => {
    const totalItems = materials.length;
    const totalValue = materials.reduce((sum, m) => sum + (Number(m.soLuongTon) * Number(m.giaNhap) || 0), 0);
    const lowStock = materials.filter(m => Number(m.soLuongTon) <= Number(m.mucToiThieu)).length;
    return { totalItems, totalValue, lowStock };
  }, [materials, alerts]);

  // Handlers
  const handleOpenDialog = (material = null) => {
    if (material) {
      setEditingMaterial(material);
      setFormData({
        ten: material.ten || '',
        maSKU: material.maSKU || '',
        donViTinh: material.donViTinh || '',
        soLuongTon: material.soLuongTon || 0,
        mucToiThieu: material.mucToiThieu || 0,
        giaNhap: material.giaNhap || 0,
        nhaCungCapId: material.nhaCungCapId || '',
      });
    } else {
      setEditingMaterial(null);
      setFormData({
        ten: '',
        maSKU: '',
        donViTinh: '',
        soLuongTon: 0,
        mucToiThieu: 0,
        giaNhap: 0,
        nhaCungCapId: '',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingMaterial(null);
  };

  const handleSave = async () => {
    try {
      if (editingMaterial) {
        await updateMaterial.mutateAsync({ id: editingMaterial.id, ...formData });
        setSnackbar({ open: true, message: '✅ Cập nhật thành công!', severity: 'success' });
      } else {
        await createMaterial.mutateAsync(formData);
        setSnackbar({ open: true, message: '✅ Thêm mới thành công!', severity: 'success' });
      }
      handleCloseDialog();
      refetch();
    } catch (err) {
      setSnackbar({
        open: true,
        message: `❌ ${err?.response?.data?.message || 'Có lỗi xảy ra'}`,
        severity: 'error'
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteMaterial.mutateAsync(deleteConfirm.id);
      setSnackbar({ open: true, message: '✅ Xóa thành công!', severity: 'success' });
      setDeleteConfirm(null);
      refetch();
    } catch (err) {
      setSnackbar({
        open: true,
        message: `❌ ${err?.response?.data?.message || 'Không thể xóa'}`,
        severity: 'error'
      });
    }
  };

  return (
    <MainLayout title="Quản lý Kho hàng">
      <Box sx={{ background: COLORS.background, minHeight: '100vh', mx: -3, mt: -2, px: 3, py: 2 }}>
        {/* ==================== HEADER STATS ==================== */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              icon={<Inventory2 sx={{ color: '#fff', fontSize: 24 }} />}
              label="Tổng nguyên liệu"
              value={stats.totalItems}
              color={COLORS.primary}
              subValue={`${filteredMaterials.length} hiển thị`}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              icon={<Warehouse sx={{ color: '#fff', fontSize: 24 }} />}
              label="Giá trị tồn kho"
              value={formatCurrency(stats.totalValue)}
              color={COLORS.success}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              icon={<Warning sx={{ color: '#fff', fontSize: 24 }} />}
              label="Sắp hết hàng"
              value={stats.lowStock}
              color={COLORS.warning}
              subValue="Dưới mức tối thiểu"
            />
          </Grid>
        </Grid>

        {/* ==================== MAIN CONTENT ==================== */}
        <Paper
          sx={{
            borderRadius: 4,
            overflow: 'hidden',
            border: `1px solid ${COLORS.border}`,
          }}
        >
          {/* Toolbar */}
          <Box sx={{ p: 2, background: `linear-gradient(135deg, ${COLORS.primary}08, ${COLORS.primaryLight}05)`, borderBottom: `1px solid ${COLORS.border}` }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }} justifyContent="space-between">
              {/* Search */}
              <TextField
                size="small"
                placeholder="Tìm kiếm nguyên liệu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ color: COLORS.textMuted, mr: 1 }} />,
                }}
                sx={{
                  minWidth: 280,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    background: COLORS.cardBg,
                  },
                }}
              />

              {/* Filters */}
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                <TextField
                  select
                  size="small"
                  label="Danh mục"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  sx={{ minWidth: 140 }}
                >
                  <MenuItem value="all">Tất cả</MenuItem>
                  {categories.map(cat => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </TextField>

                <ToggleButtonGroup
                  size="small"
                  value={stockFilter}
                  exclusive
                  onChange={(e, v) => v && setStockFilter(v)}
                >
                  <ToggleButton value="all">
                    <Tooltip title="Tất cả">Tất cả</Tooltip>
                  </ToggleButton>
                  <ToggleButton value="low" sx={{ color: COLORS.error }}>
                    <Tooltip title="Sắp hết">⚠️ Thấp</Tooltip>
                  </ToggleButton>
                  <ToggleButton value="ok" sx={{ color: COLORS.success }}>
                    <Tooltip title="Đủ hàng">✅ Đủ</Tooltip>
                  </ToggleButton>
                </ToggleButtonGroup>

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
                  Thêm mới
                </Button>
              </Stack>
            </Stack>
          </Box>

          {/* Table */}
          {isLoading && <LinearProgress />}
          <TableContainer sx={{ maxHeight: 'calc(100vh - 400px)' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, background: COLORS.surfaceHover }}>
                    Nguyên liệu
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, background: COLORS.surfaceHover }}>
                    Danh mục
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, background: COLORS.surfaceHover }}>
                    <Stack direction="row" alignItems="center" spacing={0.5} sx={{ cursor: 'pointer' }} onClick={() => { setSortBy('stock'); setSortOrder(o => o === 'asc' ? 'desc' : 'asc'); }}>
                      <span>Tồn kho</span>
                      {sortBy === 'stock' && (sortOrder === 'asc' ? <KeyboardArrowUp sx={{ fontSize: 18 }} /> : <KeyboardArrowDown sx={{ fontSize: 18 }} />)}
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, background: COLORS.surfaceHover }}>
                    Phân loại
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, background: COLORS.surfaceHover }}>
                    Mức tối thiểu
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, background: COLORS.surfaceHover }}>
                    Đơn giá
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, background: COLORS.surfaceHover }}>
                    <Stack direction="row" alignItems="center" spacing={0.5} sx={{ cursor: 'pointer' }} onClick={() => { setSortBy('value'); setSortOrder(o => o === 'asc' ? 'desc' : 'asc'); }}>
                      <span>Giá trị</span>
                      {sortBy === 'value' && (sortOrder === 'asc' ? <KeyboardArrowUp sx={{ fontSize: 18 }} /> : <KeyboardArrowDown sx={{ fontSize: 18 }} />)}
                    </Stack>
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, background: COLORS.surfaceHover }}>
                    Thao tác
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <AnimatePresence>
                  {filteredMaterials.map((material) => (
                    <MaterialRow
                      key={material.id}
                      material={material}
                      alerts={alerts}
                      onEdit={handleOpenDialog}
                      onDelete={setDeleteConfirm}
                    />
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          </TableContainer>

          {!isLoading && filteredMaterials.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Inventory2 sx={{ fontSize: 80, color: COLORS.textMuted, opacity: 0.3, mb: 2 }} />
              <Typography variant="h6" color={COLORS.textSecondary}>
                {searchQuery ? 'Không tìm thấy nguyên liệu' : 'Chưa có nguyên liệu nào'}
              </Typography>
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={() => handleOpenDialog()}
                sx={{ mt: 2, borderRadius: 2 }}
              >
                Thêm nguyên liệu đầu tiên
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
              {editingMaterial ? <Edit sx={{ color: COLORS.info }} /> : <Add sx={{ color: COLORS.success }} />}
              <Typography variant="h6" fontWeight={700}>
                {editingMaterial ? 'Chỉnh sửa nguyên liệu' : 'Thêm nguyên liệu mới'}
              </Typography>
            </Stack>
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              <TextField
                label="Tên nguyên liệu"
                value={formData.ten}
                onChange={(e) => setFormData({ ...formData, ten: e.target.value })}
                fullWidth
                required
              />
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Mã SKU"
                  value={formData.maSKU}
                  onChange={(e) => setFormData({ ...formData, maSKU: e.target.value })}
                  fullWidth
                />
                <TextField
                  label="Đơn vị tính"
                  value={formData.donViTinh}
                  onChange={(e) => setFormData({ ...formData, donViTinh: e.target.value })}
                  fullWidth
                  required
                  placeholder="kg, lít, hộp..."
                />
              </Stack>
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Số lượng tồn"
                  type="number"
                  value={formData.soLuongTon}
                  onChange={(e) => setFormData({ ...formData, soLuongTon: Number(e.target.value) })}
                  fullWidth
                />
                <TextField
                  label="Mức tồn tối thiểu"
                  type="number"
                  value={formData.mucToiThieu}
                  onChange={(e) => setFormData({ ...formData, mucToiThieu: Number(e.target.value) })}
                  fullWidth
                />
              </Stack>
              <TextField
                label="Giá nhập"
                type="number"
                value={formData.giaNhap}
                onChange={(e) => setFormData({ ...formData, giaNhap: Number(e.target.value) })}
                fullWidth
                InputProps={{
                  endAdornment: <InputAdornment position="end">VNĐ</InputAdornment>,
                }}
              />
              <TextField
                select
                label="Nhà cung cấp mặc định"
                value={formData.nhaCungCapId}
                onChange={(e) => setFormData({ ...formData, nhaCungCapId: e.target.value })}
                fullWidth
              >
                <MenuItem value="">
                  <em>Không chọn</em>
                </MenuItem>
                {suppliers.map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.ten}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={handleCloseDialog} sx={{ borderRadius: 2 }}>
              Hủy
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={!formData.ten || !formData.donViTinh || createMaterial.isLoading || updateMaterial.isLoading}
              sx={{
                borderRadius: 2,
                background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryLight})`,
              }}
            >
              {editingMaterial ? 'Cập nhật' : 'Thêm mới'}
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
              Bạn có chắc muốn xóa nguyên liệu <strong>{deleteConfirm?.ten}</strong>?
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
              disabled={deleteMaterial.isLoading}
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
    </MainLayout>
  );
};

export default InventoryView;
