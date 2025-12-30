import React from 'react';
import MainLayout from '../../layouts/MainLayout';
import { Paper, Typography, List, ListItem, ListItemText } from '@mui/material';
import { useInventoryAlerts } from '../../hooks/useInventory';

const Alerts = () => {
  const { data = [], isLoading } = useInventoryAlerts();
  return (
    <MainLayout title="Cảnh báo tồn kho">
      <Paper sx={{ p: 2 }}>
        {isLoading && <Typography>Đang tải...</Typography>}
        <List>
          {data.map((a) => (
            <ListItem key={a.id} divider>
              <ListItemText
                primary={a.ten}
                secondary={`Tồn: ${a.soLuongTon} / Ngưỡng: ${a.mucTonToiThieu}`}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </MainLayout>
  );
};

export default Alerts;
