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
  IconButton,
  Typography,
  Chip,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Add, Edit, Delete, CalendarMonth } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import {
  useShifts,
  useCreateShift,
  useUpdateShift,
  useDeleteShift,
  useEmployees,
  useSchedules,
  useCreateSchedule,
  useUpdateSchedule,
  useDeleteSchedule,
  useCreateBulkSchedules,
} from '../../hooks/useHR';

const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('vi-VN');
};

const Schedules = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [tab, setTab] = useState(0);
  const [filterDate, setFilterDate] = useState('');
  const [filterEmployee, setFilterEmployee] = useState('');

  // Shift dialog
  const [shiftDialogOpen, setShiftDialogOpen] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
  const [shiftForm, setShiftForm] = useState({ ten: '', batDau: '', ketThuc: '' });

  // Schedule dialog
  const [schedDialogOpen, setSchedDialogOpen] = useState(false);
  const [editingSched, setEditingSched] = useState(null);
  const [schedForm, setSchedForm] = useState({ nhanVienId: '', caLamViecId: '', ngay: '' });

  // Bulk schedule dialog
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkForm, setBulkForm] = useState({ nhanVienId: '', caLamViecId: '', startDate: '', endDate: '' });

  const [confirmDelete, setConfirmDelete] = useState(null);

  const { data: shifts = [], isLoading: loadingShifts } = useShifts();
  const { data: employees = [] } = useEmployees();
  const { data: schedules = [], isLoading: loadingSchedules } = useSchedules({
    startDate: filterDate || undefined,
    endDate: filterDate || undefined,
    nhanVienId: filterEmployee || undefined,
  });

  const createShiftMutation = useCreateShift();
  const updateShiftMutation = useUpdateShift();
  const deleteShiftMutation = useDeleteShift();

  const createSchedMutation = useCreateSchedule();
  const updateSchedMutation = useUpdateSchedule();
  const deleteSchedMutation = useDeleteSchedule();
  const createBulkMutation = useCreateBulkSchedules();

  // ==================== SHIFT HANDLERS ====================

  const openAddShift = () => {
    setEditingShift(null);
    setShiftForm({ ten: '', batDau: '08:00', ketThuc: '17:00' });
    setShiftDialogOpen(true);
  };

  const openEditShift = (shift) => {
    setEditingShift(shift);
    setShiftForm({ ten: shift.ten, batDau: shift.batDau, ketThuc: shift.ketThuc });
    setShiftDialogOpen(true);
  };

  const handleSaveShift = async () => {
    if (!shiftForm.ten || !shiftForm.batDau || !shiftForm.ketThuc) {
      enqueueSnackbar('Vui lòng điền đầy đủ thông tin', { variant: 'warning' });
      return;
    }
    try {
      if (editingShift) {
        await updateShiftMutation.mutateAsync({ id: editingShift.id, ...shiftForm });
        enqueueSnackbar('Cập nhật ca thành công', { variant: 'success' });
      } else {
        await createShiftMutation.mutateAsync(shiftForm);
        enqueueSnackbar('Tạo ca thành công', { variant: 'success' });
      }
      setShiftDialogOpen(false);
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Có lỗi xảy ra', { variant: 'error' });
    }
  };

  const handleDeleteShift = async (shift) => {
    try {
      await deleteShiftMutation.mutateAsync(shift.id);
      enqueueSnackbar('Xóa ca thành công', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Có lỗi xảy ra', { variant: 'error' });
    }
  };

  // ==================== SCHEDULE HANDLERS ====================

  const openAddSchedule = () => {
    setEditingSched(null);
    setSchedForm({ nhanVienId: '', caLamViecId: '', ngay: '' });
    setSchedDialogOpen(true);
  };

  const openEditSchedule = (sched) => {
    setEditingSched(sched);
    setSchedForm({
      nhanVienId: sched.nhanVien?.id || '',
      caLamViecId: sched.caLamViec?.id || '',
      ngay: sched.ngay ? new Date(sched.ngay).toISOString().split('T')[0] : '',
    });
    setSchedDialogOpen(true);
  };

  const handleSaveSchedule = async () => {
    if (!schedForm.nhanVienId || !schedForm.caLamViecId || !schedForm.ngay) {
      enqueueSnackbar('Vui lòng điền đầy đủ thông tin', { variant: 'warning' });
      return;
    }
    try {
      if (editingSched) {
        await updateSchedMutation.mutateAsync({ id: editingSched.id, ...schedForm });
        enqueueSnackbar('Cập nhật lịch thành công', { variant: 'success' });
      } else {
        await createSchedMutation.mutateAsync(schedForm);
        enqueueSnackbar('Tạo lịch thành công', { variant: 'success' });
      }
      setSchedDialogOpen(false);
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Có lỗi xảy ra', { variant: 'error' });
    }
  };

  const handleDeleteSchedule = async () => {
    try {
      await deleteSchedMutation.mutateAsync(confirmDelete.id);
      enqueueSnackbar('Xóa lịch thành công', { variant: 'success' });
      setConfirmDelete(null);
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Có lỗi xảy ra', { variant: 'error' });
    }
  };

  // ==================== BULK SCHEDULE HANDLERS ====================

  const handleSaveBulk = async () => {
    if (!bulkForm.nhanVienId || !bulkForm.caLamViecId || !bulkForm.startDate || !bulkForm.endDate) {
      enqueueSnackbar('Vui lòng điền đầy đủ thông tin', { variant: 'warning' });
      return;
    }
    try {
      const result = await createBulkMutation.mutateAsync(bulkForm);
      enqueueSnackbar(result.message, { variant: 'success' });
      setBulkDialogOpen(false);
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Có lỗi xảy ra', { variant: 'error' });
    }
  };

  // ==================== COLUMNS ====================

  const shiftColumns = [
    { field: 'ten', headerName: 'Tên ca', flex: 1 },
    { field: 'batDau', headerName: 'Bắt đầu', width: 100 },
    { field: 'ketThuc', headerName: 'Kết thúc', width: 100 },
    {
      field: 'actions',
      headerName: 'Thao tác',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton size="small" onClick={() => openEditShift(params.row)}>
            <Edit fontSize="small" />
          </IconButton>
          <IconButton size="small" color="error" onClick={() => handleDeleteShift(params.row)}>
            <Delete fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  const scheduleColumns = [
    {
      field: 'ngay',
      headerName: 'Ngày',
      width: 120,
      valueFormatter: (value) => formatDate(value),
    },
    {
      field: 'nhanVien',
      headerName: 'Nhân viên',
      flex: 1,
      valueGetter: (value) => value?.hoTen || '—',
    },
    {
      field: 'caLamViec',
      headerName: 'Ca làm việc',
      width: 180,
      renderCell: (params) =>
        params.value ? (
          <Chip label={`${params.value.ten} (${params.value.batDau}-${params.value.ketThuc})`} size="small" />
        ) : (
          '—'
        ),
    },
    {
      field: 'chamCong',
      headerName: 'Chấm công',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value?.length > 0 ? 'Đã chấm' : 'Chưa'}
          size="small"
          color={params.value?.length > 0 ? 'success' : 'default'}
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
          <IconButton size="small" onClick={() => openEditSchedule(params.row)}>
            <Edit fontSize="small" />
          </IconButton>
          <IconButton size="small" color="error" onClick={() => setConfirmDelete(params.row)}>
            <Delete fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <MainLayout title="Phân ca">
      <Paper sx={{ p: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab label="Lịch phân ca" />
          <Tab label="Ca làm việc" />
        </Tabs>

        {/* Tab 0: Schedules */}
        {tab === 0 && (
          <>
            <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
              <TextField
                size="small"
                type="date"
                label="Ngày"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Nhân viên</InputLabel>
                <Select
                  value={filterEmployee}
                  onChange={(e) => setFilterEmployee(e.target.value)}
                  label="Nhân viên"
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  {employees.map((e) => (
                    <MenuItem key={e.id} value={e.id}>
                      {e.hoTen}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Box sx={{ flexGrow: 1 }} />
              <Button variant="outlined" startIcon={<CalendarMonth />} onClick={() => setBulkDialogOpen(true)}>
                Phân ca hàng loạt
              </Button>
              <Button variant="contained" startIcon={<Add />} onClick={openAddSchedule}>
                Thêm lịch
              </Button>
            </Box>
            <DataGrid
              rows={schedules}
              columns={scheduleColumns}
              loading={loadingSchedules}
              autoHeight
              pageSizeOptions={[10, 25, 50]}
              initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
              disableRowSelectionOnClick
            />
          </>
        )}

        {/* Tab 1: Shifts */}
        {tab === 1 && (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Button variant="contained" startIcon={<Add />} onClick={openAddShift}>
                Thêm ca
              </Button>
            </Box>
            <DataGrid
              rows={shifts}
              columns={shiftColumns}
              loading={loadingShifts}
              autoHeight
              pageSizeOptions={[10, 25]}
              initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
              disableRowSelectionOnClick
            />
          </>
        )}
      </Paper>

      {/* Shift Dialog */}
      <Dialog open={shiftDialogOpen} onClose={() => setShiftDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingShift ? 'Sửa ca' : 'Thêm ca'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Tên ca *"
              value={shiftForm.ten}
              onChange={(e) => setShiftForm((p) => ({ ...p, ten: e.target.value }))}
              fullWidth
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Giờ bắt đầu *"
                type="time"
                value={shiftForm.batDau}
                onChange={(e) => setShiftForm((p) => ({ ...p, batDau: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                sx={{ flex: 1 }}
              />
              <TextField
                label="Giờ kết thúc *"
                type="time"
                value={shiftForm.ketThuc}
                onChange={(e) => setShiftForm((p) => ({ ...p, ketThuc: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                sx={{ flex: 1 }}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShiftDialogOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleSaveShift}>
            {editingShift ? 'Cập nhật' : 'Thêm'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Schedule Dialog */}
      <Dialog open={schedDialogOpen} onClose={() => setSchedDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingSched ? 'Sửa lịch' : 'Thêm lịch'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Nhân viên *</InputLabel>
              <Select
                value={schedForm.nhanVienId}
                onChange={(e) => setSchedForm((p) => ({ ...p, nhanVienId: e.target.value }))}
                label="Nhân viên *"
              >
                {employees.map((e) => (
                  <MenuItem key={e.id} value={e.id}>
                    {e.hoTen}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Ca làm việc *</InputLabel>
              <Select
                value={schedForm.caLamViecId}
                onChange={(e) => setSchedForm((p) => ({ ...p, caLamViecId: e.target.value }))}
                label="Ca làm việc *"
              >
                {shifts.map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.ten} ({s.batDau} - {s.ketThuc})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Ngày *"
              type="date"
              value={schedForm.ngay}
              onChange={(e) => setSchedForm((p) => ({ ...p, ngay: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSchedDialogOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleSaveSchedule}>
            {editingSched ? 'Cập nhật' : 'Thêm'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Schedule Dialog */}
      <Dialog open={bulkDialogOpen} onClose={() => setBulkDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Phân ca hàng loạt</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Tạo lịch phân ca cho một nhân viên trong khoảng thời gian
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Nhân viên *</InputLabel>
              <Select
                value={bulkForm.nhanVienId}
                onChange={(e) => setBulkForm((p) => ({ ...p, nhanVienId: e.target.value }))}
                label="Nhân viên *"
              >
                {employees.map((e) => (
                  <MenuItem key={e.id} value={e.id}>
                    {e.hoTen}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Ca làm việc *</InputLabel>
              <Select
                value={bulkForm.caLamViecId}
                onChange={(e) => setBulkForm((p) => ({ ...p, caLamViecId: e.target.value }))}
                label="Ca làm việc *"
              >
                {shifts.map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.ten} ({s.batDau} - {s.ketThuc})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Từ ngày *"
                type="date"
                value={bulkForm.startDate}
                onChange={(e) => setBulkForm((p) => ({ ...p, startDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                sx={{ flex: 1 }}
              />
              <TextField
                label="Đến ngày *"
                type="date"
                value={bulkForm.endDate}
                onChange={(e) => setBulkForm((p) => ({ ...p, endDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                sx={{ flex: 1 }}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkDialogOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleSaveBulk} disabled={createBulkMutation.isPending}>
            Tạo lịch
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>Bạn có chắc muốn xóa lịch phân ca này?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(null)}>Hủy</Button>
          <Button color="error" variant="contained" onClick={handleDeleteSchedule}>
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
};

export default Schedules;
