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
  Button,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
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
  Cancel,
  AccessTime,
} from '@mui/icons-material';
import { useThemeMode } from '../theme/ThemeContext';
import { useAuth } from '../auth/authContext';
import { PERMISSIONS } from '../utils/permissions';
import { usePermissions } from '../hooks/usePermissions';
import PermissionGate from '../components/PermissionGate';
import { useInventoryAlerts } from '../hooks/useInventory';
import { useVoidRequestsCount } from '../hooks/useVoidRequests';
import { useNotifications } from '../hooks/useNotifications';

const DRAWER_WIDTH = 280;
const DRAWER_WIDTH_COLLAPSED = 80;

// Menu items configuration with permissions
const menuItems = [
  {
    title: 'Tổng quan',
    excludeRoles: ['ThuKho', 'Bep', 'PhucVu'],
    items: [
      { title: 'Dashboard', icon: <Dashboard />, path: '/', excludeRoles: ['ThuKho', 'Bep', 'PhucVu'] },
    ],
  },
  {
    title: 'Bán hàng',
    items: [
      { title: 'POS - Bán hàng', icon: <Restaurant />, path: '/pos', permission: PERMISSIONS.ORDER_CREATE },
      { title: 'Sơ đồ bàn', icon: <TableBar />, path: '/pos/tables', permission: PERMISSIONS.TABLE_VIEW },
      { title: 'Đặt bàn', icon: <EventSeat />, path: '/reservations', permission: PERMISSIONS.RESERVATION_MANAGE },
      { title: 'Thanh toán', icon: <Receipt />, path: '/billing', permission: PERMISSIONS.PAYMENT_EXECUTE },
      { title: 'Quản lý ca', icon: <AccessTime />, path: '/billing/shifts', permission: PERMISSIONS.SHIFT_MANAGE },
      { title: 'Chấm công', icon: <History />, path: '/hr/attendance', permission: PERMISSIONS.ATTENDANCE_VIEW },
    ],
  },
  {
    title: 'Quản lý',
    excludeRoles: ['Bep', 'PhucVu', 'ThuNgan'],
    items: [
      { title: 'Yêu cầu hủy món', icon: <Cancel />, path: '/manager/void-requests', permission: PERMISSIONS.ORDER_VOID_APPROVE },
      {
        title: 'Thực đơn',
        icon: <LocalDining />,
        permission: PERMISSIONS.MENU_MANAGE,
        children: [
          { title: 'Món ăn', path: '/menu/dishes', permission: PERMISSIONS.MENU_MANAGE },
          { title: 'Danh mục', path: '/menu/categories', permission: PERMISSIONS.MENU_MANAGE },
        ],
      },
      {
        title: 'Kho hàng',
        icon: <Inventory />,
        permission: PERMISSIONS.STOCK_VIEW,
        children: [
          { title: 'Nguyên vật liệu', path: '/inventory', permission: PERMISSIONS.STOCK_VIEW },
          { title: 'Cảnh báo tồn kho', path: '/inventory/alerts', permission: PERMISSIONS.STOCK_VIEW },
          { title: 'Điều chỉnh kho', path: '/stock/adjustments', permission: PERMISSIONS.STOCK_MANAGE },
        ],
      },
      {
        title: 'Mua hàng',
        icon: <ShoppingCart />,
        permission: PERMISSIONS.PO_VIEW,
        children: [
          { title: 'Nhà cung cấp', path: '/purchase/suppliers', permission: PERMISSIONS.PO_VIEW },
          { title: 'Đơn mua hàng', path: '/purchase/orders', permission: PERMISSIONS.PO_CREATE },
          { title: 'Nhập kho', path: '/purchase/receipts', permission: PERMISSIONS.STOCK_IMPORT },
        ],
      },
      {
        title: 'Nhân sự',
        icon: <People />,
        permission: PERMISSIONS.HR_VIEW,
        children: [
          { title: 'Nhân viên', path: '/hr/employees', permission: PERMISSIONS.HR_VIEW },
          { title: 'Lịch làm việc', path: '/hr/schedules', permission: PERMISSIONS.HR_VIEW },
        ],
      },
    ],
  },
  {
    title: 'Khách hàng',
    excludeRoles: ['ThuKho', 'Bep', 'PhucVu', 'ThuNgan'],
    items: [
      { title: 'Khách hàng', icon: <Group />, path: '/customers', permission: PERMISSIONS.CUSTOMER_MANAGE },
      { title: 'Tích điểm', icon: <CardGiftcard />, path: '/loyalty', permission: PERMISSIONS.CUSTOMER_MANAGE },
    ],
  },
  {
    title: 'Báo cáo',
    excludeRoles: ['ThuKho', 'Bep', 'PhucVu', 'ThuNgan'],
    items: [
      { title: 'Báo cáo', icon: <Assessment />, path: '/reports', permission: PERMISSIONS.REPORT_VIEW },
    ],
  },
  {
    title: 'Hệ thống',
    excludeRoles: ['ThuKho', 'Bep', 'PhucVu', 'ThuNgan'],
    items: [
      {
        title: 'Quản trị',
        icon: <AdminPanelSettings />,
        adminOnly: true,
        children: [
          { title: 'Người dùng', path: '/admin/users', permission: PERMISSIONS.ACCOUNT_CREATE },
          { title: 'Phân quyền', path: '/admin/roles', permission: PERMISSIONS.ACCOUNT_MANAGE },
          { title: 'Cấu hình hệ thống', path: '/admin/config', adminOnly: true },
          { title: 'Nhật ký', path: '/admin/audit-logs', permission: PERMISSIONS.ACCOUNT_MANAGE },
        ],
      },
    ],
  },
];

