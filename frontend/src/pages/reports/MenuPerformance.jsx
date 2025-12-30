import React, { useMemo, useState } from 'react';
import MainLayout from '../../layouts/MainLayout';
import { Paper, Typography, Table, TableHead, TableRow, TableCell, TableBody, TableSortLabel, Stack, TextField, Button } from '@mui/material';
import { useMenuPerformance } from '../../hooks/useReports';

const MenuPerformance = () => {
  const [filters, setFilters] = useState({ from: '', to: '' });
  const { data = [], isLoading, refetch } = useMenuPerformance(filters);
  const [orderBy, setOrderBy] = useState('soLuong');
  const [direction, setDirection] = useState('desc');

  const sorted = useMemo(() => {
    return [...data].sort((a, b) => {
      const dir = direction === 'asc' ? 1 : -1;
      return (a[orderBy] || 0) > (b[orderBy] || 0) ? dir : -dir;
    });
  }, [data, orderBy, direction]);

  const handleSort = (field) => {
    if (orderBy === field) setDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setOrderBy(field);
      setDirection('desc');
    }
  };

  const applyFilters = () => refetch();

  return (
    <MainLayout title="Hiệu suất món">
      <Paper sx={{ p: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
          <TextField
            label="Từ ngày"
            type="date"
            value={filters.from}
            onChange={(e) => setFilters((prev) => ({ ...prev, from: e.target.value }))}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Đến ngày"
            type="date"
            value={filters.to}
            onChange={(e) => setFilters((prev) => ({ ...prev, to: e.target.value }))}
            InputLabelProps={{ shrink: true }}
          />
          <Button variant="contained" onClick={applyFilters}>
            Lọc
          </Button>
        </Stack>
        {isLoading && <Typography>Đang tải...</Typography>}
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Món</TableCell>
              <TableCell sortDirection={orderBy === 'soLuong' ? direction : false}>
                <TableSortLabel active={orderBy === 'soLuong'} direction={direction} onClick={() => handleSort('soLuong')}>
                  Số lượng
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={orderBy === 'doanhThu' ? direction : false}>
                <TableSortLabel active={orderBy === 'doanhThu'} direction={direction} onClick={() => handleSort('doanhThu')}>
                  Doanh thu
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={orderBy === 'giaVon' ? direction : false}>
                <TableSortLabel active={orderBy === 'giaVon'} direction={direction} onClick={() => handleSort('giaVon')}>
                  Giá vốn
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={orderBy === 'loiNhuan' ? direction : false}>
                <TableSortLabel active={orderBy === 'loiNhuan'} direction={direction} onClick={() => handleSort('loiNhuan')}>
                  Lợi nhuận
                </TableSortLabel>
              </TableCell>
              <TableCell>Tỷ trọng (%)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sorted.map((row) => (
              <TableRow key={row.monAnId}>
                <TableCell>{row.ten}</TableCell>
                <TableCell>{row.soLuong}</TableCell>
                <TableCell>{row.doanhThu?.toLocaleString('vi-VN')}</TableCell>
                <TableCell>{row.giaVon?.toLocaleString('vi-VN')}</TableCell>
                <TableCell sx={{ color: (row.loiNhuan || 0) >= 0 ? 'success.main' : 'error.main', fontWeight: 'bold' }}>
                  {row.loiNhuan?.toLocaleString('vi-VN')}
                </TableCell>
                <TableCell>{row.tyTrong.toFixed(1)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </MainLayout >
  );
};

export default MenuPerformance;
