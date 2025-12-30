// Reusable UI components for the application
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Avatar,
  Chip,
  TextField,
  InputAdornment,
  Paper,
  Breadcrumbs,
  Link,
  Stack,
  LinearProgress,
  CircularProgress,
  Skeleton,
  alpha,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  Search,
  Add,
  FilterList,
  Download,
  Upload,
  Refresh,
  MoreVert,
  NavigateNext,
  Home,
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

// ============================
// Page Header Component
// ============================
export const PageHeader = ({
  title,
  subtitle,
  breadcrumbs = [],
  actions,
  children,
}) => {
  return (
    <Box sx={{ mb: 4 }}>
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <Breadcrumbs
          separator={<NavigateNext fontSize="small" />}
          sx={{ mb: 2 }}
        >
          <Link
            component={RouterLink}
            to="/"
            color="inherit"
            underline="hover"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <Home fontSize="small" sx={{ mr: 0.5 }} />
            Trang chủ
          </Link>
          {breadcrumbs.map((item, index) => (
            <Link
              key={index}
              component={RouterLink}
              to={item.path || '#'}
              color={index === breadcrumbs.length - 1 ? 'text.primary' : 'inherit'}
              underline={index === breadcrumbs.length - 1 ? 'none' : 'hover'}
              fontWeight={index === breadcrumbs.length - 1 ? 600 : 400}
            >
              {item.label}
            </Link>
          ))}
        </Breadcrumbs>
      )}

      {/* Title and Actions */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {actions && (
          <Stack direction="row" spacing={1}>
            {actions}
          </Stack>
        )}
      </Box>
      {children}
    </Box>
  );
};

