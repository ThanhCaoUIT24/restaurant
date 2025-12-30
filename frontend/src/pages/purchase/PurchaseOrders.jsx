import React, { useMemo, useState } from 'react';
import MainLayout from '../../layouts/MainLayout';
import {
  Alert,
  Box,
  Button,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { useMaterials } from '../../hooks/useInventory';
import { usePOs, useCreatePO, useUpdatePOStatus, useSuppliers } from '../../hooks/usePurchase';

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

const shortId = (id) => (id ? String(id).slice(0, 8) : '');

const calcTotal = (po) => {
  const lines = po?.chiTiet || [];
  return lines.reduce((sum, l) => sum + Number(l.soLuong || 0) * Number(l.donGia || 0), 0);
};

const PurchaseOrders = () => {
  const { data: pos = [], isLoading, refetch } = usePOs();
  const { data: materials = [] } = useMaterials();
  const { data: suppliers = [] } = useSuppliers();
  const createPO = useCreatePO();
  const updateStatus = useUpdatePOStatus();
  const [supplierId, setSupplierId] = useState('');
  const [lines, setLines] = useState([{ nguyenVatLieuId: '', soLuong: 0, donGia: 0 }]);
  const [feedback, setFeedback] = useState('');
  const [selectedPO, setSelectedPO] = useState(null);

  const pendingPOs = useMemo(() => pos || [], [pos]);

  const addLine = () => setLines((prev) => [...prev, { nguyenVatLieuId: '', soLuong: 0, donGia: 0 }]);
  const updateLine = (idx, patch) => setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
  const removeLine = (idx) => setLines((prev) => prev.filter((_, i) => i !== idx));

  const handleCreate = () => {
    setFeedback('');
    const items = lines.filter((l) => l.nguyenVatLieuId && Number(l.soLuong) > 0);
    if (!supplierId || !items.length) {
      setFeedback('Chọn nhà cung cấp và thêm ít nhất một dòng');
      return;
    }
    createPO
      .mutateAsync({ nhaCungCapId: supplierId, items })
      .then(() => {
        setFeedback('Đã tạo PO');
        setLines([{ nguyenVatLieuId: '', soLuong: 0, donGia: 0 }]);
        refetch();
      })
      .catch((err) => setFeedback(err?.response?.data?.message || 'Không thể tạo PO'));
  };

  const handleStatus = (id, status) => {
    setFeedback('');
    updateStatus
      .mutateAsync({ id, status })
      .then(() => {
        refetch();
        if (selectedPO?.id === id) {
          setSelectedPO((prev) => (prev ? { ...prev, trangThai: status } : prev));
        }
      })
      .catch((err) => setFeedback(err?.response?.data?.message || 'Cập nhật trạng thái thất bại'));
  };

  const closeDetail = () => setSelectedPO(null);

  return (
    <MainLayout title="Đơn mua hàng">
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Tạo PO mới</Typography>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                select
                label="Nhà cung cấp"
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                fullWidth
              >
                {suppliers.map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.ten}
                  </MenuItem>
                ))}
              </TextField>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Nguyên liệu</TableCell>
                    <TableCell>Số lượng</TableCell>
                    <TableCell>Đơn giá</TableCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {lines.map((l, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <TextField
                          select
                          fullWidth
                          value={l.nguyenVatLieuId}
                          onChange={(e) => updateLine(idx, { nguyenVatLieuId: e.target.value })}
                        >
                          {materials.map((m) => (
                            <MenuItem key={m.id} value={m.id}>
                              {m.ten}
                            </MenuItem>
                          ))}
                        </TextField>
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          value={l.soLuong}
                          onChange={(e) => updateLine(idx, { soLuong: Number(e.target.value) || 0 })}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          value={l.donGia}
                          onChange={(e) => updateLine(idx, { donGia: Number(e.target.value) || 0 })}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton onClick={() => removeLine(idx)}>
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Button variant="outlined" onClick={addLine} startIcon={<Add />}>
                Thêm dòng
              </Button>
              <Button variant="contained" onClick={handleCreate} disabled={createPO.isLoading}>
                Lưu PO
              </Button>
              {feedback && <Alert severity="info">{feedback}</Alert>}
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Danh sách PO</Typography>
            {isLoading && <Typography>Đang tải...</Typography>}
            <Box sx={{ maxHeight: 420, overflowY: 'auto' }}>
              <List disablePadding>
                {pendingPOs.map((po) => (
                  <ListItem
                    key={po.id}
                    divider
                    button
                    onClick={() => setSelectedPO(po)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <ListItemText
                      primary={`PO ${shortId(po.id)} - ${po.nhaCungCap?.ten || ''}`}
                      secondary={`Ngày: ${formatDateTime(po.createdAt)} | Trạng thái: ${po.trangThai} | Tổng: ${formatMoney(calcTotal(po))} đ`}
                    />
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatus(po.id, 'DAGUI');
                        }}
                      >
                        Gửi
                      </Button>
                      <Button
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatus(po.id, 'DAHUY');
                        }}
                        color="error"
                      >
                        Hủy
                      </Button>
                    </Stack>
                  </ListItem>
                ))}
                {!pendingPOs.length && (
                  <Box sx={{ p: 2 }}>
                    <Typography color="text.secondary">Chưa có PO.</Typography>
                  </Box>
                )}
              </List>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={!!selectedPO} onClose={closeDetail} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedPO ? `Chi tiết PO ${shortId(selectedPO.id)} - ${selectedPO.nhaCungCap?.ten || ''}` : 'Chi tiết PO'}
        </DialogTitle>
        <DialogContent dividers>
          {selectedPO && (
            <Stack spacing={2}>
              <Typography variant="body2" color="text.secondary">
                Ngày tạo: {formatDateTime(selectedPO.createdAt)} | Trạng thái: {selectedPO.trangThai}
              </Typography>
              <Divider />
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Nguyên liệu</TableCell>
                    <TableCell>Số lượng</TableCell>
                    <TableCell>Đơn giá</TableCell>
                    <TableCell align="right">Thành tiền</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(selectedPO.chiTiet || []).map((l) => (
                    <TableRow key={l.id}>
                      <TableCell>{l.nguyenVatLieu?.ten || l.nguyenVatLieuId}</TableCell>
                      <TableCell>{Number(l.soLuong || 0)}</TableCell>
                      <TableCell>{formatMoney(l.donGia)} đ</TableCell>
                      <TableCell align="right">{formatMoney(Number(l.soLuong || 0) * Number(l.donGia || 0))} đ</TableCell>
                    </TableRow>
                  ))}
                  {(!selectedPO.chiTiet || selectedPO.chiTiet.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={4}>
                        <Typography color="text.secondary">PO chưa có dòng nguyên liệu.</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <Box>
                <Typography fontWeight={600}>
                  Tổng PO: {formatMoney(calcTotal(selectedPO))} đ
                </Typography>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDetail}>Đóng</Button>
          {selectedPO && (
            <>
              <Button onClick={() => handleStatus(selectedPO.id, 'DAGUI')}>
                Gửi
              </Button>
              <Button color="error" onClick={() => handleStatus(selectedPO.id, 'DAHUY')}>
                Hủy
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
};

export default PurchaseOrders;
