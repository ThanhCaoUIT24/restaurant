import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  ListItemIcon,
  Button,
  Box,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from '@mui/material';
import { useInventoryAlerts } from '../../hooks/useInventory';
import { AddShoppingCart } from '@mui/icons-material';

const Alerts = () => {
  const { data = [], isLoading } = useInventoryAlerts();
  const [selected, setSelected] = useState([]);
  const [supplierDialog, setSupplierDialog] = useState({ open: false, groups: {} });
  const navigate = useNavigate();

  const handleToggle = (id) => () => {
    const currentIndex = selected.indexOf(id);
    const newChecked = [...selected];

    if (currentIndex === -1) {
      newChecked.push(id);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setSelected(newChecked);
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelected(data.map(item => item.id));
    } else {
      setSelected([]);
    }
  };

  const handleCreatePO = () => {
    if (selected.length === 0) return;

    // Filter selected items
    const selectedItems = data.filter((item) => selected.includes(item.id));

    // Group by supplier
    const groups = {};
    const noSupplier = [];

    selectedItems.forEach(item => {
      if (item.nhaCungCapId) {
        if (!groups[item.nhaCungCapId]) {
          groups[item.nhaCungCapId] = {
            supplierName: item.nhaCungCap?.ten || 'Nhà cung cấp ẩn',
            items: []
          };
        }
        groups[item.nhaCungCapId].items.push(item);
      } else {
        noSupplier.push(item);
      }
    });

    const supplierIds = Object.keys(groups);

    // Case 1: All items have same supplier
    if (supplierIds.length === 1 && noSupplier.length === 0) {
      const supplierId = supplierIds[0];
      navigateToPO(supplierId, groups[supplierId].items);
      return;
    }

    // Case 2: Only items with no supplier
    if (supplierIds.length === 0 && noSupplier.length > 0) {
      navigateToPO(null, noSupplier);
      return;
    }

    // Case 3: Multiple suppliers or mixed
    setSupplierDialog({
      open: true,
      groups: groups,
      noSupplier: noSupplier
    });
  };

  const navigateToPO = (supplierId, items) => {
    const prefillItems = items.map((item) => ({
      id: item.id,
      shortfall: Math.max(0, item.mucTonToiThieu - item.soLuongTon),
    }));
    navigate('/purchase/orders', { state: { prefillItems, supplierId } });
    setSupplierDialog({ open: false, groups: {} });
  };

  return (
    <MainLayout title="Cảnh báo tồn kho">
      <Paper sx={{ p: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Danh sách cần nhập hàng</Typography>
          <Button
            variant="contained"
            startIcon={<AddShoppingCart />}
            disabled={selected.length === 0}
            onClick={handleCreatePO}
          >
            Tạo đơn mua hàng ({selected.length})
          </Button>
        </Stack>

        {isLoading && <Typography>Đang tải...</Typography>}

        {!isLoading && data.length > 0 && (
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', pl: 2 }}>
            <Checkbox
              edge="start"
              checked={data.length > 0 && selected.length === data.length}
              indeterminate={selected.length > 0 && selected.length < data.length}
              onChange={handleSelectAll}
            />
            <Typography variant="body2" sx={{ ml: 2 }}>Chọn tất cả</Typography>
          </Box>
        )}

        <List>
          {!isLoading && data.length === 0 && <Typography align="center">Kho hàng ổn định, không có cảnh báo.</Typography>}
          {data.map((a) => {
            const labelId = `checkbox-list-label-${a.id}`;
            const isSelected = selected.indexOf(a.id) !== -1;

            return (
              <ListItem
                key={a.id}
                divider
                button
                onClick={handleToggle(a.id)}
              >
                <ListItemIcon>
                  <Checkbox
                    edge="start"
                    checked={isSelected}
                    tabIndex={-1}
                    disableRipple
                    inputProps={{ 'aria-labelledby': labelId }}
                  />
                </ListItemIcon>
                <ListItemText
                  id={labelId}
                  primary={
                    <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {a.ten}
                      {a.nhaCungCap?.ten && (
                        <Chip size="small" label={a.nhaCungCap.ten} color="default" variant="outlined" sx={{ height: 20 }} />
                      )}
                    </Box>
                  }
                  secondary={
                    <Typography variant="body2" component="span" color="text.secondary">
                      Tồn: <Typography component="span" fontWeight="bold" color="error.main">{a.soLuongTon}</Typography>
                      {' / '}
                      Ngưỡng: {a.mucTonToiThieu}
                      {' -> '}
                      <Typography component="span" color="primary.main">
                        Cần nhập: {Math.max(0, a.mucTonToiThieu - a.soLuongTon)}
                      </Typography>
                    </Typography>
                  }
                />
              </ListItem>
            );
          })}
        </List>

        {/* Multi-supplier Dialog */}
        <Dialog open={supplierDialog.open} onClose={() => setSupplierDialog({ open: false, groups: {} })} maxWidth="sm" fullWidth>
          <DialogTitle>Chọn Nhà Cung Cấp</DialogTitle>
          <DialogContent dividers>
            <Typography gutterBottom>
              Các món bạn chọn thuộc về nhiều nhà cung cấp khác nhau. Vui lòng chọn nhóm để tạo đơn:
            </Typography>
            <List dense>
              {Object.keys(supplierDialog.groups || {}).map(supplierId => {
                const group = supplierDialog.groups[supplierId];
                return (
                  <ListItem key={supplierId} disablePadding sx={{ mb: 1 }}>
                    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, border: '1px solid #eee', borderRadius: 1 }}>
                      <Box>
                        <Typography variant="subtitle2">{group.supplierName}</Typography>
                        <Typography variant="caption" color="text.secondary">{group.items.length} mặt hàng</Typography>
                      </Box>
                      <Button variant="outlined" size="small" onClick={() => navigateToPO(supplierId, group.items)}>
                        Tạo đơn
                      </Button>
                    </Box>
                  </ListItem>
                );
              })}
              {supplierDialog.noSupplier?.length > 0 && (
                <ListItem disablePadding sx={{ mb: 1 }}>
                  <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, border: '1px solid #eee', borderRadius: 1 }}>
                    <Box>
                      <Typography variant="subtitle2" color="error">Chưa phân loại NCC</Typography>
                      <Typography variant="caption" color="text.secondary">{supplierDialog.noSupplier.length} mặt hàng</Typography>
                    </Box>
                    <Button variant="outlined" size="small" color="error" onClick={() => navigateToPO(null, supplierDialog.noSupplier)}>
                      Tạo đơn
                    </Button>
                  </Box>
                </ListItem>
              )}
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSupplierDialog({ open: false, groups: {} })}>Đóng</Button>
          </DialogActions>
        </Dialog>

      </Paper>
    </MainLayout>
  );
};

export default Alerts;