// ============================
// Search Bar Component
// ============================
export const SearchBar = ({
  value,
  onChange,
  placeholder = 'Tìm kiếm...',
  onFilter,
  showFilter = true,
  fullWidth = false,
  sx = {},
}) => {
  return (
    <Box sx={{ display: 'flex', gap: 1, ...sx }}>
      <TextField
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        size="small"
        sx={{
          width: fullWidth ? '100%' : { xs: '100%', sm: 300 },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search color="action" />
            </InputAdornment>
          ),
        }}
      />
      {showFilter && onFilter && (
        <Tooltip title="Bộ lọc">
          <IconButton onClick={onFilter}>
            <FilterList />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
};

// ============================
// Action Button Group
// ============================
export const ActionButtons = ({
  onAdd,
  onExport,
  onImport,
  onRefresh,
  addLabel = 'Thêm mới',
  showAdd = true,
  showExport = false,
  showImport = false,
  showRefresh = true,
}) => {
  return (
    <Stack direction="row" spacing={1}>
      {showRefresh && (
        <Tooltip title="Làm mới">
          <IconButton onClick={onRefresh}>
            <Refresh />
          </IconButton>
        </Tooltip>
      )}
      {showImport && (
        <Tooltip title="Nhập dữ liệu">
          <IconButton onClick={onImport}>
            <Upload />
          </IconButton>
        </Tooltip>
      )}
      {showExport && (
        <Tooltip title="Xuất dữ liệu">
          <IconButton onClick={onExport}>
            <Download />
          </IconButton>
        </Tooltip>
      )}
      {showAdd && (
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={onAdd}
          sx={{ minWidth: 120 }}
        >
          {addLabel}
        </Button>
      )}
    </Stack>
  );
};

// ============================
// Stats Card Component
// ============================
export const StatsCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'primary',
  trend,
  trendValue,
  loading = false,
}) => {
  return (
    <Card
      component={motion.div}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <CardContent sx={{ p: 3 }}>
        {loading ? (
          <>
            <Skeleton width={100} />
            <Skeleton width={80} height={40} sx={{ my: 1 }} />
            <Skeleton width={120} />
          </>
        ) : (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  {title}
                </Typography>
                <Typography variant="h4" fontWeight={700} sx={{ my: 1 }}>
                  {value}
                </Typography>
                {subtitle && (
                  <Typography variant="body2" color="text.secondary">
                    {subtitle}
                  </Typography>
                )}
              </Box>
              {Icon && (
                <Avatar
                  sx={{
                    width: 48,
                    height: 48,
                    bgcolor: (theme) => alpha(theme.palette[color]?.main || theme.palette.primary.main, 0.12),
                    color: `${color}.main`,
                  }}
                >
                  <Icon />
                </Avatar>
              )}
            </Box>
            {trend && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, gap: 0.5 }}>
                <Typography
                  variant="body2"
                  color={trend === 'up' ? 'success.main' : 'error.main'}
                  fontWeight={600}
                >
                  {trend === 'up' ? '↑' : '↓'} {trendValue}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  so với kỳ trước
                </Typography>
              </Box>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

// ============================
// Data Card Component
// ============================
export const DataCard = ({
  title,
  children,
  action,
  loading = false,
  empty = false,
  emptyIcon: EmptyIcon,
  emptyTitle = 'Không có dữ liệu',
  emptyMessage = 'Dữ liệu sẽ hiển thị khi có',
  sx = {},
}) => {
  return (
    <Card sx={{ height: '100%', ...sx }}>
      <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight={700}>
            {title}
          </Typography>
          {action}
        </Box>
        
        <Box sx={{ flex: 1 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : empty ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              {EmptyIcon && (
                <EmptyIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
              )}
              <Typography variant="subtitle1" fontWeight={600}>
                {emptyTitle}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {emptyMessage}
              </Typography>
            </Box>
          ) : (
            children
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

// ============================
// Status Chip Component
// ============================
export const StatusChip = ({ status, size = 'small' }) => {
  const statusConfig = {
    // Order statuses
    pending: { label: 'Chờ xử lý', color: 'warning' },
    preparing: { label: 'Đang chế biến', color: 'info' },
    ready: { label: 'Sẵn sàng', color: 'success' },
    served: { label: 'Đã phục vụ', color: 'default' },
    cancelled: { label: 'Đã hủy', color: 'error' },
    
    // Table statuses
    available: { label: 'Trống', color: 'success' },
    occupied: { label: 'Có khách', color: 'error' },
    reserved: { label: 'Đã đặt', color: 'warning' },
    
    // Bill statuses
    unpaid: { label: 'Chưa thanh toán', color: 'error' },
    paid: { label: 'Đã thanh toán', color: 'success' },
    partial: { label: 'Thanh toán 1 phần', color: 'warning' },
    
    // Employee statuses
    active: { label: 'Đang làm', color: 'success' },
    inactive: { label: 'Nghỉ', color: 'default' },
    
    // Stock statuses
    low: { label: 'Tồn thấp', color: 'error' },
    normal: { label: 'Bình thường', color: 'success' },
    high: { label: 'Tồn cao', color: 'warning' },
  };

  const config = statusConfig[status] || { label: status, color: 'default' };

  return (
    <Chip
      label={config.label}
      color={config.color}
      size={size}
      sx={{
        fontWeight: 600,
        textTransform: 'capitalize',
      }}
    />
  );
};

// ============================
// Loading Overlay Component
// ============================
export const LoadingOverlay = ({ loading, children }) => {
  return (
    <Box sx={{ position: 'relative' }}>
      {loading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(255,255,255,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            borderRadius: 'inherit',
          }}
        >
          <CircularProgress />
        </Box>
      )}
      {children}
    </Box>
  );
};

// ============================
// Empty State Component
// ============================
export const EmptyState = ({
  icon: Icon,
  title = 'Không có dữ liệu',
  message = 'Dữ liệu sẽ hiển thị khi có',
  action,
  actionLabel = 'Thêm mới',
}) => {
  return (
    <Box
      sx={{
        textAlign: 'center',
        py: 8,
        px: 2,
      }}
    >
      {Icon && (
        <Box
          sx={{
            width: 80,
            height: 80,
            mx: 'auto',
            mb: 3,
            borderRadius: '50%',
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon sx={{ fontSize: 40, color: 'primary.main' }} />
        </Box>
      )}
      <Typography variant="h6" fontWeight={600} gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {message}
      </Typography>
      {action && (
        <Button variant="contained" startIcon={<Add />} onClick={action}>
          {actionLabel}
        </Button>
      )}
    </Box>
  );
};

// ============================
// Confirm Dialog Component
// ============================
export { default as ConfirmDialog } from './ConfirmDialog';

// ============================
// Animated Container
// ============================
export const AnimatedContainer = ({ children, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      {children}
    </motion.div>
  );
};

// ============================
// Table Toolbar Component
// ============================
export const TableToolbar = ({
  search,
  onSearchChange,
  searchPlaceholder = 'Tìm kiếm...',
  onAdd,
  onExport,
  onRefresh,
  addLabel = 'Thêm mới',
  selectedCount = 0,
  onDelete,
  children,
}) => {
  return (
    <Paper
      sx={{
        p: 2,
        mb: 2,
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'stretch', sm: 'center' },
        gap: 2,
      }}
    >
      {selectedCount > 0 ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="subtitle1" fontWeight={600}>
            Đã chọn {selectedCount} mục
          </Typography>
          {onDelete && (
            <Button color="error" onClick={onDelete}>
              Xóa
            </Button>
          )}
        </Box>
      ) : (
        <SearchBar
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          showFilter={false}
        />
      )}
      
      <Stack direction="row" spacing={1} alignItems="center">
        {children}
        {onRefresh && (
          <Tooltip title="Làm mới">
            <IconButton onClick={onRefresh}>
              <Refresh />
            </IconButton>
          </Tooltip>
        )}
        {onExport && (
          <Tooltip title="Xuất Excel">
            <IconButton onClick={onExport}>
              <Download />
            </IconButton>
          </Tooltip>
        )}
        {onAdd && (
          <Button variant="contained" startIcon={<Add />} onClick={onAdd}>
            {addLabel}
          </Button>
        )}
      </Stack>
    </Paper>
  );
};
