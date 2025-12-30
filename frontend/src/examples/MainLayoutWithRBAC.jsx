/**
 * VÍ DỤ CẬP NHẬT MAINLAYOUT VỚI RBAC
 * File này minh họa cách áp dụng PermissionGate vào MainLayout của ứng dụng
 */

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Badge,
  Menu,
  MenuItem,
  Divider,
  useMediaQuery,
  useTheme,
  alpha,
  Tooltip,
  Collapse,
  Stack,
  Chip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Restaurant,
  TableBar,
  Receipt,
  Inventory,
  People,
  Assessment,
  EventSeat,
  ShoppingCart,
  Settings,
  Logout,
  DarkMode,
  LightMode,
  Notifications,
  ExpandMore,
  ExpandLess,
  LocalDining,
  Category,
  Group,
  Schedule,
  TrendingUp,
  Warehouse,
  LocalShipping,
  CardGiftcard,
  AdminPanelSettings,
  Security,
  History,
  ChefHat,
} from '@mui/icons-material';
import { useThemeMode } from '../theme/ThemeContext';
import { useAuth } from '../auth/authContext';

// ========== IMPORT RBAC COMPONENTS ==========
import { PermissionGate, AdminGate } from '../components/PermissionGate';
import { PERMISSIONS } from '../utils/permissions';
import { usePermissions } from '../hooks/usePermissions';

const DRAWER_WIDTH = 280;
const DRAWER_WIDTH_COLLAPSED = 80;