// Animated logo component
const Logo = ({ collapsed }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 1.5,
      px: 2,
      py: 2.5,
    }}
  >
    <Box
      component={motion.div}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      sx={{
        width: 40,
        height: 40,
        borderRadius: 2,
        background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 800,
        fontSize: '1.25rem',
        boxShadow: (theme) => `0 8px 16px ${alpha(theme.palette.primary.main, 0.24)}`,
      }}
    >
      L
    </Box>
    <AnimatePresence>
      {!collapsed && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
        >
          <Typography variant="h6" fontWeight={800} sx={{ background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            L'Ami RMS
          </Typography>
        </motion.div>
      )}
    </AnimatePresence>
  </Box>
);

// Navigation item component with permission checking
const NavItem = ({ item, collapsed, depth = 0 }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasPermission, isAdmin, hasAnyRole } = usePermissions();
  const [open, setOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const isActive = item.path === location.pathname || (hasChildren && item.children.some((child) => child.path === location.pathname));

  // Get void requests count for badge
  const { data: voidRequestsCount = 0 } = useVoidRequestsCount();
  const showBadge = item.path === '/manager/void-requests' && voidRequestsCount > 0;

  // Check permissions
  if (item.adminOnly && !isAdmin()) {
    return null;
  }

  if (item.permission && !hasPermission(item.permission)) {
    return null;
  }

  // Check excludeRoles - hide item from specific roles
  if (item.excludeRoles && item.excludeRoles.length > 0 && hasAnyRole(item.excludeRoles)) {
    return null;
  }

  // Filter children based on permissions
  const visibleChildren = hasChildren
    ? item.children.filter(child => {
      if (child.adminOnly && !isAdmin()) return false;
      if (child.permission && !hasPermission(child.permission)) return false;
      if (child.excludeRoles && child.excludeRoles.length > 0 && hasAnyRole(child.excludeRoles)) return false;
      return true;
    })
    : [];

  // Don't show parent if no children are visible
  if (hasChildren && visibleChildren.length === 0) {
    return null;
  }

  const handleClick = () => {
    if (hasChildren) {
      setOpen(!open);
    } else if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <>
      <ListItem disablePadding sx={{ display: 'block', px: 1 }}>
        <Tooltip title={collapsed ? item.title : ''} placement="right" arrow>
          <ListItemButton
            onClick={handleClick}
            selected={isActive && !hasChildren}
            sx={{
              minHeight: 44,
              px: 2,
              py: 1,
              pl: depth > 0 ? 4 : 2,
              borderRadius: 1.5,
              ...(collapsed && {
                justifyContent: 'center',
                px: 1,
              }),
            }}
          >
            {item.icon && (
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: collapsed ? 0 : 2,
                  justifyContent: 'center',
                  color: isActive ? 'primary.main' : 'text.secondary',
                }}
              >
                {showBadge ? (
                  <Badge badgeContent={voidRequestsCount} color="error" max={99}>
                    {item.icon}
                  </Badge>
                ) : (
                  item.icon
                )}
              </ListItemIcon>
            )}
            {!collapsed && (
              <>
                <ListItemText
                  primary={item.title}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: isActive ? 600 : 400,
                  }}
                />
                {hasChildren && (open ? <ExpandLess /> : <ExpandMore />)}
              </>
            )}
          </ListItemButton>
        </Tooltip>
      </ListItem>
      {hasChildren && !collapsed && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {visibleChildren.map((child) => (
              <NavItem key={child.path} item={child} collapsed={collapsed} depth={depth + 1} />
            ))}
          </List>
        </Collapse>
      )}
    </>
  );
};

