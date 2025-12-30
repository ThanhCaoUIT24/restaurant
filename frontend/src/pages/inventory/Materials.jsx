import React, { useEffect, useMemo, useState } from 'react';
import MainLayout from '../../layouts/MainLayout';
import {
  Alert,
  Box,
  Button,
  Divider,
  Grid,
  IconButton,
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
import { Add, Delete } from '@mui/icons-material';
import { useMaterials, useUpsertRecipe, useRecipe, useInventoryAlerts } from '../../hooks/useInventory';
import { useMenuDishes } from '../../hooks/useMenu';

const Materials = () => {
  const { data: materials = [] } = useMaterials();
  const { data: alerts = [] } = useInventoryAlerts();
  const { data: dishes = [] } = useMenuDishes();
  const [selectedDish, setSelectedDish] = useState('');
  const [lines, setLines] = useState([]);
  const [feedback, setFeedback] = useState('');

  const { data: recipeData } = useRecipe(selectedDish);
  const upsertRecipe = useUpsertRecipe();

  useEffect(() => {
    if (recipeData?.recipe) {
      setLines(recipeData.recipe.map((r) => ({ nguyenVatLieuId: r.nguyenVatLieuId, soLuong: Number(r.soLuong) || 0 })));
    } else {
      setLines([]);
    }
  }, [recipeData]);

  const foodCost = useMemo(() => recipeData?.foodCost || 0, [recipeData]);

  const addLine = () => setLines((prev) => [...prev, { nguyenVatLieuId: '', soLuong: 0 }]);
  const updateLine = (idx, patch) => setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
  const removeLine = (idx) => setLines((prev) => prev.filter((_, i) => i !== idx));

  const handleSave = () => {
    if (!selectedDish) return;
    const ingredients = lines.filter((l) => l.nguyenVatLieuId && Number(l.soLuong) > 0);
    setFeedback('');
    upsertRecipe
      .mutateAsync({ monAnId: selectedDish, ingredients })
      .then(() => setFeedback('Đã lưu công thức'))
      .catch((err) => setFeedback(err?.response?.data?.message || 'Lưu công thức thất bại'));
  };

  return (
    <MainLayout title="Nguyên vật liệu & Công thức">
      <Grid container spacing={2}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Thiết lập công thức món</Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 1 }}>
              <TextField
                select
                label="Chọn món"
                value={selectedDish}
                onChange={(e) => setSelectedDish(e.target.value)}
                fullWidth
              >
                {dishes.map((d) => (
                  <MenuItem key={d.id} value={d.id}>
                    {d.ten}
                  </MenuItem>
                ))}
              </TextField>
              <Button variant="outlined" onClick={addLine} startIcon={<Add />}>
                Thêm nguyên liệu
              </Button>
            </Stack>
            <Table size="small" sx={{ mt: 2 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Nguyên liệu</TableCell>
                  <TableCell>Số lượng</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {lines.map((line, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <TextField
                        select
                        fullWidth
                        value={line.nguyenVatLieuId}
                        onChange={(e) => updateLine(idx, { nguyenVatLieuId: e.target.value })}
                      >
                        {materials.map((m) => (
                          <MenuItem key={m.id} value={m.id}>
                            {m.ten} ({m.donViTinh})
                          </MenuItem>
                        ))}
                      </TextField>
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        fullWidth
                        value={line.soLuong}
                        onChange={(e) => updateLine(idx, { soLuong: Number(e.target.value) || 0 })}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => removeLine(idx)}>
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {!lines.length && (
                  <TableRow>
                    <TableCell colSpan={3}>
                      <Typography color="text.secondary">Chưa có nguyên liệu trong công thức.</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
              <Typography>Giá vốn ước tính</Typography>
              <Typography fontWeight="bold">{foodCost.toLocaleString('vi-VN')} đ</Typography>
            </Stack>
            <Button sx={{ mt: 1 }} variant="contained" onClick={handleSave} disabled={!selectedDish || upsertRecipe.isLoading}>
              Lưu công thức
            </Button>
            {feedback && (
              <Alert severity="info" sx={{ mt: 1 }}>
                {feedback}
              </Alert>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6">Nguyên vật liệu</Typography>
            <Divider sx={{ my: 1 }} />
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Tên</TableCell>
                  <TableCell>Tồn</TableCell>
                  <TableCell>Ngưỡng</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {materials.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>{m.ten}</TableCell>
                    <TableCell>{m.soLuongTon}</TableCell>
                    <TableCell>{m.mucTonToiThieu}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Cảnh báo tồn kho</Typography>
            <Divider sx={{ my: 1 }} />
            {alerts.map((a) => (
              <Box key={a.id} sx={{ mb: 1 }}>
                <Typography variant="subtitle2">{a.ten}</Typography>
                <Typography variant="caption" color="error">
                  Tồn: {a.soLuongTon} / Ngưỡng: {a.mucTonToiThieu}
                </Typography>
              </Box>
            ))}
            {!alerts.length && <Typography color="text.secondary">Không có cảnh báo.</Typography>}
          </Paper>
        </Grid>
      </Grid>
    </MainLayout>
  );
};

export default Materials;
