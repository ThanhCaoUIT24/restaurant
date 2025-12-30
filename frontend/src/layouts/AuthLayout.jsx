import React from 'react';
import { Box, useTheme, alpha } from '@mui/material';

const AuthLayout = ({ children }) => {
  const theme = useTheme();
  
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: theme.palette.mode === 'dark'
          ? `linear-gradient(135deg, ${theme.palette.grey[900]} 0%, ${alpha(theme.palette.primary.dark, 0.2)} 100%)`
          : `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.2)} 0%, ${theme.palette.background.default} 100%)`,
        p: 2,
      }}
    >
      {children}
    </Box>
  );
};

export default AuthLayout;
