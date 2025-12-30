import React from 'react';
import MainLayout from '../../layouts/MainLayout';
import { Paper, Typography, List, ListItem, ListItemText, Stack, Button } from '@mui/material';
import { useMyAttendanceRecords, useCheckIn, useCheckOut } from '../../hooks/useHR';

const Attendance = () => {
  const { data = [], isLoading, refetch } = useMyAttendanceRecords();
  const checkIn = useCheckIn();
  const checkOut = useCheckOut();

  const handleCheckIn = () => {
    checkIn.mutate({}, { onSuccess: () => refetch() });
  };
  const handleCheckOut = () => {
    checkOut.mutate({}, { onSuccess: () => refetch() });
  };

  return (
    <MainLayout title="Chấm công">
      <Paper sx={{ p: 2 }}>
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Button variant="contained" onClick={handleCheckIn} disabled={checkIn.isLoading}>
            Check-in
          </Button>
          <Button variant="outlined" onClick={handleCheckOut} disabled={checkOut.isLoading}>
            Check-out
          </Button>
        </Stack>
        {isLoading && <Typography>Đang tải...</Typography>}
        <List>
          {data.map((row) => (
            <ListItem key={row.id} divider>
              <ListItemText
                primary={row.lichPhanCa?.nhanVien?.hoTen || row.id}
                secondary={`Vào: ${row.thoiGianVao || '-'} | Ra: ${row.thoiGianRa || '-'} | Giờ: ${row.hours?.toFixed(2) || 0}`}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </MainLayout>
  );
};

export default Attendance;
