import React from 'react';
import { Box, Typography, Button, Stack, Paper } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Restaurant, Kitchen } from '@mui/icons-material';

const PosFallback = () => {
  const navigate = useNavigate();
  return (
    <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Paper sx={{ p: 4, width: 560, borderRadius: 2 }} elevation={4}>
        <Stack spacing={2} alignItems="center">
          <Kitchen sx={{ fontSize: 48, color: 'primary.main' }} />
          <Typography variant="h5" fontWeight={700}>Quyền truy cập sơ đồ bàn bị giới hạn</Typography>
          <Typography variant="body1" color="text.secondary" textAlign="center">
            Tài khoản hiện tại không có quyền xem Sơ đồ bàn (TABLE_VIEW). Nếu bạn là nhân viên bếp, vui lòng sử dụng màn hình Bếp (KDS) để xử lý các món. Nếu cần quyền truy cập, liên hệ quản lý.
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 1 }}>
            <Button variant="contained" startIcon={<Kitchen />} component={RouterLink} to="/kds">
              Mở màn hình Bếp (KDS)
            </Button>
            <Button variant="outlined" startIcon={<Restaurant />} onClick={() => navigate('/') }>
              Về trang chính
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
};

export default PosFallback;