// ========== MENU ITEMS VỚI PERMISSIONS ==========
const menuItems = [
  {
    title: 'Tổng quan',
    items: [
      { 
        title: 'Dashboard', 
        icon: <Dashboard />, 
        path: '/',
        // Dashboard hiển thị cho tất cả user đã đăng nhập
      },
    ],
  },
  {
    title: 'Bán hàng',
    items: [
      { 
        title: 'POS - Bán hàng', 
        icon: <Restaurant />, 
        path: '/pos',
        permission: PERMISSIONS.ORDER_CREATE, // PhucVu, Manager, Admin
      },
      { 
        title: 'Sơ đồ bàn', 
        icon: <TableBar />, 
        path: '/pos/tables',
        permission: PERMISSIONS.TABLE_VIEW, // PhucVu, ThuNgan, Manager, Admin
      },
      { 
        title: 'Đặt bàn', 
        icon: <EventSeat />, 
        path: '/reservations',
        permission: PERMISSIONS.RESERVATION_VIEW, // PhucVu, Manager, Admin
      },
      { 
        title: 'Thanh toán', 
        icon: <Receipt />, 
        path: '/billing',
        permission: PERMISSIONS.PAYMENT_VIEW, // ThuNgan, Manager, Admin
      },
    ],
  },
  {
    title: 'Bếp',
    items: [
      {
        title: 'Kitchen Display',
        icon: <ChefHat />,
        path: '/kds',
        permission: PERMISSIONS.KDS_VIEW, // Bep, Manager, Admin
      },
    ],
  },
  {
    title: 'Quản lý',
    items: [
      {
        title: 'Thực đơn',
        icon: <LocalDining />,
        permission: PERMISSIONS.MENU_VIEW, // Tất cả trừ ThuNgan
        children: [
          { 
            title: 'Món ăn', 
            path: '/menu/dishes',
            permission: PERMISSIONS.MENU_VIEW,
          },
          { 
            title: 'Danh mục', 
            path: '/menu/categories',
            permission: PERMISSIONS.MENU_VIEW,
          },
        ],
      },
      {
        title: 'Kho hàng',
        icon: <Inventory />,
        permission: PERMISSIONS.STOCK_VIEW, // ThuKho, Manager, Admin
        children: [
          { 
            title: 'Nguyên vật liệu', 
            path: '/inventory',
            permission: PERMISSIONS.STOCK_VIEW,
          },
          { 
            title: 'Điều chỉnh kho', 
            path: '/stock/adjustments',
            permission: PERMISSIONS.STOCK_MANAGE,
          },
        ],
      },
      {
        title: 'Mua hàng',
        icon: <ShoppingCart />,
        permission: PERMISSIONS.PO_VIEW, // ThuKho, Manager, Admin
        children: [
          { 
            title: 'Đơn mua hàng', 
            path: '/purchase/orders',
            permission: PERMISSIONS.PO_VIEW,
          },
          { 
            title: 'Nhà cung cấp', 
            path: '/purchase/suppliers',
            permission: PERMISSIONS.PO_VIEW,
          },
        ],
      },
      {
        title: 'Nhân sự',
        icon: <People />,
        permission: PERMISSIONS.HR_VIEW, // Manager, Admin
        children: [
          { 
            title: 'Nhân viên', 
            path: '/hr/employees',
            permission: PERMISSIONS.HR_VIEW,
          },
          { 
            title: 'Lịch làm việc', 
            path: '/hr/schedules',
            permission: PERMISSIONS.HR_VIEW,
          },
          { 
            title: 'Chấm công', 
            path: '/hr/attendance',
            permission: PERMISSIONS.HR_VIEW,
          },
        ],
      },
      {
        title: 'Khách hàng',
        icon: <Group />,
        permission: PERMISSIONS.CUSTOMER_VIEW, // PhucVu, ThuNgan, Manager, Admin
        children: [
          { 
            title: 'Danh sách', 
            path: '/customers',
            permission: PERMISSIONS.CUSTOMER_VIEW,
          },
          { 
            title: 'Chương trình khách hàng thân thiết', 
            path: '/loyalty',
            permission: PERMISSIONS.CUSTOMER_VIEW,
          },
        ],
      },
    ],
  },
  {
    title: 'Báo cáo',
    items: [
      {
        title: 'Báo cáo',
        icon: <Assessment />,
        permission: PERMISSIONS.REPORT_VIEW, // Manager, Admin
        children: [
          { 
            title: 'Dashboard báo cáo', 
            path: '/reports',
            permission: PERMISSIONS.REPORT_VIEW,
          },
          { 
            title: 'Doanh thu', 
            path: '/reports/sales',
            permission: PERMISSIONS.REPORT_VIEW,
          },
          { 
            title: 'Hiệu suất món', 
            path: '/reports/menu',
            permission: PERMISSIONS.REPORT_VIEW,
          },
          { 
            title: 'Tồn kho', 
            path: '/reports/inventory',
            permission: PERMISSIONS.REPORT_VIEW,
          },
          { 
            title: 'Chấm công', 
            path: '/reports/attendance',
            permission: PERMISSIONS.REPORT_VIEW,
          },
        ],
      },
    ],
  },
  {
    title: 'Hệ thống',
    items: [
      {
        title: 'Quản trị',
        icon: <AdminPanelSettings />,
        adminOnly: true, // CHỈ ADMIN - Đây là yêu cầu quan trọng
        children: [
          { 
            title: 'Quản lý Tài khoản', 
            path: '/admin/accounts',
            permission: PERMISSIONS.ACCOUNT_MANAGE,
          },
          { 
            title: 'Vai trò & Quyền', 
            path: '/admin/roles',
            adminOnly: true,
          },
          { 
            title: 'Cấu hình', 
            path: '/admin/config',
            adminOnly: true,
          },
          { 
            title: 'Lịch sử hoạt động', 
            path: '/admin/audit',
            adminOnly: true,
          },
        ],
      },
    ],
  },
];

// ========== MENU ITEM COMPONENT VỚI RBAC ==========
const MenuItem = ({ item, level = 0, onNavigate, collapsed }) => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { hasPermission, isAdmin } = usePermissions();

  const handleClick = () => {
    if (item.children) {
      setOpen(!open);
    } else if (item.path) {
      onNavigate(item.path);
    }
  };

  // Kiểm tra permission
  const hasAccess = () => {
    // Nếu là adminOnly, chỉ Admin mới thấy
    if (item.adminOnly) {
      return isAdmin();
    }
    // Nếu có permission, kiểm tra
    if (item.permission) {
      return hasPermission(item.permission);
    }
    // Nếu không có gì, cho phép (dashboard, ...)
    return true;
  };

  // Nếu không có quyền, KHÔNG RENDER
  if (!hasAccess()) {
    return null;
  }

  const isActive = location.pathname === item.path;

  return (
    <>
      <ListItem disablePadding sx={{ display: 'block' }}>
        <ListItemButton
          onClick={handleClick}
          sx={{
            minHeight: 48,
            justifyContent: collapsed ? 'initial' : 'center',
            px: 2.5,
            pl: level * 2 + 2.5,
            bgcolor: isActive ? alpha('#1976d2', 0.1) : 'transparent',
            '&:hover': {
              bgcolor: alpha('#1976d2', 0.05),
            },
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 0,
              mr: collapsed ? 3 : 'auto',
              justifyContent: 'center',
              color: isActive ? '#1976d2' : 'inherit',
            }}
          >
            {item.icon}
          </ListItemIcon>
          {!collapsed && (
            <>
              <ListItemText
                primary={item.title}
                sx={{
                  color: isActive ? '#1976d2' : 'inherit',
                  fontWeight: isActive ? 600 : 400,
                }}
              />
              {item.children && (open ? <ExpandLess /> : <ExpandMore />)}
            </>
          )}
        </ListItemButton>
      </ListItem>

      {/* Submenu */}
      {item.children && !collapsed && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {item.children.map((child, index) => (
              <MenuItem
                key={index}
                item={child}
                level={level + 1}
                onNavigate={onNavigate}
                collapsed={collapsed}
              />
            ))}
          </List>
        </Collapse>
      )}
    </>
  );
};

