import React, { useState, useEffect } from 'react';
import MainLayout from '../../layouts/MainLayout';
import {
  Paper,
  Typography,
  Stack,
  Button,
  Box,
  Grid,
  TextField,
  Card,
  CardContent,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  Chip,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  Settings,
  Save,
  Percent,
  AttachMoney,
  Store,
  Phone,
  LocationOn,
  Loyalty,
  Add,
  Edit,
  Delete,
  LocalOffer,
  TrendingUp,
  CalendarToday,
  Schedule,
} from '@mui/icons-material';
import {
  useConfigs,
  useBatchUpdateConfigs,
  useLoyaltyTiers,
  useCreateLoyaltyTier,
  useUpdateLoyaltyTier,
  useDeleteLoyaltyTier,
  usePromotions,
  useCreatePromotion,
  useUpdatePromotion,
  useDeletePromotion,
} from '../../hooks/useAdmin';

// ==================== COLORS ====================
const COLORS = {
  primary: '#6366F1',
  primaryLight: '#818CF8',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  textPrimary: '#1E293B',
  textSecondary: '#64748B',
  border: '#E2E8F0',
  cardBg: '#FFFFFF',
};

// ==================== CONFIG SECTION ====================
const ConfigSection = ({ title, icon, children }) => (
  <Card sx={{ borderRadius: 3, border: `1px solid ${COLORS.border}`, mb: 3 }}>
    <CardContent>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        {icon}
        <Typography variant="h6" fontWeight={700}>{title}</Typography>
      </Stack>
      <Divider sx={{ mb: 2 }} />
      {children}
    </CardContent>
  </Card>
);

