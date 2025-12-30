import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import {
  Alert,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
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

const PO_STATUS_LABEL = {
  MOITAO: 'Mới tạo',
  DAGUI: 'Chờ duyệt',
  DAHUY: 'Đã hủy',
  DANHANMOTPHAN: 'Đã nhận một phần',
  DANHANDU: 'Đã nhận đủ',
  DADUYET: 'Đã duyệt',
};

const Receipts = () => {
  const { data: pos = [] } = usePOs();
  const [searchParams] = useSearchParams();
  const [selectedPO, setSelectedPO] = useState('');
  const [lines, setLines] = useState([]);
  const [feedback, setFeedback] = useState('');
  const createReceipt = useCreateReceipt();

  const po = useMemo(() => pos.find((p) => p.id === selectedPO), [pos, selectedPO]);

  // Auto-select from URL query param
  useEffect(() => {
    const poId = searchParams.get('poId');
    if (poId && pos.length > 0 && !selectedPO) {
      handleSelect(poId);
    }
  }, [searchParams, pos]);

  const handleSelect = (id) => {
    setSelectedPO(id);
    const found = pos.find((p) => p.id === id);
    if (found) {
      setLines(
        (found.chiTiet || []).map((l) => ({
          nguyenVatLieuId: l.nguyenVatLieuId,
          soLuongDat: Number(l.soLuong) || 0, // QĐ-RECEIVE: Số lượng đặt từ Đơn hàng
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

  // Confirmation Dialog
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [discrepancies, setDiscrepancies] = useState([]);

  const handleSubmit = () => {
    if (!po) return;

    // Check for discrepancies
    const diffs = lines.filter(l => l.soLuong !== l.soLuongDat);
    if (diffs.length > 0) {
      setDiscrepancies(diffs);
      setConfirmOpen(true);
      return;
    }

    submitReceipt();
  };

  const submitReceipt = () => {
    setFeedback('');
    createReceipt
      .mutateAsync({ donMuaHangId: po.id, items: lines })
      .then(() => {
        setFeedback('Đã tạo phiếu nhập');
        setLines([]);
        setSelectedPO('');
        setConfirmOpen(false);
      })
      .catch((err) => setFeedback(err?.response?.data?.message || 'Không thể tạo phiếu nhập'));
  };

  return (
    <MainLayout title="Nhập kho">
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6">Nhận hàng từ Đơn mua hàng</Typography>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField select label="Chọn Đơn hàng" value={selectedPO} onChange={(e) => handleSelect(e.target.value)} fullWidth>
            {pos.filter(p => p.trangThai === 'DADUYET').map((p) => (
              <MenuItem key={p.id} value={p.id}>
                #{p.id.slice(0, 8)} - {p.nhaCungCap?.ten || 'Chưa có NCC'}
              </MenuItem>
            ))}
          </TextField>
          {po && (
            <>
              <Typography variant="body2" color="text.secondary">
                Trạng thái: {PO_STATUS_LABEL[po.trangThai] || po.trangThai}
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

        {/* Mismatch Confirmation Dialog */}
        <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
          <DialogTitle>⚠️ Xác nhận chênh lệch</DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              Các mặt hàng sau có số lượng thực tế <b>KHÁC</b> so với đơn đặt hàng:
            </DialogContentText>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Mặt hàng</TableCell>
                  <TableCell align="center">Đặt</TableCell>
                  <TableCell align="center">Nhận</TableCell>
                  <TableCell align="center">Lệch</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {discrepancies.map((d, i) => {
                  const diff = d.soLuong - d.soLuongDat;
                  return (
                    <TableRow key={i}>
                      <TableCell>{d.name}</TableCell>
                      <TableCell align="center">{d.soLuongDat}</TableCell>
                      <TableCell align="center"><b>{d.soLuong}</b></TableCell>
                      <TableCell align="center" sx={{ color: diff > 0 ? 'info.main' : 'error.main' }}>
                        {diff > 0 ? `+${diff}` : diff}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <DialogContentText sx={{ mt: 2 }}>
              Bạn có chắc chắn muốn nhập kho với số lượng này?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmOpen(false)} color="inherit">Kiểm tra lại</Button>
            <Button onClick={submitReceipt} variant="contained" color="primary">
              Vẫn nhập kho
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </MainLayout>
  );
};

export default Receipts;
