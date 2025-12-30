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
  InputAdornment,
  MenuItem,
} from '@mui/material';
import { Add, Edit, Delete, Search, Key, Person } from '@mui/icons-material';
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useEmployeesWithoutAccount,
  useRoles,
} from '../../hooks/useAdmin';
import PermissionGate from '../../components/PermissionGate';
import { PERMISSIONS } from '../../utils/permissions';

const Users = () => {
  const [search, setSearch] = useState('');
  const { data, isLoading, refetch } = useUsers({ q: search });
  const users = data?.items || [];
  const { data: employeesData } = useEmployeesWithoutAccount();
  const { data: rolesData } = useRoles();
  const employees = employeesData?.items || [];
  const roles = rolesData?.items || [];

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [createNewEmployee, setCreateNewEmployee] = useState(false);
  const [form, setForm] = useState({
    username: '',
    password: '',
    nhanVienId: '',
    vaiTroId: '',
    hoTen: '',
    soDienThoai: '',
  });
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const handleOpenDialog = (user = null) => {
    if (user) {
      setEditingUser(user);
      setCreateNewEmployee(false);
      setForm({
        username: user.username,
        password: '',
        nhanVienId: user.nhanVienId,
        vaiTroId: user.vaiTro?.id || '',
        hoTen: user.hoTen || '',
        soDienThoai: user.soDienThoai || '',
      });
    } else {
      setEditingUser(null);
      setCreateNewEmployee(true);
      setForm({ username: '', password: '', nhanVienId: '', vaiTroId: '', hoTen: '', soDienThoai: '' });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingUser(null);
    setCreateNewEmployee(false);
    setForm({ username: '', password: '', nhanVienId: '', vaiTroId: '', hoTen: '', soDienThoai: '' });
  };

  const handleSubmit = async () => {
    try {
      if (editingUser) {
        await updateUser.mutateAsync({
          id: editingUser.id,
          payload: {
            ...(form.password && { password: form.password }),
            vaiTroId: form.vaiTroId || null,
            username: form.username,
            hoTen: form.hoTen,
            soDienThoai: form.soDienThoai,
          },
        });
        setFeedback({ type: 'success', message: 'Cập nhật thành công!' });
      } else {
        await createUser.mutateAsync(form);
        setFeedback({ type: 'success', message: 'Tạo tài khoản thành công!' });
      }
      handleCloseDialog();
      refetch();
    } catch (err) {
      setFeedback({ type: 'error', message: err?.response?.data?.message || 'Có lỗi xảy ra' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa tài khoản này?')) return;
    try {
      await deleteUser.mutateAsync(id);
      setFeedback({ type: 'success', message: 'Xóa thành công!' });
      refetch();
    } catch (err) {
      setFeedback({ type: 'error', message: err?.response?.data?.message || 'Không thể xóa' });
    }
  };

  return (
    <MainLayout title="Quản lý Tài khoản">
      <Stack spacing={2}>
        {feedback.message && (
          <Alert severity={feedback.type} onClose={() => setFeedback({ type: '', message: '' })}>
            {feedback.message}
          </Alert>
        )}

        <Paper sx={{ p: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
            <TextField
              placeholder="Tìm theo tên đăng nhập..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 300 }}
            />
            <PermissionGate permission={PERMISSIONS.ACCOUNT_CREATE}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleOpenDialog()}
              >
                Thêm tài khoản
              </Button>
            </PermissionGate>
          </Stack>
        </Paper>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tên đăng nhập</TableCell>
                <TableCell>Nhân viên</TableCell>
                <TableCell>Số điện thoại</TableCell>
                <TableCell>Vai trò</TableCell>
                <TableCell>Ngày tạo</TableCell>
                <TableCell align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">Đang tải...</TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">Không có tài khoản nào</TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Person fontSize="small" color="action" />
                        <Typography fontWeight="medium">{user.username}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>{user.hoTen}</TableCell>
                    <TableCell>{user.soDienThoai}</TableCell>
                    <TableCell>
                      {user.vaiTro ? (
                        <Chip label={user.vaiTro.ten} color="primary" size="small" />
                      ) : (
                        <Chip label="Chưa gán" size="small" />
                      )}
                    </TableCell>
                    <TableCell>{new Date(user.createdAt).toLocaleDateString('vi-VN')}</TableCell>
                    <TableCell align="center">
                      <PermissionGate permission={PERMISSIONS.ACCOUNT_MANAGE}>
                        <IconButton size="small" onClick={() => handleOpenDialog(user)} title="Sửa">
                          <Edit />
                        </IconButton>
                      </PermissionGate>
                      <PermissionGate permission={PERMISSIONS.ACCOUNT_DELETE}>
                        <IconButton size="small" color="error" onClick={() => handleDelete(user.id)} title="Xóa">
                          <Delete />
                        </IconButton>
                      </PermissionGate>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingUser ? 'Sửa tài khoản' : 'Tạo tài khoản mới'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {!editingUser && !createNewEmployee ? (
              <>
                {employees.length > 0 ? (
                  <TextField
                    select
                    label="Nhân viên"
                    value={form.nhanVienId}
                    onChange={(e) => setForm({ ...form, nhanVienId: e.target.value })}
                    fullWidth
                    required
                  >
                    {employees.map((emp) => (
                      <MenuItem key={emp.id} value={emp.id}>
                        {emp.hoTen} - {emp.soDienThoai}
                      </MenuItem>
                    ))}
                  </TextField>
                ) : (
                  <Alert severity="warning">Không có nhân viên chưa có tài khoản</Alert>
                )}
              </>
            ) : null}

            {!editingUser && employees.length > 0 && (
              <Button
                size="small"
                onClick={() => {
                  setCreateNewEmployee(!createNewEmployee);
                  setForm({ ...form, nhanVienId: '', hoTen: '', soDienThoai: '', vaiTroId: '' });
                }}
              >
                {createNewEmployee ? '↩ Chọn nhân viên có sẵn' : '➕ Tạo nhân viên mới'}
              </Button>
            )}

            {(editingUser || createNewEmployee) && (
              <>
                {createNewEmployee && <Alert severity="info">Tạo nhân viên mới và tài khoản</Alert>}
                <TextField
                  label="Họ tên nhân viên"
                  value={form.hoTen}
                  onChange={(e) => setForm({ ...form, hoTen: e.target.value })}
                  fullWidth
                  required
                />
                <TextField
                  label="Số điện thoại"
                  value={form.soDienThoai}
                  onChange={(e) => setForm({ ...form, soDienThoai: e.target.value })}
                  fullWidth
                  required
                />
                <TextField
                  select
                  label="Vai trò"
                  value={form.vaiTroId}
                  onChange={(e) => setForm({ ...form, vaiTroId: e.target.value })}
                  fullWidth
                  required
                >
                  {roles.map((role) => (
                    <MenuItem key={role.id} value={role.id}>
                      {role.ten}
                    </MenuItem>
                  ))}
                </TextField>
              </>
            )}

            <TextField
              label="Tên đăng nhập"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              fullWidth
              required
            />

            <TextField
              label={editingUser ? 'Mật khẩu mới (để trống nếu không đổi)' : 'Mật khẩu'}
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              fullWidth
              required={!editingUser}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Key />
                  </InputAdornment>
                ),
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={
              (!editingUser && (
                !form.username ||
                !form.password ||
                (createNewEmployee ? (!form.hoTen || !form.soDienThoai || !form.vaiTroId) : !form.nhanVienId)
              )) ||
              createUser.isLoading ||
              updateUser.isLoading
            }
          >
            {editingUser ? 'Cập nhật' : 'Tạo mới'}
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
};

export default Users;
