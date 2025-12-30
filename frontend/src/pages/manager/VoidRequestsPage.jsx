import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Alert,
    CircularProgress,
    IconButton,
    Tooltip,
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, Cancel, Refresh } from '@mui/icons-material';
import { listVoidRequests, approveVoidRequest, rejectVoidRequest } from '../../api/orders.api';

const VoidRequestsPage = () => {
    const queryClient = useQueryClient();
    const [pinDialogOpen, setPinDialogOpen] = useState(false);
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [managerPin, setManagerPin] = useState('');
    const [rejectReason, setRejectReason] = useState('');
    const [error, setError] = useState('');

    // Fetch void requests
    const { data: voidRequests = [], isLoading, refetch } = useQuery({
        queryKey: ['voidRequests'],
        queryFn: () => listVoidRequests({ status: 'PENDING' }),
        refetchInterval: 5000, // Auto-refresh every 5 seconds
    });

    // Approve mutation
    const approveMutation = useMutation({
        mutationFn: ({ id, payload }) => approveVoidRequest(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries(['voidRequests']);
            setPinDialogOpen(false);
            setManagerPin('');
            setError('');
            setSelectedRequest(null);
        },
        onError: (err) => {
            setError(err.response?.data?.message || 'Lỗi khi duyệt yêu cầu');
        },
    });

    // Reject mutation
    const rejectMutation = useMutation({
        mutationFn: ({ id, payload }) => rejectVoidRequest(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries(['voidRequests']);
            setRejectDialogOpen(false);
            setRejectReason('');
            setSelectedRequest(null);
        },
        onError: (err) => {
            setError(err.response?.data?.message || 'Lỗi khi từ chối yêu cầu');
        },
    });

    const handleApproveClick = (request) => {
        setSelectedRequest(request);
        setPinDialogOpen(true);
        setError('');
    };

    const handleRejectClick = (request) => {
        setSelectedRequest(request);
        setRejectDialogOpen(true);
    };

    const handleApproveSubmit = () => {
        if (!managerPin) {
            setError('Vui lòng nhập mã PIN');
            return;
        }
        approveMutation.mutate({
            id: selectedRequest.id,
            payload: { managerPin },
        });
    };

    const handleRejectSubmit = () => {
        rejectMutation.mutate({
            id: selectedRequest.id,
            payload: { reason: rejectReason },
        });
    };

    const getStatusChip = (status) => {
        const statusMap = {
            PENDING: { label: 'Chờ duyệt', color: 'warning' },
            APPROVED: { label: 'Đã duyệt', color: 'success' },
            REJECTED: { label: 'Đã từ chối', color: 'error' },
        };
        const { label, color } = statusMap[status] || { label: status, color: 'default' };
        return <Chip label={label} color={color} size="small" />;
    };

    const getItemStatusChip = (status) => {
        const statusMap = {
            CHOCHEBIEN: { label: 'Chờ chế biến', color: 'default' },
            DANGLAM: { label: 'Đang làm', color: 'info' },
            HOANTHANH: { label: 'Hoàn thành', color: 'success' },
            DAPHUCVU: { label: 'Đã phục vụ', color: 'secondary' },
            DAHUY: { label: 'Đã hủy', color: 'error' },
        };
        const { label, color } = statusMap[status] || { label: status, color: 'default' };
        return <Chip label={label} color={color} size="small" variant="outlined" />;
    };

    const formatDateTime = (dateString) => {
        return new Date(dateString).toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1">
                    Yêu cầu hủy món
                </Typography>
                <Tooltip title="Làm mới">
                    <IconButton onClick={() => refetch()} color="primary">
                        <Refresh />
                    </IconButton>
                </Tooltip>
            </Box>

            {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                </Box>
            ) : voidRequests.length === 0 ? (
                <Card>
                    <CardContent>
                        <Typography variant="body1" color="text.secondary" align="center">
                            Không có yêu cầu hủy món nào đang chờ duyệt
                        </Typography>
                    </CardContent>
                </Card>
            ) : (
                <TableContainer component={Card}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Thời gian</TableCell>
                                <TableCell>Bàn</TableCell>
                                <TableCell>Món</TableCell>
                                <TableCell>Trạng thái món</TableCell>
                                <TableCell>Lý do</TableCell>
                                <TableCell>Người yêu cầu</TableCell>
                                <TableCell>Trạng thái</TableCell>
                                <TableCell align="center">Hành động</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {voidRequests.map((request) => (
                                <TableRow key={request.id}>
                                    <TableCell>{formatDateTime(request.createdAt)}</TableCell>
                                    <TableCell>{request.donHang?.ban?.ten || 'N/A'}</TableCell>
                                    <TableCell>{request.chiTietDonHang?.monAn?.ten || 'N/A'}</TableCell>
                                    <TableCell>{getItemStatusChip(request.chiTietDonHang?.trangThai)}</TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ maxWidth: 300 }}>
                                            {request.lyDo}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>{request.nguoiYeuCau?.hoTen || 'N/A'}</TableCell>
                                    <TableCell>{getStatusChip(request.trangThai)}</TableCell>
                                    <TableCell align="center">
                                        {request.trangThai === 'PENDING' && (
                                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                                <Button
                                                    variant="contained"
                                                    color="success"
                                                    size="small"
                                                    startIcon={<CheckCircle />}
                                                    onClick={() => handleApproveClick(request)}
                                                >
                                                    Duyệt
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    color="error"
                                                    size="small"
                                                    startIcon={<Cancel />}
                                                    onClick={() => handleRejectClick(request)}
                                                >
                                                    Từ chối
                                                </Button>
                                            </Box>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* PIN Approval Dialog */}
            <Dialog open={pinDialogOpen} onClose={() => setPinDialogOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Xác nhận duyệt hủy món</DialogTitle>
                <DialogContent>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Món: <strong>{selectedRequest?.chiTietDonHang?.monAn?.ten}</strong>
                    </Typography>
                    <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                            Trạng thái:
                        </Typography>
                        {selectedRequest && getItemStatusChip(selectedRequest.chiTietDonHang?.trangThai)}
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Lý do: {selectedRequest?.lyDo}
                    </Typography>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Mã PIN quản lý"
                        type="password"
                        fullWidth
                        variant="outlined"
                        value={managerPin}
                        onChange={(e) => setManagerPin(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                handleApproveSubmit();
                            }
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPinDialogOpen(false)}>Hủy</Button>
                    <Button
                        onClick={handleApproveSubmit}
                        variant="contained"
                        color="success"
                        disabled={approveMutation.isPending}
                    >
                        {approveMutation.isPending ? <CircularProgress size={24} /> : 'Xác nhận'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Reject Dialog */}
            <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Từ chối yêu cầu hủy món</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Món: <strong>{selectedRequest?.chiTietDonHang?.monAn?.ten}</strong>
                    </Typography>
                    <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                            Trạng thái:
                        </Typography>
                        {selectedRequest && getItemStatusChip(selectedRequest.chiTietDonHang?.trangThai)}
                    </Box>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Lý do từ chối (tùy chọn)"
                        type="text"
                        fullWidth
                        multiline
                        rows={3}
                        variant="outlined"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRejectDialogOpen(false)}>Hủy</Button>
                    <Button
                        onClick={handleRejectSubmit}
                        variant="contained"
                        color="error"
                        disabled={rejectMutation.isPending}
                    >
                        {rejectMutation.isPending ? <CircularProgress size={24} /> : 'Từ chối'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default VoidRequestsPage;
