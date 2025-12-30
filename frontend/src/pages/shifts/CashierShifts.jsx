import React from 'react';
import MainLayout from '../../layouts/MainLayout';
import { Paper, Typography } from '@mui/material';

const CashierShifts = () => (
  <MainLayout title="Ca thu ngân">
    <Paper sx={{ p: 2 }}>
      <Typography>Theo dõi ca thu ngân.</Typography>
    </Paper>
  </MainLayout>
);

export default CashierShifts;