const MainLayout = ({ title = 'Dashboard', children }) => {
  const theme = useTheme();
  const { mode, toggleTheme } = useThemeMode();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

  const { hasPermission } = usePermissions();
  const isChef = (user?.roles || []).includes('Bep');
  const canViewStock = hasPermission(PERMISSIONS.STOCK_VIEW);
  const { data: stockAlerts = [] } = useInventoryAlerts({
    enabled: canViewStock,
    refetchInterval: 30000,
  });

  // Custom Notifications
  const { data: notifData, markRead, markAllRead } = useNotifications();
  const notifications = notifData?.notifications || [];
  const unreadCount = notifData?.unreadCount || 0;

  console.log('MainLayout USER DEBUG:', user);

  const lowStockCount = stockAlerts.length;
  const totalBadge = lowStockCount + unreadCount;

  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifAnchor, setNotifAnchor] = useState(null);

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setCollapsed(!collapsed);
    }
  };

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleCloseMenu();
    logout();
    navigate('/login');
  };

  const drawerWidth = collapsed && !isMobile ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH;

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Logo collapsed={collapsed && !isMobile} />
      <Divider sx={{ mx: 2 }} />

      {/* Menu sections - for chefs we prepend a Kitchen section */}
      {(() => {
        const menuSections = isChef ? [
          { title: 'Bếp', items: [{ title: 'Bếp', icon: <LocalDining />, path: '/kds', permission: PERMISSIONS.KDS_VIEW }] },
          ...menuItems,
        ] : menuItems;

        // Filter sections based on excludeRoles
        const filteredSections = menuSections.filter(section => {
          if (section.excludeRoles && section.excludeRoles.length > 0) {
            return !section.excludeRoles.some(role => (user?.roles || []).includes(role));
          }
          return true;
        });

        return (
          <Box sx={{ flex: 1, overflow: 'auto', py: 2 }}>
            {filteredSections.map((section, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                {!collapsed && (
                  <Typography
                    variant="overline"
                    sx={{
                      px: 3,
                      py: 1,
                      display: 'block',
                      color: 'text.secondary',
                      fontSize: '0.6875rem',
                    }}
                  >
                    {section.title}
                  </Typography>
                )}
                <List disablePadding>
                  {section.items.map((item, idx) => (
                    <NavItem key={idx} item={item} collapsed={collapsed && !isMobile} />
                  ))}
                </List>
              </Box>
            ))}
          </Box>
        );
      })()}

      {/* User info at bottom */}
      <Box sx={{ p: 2, borderTop: (theme) => `1px dashed ${alpha(theme.palette.divider, 0.5)}` }}>
        {collapsed && !isMobile ? (
          <Tooltip title={user?.hoTen || user?.username} placement="right">
            <Avatar
              sx={{
                width: 40,
                height: 40,
                mx: 'auto',
                cursor: 'pointer',
                bgcolor: 'primary.main',
              }}
              onClick={handleProfileClick}
            >
              {user?.hoTen?.[0] || 'U'}
            </Avatar>
          </Tooltip>
        ) : (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              p: 1.5,
              borderRadius: 2,
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': {
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.16),
              },
            }}
            onClick={handleProfileClick}
          >
            <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}>
              {user?.hoTen?.[0] || 'U'}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle2" noWrap>
                {user?.hoTen || user?.username}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {user?.roles?.[0] || 'Staff'}
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <Box
        component="nav"
        sx={{
          width: { lg: drawerWidth },
          flexShrink: { lg: 0 },
        }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', lg: 'none' },
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
            },
          }}
        >
          {drawerContent}
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', lg: 'block' },
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
              overflowX: 'hidden',
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          width: { lg: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        {/* Header */}
        <AppBar
          position="sticky"
          sx={{
            bgcolor: (theme) => alpha(theme.palette.background.paper, 0.8),
            backdropFilter: 'blur(8px)',
          }}
        >
          <Toolbar sx={{ gap: 1 }}>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>

            <Typography variant="h6" component="h1" sx={{ flexGrow: 1, fontWeight: 700 }}>
              {title}
            </Typography>

            {/* Theme toggle */}
            <Tooltip title={mode === 'dark' ? 'Chế độ sáng' : 'Chế độ tối'}>
              <IconButton onClick={toggleTheme} color="inherit">
                {mode === 'dark' ? <LightMode /> : <DarkMode />}
              </IconButton>
            </Tooltip>

            {/* Notifications */}
            <Tooltip title="Thông báo">
              <IconButton color="inherit" onClick={(e) => setNotifAnchor(e.currentTarget)}>
                <Badge badgeContent={totalBadge} color="error" showZero={false}>
                  <Notifications />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* User menu */}
            <IconButton onClick={handleProfileClick} sx={{ p: 0, ml: 1 }}>
              <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}>
                {user?.name?.[0] || 'U'}
              </Avatar>
            </IconButton>
          </Toolbar>
        </AppBar>

        {/* Page content */}
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          sx={{
            flex: 1,
            p: { xs: 2, sm: 3 },
            bgcolor: 'background.default',
          }}
        >
          {children}
        </Box>

        {/* Footer */}
        <Box
          component="footer"
          sx={{
            py: 2,
            px: 3,
            borderTop: (theme) => `1px solid ${theme.palette.divider}`,
            bgcolor: 'background.paper',
          }}
        >
          <Typography variant="body2" color="text.secondary" align="center">
            © 2024 L'Ami Restaurant Management System
          </Typography>
        </Box>
      </Box>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: { width: 200, mt: 1 },
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle1" fontWeight={600}>
            {user?.hoTen || user?.username}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            @{user?.username}
          </Typography>
        </Box>
        <Divider sx={{ my: 1 }} />
        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <Logout fontSize="small" sx={{ color: 'error.main' }} />
          </ListItemIcon>
          Đăng xuất
        </MenuItem>
      </Menu>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notifAnchor}
        open={Boolean(notifAnchor)}
        onClose={() => setNotifAnchor(null)}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: { width: 360, maxHeight: 480, mt: 1 },
        }}
      >
        <Box sx={{ px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1" fontWeight={600}>
            Thông báo
          </Typography>
          <Stack direction="row" spacing={1}>
            {unreadCount > 0 && (
              <Typography
                variant="caption"
                sx={{ cursor: 'pointer', color: 'primary.main', '&:hover': { textDecoration: 'underline' } }}
                onClick={() => markAllRead.mutate()}
              >
                Đánh dấu đã đọc
              </Typography>
            )}
          </Stack>
        </Box>
        <Divider />

        {/* Low Stock Alert Section */}
        {lowStockCount > 0 && canViewStock && (
          <>
            <MenuItem
              onClick={() => {
                setNotifAnchor(null);
                navigate('/inventory');
              }}
              sx={{ bgcolor: 'error.lighter' }}
            >
              <ListItemIcon>
                <Inventory color="error" fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary="Sắp hết hàng"
                secondary={`Có ${lowStockCount} nguyên liệu dưới mức tối thiểu`}
                primaryTypographyProps={{ variant: 'subtitle2', color: 'error.main' }}
              />
            </MenuItem>
            <Divider />
          </>
        )}

        {/* General Notifications List */}
        <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
          {notifications.length === 0 && lowStockCount === 0 ? (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Không có thông báo mới
              </Typography>
            </Box>
          ) : (
            notifications.map((notif) => (
              <MenuItem
                key={notif.id}
                onClick={() => {
                  if (!notif.daDoc) markRead.mutate(notif.id);
                  if (notif.lienKet) {
                    navigate(notif.lienKet);
                    setNotifAnchor(null);
                  }
                }}
                sx={{
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  bgcolor: notif.daDoc ? 'transparent' : 'action.hover',
                  borderBottom: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <Box sx={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle2" fontWeight={notif.daDoc ? 400 : 700}>
                    {notif.tieuDe}
                  </Typography>
                  {!notif.daDoc && <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main', mt: 1 }} />}
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, whiteSpace: 'pre-wrap' }}>
                  {notif.noiDung}
                </Typography>
                <Typography variant="caption" color="text.disabled" sx={{ mt: 1, alignSelf: 'flex-end' }}>
                  {new Date(notif.createdAt).toLocaleString()}
                </Typography>
              </MenuItem>
            ))
          )}
        </Box>
      </Menu>
    </Box>
  );
};

export default MainLayout;
