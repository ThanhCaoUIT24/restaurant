import React, { useMemo, useState } from 'react';
import MainLayout from '../../layouts/MainLayout';
import {
  Alert,
  Button,
  Chip,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { usePOs, useCreateReceipt } from '../../hooks/usePurchase';

const Receipts = () => {
  const { data: pos = [] } = usePOs();
  const [selectedPO, setSelectedPO] = useState('');
  const [lines, setLines] = useState([]);
  const [feedback, setFeedback] = useState('');
  const createReceipt = useCreateReceipt();

  const po = useMemo(() => pos.find((p) => p.id === selectedPO), [pos, selectedPO]);

  const handleSelect = (id) => {
    setSelectedPO(id);
    const found = pos.find((p) => p.id === id);
    if (found) {
      setLines(
        (found.chiTiet || []).map((l) => ({
          nguyenVatLieuId: l.nguyenVatLieuId,
          soLuongDat: Number(l.soLuong) || 0, // QĐ-RECEIVE: Số lượng đặt từ PO
          soLuong: Number(l.soLuong) || 0,    // Số lượng thực nhận (mặc định = đặt)
          donGia: Number(l.donGia) || 0,
          name: l.nguyenVatLieu?.ten,
          donViTinh: l.nguyenVatLieu?.donViTinh || '',
        })),
      );
    } else {
      setLines([]);
    }
  };

  const updateLine = (idx, patch) => setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, ...patch } : l)));

  const handleSubmit = () => {
    if (!po) return;
    setFeedback('');
    createReceipt
      .mutateAsync({ donMuaHangId: po.id, items: lines })
      .then(() => {
        setFeedback('Đã tạo phiếu nhập');
        setLines([]);
        setSelectedPO('');
      })
      .catch((err) => setFeedback(err?.response?.data?.message || 'Không thể tạo phiếu nhập'));
  };

  return (
    <MainLayout title="Nhập kho">
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6">Nhận hàng từ PO</Typography>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField select label="Chọn PO" value={selectedPO} onChange={(e) => handleSelect(e.target.value)} fullWidth>
            {pos.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.id} - {p.nhaCungCap?.ten}
              </MenuItem>
            ))}
          </TextField>
          {po && (
            <>
              <Typography variant="body2" color="text.secondary">
                Trạng thái: {po.trangThai}
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Nguyên liệu</TableCell>
                    <TableCell align="center">SL Đặt</TableCell>
                    <TableCell align="center">SL Thực nhận</TableCell>
                    <TableCell align="center">So sánh</TableCell>
                    <TableCell>Đơn giá</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {lines.map((l, idx) => {
                    const diff = l.soLuong - l.soLuongDat;
                    const status = diff === 0 ? 'success' : diff > 0 ? 'info' : 'warning';
                    const statusText = diff === 0 ? 'Đủ' : diff > 0 ? `+${diff}` : `${diff}`;
                    return (
                      <TableRow key={idx}>
                        <TableCell>{l.name}</TableCell>
                        <TableCell align="center">
                          <Typography variant="body2">
                            {l.soLuongDat} {l.donViTinh}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <TextField
                            type="number"
                            size="small"
                            value={l.soLuong}
                            onChange={(e) => updateLine(idx, { soLuong: Number(e.target.value) || 0 })}
                            sx={{ width: 100 }}
                            inputProps={{ min: 0 }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title={diff < 0 ? 'Nhận thiếu so với đặt' : diff > 0 ? 'Nhận thừa so với đặt' : 'Đủ số lượng'}>
                            <Chip
                              label={statusText}
                              color={status}
                              size="small"
                              variant={diff === 0 ? 'filled' : 'outlined'}
                            />
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            size="small"
                            value={l.donGia}
                            onChange={(e) => updateLine(idx, { donGia: Number(e.target.value) || 0 })}
                            sx={{ width: 120 }}
                            inputProps={{ min: 0 }}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <Button variant="contained" onClick={handleSubmit} disabled={createReceipt.isLoading}>
                Xác nhận nhập kho
              </Button>
            </>
          )}
          {feedback && <Alert severity="info">{feedback}</Alert>}
        </Stack>
      </Paper>
    </MainLayout>
  );
};

export default Receipts;
