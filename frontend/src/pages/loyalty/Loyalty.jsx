import React, { useState } from 'react';
import MainLayout from '../../layouts/MainLayout';
import {
  Paper,
  Typography,
  Stack,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  Alert,
  Chip,
  Divider,
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  InputAdornment,
} from '@mui/material';
import { Search, Star, CardGiftcard, EmojiEvents } from '@mui/icons-material';
import {
  useFindCustomerByPhone,
  useCustomerPoints,
  useAddPoints,
  useUsePoints,
  useMembershipTiers,
} from '../../hooks/useCustomers';

const tierColors = {
  'Thường': 'default',
  'Bạc': 'info',
  'Vàng': 'warning',
  'VIP': 'error',
};

const Loyalty = () => {
  const [phone, setPhone] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  const { data: customer, isLoading: searchLoading } = useFindCustomerByPhone(searchPhone);
  const { data: pointsData, refetch: refetchPoints } = useCustomerPoints(customer?.id);
  const { data: tiersData } = useMembershipTiers();

  const [pointsToUse, setPointsToUse] = useState('');
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const addPointsMutation = useAddPoints();
  const usePointsMutation = useUsePoints();

  const handleSearch = () => {
    if (phone.length >= 10) {
      setSearchPhone(phone);
    }
  };

  const handleUsePoints = async () => {
    if (!customer?.id || !pointsToUse) return;
    try {
      const result = await usePointsMutation.mutateAsync({
        id: customer.id,
        points: parseInt(pointsToUse),
        description: 'Đổi điểm tại quầy',
      });
      setFeedback({
        type: 'success',
        message: `Đã đổi ${result.used} điểm = ${result.discountAmount.toLocaleString()}đ giảm giá. Điểm còn lại: ${result.newTotal}`,
      });
      setPointsToUse('');
      refetchPoints();
    } catch (err) {
      setFeedback({ type: 'error', message: err?.response?.data?.message || 'Lỗi đổi điểm' });
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  return (
    <MainLayout title="Tích điểm & Đổi thưởng">
      <Grid container spacing={3}>
        {/* Left: Customer lookup */}
        <Grid item xs={12} md={7}>
          <Stack spacing={2}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Tra cứu khách hàng</Typography>
              <Stack direction="row" spacing={2}>
                <TextField
                  placeholder="Nhập số điện thoại..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                />
                <Button variant="contained" onClick={handleSearch} disabled={phone.length < 10}>
                  Tìm
                </Button>
              </Stack>
            </Paper>

            {feedback.message && (
              <Alert severity={feedback.type} onClose={() => setFeedback({ type: '', message: '' })}>
                {feedback.message}
              </Alert>
            )}

            {searchLoading && <Typography>Đang tìm...</Typography>}

            {customer && customer.id && (
              <Card elevation={3}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                    <Box>
                      <Typography variant="h5">{customer.hoTen}</Typography>
                      <Typography color="text.secondary">{customer.soDienThoai}</Typography>
                    </Box>
                    <Chip
                      icon={customer.hangThe === 'VIP' ? <Star /> : <EmojiEvents />}
                      label={customer.hangThe || 'Thường'}
                      color={tierColors[customer.hangThe] || 'default'}
                      size="large"
                    />
                  </Stack>

                  <Divider sx={{ my: 2 }} />

                  <Stack direction="row" spacing={4} justifyContent="center" mb={3}>
                    <Box textAlign="center">
                      <Typography variant="h3" color="primary" fontWeight="bold">
                        {pointsData?.points?.toLocaleString() || customer.diemTichLuy || 0}
                      </Typography>
                      <Typography color="text.secondary">Điểm tích lũy</Typography>
                    </Box>
                    <Box textAlign="center">
                      <Typography variant="h3" color="success.main" fontWeight="bold">
                        {formatCurrency((pointsData?.points || customer.diemTichLuy || 0) * 1000)}
                      </Typography>
                      <Typography color="text.secondary">Giá trị quy đổi</Typography>
                    </Box>
                  </Stack>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="subtitle1" gutterBottom>Đổi điểm</Typography>
                  <Stack direction="row" spacing={2}>
                    <TextField
                      label="Số điểm đổi"
                      type="number"
                      value={pointsToUse}
                      onChange={(e) => setPointsToUse(e.target.value)}
                      fullWidth
                      inputProps={{ min: 1, max: pointsData?.points || customer.diemTichLuy || 0 }}
                      helperText={pointsToUse ? `= ${formatCurrency(parseInt(pointsToUse || 0) * 1000)} giảm giá` : ''}
                    />
                    <Button
                      variant="contained"
                      color="secondary"
                      startIcon={<CardGiftcard />}
                      onClick={handleUsePoints}
                      disabled={!pointsToUse || parseInt(pointsToUse) <= 0 || usePointsMutation.isLoading}
                    >
                      Đổi điểm
                    </Button>
                  </Stack>

                  {/* Recent history */}
                  {pointsData?.history?.length > 0 && (
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="subtitle1" gutterBottom>Lịch sử gần đây</Typography>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Thời gian</TableCell>
                            <TableCell>Mô tả</TableCell>
                            <TableCell align="right">Thay đổi</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {pointsData.history.slice(0, 5).map((h) => (
                            <TableRow key={h.id}>
                              <TableCell>{new Date(h.createdAt).toLocaleDateString('vi-VN')}</TableCell>
                              <TableCell>{h.moTa}</TableCell>
                              <TableCell align="right">
                                {h.diemCong > 0 && <Chip label={`+${h.diemCong}`} color="success" size="small" />}
                                {h.diemTru > 0 && <Chip label={`-${h.diemTru}`} color="error" size="small" />}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Box>
                  )}
                </CardContent>
              </Card>
            )}

            {searchPhone && !searchLoading && (!customer || !customer.id) && (
              <Alert severity="warning">
                Không tìm thấy khách hàng với SĐT: {searchPhone}
              </Alert>
            )}
          </Stack>
        </Grid>

        {/* Right: Tiers info */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              <EmojiEvents sx={{ mr: 1, verticalAlign: 'middle' }} />
              Chương trình thành viên
            </Typography>

            <Box sx={{ mb: 3, p: 2, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'grey.800' : 'grey.100', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>Quy tắc tích điểm:</Typography>
              <Typography variant="body2">• {tiersData?.conversionRate?.earn || '10,000đ = 1 điểm'}</Typography>
              <Typography variant="body2">• {tiersData?.conversionRate?.redeem || '1 điểm = 1,000đ giảm giá'}</Typography>
            </Box>

            <Typography variant="subtitle1" gutterBottom>Các hạng thẻ</Typography>
            <Stack spacing={2}>
              {(tiersData?.tiers || [
                { name: 'Thường', minPoints: 0, benefits: 'Tích điểm cơ bản' },
                { name: 'Bạc', minPoints: 100, benefits: 'Tích điểm x1.2' },
                { name: 'Vàng', minPoints: 500, benefits: 'Tích điểm x1.5, ưu tiên đặt bàn' },
                { name: 'VIP', minPoints: 1000, benefits: 'Tích điểm x2, ưu tiên đặt bàn, quà sinh nhật' },
              ]).map((tier) => (
                <Card key={tier.name} variant="outlined">
                  <CardContent sx={{ py: 1.5 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Chip
                          label={tier.name}
                          color={tierColors[tier.name] || 'default'}
                          icon={tier.name === 'VIP' ? <Star /> : undefined}
                          sx={{
                            '& .MuiChip-label': { color: '#000' },
                            '& .MuiChip-icon': { color: '#000' }
                          }}
                        />
                        <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                          Từ {tier.minPoints} điểm
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 180 }}>
                        {tier.benefits}
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </MainLayout>
  );
};

export default Loyalty;
