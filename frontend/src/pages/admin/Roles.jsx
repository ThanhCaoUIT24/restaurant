import React, { useState } from 'react';
import MainLayout from '../../layouts/MainLayout';
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Alert,
  Box,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Divider,
  Card,
  CardContent,
} from '@mui/material';
import { Add, Edit, Delete, Security, People } from '@mui/icons-material';
import {
  useRoles,
  usePermissions,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
} from '../../hooks/useAdmin';
import PermissionGate from '../../components/PermissionGate';
import { PERMISSIONS } from '../../utils/permissions';

const Roles = () => {
  const { data, isLoading, refetch } = useRoles();
  const { data: permissionsData } = usePermissions();
  const roles = data?.items || [];
  const permissions = permissionsData?.items || [];

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [form, setForm] = useState({ ten: '', moTa: '', quyenIds: [] });
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const createRole = useCreateRole();
  const updateRole = useUpdateRole();
  const deleteRole = useDeleteRole();

  const handleOpenDialog = (role = null) => {
    if (role) {
      setEditingRole(role);
      setForm({
        ten: role.ten,
        moTa: role.moTa || '',
        quyenIds: role.quyen?.map((q) => q.id) || [],
      });
    } else {
      setEditingRole(null);
      setForm({ ten: '', moTa: '', quyenIds: [] });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingRole(null);
    setForm({ ten: '', moTa: '', quyenIds: [] });
  };

  const handleTogglePermission = (permissionId) => {
    setForm((prev) => ({
      ...prev,
      quyenIds: prev.quyenIds.includes(permissionId)
        ? prev.quyenIds.filter((id) => id !== permissionId)
        : [...prev.quyenIds, permissionId],
    }));
  };

  const handleSubmit = async () => {
    try {
      if (editingRole) {
        await updateRole.mutateAsync({ id: editingRole.id, payload: form });
        setFeedback({ 
          type: 'success', 
          message: 'Cập nhật vai trò thành công! Quyền của nhân viên thuộc vai trò này đã được cập nhật.' 
        });
      } else {
        await createRole.mutateAsync(form);
        setFeedback({ type: 'success', message: 'Tạo vai trò thành công!' });
      }
      handleCloseDialog();
      refetch();
    } catch (err) {
      setFeedback({ type: 'error', message: err?.response?.data?.message || 'Có lỗi xảy ra' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa vai trò này?')) return;
    try {
      await deleteRole.mutateAsync(id);
      setFeedback({ type: 'success', message: 'Xóa thành công!' });
      refetch();
    } catch (err) {
      setFeedback({ type: 'error', message: err?.response?.data?.message || 'Không thể xóa' });
    }
  };

  return (
    <MainLayout title="Quản lý Vai trò & Quyền">
      <Stack spacing={2}>
        {feedback.message && (
          <Alert severity={feedback.type} onClose={() => setFeedback({ type: '', message: '' })}>
            {feedback.message}
          </Alert>
        )}

        <Paper sx={{ p: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
            <Typography variant="h6">
              <Security sx={{ mr: 1, verticalAlign: 'middle' }} />
              Danh sách vai trò
            </Typography>
            <PermissionGate permission={PERMISSIONS.ACCOUNT_CREATE}>
              <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>
                Thêm vai trò
              </Button>
            </PermissionGate>
          </Stack>
        </Paper>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} flexWrap="wrap">
          {isLoading ? (
            <Typography>Đang tải...</Typography>
          ) : roles.length === 0 ? (
            <Typography color="text.secondary">Chưa có vai trò nào</Typography>
          ) : (
            roles.map((role) => (
              <Card key={role.id} sx={{ minWidth: 300, flex: '1 1 300px', maxWidth: 400 }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography variant="h6">{role.ten}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {role.moTa || 'Không có mô tả'}
                      </Typography>
                      <Chip
                        icon={<People />}
                        label={`${role.soNhanVien || 0} nhân viên`}
                        size="small"
                        color={role.soNhanVien > 0 ? 'primary' : 'default'}
                        sx={{ mb: 1 }}
                      />
                    </Box>
                    <Stack direction="row">
                      <PermissionGate permission={PERMISSIONS.ACCOUNT_MANAGE}>
                        <IconButton size="small" onClick={() => handleOpenDialog(role)}>
                          <Edit />
                        </IconButton>
                      </PermissionGate>
                      <PermissionGate permission={PERMISSIONS.ACCOUNT_DELETE}>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(role.id)}
                          disabled={role.soNhanVien > 0}
                        >
                          <Delete />
                        </IconButton>
                      </PermissionGate>
                    </Stack>
                  </Stack>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="caption" color="text.secondary">Quyền:</Typography>
                  <Box sx={{ mt: 0.5 }}>
                    {role.quyen?.length > 0 ? (
                      role.quyen.map((q) => (
                        <Chip key={q.id} label={q.ma} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">Không có quyền</Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            ))
          )}
        </Stack>
      </Stack>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingRole ? 'Sửa vai trò' : 'Tạo vai trò mới'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Tên vai trò"
              value={form.ten}
              onChange={(e) => setForm({ ...form, ten: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Mô tả"
              value={form.moTa}
              onChange={(e) => setForm({ ...form, moTa: e.target.value })}
              fullWidth
              multiline
              rows={2}
            />
            <Box>
              <Typography variant="subtitle2" gutterBottom>Phân quyền:</Typography>
              <FormGroup>
                {permissions.map((perm) => (
                  <FormControlLabel
                    key={perm.id}
                    control={
                      <Checkbox
                        checked={form.quyenIds.includes(perm.id)}
                        onChange={() => handleTogglePermission(perm.id)}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2">{perm.ma}</Typography>
                        <Typography variant="caption" color="text.secondary">{perm.moTa}</Typography>
                      </Box>
                    }
                  />
                ))}
              </FormGroup>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!form.ten || createRole.isLoading || updateRole.isLoading}
          >
            {editingRole ? 'Cập nhật' : 'Tạo mới'}
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
};

export default Roles;
