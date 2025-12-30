import React, { useMemo, useState } from 'react';
import MainLayout from '../../layouts/MainLayout';
import {
  Paper,
  Typography,
  Stack,
  TextField,
  Button,
  Divider,
  Chip,
  Alert,
  Box,
  Grid,
  Card,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  LinearProgress,
  alpha,
} from '@mui/material';
import {
  AttachMoney,
  CreditCard,
  QrCode2,
  TrendingUp,
  Lock,
  LockOpen,
  CheckCircle,
  Schedule,
  Assessment,
  ArrowUpward,
  ArrowDownward,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useCurrentShift, useOpenShift, useCloseShift, useExportZReport } from '../../hooks/useBilling';

// ==================== COLORS ====================
const COLORS = {
  primary: '#6366F1',
  primaryLight: '#818CF8',
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  info: '#3B82F6',
  infoLight: '#DBEAFE',
  background: '#F8FAFC',
  textPrimary: '#1E293B',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  border: '#E2E8F0',
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

const formatTime = (date) => date ? new Date(date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '--:--';
const formatDate = (date) => date ? new Date(date).toLocaleDateString('vi-VN') : '--/--/----';

// ==================== STAT CARD ====================
const StatCard = ({ icon, label, value, color, subLabel }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
    <Card elevation={0} sx={{ p: 2.5, borderRadius: 3, background: `linear-gradient(135deg, ${alpha(color, 0.08)}, ${alpha(color, 0.02)})`, border: `1px solid ${alpha(color, 0.2)}`, height: '100%' }}>
      <Stack spacing={1.5}>
        <Box sx={{ width: 48, height: 48, borderRadius: 2, background: `linear-gradient(135deg, ${color}, ${alpha(color, 0.8)})`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 12px ${alpha(color, 0.3)}` }}>
          {icon}
        </Box>
        <Box>
          <Typography variant="body2" color={COLORS.textSecondary} sx={{ mb: 0.5 }}>{label}</Typography>
          <Typography variant="h5" fontWeight={700} color={COLORS.textPrimary}>{value}</Typography>
          {subLabel && <Typography variant="caption" color={COLORS.textMuted}>{subLabel}</Typography>}
        </Box>
      </Stack>
    </Card>
  </motion.div>
);

// ==================== PAYMENT METHOD CARD ====================
const PaymentMethodCard = ({ method, data, color, icon }) => (
  <Paper elevation={0} sx={{ p: 2, borderRadius: 2, background: alpha(color, 0.05), border: `1px solid ${alpha(color, 0.15)}` }}>
    <Stack direction="row" alignItems="center" spacing={2}>
      <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: alpha(color, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', color: color }}>
        {icon}
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography variant="body2" color={COLORS.textSecondary}>{method}</Typography>
        <Typography variant="h6" fontWeight={700} color={color}>{formatCurrency(data?.total || 0)}</Typography>
      </Box>
      <Chip label={`${data?.count || 0} GD`} size="small" sx={{ bgcolor: alpha(color, 0.1), color: color }} />
    </Stack>
  </Paper>
);

// ==================== MAIN COMPONENT ====================
const CashierShift = () => {
  const { data, isLoading, refetch } = useCurrentShift();
  const openShift = useOpenShift();
  const closeShift = useCloseShift();
  const exportZ = useExportZReport();
  const shift = data?.shift;
  const summary = data?.summary;

  const [openingCash, setOpeningCash] = useState('');
  const [actualCash, setActualCash] = useState('');
  const [feedback, setFeedback] = useState({ message: '', severity: 'info' });
  const [openDialog, setOpenDialog] = useState(false);
  const [closeDialog, setCloseDialog] = useState(false);

  const cashTotal = useMemo(() => summary?.TienMat?.total || 0, [summary]);
  const cardTotal = useMemo(() => summary?.The?.total || 0, [summary]);
  const qrTotal = useMemo(() => summary?.QR?.total || 0, [summary]);
  const expectedCash = useMemo(() => Number(shift?.tienMatDauCa || 0) + cashTotal, [shift, cashTotal]);
  const totalRevenue = useMemo(() => cashTotal + cardTotal + qrTotal, [cashTotal, cardTotal, qrTotal]);
  const variance = Number(actualCash || 0) - expectedCash;

  const handleOpen = () => {
    openShift.mutateAsync({ openingCash: Number(openingCash) })
      .then(() => { setOpeningCash(''); setOpenDialog(false); setFeedback({ message: '✅ Mở ca thành công!', severity: 'success' }); refetch(); })
      .catch((err) => setFeedback({ message: err?.response?.data?.message || 'Không thể mở ca', severity: 'error' }));
  };

  const handleClose = () => {
    if (!shift) return;
    closeShift.mutateAsync({ shiftId: shift.id, payload: { actualCash: Number(actualCash) } })
      .then((res) => { setActualCash(''); setCloseDialog(false); setFeedback({ message: `✅ Đóng ca thành công! Chênh lệch: ${formatCurrency(res.variance)}`, severity: res.variance === 0 ? 'success' : 'warning' }); refetch(); })
      .catch((err) => setFeedback({ message: err?.response?.data?.message || 'Không thể đóng ca', severity: 'error' }));
  };

  return (
    <MainLayout title="Quản lý ca thu ngân">
      <Box sx={{ p: 3, minHeight: '100vh', bgcolor: COLORS.background }}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Box>
            <Typography variant="h4" fontWeight={700} color={COLORS.textPrimary}>💼 Quản lý Ca Thu Ngân</Typography>
            <Typography variant="body1" color={COLORS.textSecondary}>Mở ca, đóng ca và báo cáo Z-Report</Typography>
          </Box>
          {!shift ? (
            <Button variant="contained" size="large" startIcon={<LockOpen />} onClick={() => setOpenDialog(true)}
              sx={{ px: 4, py: 1.5, borderRadius: 3, background: `linear-gradient(135deg, ${COLORS.success}, #059669)`, fontWeight: 700, boxShadow: `0 4px 20px ${alpha(COLORS.success, 0.4)}` }}>
              Mở Ca Mới
            </Button>
          ) : (
            <Stack direction="row" spacing={1} alignItems="center">
              <Button variant="contained" size="large" color="error" startIcon={<Lock />} onClick={() => setCloseDialog(true)}
                sx={{ px: 4, py: 1.5, borderRadius: 3, fontWeight: 700, boxShadow: `0 4px 20px ${alpha(COLORS.error, 0.4)}` }}>
                Đóng Ca
              </Button>
              {shift?.trangThai === 'DADONG' && (
                <Button variant="outlined" size="large" startIcon={<Assessment />} onClick={async () => {
                  try {
                    const csv = await exportZ.mutateAsync({ shiftId: shift.id, format: 'csv' });
                    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                    const a = document.createElement('a');
                    const url = URL.createObjectURL(blob);
                    a.href = url;
                    a.download = `zreport_${shift.id}.csv`;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    URL.revokeObjectURL(url);
                  } catch (err) {
                    setFeedback({ message: err?.response?.data?.message || 'Không thể xuất Z-Report', severity: 'error' });
                  }
                }} sx={{ borderRadius: 3 }}>
                  Xuất Z-Report
                </Button>
              )}
            </Stack>
          )}
        </Stack>

        {isLoading && <LinearProgress sx={{ mb: 2, borderRadius: 2 }} />}
        {feedback.message && <Alert severity={feedback.severity} sx={{ mb: 3, borderRadius: 2 }}>{feedback.message}</Alert>}

        {shift ? (
          <>
            {/* Shift Info */}
            <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 4, background: `linear-gradient(135deg, ${COLORS.primary}08, ${COLORS.primary}02)`, border: `1px solid ${COLORS.border}` }}>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={6}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Box sx={{ width: 60, height: 60, borderRadius: 3, background: `linear-gradient(135deg, ${COLORS.success}, #059669)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 12px ${alpha(COLORS.success, 0.3)}` }}>
                      <Schedule sx={{ color: 'white', fontSize: 28 }} />
                    </Box>
                    <Box>
                      <Typography variant="h6" fontWeight={700} color={COLORS.textPrimary}>Ca đang hoạt động</Typography>
                      <Typography color={COLORS.textSecondary}>Mở lúc: {formatTime(shift.thoiGianMo)} - {formatDate(shift.thoiGianMo)}</Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Stack direction="row" spacing={2} justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
                    <Chip icon={<AttachMoney />} label={`Tiền đầu ca: ${formatCurrency(shift.tienMatDauCa)}`} sx={{ bgcolor: COLORS.infoLight, color: COLORS.info, fontWeight: 600 }} />
                    <Chip label={shift.trangThai === 'HOATDONG' ? '🟢 Đang hoạt động' : '🔴 Đã đóng'} sx={{ bgcolor: shift.trangThai === 'HOATDONG' ? COLORS.successLight : COLORS.errorLight, color: shift.trangThai === 'HOATDONG' ? COLORS.success : COLORS.error, fontWeight: 600 }} />
                  </Stack>
                </Grid>
              </Grid>
            </Paper>

            {/* Stats Grid */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard icon={<TrendingUp sx={{ color: 'white', fontSize: 24 }} />} label="Tổng doanh thu" value={formatCurrency(totalRevenue)} color={COLORS.primary} subLabel={`${(summary?.TienMat?.count || 0) + (summary?.The?.count || 0) + (summary?.QR?.count || 0)} giao dịch`} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard icon={<AttachMoney sx={{ color: 'white', fontSize: 24 }} />} label="Tiền mặt lý thuyết" value={formatCurrency(expectedCash)} color={COLORS.success} subLabel={`Đầu ca: ${formatCurrency(shift.tienMatDauCa)}`} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard icon={<CreditCard sx={{ color: 'white', fontSize: 24 }} />} label="Thẻ" value={formatCurrency(cardTotal)} color={COLORS.info} subLabel={`${summary?.The?.count || 0} giao dịch`} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard icon={<QrCode2 sx={{ color: 'white', fontSize: 24 }} />} label="QR" value={formatCurrency(qrTotal)} color="#8B5CF6" subLabel={`${summary?.QR?.count || 0} giao dịch`} />
              </Grid>
            </Grid>

            {/* Payment Breakdown */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: `1px solid ${COLORS.border}` }}>
              <Typography variant="h6" fontWeight={700} color={COLORS.textPrimary} sx={{ mb: 2 }}>📊 Chi tiết theo phương thức thanh toán</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}><PaymentMethodCard method="Tiền mặt" data={summary?.TienMat} color={COLORS.success} icon={<AttachMoney />} /></Grid>
                <Grid item xs={12} md={4}><PaymentMethodCard method="Thẻ" data={summary?.The} color={COLORS.info} icon={<CreditCard />} /></Grid>
                <Grid item xs={12} md={4}><PaymentMethodCard method="QR Code" data={summary?.QR} color="#8B5CF6" icon={<QrCode2 />} /></Grid>
              </Grid>
            </Paper>
          </>
        ) : (
          <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: 4, border: `1px solid ${COLORS.border}`, bgcolor: 'white' }}>
            <Box sx={{ width: 100, height: 100, borderRadius: '50%', bgcolor: COLORS.warningLight, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3 }}>
              <Lock sx={{ fontSize: 48, color: COLORS.warning }} />
            </Box>
            <Typography variant="h5" fontWeight={700} color={COLORS.textPrimary} sx={{ mb: 1 }}>Chưa có ca đang mở</Typography>
            <Typography color={COLORS.textSecondary} sx={{ mb: 3 }}>Vui lòng mở ca để bắt đầu thu ngân</Typography>
            <Button variant="contained" size="large" startIcon={<LockOpen />} onClick={() => setOpenDialog(true)}
              sx={{ px: 5, py: 1.5, borderRadius: 3, background: `linear-gradient(135deg, ${COLORS.success}, #059669)`, fontWeight: 700 }}>
              Mở Ca Ngay
            </Button>
          </Paper>
        )}

        {/* ==================== OPEN SHIFT DIALOG ==================== */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
          <DialogTitle sx={{ pb: 1 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <LockOpen sx={{ color: COLORS.success }} />
              <Typography variant="h6" fontWeight={700}>Mở Ca Mới</Typography>
            </Stack>
          </DialogTitle>
          <DialogContent>
            <Typography color={COLORS.textSecondary} sx={{ mb: 3 }}>Nhập số tiền mặt hiện có trong két (float) để bắt đầu ca làm việc.</Typography>
            <TextField fullWidth label="Tiền mặt đầu ca" type="number" value={openingCash} onChange={(e) => setOpeningCash(e.target.value)} placeholder="0"
              InputProps={{ startAdornment: <InputAdornment position="start">₫</InputAdornment> }} sx={{ mb: 2 }} />
            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
              {[500000, 1000000, 2000000, 5000000].map((amount) => (
                <Chip key={amount} label={formatCurrency(amount)} onClick={() => setOpeningCash(String(amount))}
                  sx={{ cursor: 'pointer', bgcolor: Number(openingCash) === amount ? COLORS.primaryLight : COLORS.background }} />
              ))}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
            <Button variant="contained" onClick={handleOpen} disabled={openShift.isLoading || !openingCash}
              sx={{ background: `linear-gradient(135deg, ${COLORS.success}, #059669)` }}>
              {openShift.isLoading ? 'Đang mở...' : 'Xác nhận mở ca'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* ==================== CLOSE SHIFT DIALOG (Z-REPORT) ==================== */}
        <Dialog open={closeDialog} onClose={() => setCloseDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
          <DialogTitle sx={{ pb: 1 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Assessment sx={{ color: COLORS.error }} />
              <Typography variant="h6" fontWeight={700}>Báo cáo cuối ca (Z-Report)</Typography>
            </Stack>
          </DialogTitle>
          <DialogContent>
            {/* Summary */}
            <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: COLORS.background }}>
              <Typography variant="subtitle2" color={COLORS.textSecondary} sx={{ mb: 1.5 }}>Tổng kết doanh thu theo phương thức</Typography>
              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between"><Typography>💵 Tiền mặt:</Typography><Typography fontWeight={600} color={COLORS.success}>{formatCurrency(cashTotal)}</Typography></Stack>
                <Stack direction="row" justifyContent="space-between"><Typography>💳 Thẻ:</Typography><Typography fontWeight={600} color={COLORS.info}>{formatCurrency(cardTotal)}</Typography></Stack>
                <Stack direction="row" justifyContent="space-between"><Typography>📱 QR:</Typography><Typography fontWeight={600} color="#8B5CF6">{formatCurrency(qrTotal)}</Typography></Stack>
                <Divider sx={{ my: 1 }} />
                <Stack direction="row" justifyContent="space-between"><Typography fontWeight={700}>Tổng doanh thu:</Typography><Typography variant="h6" fontWeight={700} color={COLORS.primary}>{formatCurrency(totalRevenue)}</Typography></Stack>
              </Stack>
            </Paper>

            {/* Cash Reconciliation */}
            <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: COLORS.successLight }}>
              <Typography variant="subtitle2" color={COLORS.success} sx={{ mb: 1.5 }}>Đối soát tiền mặt trong két</Typography>
              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between"><Typography>Tiền đầu ca:</Typography><Typography fontWeight={600}>{formatCurrency(shift?.tienMatDauCa)}</Typography></Stack>
                <Stack direction="row" justifyContent="space-between"><Typography>Thu tiền mặt:</Typography><Typography fontWeight={600} color={COLORS.success}>+{formatCurrency(cashTotal)}</Typography></Stack>
                <Divider sx={{ my: 1 }} />
                <Stack direction="row" justifyContent="space-between"><Typography fontWeight={700}>Tiền mặt lý thuyết:</Typography><Typography variant="h6" fontWeight={700} color={COLORS.success}>{formatCurrency(expectedCash)}</Typography></Stack>
              </Stack>
            </Paper>

            {/* Actual Cash Input */}
            <TextField fullWidth label="Tiền mặt thực tế đếm được" type="number" value={actualCash} onChange={(e) => setActualCash(e.target.value)} placeholder="Nhập số tiền đếm được"
              InputProps={{ startAdornment: <InputAdornment position="start">₫</InputAdornment> }} sx={{ mb: 2 }} />

            {/* Variance Display */}
            {actualCash && (
              <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: variance === 0 ? COLORS.successLight : variance > 0 ? COLORS.warningLight : COLORS.errorLight, border: `1px solid ${variance === 0 ? COLORS.success : variance > 0 ? COLORS.warning : COLORS.error}` }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Stack direction="row" alignItems="center" spacing={1}>
                    {variance === 0 ? <CheckCircle sx={{ color: COLORS.success }} /> : variance > 0 ? <ArrowUpward sx={{ color: COLORS.warning }} /> : <ArrowDownward sx={{ color: COLORS.error }} />}
                    <Typography fontWeight={600}>{variance === 0 ? 'Khớp hoàn toàn!' : variance > 0 ? 'Thừa tiền' : 'Thiếu tiền'}</Typography>
                  </Stack>
                  <Typography variant="h5" fontWeight={700} color={variance === 0 ? COLORS.success : variance > 0 ? COLORS.warning : COLORS.error}>
                    {variance >= 0 ? '+' : ''}{formatCurrency(variance)}
                  </Typography>
                </Stack>
              </Paper>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setCloseDialog(false)}>Hủy</Button>
            <Button variant="contained" color="error" onClick={handleClose} disabled={closeShift.isLoading || !actualCash}>
              {closeShift.isLoading ? 'Đang đóng...' : 'Xác nhận đóng ca'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </MainLayout>
  );
};

export default CashierShift;
