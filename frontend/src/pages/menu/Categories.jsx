import React, { useState } from 'react';
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
  IconButton,
  Typography,
  Chip,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Add, Edit, Delete } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import {
  useMenuCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '../../hooks/useMenu';

const Categories = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form, setForm] = useState({ ten: '', moTa: '' });

  const { data: categories = [], isLoading } = useMenuCategories();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const openAddDialog = () => {
    setEditingCategory(null);
    setForm({ ten: '', moTa: '' });
    setDialogOpen(true);
  };

  const openEditDialog = (category) => {
    setEditingCategory(category);
    setForm({ ten: category.ten, moTa: category.moTa || '' });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.ten.trim()) {
      enqueueSnackbar('Vui lòng nhập tên danh mục', { variant: 'warning' });
      return;
    }

    try {
      if (editingCategory) {
        await updateMutation.mutateAsync({
          id: editingCategory.id,
          ten: form.ten.trim(),
          moTa: form.moTa.trim() || null,
        });
        enqueueSnackbar('Cập nhật danh mục thành công', { variant: 'success' });
      } else {
        await createMutation.mutateAsync({
          ten: form.ten.trim(),
          moTa: form.moTa.trim() || null,
        });
        enqueueSnackbar('Thêm danh mục thành công', { variant: 'success' });
      }
      setDialogOpen(false);
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Có lỗi xảy ra', { variant: 'error' });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(confirmDelete.id);
      enqueueSnackbar('Xóa danh mục thành công', { variant: 'success' });
      setConfirmDelete(null);
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Có lỗi xảy ra', { variant: 'error' });
    }
  };

  const columns = [
    { field: 'ten', headerName: 'Tên danh mục', flex: 1 },
    { field: 'moTa', headerName: 'Mô tả', flex: 1.5, valueGetter: (value) => value || '—' },
    {
      field: 'soMon',
      headerName: 'Số món',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value || 0}
          size="small"
          color={params.value > 0 ? 'primary' : 'default'}
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Thao tác',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton size="small" onClick={() => openEditDialog(params.row)} title="Sửa">
            <Edit fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => setConfirmDelete(params.row)}
            title="Xóa"
            color="error"
            disabled={params.row.soMon > 0}
          >
            <Delete fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <MainLayout title="Danh mục món">
      <Paper sx={{ p: 2 }}>
        {/* Toolbar */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button variant="contained" startIcon={<Add />} onClick={openAddDialog}>
            Thêm danh mục
          </Button>
        </Box>

        {/* Data Grid */}
        <DataGrid
          rows={categories}
          columns={columns}
          loading={isLoading}
          autoHeight
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          disableRowSelectionOnClick
        />
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingCategory ? 'Sửa danh mục' : 'Thêm danh mục'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Tên danh mục *"
              value={form.ten}
              onChange={(e) => setForm((p) => ({ ...p, ten: e.target.value }))}
              fullWidth
              autoFocus
            />
            <TextField
              label="Mô tả"
              value={form.moTa}
              onChange={(e) => setForm((p) => ({ ...p, moTa: e.target.value }))}
              fullWidth
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Hủy</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {editingCategory ? 'Cập nhật' : 'Thêm'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc muốn xóa danh mục <strong>{confirmDelete?.ten}</strong>?
          </Typography>
          {confirmDelete?.soMon > 0 && (
            <Typography color="error" sx={{ mt: 1 }}>
              Danh mục này đang có {confirmDelete.soMon} món, không thể xóa.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(null)}>Hủy</Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleDelete}
            disabled={confirmDelete?.soMon > 0}
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
};

export default Categories;
