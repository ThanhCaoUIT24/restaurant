import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Button,
  Stack,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Tooltip,
  Badge,
  alpha,
  useTheme,
  Chip,
} from '@mui/material';
import {
  TableBar,
  Receipt,
  Kitchen,
  PointOfSale,
  DarkMode,
  LightMode,
  Notifications,
  Logout,
  Home,
  Settings,
  FullscreenExit,
  Fullscreen,
  Schedule,
} from '@mui/icons-material';
import { useThemeMode } from '../theme/ThemeContext';
import { useAuth } from '../auth/authContext';

// Premium color system
const NAV_COLORS = {
  primary: '#0EA5E9',
  primaryGradient: 'linear-gradient(135deg, #38BDF8 0%, #0EA5E9 100%)',
  background: '#FFFFFF',
  surface: '#F8FAFC',
  text: '#1E293B',
  textSecondary: '#64748B',
  border: 'rgba(0,0,0,0.06)',
};

const navItems = [
  { label: 'Sơ đồ bàn', path: '/pos/tables', icon: TableBar },
  { label: 'Đặt bàn', path: '/reservations', icon: Receipt },
  { label: 'Bếp (KDS)', path: '/kds', icon: Kitchen },
];

const PosLayout = ({ children }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, toggleTheme } = useThemeMode();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleProfileClick = (event) => setAnchorEl(event.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);

  const handleLogout = () => {
    handleCloseMenu();
    logout();
    navigate('/login');
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: NAV_COLORS.surface }}>
      {/* Premium Top Navigation Bar */}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          bgcolor: NAV_COLORS.background,
          borderBottom: `1px solid ${NAV_COLORS.border}`,
          boxShadow: `0 1px 3px ${alpha('#000', 0.04)}`,
        }}
      >
        <Toolbar sx={{ gap: 1.5, minHeight: '56px !important', px: 2 }}>
          {/* Home Button */}
          <Tooltip title="Về Dashboard">
            <IconButton
              onClick={() => navigate('/')}
              size="small"
              sx={{
                width: 36,
                height: 36,
                bgcolor: alpha(NAV_COLORS.primary, 0.08),
                color: NAV_COLORS.primary,
                '&:hover': { bgcolor: alpha(NAV_COLORS.primary, 0.15) },
              }}
            >
              <Home sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>

          {/* Logo - Premium */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: '10px',
                background: NAV_COLORS.primaryGradient,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                boxShadow: `0 4px 12px ${alpha(NAV_COLORS.primary, 0.3)}`,
              }}
            >
              <PointOfSale sx={{ fontSize: 18 }} />
            </Box>
            <Typography variant="subtitle1" fontWeight={700} color={NAV_COLORS.text}>
              POS
            </Typography>
          </Box>

          <Divider orientation="vertical" flexItem sx={{ mx: 1, borderColor: NAV_COLORS.border }} />

          {/* Navigation Items - Capsule Style */}
          <Stack direction="row" spacing={0.75}>
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <motion.div key={item.path} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={() => navigate(item.path)}
                    startIcon={<Icon sx={{ fontSize: 18 }} />}
                    sx={{
                      px: 2,
                      py: 0.875,
                      borderRadius: '10px',
                      fontSize: '0.8rem',
                      fontWeight: isActive ? 600 : 500,
                      textTransform: 'none',
                      color: isActive ? 'white' : NAV_COLORS.textSecondary,
                      bgcolor: isActive ? NAV_COLORS.primary : 'transparent',
                      boxShadow: isActive ? `0 4px 12px ${alpha(NAV_COLORS.primary, 0.3)}` : 'none',
                      '&:hover': {
                        bgcolor: isActive ? NAV_COLORS.primary : alpha(NAV_COLORS.primary, 0.08),
                      },
                    }}
                  >
                    {item.label}
                  </Button>
                </motion.div>
              );
            })}
          </Stack>

          <Box sx={{ flexGrow: 1 }} />

          {/* Current Time - Premium Chip */}
          <Chip
            icon={<Schedule sx={{ fontSize: 16 }} />}
            label={currentTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
            size="small"
            sx={{
              fontWeight: 600,
              fontSize: '0.8rem',
              bgcolor: alpha(NAV_COLORS.primary, 0.08),
              color: NAV_COLORS.primary,
              border: 'none',
              '& .MuiChip-icon': { color: NAV_COLORS.primary },
            }}
          />

          {/* Action Buttons Group */}
          <Stack direction="row" spacing={0.5}>
            <Tooltip title={isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}>
              <IconButton onClick={toggleFullscreen} size="small" sx={{ color: NAV_COLORS.textSecondary }}>
                {isFullscreen ? <FullscreenExit sx={{ fontSize: 20 }} /> : <Fullscreen sx={{ fontSize: 20 }} />}
              </IconButton>
            </Tooltip>

            <Tooltip title={mode === 'dark' ? 'Chế độ sáng' : 'Chế độ tối'}>
              <IconButton onClick={toggleTheme} size="small" sx={{ color: NAV_COLORS.textSecondary }}>
                {mode === 'dark' ? <LightMode sx={{ fontSize: 20 }} /> : <DarkMode sx={{ fontSize: 20 }} />}
              </IconButton>
            </Tooltip>

            <Tooltip title="Thông báo">
              <IconButton size="small" sx={{ color: NAV_COLORS.textSecondary }}>
                <Badge badgeContent={2} color="error" sx={{ '& .MuiBadge-badge': { fontSize: '0.65rem', height: 16, minWidth: 16 } }}>
                  <Notifications sx={{ fontSize: 20 }} />
                </Badge>
              </IconButton>
            </Tooltip>
          </Stack>

          {/* User Profile - Premium */}
          <Box
            onClick={handleProfileClick}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              cursor: 'pointer',
              px: 1.25,
              py: 0.625,
              borderRadius: '10px',
              bgcolor: alpha('#000', 0.04),
              border: `1px solid ${NAV_COLORS.border}`,
              transition: 'all 0.2s',
              '&:hover': { bgcolor: alpha('#000', 0.06), borderColor: alpha('#000', 0.1) },
            }}
          >
            <Avatar
              sx={{
                width: 30,
                height: 30,
                background: NAV_COLORS.primaryGradient,
                fontSize: '0.8rem',
                fontWeight: 600,
              }}
            >
              {user?.name?.[0] || 'U'}
            </Avatar>
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="body2" fontWeight={600} color={NAV_COLORS.text} sx={{ fontSize: '0.8rem', lineHeight: 1.2 }}>
                {user?.name || 'Nhân viên'}
              </Typography>
              <Typography variant="caption" color={NAV_COLORS.textSecondary} sx={{ fontSize: '0.65rem' }}>
                POS Staff
              </Typography>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content - No padding for full-width layout */}
      <Box
        component={motion.div}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
        sx={{ flex: 1, overflow: 'hidden' }}
      >
        {children}
      </Box>

      {/* User Menu - Premium */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            width: 200,
            mt: 1,
            borderRadius: '12px',
            boxShadow: `0 10px 40px ${alpha('#000', 0.12)}`,
            border: `1px solid ${NAV_COLORS.border}`,
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle2" fontWeight={600} color={NAV_COLORS.text}>
            {user?.name || 'User'}
          </Typography>
          <Typography variant="caption" color={NAV_COLORS.textSecondary}>
            {user?.email || 'user@example.com'}
          </Typography>
        </Box>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem onClick={() => { handleCloseMenu(); navigate('/'); }} sx={{ fontSize: '0.85rem', py: 1 }}>
          <Home sx={{ fontSize: 18, mr: 1.5, color: NAV_COLORS.textSecondary }} />
          Dashboard
        </MenuItem>
        <MenuItem onClick={() => { handleCloseMenu(); navigate('/settings'); }} sx={{ fontSize: '0.85rem', py: 1 }}>
          <Settings sx={{ fontSize: 18, mr: 1.5, color: NAV_COLORS.textSecondary }} />
          Cài đặt
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem onClick={handleLogout} sx={{ color: 'error.main', fontSize: '0.85rem', py: 1 }}>
          <Logout sx={{ fontSize: 18, mr: 1.5 }} />
          Đăng xuất
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default PosLayout;