const Config = () => {
  const { data: configData, isLoading: configLoading } = useConfigs();
  const { mutate: batchUpdate, isPending: saving } = useBatchUpdateConfigs();
  const { data: tiersData } = useLoyaltyTiers();
  const { mutate: createTier } = useCreateLoyaltyTier();
  const { mutate: updateTier } = useUpdateLoyaltyTier();
  const { mutate: deleteTier } = useDeleteLoyaltyTier();
  const { data: promosData } = usePromotions();
  const { mutate: createPromo } = useCreatePromotion();
  const { mutate: updatePromo } = useUpdatePromotion();
  const { mutate: deletePromo } = useDeletePromotion();

  const [configs, setConfigs] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [tierDialog, setTierDialog] = useState({ open: false, tier: null });
  const [promoDialog, setPromoDialog] = useState({ open: false, promo: null });

  useEffect(() => {
    if (configData?.items) {
      const map = {};
      configData.items.forEach(c => { map[c.key] = c.value; });
      setConfigs(map);
    }
  }, [configData]);

  const handleConfigChange = (key, value) => {
    setConfigs(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveConfigs = () => {
    const configsArray = Object.entries(configs).map(([key, value]) => ({ key, value }));
    batchUpdate(configsArray, {
      onSuccess: () => setSnackbar({ open: true, message: 'Lưu cấu hình thành công!', severity: 'success' }),
      onError: () => setSnackbar({ open: true, message: 'Lỗi khi lưu cấu hình', severity: 'error' }),
    });
  };

  // Tier handlers
  const handleSaveTier = (tier) => {
    if (tier.id) {
      updateTier({ id: tier.id, payload: tier }, {
        onSuccess: () => { setTierDialog({ open: false, tier: null }); setSnackbar({ open: true, message: 'Cập nhật thành công!', severity: 'success' }); },
      });
    } else {
      createTier(tier, {
        onSuccess: () => { setTierDialog({ open: false, tier: null }); setSnackbar({ open: true, message: 'Tạo thành công!', severity: 'success' }); },
      });
    }
  };

  const handleDeleteTier = (id) => {
    if (confirm('Xác nhận xóa hạng thành viên này?')) {
      deleteTier(id, {
        onSuccess: () => setSnackbar({ open: true, message: 'Xóa thành công!', severity: 'success' }),
      });
    }
  };

  // Promo handlers
  const handleSavePromo = (promo) => {
    if (promo.id) {
      updatePromo({ id: promo.id, payload: promo }, {
        onSuccess: () => { setPromoDialog({ open: false, promo: null }); setSnackbar({ open: true, message: 'Cập nhật thành công!', severity: 'success' }); },
      });
    } else {
      createPromo(promo, {
        onSuccess: () => { setPromoDialog({ open: false, promo: null }); setSnackbar({ open: true, message: 'Tạo thành công!', severity: 'success' }); },
      });
    }
  };

  const handleDeletePromo = (id) => {
    if (confirm('Xác nhận xóa khuyến mãi này?')) {
      deletePromo(id, {
        onSuccess: () => setSnackbar({ open: true, message: 'Xóa thành công!', severity: 'success' }),
      });
    }
  };

  if (configLoading) return <MainLayout title="Cấu hình"><Typography>Đang tải...</Typography></MainLayout>;

  return (
    <MainLayout title="Cấu hình hệ thống">
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 2 }}>
        {/* Restaurant Info */}
        <ConfigSection title="Thông tin nhà hàng" icon={<Store sx={{ color: COLORS.primary }} />}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tên nhà hàng"
                value={configs.RESTAURANT_NAME || ''}
                onChange={(e) => handleConfigChange('RESTAURANT_NAME', e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><Store /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Số điện thoại"
                value={configs.RESTAURANT_PHONE || ''}
                onChange={(e) => handleConfigChange('RESTAURANT_PHONE', e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><Phone /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Địa chỉ"
                value={configs.RESTAURANT_ADDRESS || ''}
                onChange={(e) => handleConfigChange('RESTAURANT_ADDRESS', e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><LocationOn /></InputAdornment> }}
              />
            </Grid>
          </Grid>
        </ConfigSection>

        {/* Tax Settings */}
        <ConfigSection title="Thuế suất" icon={<Percent sx={{ color: COLORS.warning }} />}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="number"
                label="Thuế VAT (%)"
                value={configs.VAT_RATE || '10'}
                onChange={(e) => handleConfigChange('VAT_RATE', e.target.value)}
                InputProps={{ 
                  startAdornment: <InputAdornment position="start"><Percent /></InputAdornment>,
                  endAdornment: <InputAdornment position="end">%</InputAdornment>
                }}
              />
            </Grid>
          </Grid>
          <Alert severity="info" sx={{ mt: 2 }}>
            Thuế VAT sẽ được áp dụng tự động khi tính hóa đơn
          </Alert>
        </ConfigSection>

        {/* Loyalty Settings */}
        <ConfigSection title="Quy tắc tích điểm" icon={<Loyalty sx={{ color: COLORS.success }} />}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Mức tích điểm (VNĐ = 1 điểm)"
                value={configs.LOYALTY_EARN_RATE || '10000'}
                onChange={(e) => handleConfigChange('LOYALTY_EARN_RATE', e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><TrendingUp /></InputAdornment> }}
                helperText="Số tiền chi tiêu để được 1 điểm"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Giá trị quy đổi (1 điểm = X VNĐ)"
                value={configs.LOYALTY_REDEEM_RATE || '1000'}
                onChange={(e) => handleConfigChange('LOYALTY_REDEEM_RATE', e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><AttachMoney /></InputAdornment> }}
                helperText="Giá trị tiền khi sử dụng 1 điểm"
              />
            </Grid>
          </Grid>
        </ConfigSection>

        {/* Loyalty Tiers */}
        <ConfigSection title="Hạng thành viên" icon={<Loyalty sx={{ color: COLORS.primary }} />}>
          <Stack direction="row" justifyContent="flex-end" sx={{ mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setTierDialog({ open: true, tier: { ten: '', mucTichDiem: 10000, tyLeQuyDoi: 1000, diemToiThieu: 0 } })}
              sx={{ bgcolor: COLORS.primary }}
            >
              Thêm hạng
            </Button>
          </Stack>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                  <TableCell><strong>Hạng</strong></TableCell>
                  <TableCell align="right"><strong>Điểm tối thiểu</strong></TableCell>
                  <TableCell align="right"><strong>Mức tích điểm</strong></TableCell>
                  <TableCell align="right"><strong>Giá trị quy đổi</strong></TableCell>
                  <TableCell align="center"><strong>Thao tác</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tiersData?.items?.map((tier) => (
                  <TableRow key={tier.id}>
                    <TableCell>
                      <Chip label={tier.ten} size="small" sx={{ bgcolor: COLORS.primaryLight, color: '#fff' }} />
                    </TableCell>
                    <TableCell align="right">{tier.diemToiThieu?.toLocaleString()} điểm</TableCell>
                    <TableCell align="right">{tier.mucTichDiem?.toLocaleString()}đ = 1 điểm</TableCell>
                    <TableCell align="right">1 điểm = {tier.tyLeQuyDoi?.toLocaleString()}đ</TableCell>
                    <TableCell align="center">
                      <IconButton size="small" onClick={() => setTierDialog({ open: true, tier })}>
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDeleteTier(tier.id)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </ConfigSection>

        {/* Promotions */}
        <ConfigSection title="Khuyến mãi" icon={<LocalOffer sx={{ color: COLORS.error }} />}>
          <Stack direction="row" justifyContent="flex-end" sx={{ mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setPromoDialog({ open: true, promo: { ten: '', loai: 'PHAN_TRAM', giaTri: 10, trangThai: true } })}
              sx={{ bgcolor: COLORS.error }}
            >
              Thêm khuyến mãi
            </Button>
          </Stack>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                  <TableCell><strong>Tên</strong></TableCell>
                  <TableCell align="center"><strong>Loại</strong></TableCell>
                  <TableCell align="right"><strong>Giá trị</strong></TableCell>
                  <TableCell align="center"><strong>Trạng thái</strong></TableCell>
                  <TableCell align="center"><strong>Thao tác</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {promosData?.items?.map((promo) => (
                  <TableRow key={promo.id}>
                    <TableCell>{promo.ten}</TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={promo.loai === 'PHAN_TRAM' ? 'Phần trăm' : 'Số tiền'} 
                        size="small"
                        color={promo.loai === 'PHAN_TRAM' ? 'primary' : 'secondary'}
                      />
                    </TableCell>
                    <TableCell align="right">
                      {promo.loai === 'PHAN_TRAM' ? `${promo.giaTri}%` : `${Number(promo.giaTri).toLocaleString()}đ`}
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={promo.trangThai ? 'Hoạt động' : 'Tắt'} 
                        size="small"
                        color={promo.trangThai ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton size="small" onClick={() => setPromoDialog({ open: true, promo })}>
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDeletePromo(promo.id)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </ConfigSection>

        {/* Save Button */}
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<Save />}
            onClick={handleSaveConfigs}
            disabled={saving}
            sx={{ bgcolor: COLORS.primary, px: 6 }}
          >
            {saving ? 'Đang lưu...' : 'Lưu cấu hình'}
          </Button>
        </Box>

        {/* Tier Dialog */}
        <TierDialog
          open={tierDialog.open}
          tier={tierDialog.tier}
          onClose={() => setTierDialog({ open: false, tier: null })}
          onSave={handleSaveTier}
        />

        {/* Promo Dialog */}
        <PromoDialog
          open={promoDialog.open}
          promo={promoDialog.promo}
          onClose={() => setPromoDialog({ open: false, promo: null })}
          onSave={handleSavePromo}
        />

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </MainLayout>
  );
};

// ==================== TIER DIALOG ====================
const TierDialog = ({ open, tier, onClose, onSave }) => {
  const [form, setForm] = useState(tier || {});

  useEffect(() => { setForm(tier || {}); }, [tier]);

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{tier?.id ? 'Sửa hạng thành viên' : 'Thêm hạng thành viên'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            fullWidth
            label="Tên hạng"
            value={form.ten || ''}
            onChange={(e) => handleChange('ten', e.target.value)}
          />
          <TextField
            fullWidth
            type="number"
            label="Điểm tối thiểu để đạt hạng"
            value={form.diemToiThieu || 0}
            onChange={(e) => handleChange('diemToiThieu', parseInt(e.target.value))}
          />
          <TextField
            fullWidth
            type="number"
            label="Mức tích điểm (VNĐ = 1 điểm)"
            value={form.mucTichDiem || 10000}
            onChange={(e) => handleChange('mucTichDiem', parseInt(e.target.value))}
          />
          <TextField
            fullWidth
            type="number"
            label="Giá trị quy đổi (1 điểm = X VNĐ)"
            value={form.tyLeQuyDoi || 1000}
            onChange={(e) => handleChange('tyLeQuyDoi', parseInt(e.target.value))}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button variant="contained" onClick={() => onSave(form)}>Lưu</Button>
      </DialogActions>
    </Dialog>
  );
};

// ==================== PROMO DIALOG ====================
const PromoDialog = ({ open, promo, onClose, onSave }) => {
  const [form, setForm] = useState(promo || {});

  useEffect(() => { setForm(promo || {}); }, [promo]);

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{promo?.id ? 'Sửa khuyến mãi' : 'Thêm khuyến mãi'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            fullWidth
            label="Tên khuyến mãi"
            value={form.ten || ''}
            onChange={(e) => handleChange('ten', e.target.value)}
          />
          <FormControl fullWidth>
            <InputLabel>Loại giảm giá</InputLabel>
            <Select
              value={form.loai || 'PHAN_TRAM'}
              label="Loại giảm giá"
              onChange={(e) => handleChange('loai', e.target.value)}
            >
              <MenuItem value="PHAN_TRAM">Phần trăm (%)</MenuItem>
              <MenuItem value="SO_TIEN">Số tiền cố định (VNĐ)</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            type="number"
            label={form.loai === 'PHAN_TRAM' ? 'Phần trăm giảm (%)' : 'Số tiền giảm (VNĐ)'}
            value={form.giaTri || 0}
            onChange={(e) => handleChange('giaTri', parseFloat(e.target.value))}
          />
          <TextField
            fullWidth
            type="date"
            label="Ngày bắt đầu"
            value={form.ngayBatDau?.split('T')[0] || ''}
            onChange={(e) => handleChange('ngayBatDau', e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            type="date"
            label="Ngày kết thúc"
            value={form.ngayKetThuc?.split('T')[0] || ''}
            onChange={(e) => handleChange('ngayKetThuc', e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={form.trangThai !== false}
                onChange={(e) => handleChange('trangThai', e.target.checked)}
              />
            }
            label="Đang hoạt động"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button variant="contained" onClick={() => onSave(form)}>Lưu</Button>
      </DialogActions>
    </Dialog>
  );
};

export default Config;