// ========== MAIN LAYOUT VỚI RBAC ==========
const MainLayout = ({ children }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { mode, toggleMode } = useThemeMode();
  const { isAdmin, permissions, roles } = usePermissions();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavigate = (path) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo */}
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="h6" noWrap component="div">
          {collapsed ? 'RM' : 'Restaurant Manager'}
        </Typography>
      </Box>

      <Divider />

      {/* User Info */}
      {!collapsed && (
        <Box sx={{ p: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar sx={{ bgcolor: '#1976d2' }}>
              {user?.hoTen?.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" noWrap>
                {user?.hoTen}
              </Typography>
              <Stack direction="row" spacing={0.5} flexWrap="wrap">
                {roles.map((role, index) => (
                  <Chip 
                    key={index}
                    label={role} 
                    size="small" 
                    color={role === 'Admin' ? 'error' : 'primary'}
                    sx={{ height: 18, fontSize: '0.7rem' }}
                  />
                ))}
              </Stack>
            </Box>
          </Stack>
        </Box>
      )}

      <Divider />

      {/* Menu Items */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <List>
          {menuItems.map((section, sectionIndex) => (
            <React.Fragment key={sectionIndex}>
              {!collapsed && section.title && (
                <ListItem>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      px: 2,
                    }}
                  >
                    {section.title}
                  </Typography>
                </ListItem>
              )}
              {section.items.map((item, itemIndex) => (
                <MenuItem
                  key={itemIndex}
                  item={item}
                  onNavigate={handleNavigate}
                  collapsed={collapsed}
                />
              ))}
            </React.Fragment>
          ))}
        </List>
      </Box>

      <Divider />

      {/* Settings */}
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={toggleMode}>
            <ListItemIcon>
              {mode === 'dark' ? <LightMode /> : <DarkMode />}
            </ListItemIcon>
            {!collapsed && (
              <ListItemText 
                primary={mode === 'dark' ? 'Light Mode' : 'Dark Mode'} 
              />
            )}
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH}px)` },
          ml: { md: collapsed ? `${DRAWER_WIDTH_COLLAPSED}px` : `${DRAWER_WIDTH}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Restaurant Management System
          </Typography>

          {/* Hiển thị thông tin permissions nếu là Admin */}
          <AdminGate>
            <Chip
              label="ADMIN"
              color="error"
              size="small"
              sx={{ mr: 2 }}
            />
          </AdminGate>

          <IconButton color="inherit">
            <Badge badgeContent={4} color="error">
              <Notifications />
            </Badge>
          </IconButton>

          <IconButton
            onClick={handleProfileMenuOpen}
            color="inherit"
          >
            <Avatar sx={{ width: 32, height: 32 }}>
              {user?.hoTen?.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
          >
            <MenuItem disabled>
              <Typography variant="body2">{user?.hoTen}</Typography>
            </MenuItem>
            <MenuItem disabled>
              <Typography variant="caption" color="text.secondary">
                {roles.join(', ')}
              </Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              Đăng xuất
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Box
        component="nav"
        sx={{
          width: { md: collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH },
          flexShrink: { md: 0 },
        }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH,
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: {
            md: `calc(100% - ${collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH}px)`,
          },
          mt: 8,
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default MainLayout;
