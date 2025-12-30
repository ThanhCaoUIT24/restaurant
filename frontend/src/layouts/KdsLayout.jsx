import React, { useState, useEffect } from 'react';
import { 
  Box, 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton,
  Stack,
  Chip,
  Tooltip,
  alpha,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Kitchen as KitchenIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  VolumeUp as SoundOnIcon,
  VolumeOff as SoundOffIcon,
  Refresh as RefreshIcon,
  AccessTime as ClockIcon,
} from '@mui/icons-material';

const KdsLayout = ({ children }) => {
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('md'));

  // Use app theme colors to keep KDS layout consistent with the rest of the app
  const COLORS = {
    bgPrimary: theme.palette.background.default,
    bgSecondary: theme.palette.background.paper,
    bgHeader: theme.palette.mode === 'light'
      ? `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`
      : `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
    primary: theme.palette.primary.main,
    primaryLight: theme.palette.primary.light || theme.palette.primary.main,
    accent: theme.palette.secondary.main,
    textPrimary: theme.palette.text.primary,
    textSecondary: theme.palette.text.secondary,
    border: theme.palette.divider,
    success: theme.palette.success?.main || '#10B981',
  };
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Update clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  
  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };
  
  // Format time
  const formatTime = (date) => {
    return date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: false 
    });
  };
  
  const formatDate = (date) => {
    return date.toLocaleDateString('vi-VN', { 
      weekday: 'long',
      day: '2-digit', 
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: COLORS.bgPrimary, 
      color: COLORS.textPrimary,
    }}>
      {/* Premium Header */}
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{ 
          background: COLORS.bgHeader,
          borderBottom: `1px solid ${COLORS.border}`,
        }}
      >
        <Toolbar sx={{ py: 1 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" width="100%">
            {/* Left: Logo & Title */}
            <Stack direction="row" alignItems="center" gap={2}>
              <Box sx={{
                width: 48,
                height: 48,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryLight} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 4px 20px ${alpha(COLORS.primary, 0.4)}`,
              }}>
                <KitchenIcon sx={{ fontSize: 28, color: '#fff' }} />
              </Box>
              <Box>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 900, 
                    background: `linear-gradient(135deg, ${COLORS.textPrimary} 0%, ${COLORS.accent} 100%)`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '-0.5px',
                  }}
                >
                  Kitchen Display
                </Typography>
                <Typography variant="caption" sx={{ color: COLORS.textSecondary }}>
                  Hệ thống hiển thị bếp
                </Typography>
              </Box>
            </Stack>
            
            {/* Center: Clock (only on large screens) */}
            {isLargeScreen && (
              <Box sx={{
                px: 4,
                py: 1,
                borderRadius: 3,
                bgcolor: alpha(COLORS.primary, 0.1),
                border: `1px solid ${alpha(COLORS.primary, 0.2)}`,
                textAlign: 'center',
              }}>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 900, 
                    fontFamily: 'monospace',
                    color: COLORS.accent,
                    lineHeight: 1,
                  }}
                >
                  {formatTime(currentTime)}
                </Typography>
                <Typography variant="caption" sx={{ color: COLORS.textSecondary }}>
                  {formatDate(currentTime)}
                </Typography>
              </Box>
            )}
            
            {/* Right: Controls */}
            <Stack direction="row" alignItems="center" gap={1}>
              {/* Sound Toggle */}
              <Tooltip title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}>
                <IconButton 
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  sx={{ 
                    color: soundEnabled ? COLORS.success : COLORS.textSecondary,
                    bgcolor: alpha(soundEnabled ? COLORS.success : COLORS.textSecondary, 0.1),
                    '&:hover': {
                      bgcolor: alpha(soundEnabled ? COLORS.success : COLORS.textSecondary, 0.2),
                    }
                  }}
                >
                  {soundEnabled ? <SoundOnIcon /> : <SoundOffIcon />}
                </IconButton>
              </Tooltip>
              
              {/* Fullscreen Toggle */}
              <Tooltip title={isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}>
                <IconButton 
                  onClick={toggleFullscreen}
                  sx={{ 
                    color: COLORS.accent,
                    bgcolor: alpha(COLORS.accent, 0.1),
                    '&:hover': {
                      bgcolor: alpha(COLORS.accent, 0.2),
                    }
                  }}
                >
                  {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                </IconButton>
              </Tooltip>
              
              {/* Status Indicator */}
              <Chip
                label="LIVE"
                size="small"
                sx={{
                  bgcolor: alpha(COLORS.success, 0.2),
                  color: COLORS.success,
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  animation: 'pulse 2s infinite',
                  '@keyframes pulse': {
                    '0%, 100%': { opacity: 1 },
                    '50%': { opacity: 0.6 },
                  },
                  '&::before': {
                    content: '""',
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: COLORS.success,
                    marginRight: 1,
                    display: 'inline-block',
                  }
                }}
              />
            </Stack>
          </Stack>
        </Toolbar>
      </AppBar>
      
      {/* Main Content */}
      <Box sx={{ 
        p: { xs: 1.5, sm: 2, md: 3 },
        minHeight: 'calc(100vh - 80px)',
      }}>
        {children}
      </Box>
    </Box>
  );
};

export default KdsLayout;
