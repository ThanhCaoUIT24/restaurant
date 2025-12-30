import React, { useState, useMemo } from 'react';
import MainLayout from '../../layouts/MainLayout';
import {
  Paper,
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  IconButton,
  Chip,
  Typography,
  Autocomplete,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Add, Edit, Delete, RestaurantMenu } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import {
  useMenuDishes,
  useMenuCategories,
  useCreateDish,
  useUpdateDish,
  useToggleDishStatus,
  useDeleteDish,
} from '../../hooks/useMenu';
import { useMaterials } from '../../hooks/useInventory';

const formatCurrency = (val) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

const Dishes = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [filterCategory, setFilterCategory] = useState('');
  const [searchText, setSearchText] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [recipeDialogOpen, setRecipeDialogOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [editingDish, setEditingDish] = useState(null);
  const [selectedDish, setSelectedDish] = useState(null);

  const [form, setForm] = useState({
    ten: '',
    moTa: '',
    giaBan: 0,
    danhMucId: '',
    tramCheBien: 'Bếp',
    trangThai: true,
    congThuc: [],
  });

  const { data: dishes = [], isLoading } = useMenuDishes({
    categoryId: filterCategory || undefined,
    q: searchText || undefined,
  });
  const { data: categories = [] } = useMenuCategories();
  const { data: materials = [] } = useMaterials();

  const createMutation = useCreateDish();
  const updateMutation = useUpdateDish();
  const toggleStatusMutation = useToggleDishStatus();
  const deleteMutation = useDeleteDish();

  const openAddDialog = () => {
    setEditingDish(null);
    setForm({
      ten: '',
      moTa: '',
      giaBan: 0,
      danhMucId: '',
      tramCheBien: 'Bếp',
      trangThai: true,
      congThuc: [],
    });
    setDialogOpen(true);
  };

  const openEditDialog = (dish) => {
    setEditingDish(dish);
    setForm({
      ten: dish.ten,
      moTa: dish.moTa || '',
      giaBan: dish.giaBan,
      danhMucId: dish.danhMuc?.id || '',
      tramCheBien: dish.tramCheBien || 'Bếp',
      trangThai: dish.trangThai,
      congThuc: dish.congThuc || [],
    });
    setDialogOpen(true);
  };

  const openRecipeDialog = (dish) => {
    setSelectedDish(dish);
    setForm((prev) => ({
      ...prev,
      congThuc: dish.congThuc || [],
    }));
    setRecipeDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.ten.trim()) {
      enqueueSnackbar('Vui lòng nhập tên món', { variant: 'warning' });
      return;
    }
    if (form.giaBan <= 0) {
      enqueueSnackbar('Giá bán phải lớn hơn 0', { variant: 'warning' });
      return;
    }

    try {
      const payload = {
        ten: form.ten.trim(),
        moTa: form.moTa.trim() || null,
        giaBan: Number(form.giaBan),
        danhMucId: form.danhMucId || null,
        tramCheBien: form.tramCheBien,
        trangThai: form.trangThai,
        congThuc: form.congThuc.map((ct) => ({
          nguyenVatLieuId: ct.nguyenVatLieuId,
          soLuong: Number(ct.soLuong),
        })),
      };

      if (editingDish) {
        await updateMutation.mutateAsync({ id: editingDish.id, ...payload });
        enqueueSnackbar('Cập nhật món ăn thành công', { variant: 'success' });
      } else {
        await createMutation.mutateAsync(payload);
        enqueueSnackbar('Thêm món ăn thành công', { variant: 'success' });
      }
      setDialogOpen(false);
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Có lỗi xảy ra', { variant: 'error' });
    }
  };

  const handleSaveRecipe = async () => {
    try {
      await updateMutation.mutateAsync({
        id: selectedDish.id,
        congThuc: form.congThuc.map((ct) => ({
          nguyenVatLieuId: ct.nguyenVatLieuId,
          soLuong: Number(ct.soLuong),
        })),
      });
      enqueueSnackbar('Cập nhật công thức thành công', { variant: 'success' });
      setRecipeDialogOpen(false);
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Có lỗi xảy ra', { variant: 'error' });
    }
  };

  const handleToggleStatus = async (dish) => {
    try {
      await toggleStatusMutation.mutateAsync({ id: dish.id, status: !dish.trangThai });
      enqueueSnackbar(
        dish.trangThai ? 'Đã tắt trạng thái món' : 'Đã bật trạng thái món',
        { variant: 'success' }
      );
    } catch (err) {
      enqueueSnackbar('Có lỗi xảy ra', { variant: 'error' });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(confirmDelete.id);
      enqueueSnackbar('Xóa món ăn thành công', { variant: 'success' });
      setConfirmDelete(null);
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Có lỗi xảy ra', { variant: 'error' });
    }
  };

  const addIngredient = () => {
    setForm((prev) => ({
      ...prev,
      congThuc: [...prev.congThuc, { nguyenVatLieuId: '', ten: '', soLuong: 1, donViTinh: '' }],
    }));
  };

  const updateIngredient = (index, field, value) => {
    setForm((prev) => {
      const newCongThuc = [...prev.congThuc];
      if (field === 'nguyenVatLieuId') {
        const mat = materials.find((m) => m.id === value);
        newCongThuc[index] = {
          ...newCongThuc[index],
          nguyenVatLieuId: value,
          ten: mat?.ten || '',
          donViTinh: mat?.donViTinh || '',
        };
      } else {
        newCongThuc[index] = { ...newCongThuc[index], [field]: value };
      }
      return { ...prev, congThuc: newCongThuc };
    });
  };

  const removeIngredient = (index) => {
    setForm((prev) => ({
      ...prev,
      congThuc: prev.congThuc.filter((_, i) => i !== index),
    }));
  };

  const columns = [
    { field: 'ten', headerName: 'Tên món', flex: 1 },
    {
      field: 'danhMuc',
      headerName: 'Danh mục',
      width: 150,
      valueGetter: (value) => value?.ten || '—',
    },
    {
      field: 'giaBan',
      headerName: 'Giá bán',
      width: 130,
      valueFormatter: (value) => formatCurrency(value),
    },
    {
      field: 'giaVon',
      headerName: 'Giá vốn',
      width: 130,
      valueFormatter: (value) => formatCurrency(value),
      description: 'Tự động tính từ công thức và giá nhập NVL',
    },
    { field: 'tramCheBien', headerName: 'Trạm chế biến', width: 120 },
    {
      field: 'trangThai',
      headerName: 'Trạng thái',
      width: 120,
      renderCell: (params) => (
        <Switch
          checked={params.value}
          onChange={() => handleToggleStatus(params.row)}
          size="small"
        />
      ),
    },
    {
      field: 'congThuc',
      headerName: 'Công thức',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value?.length || 0}
          size="small"
          color={params.value?.length > 0 ? 'success' : 'default'}
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Thao tác',
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton size="small" onClick={() => openRecipeDialog(params.row)} title="Công thức">
            <RestaurantMenu fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => openEditDialog(params.row)} title="Sửa">
            <Edit fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => setConfirmDelete(params.row)}
            title="Xóa"
            color="error"
          >
            <Delete fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <MainLayout title="Món ăn">
      <Paper sx={{ p: 2 }}>
        {/* Toolbar */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Tìm kiếm..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            sx={{ width: 200 }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Danh mục</InputLabel>
            <Select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              label="Danh mục"
            >
              <MenuItem value="">Tất cả</MenuItem>
              {categories.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.ten}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box sx={{ flexGrow: 1 }} />
          <Button variant="contained" startIcon={<Add />} onClick={openAddDialog}>
            Thêm món
          </Button>
        </Box>

        {/* Data Grid */}
        <DataGrid
          rows={dishes}
          columns={columns}
          loading={isLoading}
          autoHeight
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          disableRowSelectionOnClick
        />
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingDish ? 'Sửa món ăn' : 'Thêm món ăn'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Tên món *"
              value={form.ten}
              onChange={(e) => setForm((p) => ({ ...p, ten: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Mô tả"
              value={form.moTa}
              onChange={(e) => setForm((p) => ({ ...p, moTa: e.target.value }))}
              fullWidth
              multiline
              rows={2}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Giá bán (VND) *"
                type="number"
                value={form.giaBan}
                onChange={(e) => setForm((p) => ({ ...p, giaBan: e.target.value }))}
                sx={{ flex: 1 }}
              />
              <FormControl sx={{ flex: 1 }}>
                <InputLabel>Danh mục</InputLabel>
                <Select
                  value={form.danhMucId}
                  onChange={(e) => setForm((p) => ({ ...p, danhMucId: e.target.value }))}
                  label="Danh mục"
                >
                  <MenuItem value="">Không có</MenuItem>
                  {categories.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.ten}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <FormControl sx={{ flex: 1 }}>
                <InputLabel>Trạm chế biến</InputLabel>
                <Select
                  value={form.tramCheBien}
                  onChange={(e) => setForm((p) => ({ ...p, tramCheBien: e.target.value }))}
                  label="Trạm chế biến"
                >
                  <MenuItem value="Bếp">Bếp</MenuItem>
                  <MenuItem value="Bar">Bar</MenuItem>
                  <MenuItem value="Khác">Khác</MenuItem>
                </Select>
              </FormControl>
              <FormControlLabel
                control={
                  <Switch
                    checked={form.trangThai}
                    onChange={(e) => setForm((p) => ({ ...p, trangThai: e.target.checked }))}
                  />
                }
                label="Đang bán"
              />
            </Box>

            {/* Recipe section in dialog */}
            <Typography variant="subtitle1" sx={{ mt: 2 }}>
              Công thức (nguyên liệu)
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Nguyên liệu</TableCell>
                  <TableCell width={120}>Số lượng</TableCell>
                  <TableCell width={80}>Đơn vị</TableCell>
                  <TableCell width={100}>Giá nhập</TableCell>
                  <TableCell width={100}>Thành tiền</TableCell>
                  <TableCell width={60}></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {form.congThuc.map((ct, idx) => {
                  const mat = materials.find((m) => m.id === ct.nguyenVatLieuId);
                  const giaNhap = mat?.giaNhapGanNhat || ct.giaNhap || 0;
                  const thanhTien = Number(ct.soLuong) * Number(giaNhap);
                  return (
                    <TableRow key={idx}>
                      <TableCell>
                        <Autocomplete
                          size="small"
                          options={materials}
                          getOptionLabel={(opt) => opt.ten || ''}
                          value={mat || null}
                          onChange={(_, val) => updateIngredient(idx, 'nguyenVatLieuId', val?.id || '')}
                          renderInput={(params) => <TextField {...params} placeholder="Chọn..." />}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          value={ct.soLuong}
                          onChange={(e) => updateIngredient(idx, 'soLuong', e.target.value)}
                          fullWidth
                        />
                      </TableCell>
                      <TableCell>{ct.donViTinh || mat?.donViTinh || '—'}</TableCell>
                      <TableCell>{formatCurrency(giaNhap)}</TableCell>
                      <TableCell>{formatCurrency(thanhTien)}</TableCell>
                      <TableCell>
                        <IconButton size="small" onClick={() => removeIngredient(idx)} color="error">
                          <Delete fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {/* Total food cost */}
                {form.congThuc.length > 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="right"><strong>Tổng giá vốn:</strong></TableCell>
                    <TableCell>
                      <strong>
                        {formatCurrency(
                          form.congThuc.reduce((sum, ct) => {
                            const mat = materials.find((m) => m.id === ct.nguyenVatLieuId);
                            const giaNhap = mat?.giaNhapGanNhat || ct.giaNhap || 0;
                            return sum + Number(ct.soLuong) * Number(giaNhap);
                          }, 0)
                        )}
                      </strong>
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <Button size="small" onClick={addIngredient} sx={{ alignSelf: 'flex-start' }}>
              + Thêm nguyên liệu
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Hủy</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {editingDish ? 'Cập nhật' : 'Thêm'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Recipe Dialog */}
      <Dialog open={recipeDialogOpen} onClose={() => setRecipeDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Công thức: {selectedDish?.ten}</DialogTitle>
        <DialogContent>
          <Table size="small" sx={{ mt: 1 }}>
            <TableHead>
              <TableRow>
                <TableCell>Nguyên liệu</TableCell>
                <TableCell width={120}>Số lượng</TableCell>
                <TableCell width={80}>Đơn vị</TableCell>
                <TableCell width={100}>Giá nhập</TableCell>
                <TableCell width={100}>Thành tiền</TableCell>
                <TableCell width={60}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {form.congThuc.map((ct, idx) => {
                const mat = materials.find((m) => m.id === ct.nguyenVatLieuId);
                const giaNhap = mat?.giaNhapGanNhat || ct.giaNhap || 0;
                const thanhTien = Number(ct.soLuong) * Number(giaNhap);
                return (
                  <TableRow key={idx}>
                    <TableCell>
                      <Autocomplete
                        size="small"
                        options={materials}
                        getOptionLabel={(opt) => opt.ten || ''}
                        value={mat || null}
                        onChange={(_, val) => updateIngredient(idx, 'nguyenVatLieuId', val?.id || '')}
                        renderInput={(params) => <TextField {...params} placeholder="Chọn..." />}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        value={ct.soLuong}
                        onChange={(e) => updateIngredient(idx, 'soLuong', e.target.value)}
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>{ct.donViTinh || mat?.donViTinh || '—'}</TableCell>
                    <TableCell>{formatCurrency(giaNhap)}</TableCell>
                    <TableCell>{formatCurrency(thanhTien)}</TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => removeIngredient(idx)} color="error">
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
              {/* Total food cost */}
              {form.congThuc.length > 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="right"><strong>Tổng giá vốn:</strong></TableCell>
                  <TableCell>
                    <strong>
                      {formatCurrency(
                        form.congThuc.reduce((sum, ct) => {
                          const mat = materials.find((m) => m.id === ct.nguyenVatLieuId);
                          const giaNhap = mat?.giaNhapGanNhat || ct.giaNhap || 0;
                          return sum + Number(ct.soLuong) * Number(giaNhap);
                        }, 0)
                      )}
                    </strong>
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <Button size="small" onClick={addIngredient} sx={{ mt: 1 }}>
            + Thêm nguyên liệu
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRecipeDialogOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleSaveRecipe} disabled={updateMutation.isPending}>
            Lưu công thức
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc muốn xóa món <strong>{confirmDelete?.ten}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(null)}>Hủy</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
};

export default Dishes;
