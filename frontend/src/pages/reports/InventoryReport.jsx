import React from 'react';
import MainLayout from '../../layouts/MainLayout';
import { Paper, Typography, List, ListItem, ListItemText } from '@mui/material';
import { useInventoryReport } from '../../hooks/useReports';

const InventoryReport = () => {
  const { data = [], isLoading } = useInventoryReport();
  return (
    <MainLayout title="Báo cáo kho">
      <Paper sx={{ p: 2 }}>
        {isLoading && <Typography>Đang tải...</Typography>}
        <List>
          {data.map((item) => (
            <ListItem key={item.id} divider>
              <ListItemText
                primary={item.ten}
                secondary={`Tồn: ${item.soLuongTon} | Ngưỡng: ${item.mucTonToiThieu}`}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </MainLayout>
  );
};

export default InventoryReport;
