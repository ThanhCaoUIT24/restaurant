import React, { useState } from 'react';
import { Box, Paper, Typography, Stack, TextField, Button } from '@mui/material';
import PosLayout from '../../layouts/PosLayout';
import { useCreateOrder } from '../../hooks/useOrders';

const OrderPad = () => {
  const [tableId, setTableId] = useState('');
  const [monAnId, setMonAnId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const createOrder = useCreateOrder();

  const handleCreate = () => {
    if (!tableId || !monAnId) return;
    createOrder.mutate({
      tableId,
      items: [{ monAnId, quantity: Number(quantity) || 1, options: [] }],
    });
  };

  return (
    <PosLayout>
      <Box sx={{ p: 2 }}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">Tạo đơn nhanh</Typography>
          <Stack spacing={2} sx={{ mt: 2 }} direction={{ xs: 'column', sm: 'row' }}>
            <TextField label="Bàn ID" value={tableId} onChange={(e) => setTableId(e.target.value)} fullWidth />
            <TextField label="Món ID" value={monAnId} onChange={(e) => setMonAnId(e.target.value)} fullWidth />
            <TextField
              label="Số lượng"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              fullWidth
            />
            <Button variant="contained" onClick={handleCreate} disabled={createOrder.isLoading}>
              Gửi
            </Button>
          </Stack>
          {createOrder.isError && <Typography color="error">Lỗi tạo đơn</Typography>}
          {createOrder.isSuccess && <Typography color="success.main">Đã tạo đơn</Typography>}
        </Paper>
      </Box>
    </PosLayout>
  );
};

export default OrderPad;
