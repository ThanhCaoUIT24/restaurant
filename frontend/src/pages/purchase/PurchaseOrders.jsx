import React, { useMemo, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
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
import { Add, Delete, Check, Send } from '@mui/icons-material';
import { useMaterials } from '../../hooks/useInventory';
import { usePOs, useCreatePO, useUpdatePOStatus, useSuppliers } from '../../hooks/usePurchase';
import { usePermissions } from '../../hooks/usePermissions';

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

const PO_STATUS_LABEL = {
  MOITAO: 'Mới tạo',
  DAGUI: 'Chờ duyệt',
  DADUYET: 'Đã duyệt',
  DAHUY: 'Đã hủy',
  DANHANMOTPHAN: 'Đã nhận một phần',
  DANHANDU: 'Đã nhận đủ',
};

const PurchaseOrders = () => {
  const { data: pos = [], isLoading, refetch } = usePOs();
  const { data: materials = [] } = useMaterials();
  const { data: suppliers = [] } = useSuppliers();
  const createPO = useCreatePO();
  const updateStatus = useUpdatePOStatus();
  const { hasPermission } = usePermissions();

  const [lines, setLines] = useState([{ nguyenVatLieuId: '', soLuong: 0, donGia: 0, nhaCungCapId: '' }]);
  const [feedback, setFeedback] = useState('');
  const [selectedPO, setSelectedPO] = useState(null);

  // Checks permissions
  const canCreate = hasPermission('PO_CREATE'); // ThuKho
  const canApprove = hasPermission('PO_APPROVE'); // Manager/Admin

  const location = useLocation();

  useEffect(() => {
    if (location.state?.prefillItems?.length > 0) {
      const prefillSupplierId = location.state.supplierId || '';
      const newLines = location.state.prefillItems.map((item) => {
        // Find material to get default supplier if not passed
        const mat = materials.find(m => m.id === item.id);
        return {
          nguyenVatLieuId: item.id,
          soLuong: item.shortfall > 0 ? item.shortfall : 1,
          donGia: 0,
          nhaCungCapId: prefillSupplierId || mat?.nhaCungCapId || '',
        };
      });
      setLines(newLines);

      // Clear state so it doesn't persist on refresh/navigation back
      window.history.replaceState({}, document.title);
    }
  }, [location.state, materials]);

  const pendingPOs = useMemo(() => pos || [], [pos]);

  const addLine = () => setLines((prev) => [...prev, { nguyenVatLieuId: '', soLuong: 0, donGia: 0, nhaCungCapId: '' }]);
  const updateLine = (idx, patch) => setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
  const removeLine = (idx) => setLines((prev) => prev.filter((_, i) => i !== idx));

  const handleCreate = async () => {
    setFeedback('');
    const validLines = lines.filter((l) => l.nguyenVatLieuId && l.nhaCungCapId && Number(l.soLuong) > 0);
    if (!validLines.length) {
      setFeedback('Thêm ít nhất một dòng có đủ: Nguyên liệu, Nhà cung cấp, Số lượng');
      return;
    }

    // Group by supplier
    const groups = {};
    validLines.forEach((line) => {
      if (!groups[line.nhaCungCapId]) {
        groups[line.nhaCungCapId] = [];
      }
      groups[line.nhaCungCapId].push(line);
    });

    const supplierIds = Object.keys(groups);
    let successCount = 0;
    let errorMsg = '';

    for (const suppId of supplierIds) {
      const items = groups[suppId].map(l => ({
        nguyenVatLieuId: l.nguyenVatLieuId,
        soLuong: l.soLuong,
        donGia: l.donGia,
      }));
      try {
        await createPO.mutateAsync({ nhaCungCapId: suppId, items });
        successCount++;
      } catch (err) {
        errorMsg += `${err?.response?.data?.message || 'Lỗi'}; `;
      }
    }

    if (successCount > 0) {
      setFeedback(`Đã tạo ${successCount} đơn mua hàng!`);
      setLines([{ nguyenVatLieuId: '', soLuong: 0, donGia: 0, nhaCungCapId: '' }]);
      refetch();
    }
    if (errorMsg) {
      setFeedback((prev) => prev + ' ' + errorMsg);
    }
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

  const getStatusLabel = (status) => PO_STATUS_LABEL[status] || status;

  return (
    <MainLayout title="Đơn mua hàng">
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Tạo đơn hàng mới</Typography>
            {canCreate ? (
              <Stack spacing={2} sx={{ mt: 1 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Nguyên liệu</TableCell>
                      <TableCell>Nhà cung cấp</TableCell>
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
                            onChange={(e) => {
                              const matId = e.target.value;
                              const mat = materials.find(m => m.id === matId);
                              updateLine(idx, {
                                nguyenVatLieuId: matId,
                                nhaCungCapId: mat?.nhaCungCapId || l.nhaCungCapId,
                              });
                            }}
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
                            select
                            fullWidth
                            value={l.nhaCungCapId}
                            onChange={(e) => updateLine(idx, { nhaCungCapId: e.target.value })}
                          >
                            {suppliers.map((s) => (
                              <MenuItem key={s.id} value={s.id}>
                                {s.ten}
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
                  Lưu đơn hàng
                </Button>
                {feedback && <Alert severity="info">{feedback}</Alert>}
              </Stack>
            ) : (
              <Alert severity="warning" sx={{ mt: 2 }}>
                Bạn không có quyền tạo đơn mua hàng.
              </Alert>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Danh sách đơn mua hàng</Typography>
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
                      primary={`#${shortId(po.id)} - ${po.nhaCungCap?.ten || ''}`}
                      secondary={`Ngày: ${formatDateTime(po.createdAt)} | ${getStatusLabel(po.trangThai)} | Tổng: ${formatMoney(calcTotal(po))} đ`}
                    />
                    <Stack direction="row" spacing={1}>
                      {/* Nút Gửi duyệt: Dành cho người tạo (ThuKho) khi đơn Mới tạo */}
                      {canCreate && po.trangThai === 'MOITAO' && (
                        <Button
                          size="small"
                          startIcon={<Send />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatus(po.id, 'DAGUI');
                          }}
                        >
                          Gửi duyệt
                        </Button>
                      )}

                      {/* Nút Duyệt: Dành cho Manager khi đơn Chờ duyệt */}
                      {canApprove && po.trangThai === 'DAGUI' && (
                        <Button
                          size="small"
                          color="success"
                          startIcon={<Check />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatus(po.id, 'DADUYET');
                          }}
                        >
                          Duyệt
                        </Button>
                      )}

                      {/* Nút Hủy: Chỉ hiện khi đơn chưa duyệt/chưa hoàn tất/chưa hủy */}
                      {(canCreate || canApprove) && !['DAHUY', 'DANHANDU', 'DADUYET'].includes(po.trangThai) && (
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
                      )}
                    </Stack>
                  </ListItem>
                ))}
                {!pendingPOs.length && (
                  <Box sx={{ p: 2 }}>
                    <Typography color="text.secondary">Chưa có đơn hàng nào.</Typography>
                  </Box>
                )}
              </List>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={!!selectedPO} onClose={closeDetail} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedPO ? `Chi tiết đơn #${shortId(selectedPO.id)} - ${selectedPO.nhaCungCap?.ten || ''}` : 'Chi tiết đơn hàng'}
        </DialogTitle>
        <DialogContent dividers>
          {selectedPO && (
            <Stack spacing={2}>
              <Typography variant="body2" color="text.secondary">
                Ngày tạo: {formatDateTime(selectedPO.createdAt)} | Trạng thái: {getStatusLabel(selectedPO.trangThai)}
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
                        <Typography color="text.secondary">Đơn hàng chưa có dòng nguyên liệu.</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <Box>
                <Typography fontWeight={600}>
                  Tổng cộng: {formatMoney(calcTotal(selectedPO))} đ
                </Typography>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDetail}>Đóng</Button>
          {selectedPO && (
            <>
              {canCreate && selectedPO.trangThai === 'MOITAO' && (
                <Button
                  startIcon={<Send />}
                  onClick={() => handleStatus(selectedPO.id, 'DAGUI')}
                >
                  Gửi duyệt
                </Button>
              )}
              {canApprove && selectedPO.trangThai === 'DAGUI' && (
                <Button
                  color="success"
                  startIcon={<Check />}
                  onClick={() => handleStatus(selectedPO.id, 'DADUYET')}
                >
                  Duyệt đơn
                </Button>
              )}
              {(canCreate || canApprove) && !['DAHUY', 'DANHANDU'].includes(selectedPO.trangThai) && (
                <Button color="error" onClick={() => handleStatus(selectedPO.id, 'DAHUY')}>
                  Hủy đơn
                </Button>
              )}
            </>
          )}
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
};

export default PurchaseOrders;
