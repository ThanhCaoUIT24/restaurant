import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Paper,
  Typography,
  Stack,
  Box,
  Card,
  CardContent,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Chip,
  alpha,
  Skeleton,
  IconButton,
  Tooltip,
  Button,
  ButtonGroup,
  LinearProgress,
  Badge,
  Divider,
  useTheme,
  AvatarGroup,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Receipt,
  AttachMoney,
  Group,
  Restaurant,
  Warning,
  LocalDining,
  MoreVert,
  ArrowForward,
  CalendarToday,
  Refresh,
  Notifications,
  ShoppingCart,
  Timer,
  Star,
  Whatshot,
  CheckCircle,
  Schedule,
  TableRestaurant,
  Add,
  KeyboardArrowRight,
  Inventory,
  Person,
  AccessTime,
  FiberManualRecord,
  NewReleases,
  LocalShipping,
  Timeline,
  Analytics,
  Speed,
  MonetizationOn,
  TrendingFlat,
  BarChart,
  PieChart,
  DonutLarge,
} from '@mui/icons-material';
import Chart from 'react-apexcharts';
import MainLayout from '../../layouts/MainLayout';
import { useDashboard } from '../../hooks/useReports';
import PermissionGate from '../../components/PermissionGate';
import { PERMISSIONS } from '../../utils/permissions';

// ============================================
// 🎨 PREMIUM COLOR SYSTEM - SaaS Enterprise Style
// ============================================
const DASHBOARD_COLORS = {
  // Primary colors - Soft blue
  primary: {
    main: '#0EA5E9',
    light: '#38BDF8',
    dark: '#0284C7',
    gradient: 'linear-gradient(135deg, #0EA5E9 0%, #06B6D4 100%)',
    glow: 'rgba(14, 165, 233, 0.25)',
  },
  // Secondary - Fresh green
  secondary: {
    main: '#22C55E',
    light: '#4ADE80',
    dark: '#16A34A',
    gradient: 'linear-gradient(135deg, #22C55E 0%, #10B981 100%)',
    glow: 'rgba(34, 197, 94, 0.25)',
  },
  // Warning - Warm amber
  warning: {
    main: '#F59E0B',
    light: '#FBBF24',
    dark: '#D97706',
    gradient: 'linear-gradient(135deg, #F59E0B 0%, #F97316 100%)',
    glow: 'rgba(245, 158, 11, 0.25)',
  },
  // Accent - Purple pastel
  accent: {
    main: '#8B5CF6',
    light: '#A78BFA',
    dark: '#7C3AED',
    gradient: 'linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%)',
    glow: 'rgba(139, 92, 246, 0.25)',
  },
  // Danger - Soft red
  danger: {
    main: '#EF4444',
    light: '#F87171',
    dark: '#DC2626',
    gradient: 'linear-gradient(135deg, #EF4444 0%, #F97316 100%)',
  },
  // Background
  background: {
    main: '#F7F9FC',
    paper: '#FFFFFF',
    subtle: '#F1F5F9',
  },
  // Text
  text: {
    primary: '#1E293B',
    secondary: '#64748B',
    muted: '#94A3B8',
  },
};

// ============================================
// 🎬 ANIMATION VARIANTS
// ============================================
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 100, damping: 15 },
  },
};

const floatAnimation = {
  y: [0, -6, 0],
  transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
};

// ============================================
// 📊 PREMIUM KPI CARD - Floating Card Style
// ============================================
const KPICard = ({ title, value, subtitle, icon: Icon, gradient, trend, trendValue, trendLabel, isLoading, onClick }) => {
  const theme = useTheme();

  return (
    <Card
      component={motion.div}
      variants={itemVariants}
      whileHover={{
        y: -6,
        scale: 1.01,
        boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
        transition: { duration: 0.25 }
      }}
      onClick={onClick}
      sx={{
        height: '100%',
        position: 'relative',
        overflow: 'visible',
        cursor: onClick ? 'pointer' : 'default',
        bgcolor: '#FFFFFF',
        borderRadius: '20px',
        border: '1px solid',
        borderColor: alpha('#000', 0.04),
        boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {isLoading ? (
          <>
            <Skeleton width={100} height={20} />
            <Skeleton width={140} height={48} sx={{ mt: 1.5 }} />
            <Skeleton width={120} height={24} sx={{ mt: 2 }} />
          </>
        ) : (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: DASHBOARD_COLORS.text.secondary,
                    fontWeight: 500,
                    fontSize: '0.85rem',
                    letterSpacing: '0.02em',
                  }}
                >
                  {title}
                </Typography>
                <Typography
                  variant="h4"
                  sx={{
                    mt: 1.5,
                    fontWeight: 800,
                    fontSize: '2rem',
                    letterSpacing: '-0.02em',
                    color: DASHBOARD_COLORS.text.primary,
                  }}
                >
                  {value}
                </Typography>
                {subtitle && (
                  <Typography
                    variant="caption"
                    sx={{
                      mt: 0.5,
                      display: 'block',
                      color: DASHBOARD_COLORS.text.muted,
                      fontSize: '0.75rem',
                    }}
                  >
                    {subtitle}
                  </Typography>
                )}
              </Box>

              {/* 3D Soft Icon Container */}
              <Box
                component={motion.div}
                animate={floatAnimation}
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '18px',
                  background: gradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 12px 24px ${alpha(gradient?.includes('#0EA5E9') ? DASHBOARD_COLORS.primary.main :
                    gradient?.includes('#22C55E') ? DASHBOARD_COLORS.secondary.main :
                      gradient?.includes('#F59E0B') ? DASHBOARD_COLORS.warning.main : DASHBOARD_COLORS.accent.main, 0.3)}`,
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '18px',
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, transparent 50%)',
                  },
                }}
              >
                <Icon sx={{ fontSize: 28, color: 'white', position: 'relative', zIndex: 1 }} />
              </Box>
            </Box>

            {/* Trend Chip */}
            {trend && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mt: 2.5,
                  gap: 1,
                }}
              >
                <Chip
                  icon={trend === 'up' ? <TrendingUp sx={{ fontSize: 14 }} /> :
                    trend === 'down' ? <TrendingDown sx={{ fontSize: 14 }} /> :
                      <TrendingFlat sx={{ fontSize: 14 }} />}
                  label={`${trend === 'up' ? '+' : trend === 'down' ? '-' : ''}${trendValue}%`}
                  size="small"
                  sx={{
                    height: 26,
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    bgcolor: trend === 'up'
                      ? alpha(DASHBOARD_COLORS.secondary.main, 0.1)
                      : trend === 'down'
                        ? alpha(DASHBOARD_COLORS.danger.main, 0.1)
                        : alpha(DASHBOARD_COLORS.text.muted, 0.1),
                    color: trend === 'up'
                      ? DASHBOARD_COLORS.secondary.main
                      : trend === 'down'
                        ? DASHBOARD_COLORS.danger.main
                        : DASHBOARD_COLORS.text.secondary,
                    '& .MuiChip-icon': {
                      color: 'inherit',
                    },
                  }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                  {trendLabel || 'so với hôm qua'}
                </Typography>
              </Box>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

// ============================================
// 📈 PREMIUM CHART CARD
// ============================================
const ChartCard = ({ title, subtitle, icon: Icon, action, children, isLoading, minHeight = 'auto' }) => {
  return (
    <Card
      component={motion.div}
      variants={itemVariants}
      sx={{
        height: '100%',
        bgcolor: '#FFFFFF',
        borderRadius: '20px',
        border: '1px solid',
        borderColor: alpha('#000', 0.04),
        boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
        overflow: 'hidden',
      }}
    >
      <CardContent sx={{ p: 3, minHeight }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {Icon && (
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '12px',
                  background: DASHBOARD_COLORS.primary.gradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 8px 16px ${DASHBOARD_COLORS.primary.glow}`,
                }}
              >
                <Icon sx={{ fontSize: 22, color: 'white' }} />
              </Box>
            )}
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem', color: DASHBOARD_COLORS.text.primary }}>
                {title}
              </Typography>
              {subtitle && (
                <Typography variant="caption" sx={{ color: DASHBOARD_COLORS.text.muted, fontSize: '0.8rem' }}>
                  {subtitle}
                </Typography>
              )}
            </Box>
          </Box>
          {action}
        </Box>

        {/* Content */}
        {children}
      </CardContent>
    </Card>
  );
};

// ============================================
// ⭐ BEST SELLER ITEM - Enhanced with image
// ============================================
const BestSellerItem = ({ item, index, dishName, dishImage, price, profit, soldCount }) => {
  const rankColors = ['#FFD700', '#C0C0C0', '#CD7F32', '#94A3B8', '#94A3B8'];
  const badges = ['Hot', 'Trending ↑', 'Popular', '', ''];

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08 }}
      whileHover={{
        x: 4,
        transition: { duration: 0.2 }
      }}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        p: 1.5,
        borderRadius: '14px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        '&:hover': {
          bgcolor: alpha(DASHBOARD_COLORS.primary.main, 0.04),
        },
      }}
    >
      {/* Rank Badge */}
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: '10px',
          background: index < 3
            ? `linear-gradient(135deg, ${rankColors[index]} 0%, ${alpha(rankColors[index], 0.7)} 100%)`
            : alpha('#94A3B8', 0.15),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: index < 3 ? `0 4px 12px ${alpha(rankColors[index], 0.35)}` : 'none',
        }}
      >
        {index < 3 ? (
          <Star sx={{ fontSize: 16, color: index === 0 ? '#1E293B' : 'white' }} />
        ) : (
          <Typography variant="caption" fontWeight={700} color="text.secondary">
            #{index + 1}
          </Typography>
        )}
      </Box>

      {/* Dish Image */}
      <Avatar
        src={dishImage}
        variant="rounded"
        sx={{
          width: 52,
          height: 52,
          borderRadius: '12px',
          bgcolor: alpha(DASHBOARD_COLORS.primary.main, 0.1),
          boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
        }}
      >
        <LocalDining sx={{ color: DASHBOARD_COLORS.primary.main }} />
      </Avatar>

      {/* Info */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 600,
            fontSize: '0.9rem',
            color: DASHBOARD_COLORS.text.primary,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {dishName || item?.ten || `Món #${item?.monAnId?.slice(0, 8)}`}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.5 }}>
          <Typography variant="caption" sx={{ color: DASHBOARD_COLORS.secondary.main, fontWeight: 600 }}>
            {(price ?? item?.giaBan ?? '---')}₫
          </Typography>
          <FiberManualRecord sx={{ fontSize: 4, color: DASHBOARD_COLORS.text.muted }} />
          <Typography variant="caption" sx={{ color: DASHBOARD_COLORS.text.muted }}>
            Đã bán: <strong>{soldCount || item?._sum?.soLuong || 0}</strong>
          </Typography>
        </Box>
      </Box>

      {/* Badge */}
      {index < 3 && badges[index] && (
        <Chip
          icon={index === 0 ? <Whatshot sx={{ fontSize: 14 }} /> :
            index === 1 ? <TrendingUp sx={{ fontSize: 14 }} /> :
              <NewReleases sx={{ fontSize: 14 }} />}
          label={badges[index]}
          size="small"
          sx={{
            height: 26,
            fontWeight: 600,
            fontSize: '0.7rem',
            background: index === 0
              ? DASHBOARD_COLORS.danger.gradient
              : index === 1
                ? DASHBOARD_COLORS.secondary.gradient
                : DASHBOARD_COLORS.primary.gradient,
            color: 'white',
            '& .MuiChip-icon': { color: 'white' },
          }}
        />
      )}
    </Box>
  );
};

// ============================================
// ⚠️ STOCK ALERT ITEM - Enhanced visual
// ============================================
const StockAlertItem = ({ item, index }) => {
  const percentage = (item.soLuongTon / item.mucTonToiThieu) * 100;
  const isUrgent = percentage < 30;
  const daysRemaining = Math.ceil(item.soLuongTon / 2); // Estimate consumption rate

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08 }}
      sx={{
        p: 2,
        mb: 1.5,
        borderRadius: '14px',
        bgcolor: isUrgent
          ? alpha(DASHBOARD_COLORS.danger.main, 0.06)
          : alpha(DASHBOARD_COLORS.warning.main, 0.06),
        border: '1px solid',
        borderColor: isUrgent
          ? alpha(DASHBOARD_COLORS.danger.main, 0.15)
          : alpha(DASHBOARD_COLORS.warning.main, 0.15),
        transition: 'all 0.2s',
        '&:hover': {
          transform: 'translateX(4px)',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        {/* Warning Icon */}
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: '12px',
            bgcolor: isUrgent ? DASHBOARD_COLORS.danger.main : DASHBOARD_COLORS.warning.main,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 6px 16px ${alpha(isUrgent ? DASHBOARD_COLORS.danger.main : DASHBOARD_COLORS.warning.main, 0.3)}`,
          }}
        >
          <Warning sx={{ fontSize: 22, color: 'white' }} />
        </Box>

        {/* Info */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: DASHBOARD_COLORS.text.primary, fontSize: '0.95rem' }}>
            {item.ten}
          </Typography>

          <Box sx={{ mt: 1.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
              <Typography
                variant="caption"
                sx={{
                  color: isUrgent ? DASHBOARD_COLORS.danger.main : DASHBOARD_COLORS.warning.main,
                  fontWeight: 700,
                  fontSize: '0.8rem',
                }}
              >
                Còn: {item.soLuongTon} {item.donViTinh}
              </Typography>
              <Typography variant="caption" sx={{ color: DASHBOARD_COLORS.text.muted }}>
                Tối thiểu: {item.mucTonToiThieu}
              </Typography>
            </Box>

            <LinearProgress
              variant="determinate"
              value={Math.min(percentage, 100)}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: alpha(isUrgent ? DASHBOARD_COLORS.danger.main : DASHBOARD_COLORS.warning.main, 0.12),
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  background: isUrgent ? DASHBOARD_COLORS.danger.gradient : DASHBOARD_COLORS.warning.gradient,
                },
              }}
            />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
              <Timer sx={{ fontSize: 14, color: DASHBOARD_COLORS.text.muted }} />
              <Typography variant="caption" sx={{ color: DASHBOARD_COLORS.text.muted }}>
                Dự kiến hết trong ~{daysRemaining} ngày
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

// ============================================
// 👨‍🍳 ACTIVITY FEED ITEM
// ============================================
const ActivityItem = ({ type, title, time, user, icon: Icon, color }) => {
  const typeMap = {
    order: { Icon: ShoppingCart, color: DASHBOARD_COLORS.primary.main },
    payment: { Icon: AttachMoney, color: DASHBOARD_COLORS.secondary.main },
    cancel: { Icon: Warning, color: DASHBOARD_COLORS.warning.main },
    checkin: { Icon: Person, color: DASHBOARD_COLORS.accent.main },
    checkout: { Icon: Person, color: DASHBOARD_COLORS.accent.main },
    inventory: { Icon: Inventory, color: DASHBOARD_COLORS.warning.main },
    system: { Icon: Timeline, color: DASHBOARD_COLORS.text.muted },
  };
  const resolved = Icon && color ? { Icon, color } : (typeMap[type] || typeMap.system);
  const ResolvedIcon = resolved.Icon;
  const resolvedColor = resolved.color;

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1.5,
        py: 1.5,
        borderBottom: '1px solid',
        borderColor: alpha('#000', 0.04),
        '&:last-child': { borderBottom: 'none' },
      }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: '10px',
          bgcolor: alpha(resolvedColor, 0.1),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <ResolvedIcon sx={{ fontSize: 18, color: resolvedColor }} />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.85rem', color: DASHBOARD_COLORS.text.primary }}>
          {title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.25 }}>
          <Typography variant="caption" sx={{ color: DASHBOARD_COLORS.text.muted }}>
            {time}
          </Typography>
          {user && (
            <>
              <FiberManualRecord sx={{ fontSize: 4, color: DASHBOARD_COLORS.text.muted }} />
              <Typography variant="caption" sx={{ color: DASHBOARD_COLORS.text.secondary }}>
                {user}
              </Typography>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};

// ============================================
// 👥 SHIFT EMPLOYEE ITEM
// ============================================
const ShiftEmployee = ({ name, role, status, avatar, time }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 1.5,
      p: 1.5,
      borderRadius: '12px',
      bgcolor: alpha(DASHBOARD_COLORS.background.subtle, 0.5),
      mb: 1,
    }}
  >
    <Badge
      overlap="circular"
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      badgeContent={
        <FiberManualRecord
          sx={{
            fontSize: 12,
            color: status === 'active' ? DASHBOARD_COLORS.secondary.main :
              status === 'upcoming' ? DASHBOARD_COLORS.warning.main :
                DASHBOARD_COLORS.text.muted,
            bgcolor: 'white',
            borderRadius: '50%',
          }}
        />
      }
    >
      <Avatar
        src={avatar}
        sx={{
          width: 40,
          height: 40,
          bgcolor: DASHBOARD_COLORS.primary.main,
          fontSize: '0.9rem',
          fontWeight: 600,
        }}
      >
        {name?.charAt(0)}
      </Avatar>
    </Badge>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
        {name}
      </Typography>
      <Typography variant="caption" sx={{ color: DASHBOARD_COLORS.text.muted }}>
        {role}
      </Typography>
    </Box>
    <Chip
      label={time}
      size="small"
      sx={{
        height: 24,
        fontSize: '0.7rem',
        fontWeight: 600,
        bgcolor: status === 'active'
          ? alpha(DASHBOARD_COLORS.secondary.main, 0.1)
          : alpha(DASHBOARD_COLORS.text.muted, 0.1),
        color: status === 'active'
          ? DASHBOARD_COLORS.secondary.main
          : DASHBOARD_COLORS.text.secondary,
      }}
    />
  </Box>
);

// ============================================
// 🎯 QUICK ACTION BUTTON
// ============================================
const QuickAction = ({ icon: Icon, label, gradient, onClick }) => (
  <Tooltip title={label} arrow>
    <IconButton
      component={motion.button}
      whileHover={{ scale: 1.08, y: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      sx={{
        width: 52,
        height: 52,
        borderRadius: '14px',
        background: gradient,
        color: 'white',
        boxShadow: `0 8px 20px ${alpha('#000', 0.15)}`,
        '&:hover': {
          background: gradient,
        },
      }}
    >
      <Icon sx={{ fontSize: 24 }} />
    </IconButton>
  </Tooltip>
);

// ============================================
// 📊 TIME RANGE SELECTOR
// ============================================
const TimeRangeSelector = ({ value, onChange }) => (
  <ButtonGroup size="small" sx={{ bgcolor: DASHBOARD_COLORS.background.subtle, borderRadius: '10px', p: 0.5 }}>
    {['Tuần', 'Tháng', 'Năm'].map((label, idx) => (
      <Button
        key={label}
        onClick={() => onChange(idx)}
        sx={{
          px: 2.5,
          py: 0.75,
          fontWeight: 600,
          fontSize: '0.8rem',
          borderRadius: '8px !important',
          border: 'none !important',
          ...(value === idx ? {
            background: DASHBOARD_COLORS.primary.gradient,
            color: 'white',
            boxShadow: `0 4px 12px ${DASHBOARD_COLORS.primary.glow}`,
            '&:hover': {
              background: DASHBOARD_COLORS.primary.gradient,
            },
          } : {
            bgcolor: 'transparent',
            color: DASHBOARD_COLORS.text.secondary,
            '&:hover': {
              bgcolor: alpha(DASHBOARD_COLORS.primary.main, 0.08),
            },
          }),
        }}
      >
        {label}
      </Button>
    ))}
  </ButtonGroup>
);

// ============================================
// 🏠 MAIN DASHBOARD COMPONENT
// ============================================
const ManagerDashboard = () => {
  const [timeRange, setTimeRange] = useState(0);
  const rangeParam = useMemo(() => ['week', 'month', 'year'][timeRange] || 'week', [timeRange]);
  const dashboardParams = useMemo(() => ({ range: rangeParam }), [rangeParam]);
  const { data, isLoading, refetch } = useDashboard(dashboardParams);
  const navigate = useNavigate();
  const theme = useTheme();

  // Current greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  const currentDate = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const currentTime = new Date().toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const formatTimeAgo = (dateInput) => {
    const d = dateInput ? new Date(dateInput) : null;
    if (!d || Number.isNaN(d.getTime())) return '';
    const diffMs = Date.now() - d.getTime();
    const sec = Math.floor(diffMs / 1000);
    if (sec < 60) return 'vừa xong';
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min} phút trước`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr} giờ trước`;
    const day = Math.floor(hr / 24);
    return `${day} ngày trước`;
  };

  // KPI Cards Data với permissions
  const kpiCards = [
    {
      title: 'Doanh thu hôm nay',
      value: (data?.revenue || 0).toLocaleString('vi-VN') + '₫',
      subtitle: `Cập nhật lúc ${currentTime}`,
      icon: MonetizationOn,
      gradient: DASHBOARD_COLORS.primary.gradient,
      trend: data?.trends?.revenue?.trend || 'flat',
      trendValue: data?.trends?.revenue?.value ?? 0,
      onClick: () => navigate('/reports/sales?period=today'),
      permission: PERMISSIONS.REPORT_VIEW,
    },
    {
      title: 'Số hóa đơn',
      value: data?.bills || 0,
      subtitle: 'Đơn hàng hoàn thành',
      icon: Receipt,
      gradient: DASHBOARD_COLORS.secondary.gradient,
      trend: data?.trends?.bills?.trend || 'flat',
      trendValue: data?.trends?.bills?.value ?? 0,
      onClick: () => navigate('/billing'),
      permission: PERMISSIONS.PAYMENT_VIEW,
    },
    {
      title: 'Giá trị trung bình',
      value: (data?.avgBill || 0).toLocaleString('vi-VN') + '₫',
      subtitle: 'Mỗi hóa đơn',
      icon: Analytics,
      gradient: DASHBOARD_COLORS.warning.gradient,
      trend: data?.trends?.avgBill?.trend || 'flat',
      trendValue: data?.trends?.avgBill?.value ?? 0,
      permission: PERMISSIONS.REPORT_VIEW,
    },
    {
      title: 'Khách hàng',
      value: data?.guests || 0,
      subtitle: 'Lượt phục vụ hôm nay',
      icon: Group,
      gradient: DASHBOARD_COLORS.accent.gradient,
      trend: data?.trends?.guests?.trend || 'flat',
      trendValue: data?.trends?.guests?.value ?? 0,
      onClick: () => navigate('/customers'),
      permission: PERMISSIONS.CUSTOMER_VIEW,
    },
  ];

  const revenueChartTitle = ['Doanh thu theo tuần', 'Doanh thu theo tháng', 'Doanh thu theo năm'][timeRange] || 'Doanh thu';
  const revenueChartSubtitle = ['Biểu đồ doanh thu 7 ngày qua', 'Biểu đồ doanh thu trong tháng', 'Biểu đồ doanh thu trong năm'][timeRange] || '';

  const revenueChartCategories = data?.revenueChart?.categories || ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  const revenueChartSeries = data?.revenueChart?.series || [
    {
      name: 'Doanh thu',
      data: [0, 0, 0, 0, 0, 0, 0],
    },
  ];

  // Revenue Chart Config - Premium Style
  const revenueChartOptions = {
    chart: {
      type: 'area',
      toolbar: { show: false },
      background: 'transparent',
      fontFamily: 'Inter, sans-serif',
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
      },
    },
    colors: [DASHBOARD_COLORS.primary.main],
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [0, 90, 100],
        colorStops: [
          { offset: 0, color: DASHBOARD_COLORS.primary.main, opacity: 0.4 },
          { offset: 50, color: DASHBOARD_COLORS.accent.main, opacity: 0.2 },
          { offset: 100, color: DASHBOARD_COLORS.accent.main, opacity: 0.05 },
        ],
      },
    },
    stroke: {
      curve: 'smooth',
      width: 3,
      lineCap: 'round',
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => (val / 1000000).toFixed(1) + 'M',
      style: {
        fontSize: '11px',
        fontWeight: 600,
        colors: [DASHBOARD_COLORS.text.primary],
      },
      background: {
        enabled: true,
        borderRadius: 6,
        padding: 6,
        opacity: 0.95,
        borderColor: alpha('#000', 0.05),
        borderWidth: 1,
      },
      offsetY: -8,
    },
    xaxis: {
      categories: revenueChartCategories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: {
          colors: DASHBOARD_COLORS.text.muted,
          fontSize: '12px',
          fontWeight: 500,
        },
      },
    },
    yaxis: {
      labels: {
        formatter: (val) => (val / 1000000).toFixed(1) + 'M₫',
        style: {
          colors: DASHBOARD_COLORS.text.muted,
          fontSize: '11px',
        },
      },
    },
    tooltip: {
      theme: 'light',
      y: {
        formatter: (val) => val.toLocaleString('vi-VN') + '₫',
      },
      style: {
        fontSize: '13px',
      },
    },
    grid: {
      strokeDashArray: 4,
      borderColor: alpha('#000', 0.06),
      padding: { top: 0, right: 10, bottom: 0, left: 10 },
    },
    markers: {
      size: 5,
      colors: ['white'],
      strokeColors: DASHBOARD_COLORS.primary.main,
      strokeWidth: 3,
      hover: { size: 8 },
    },
  };

  // Category Donut Chart Config
  const categoryChartOptions = {
    chart: {
      type: 'donut',
      background: 'transparent',
      fontFamily: 'Inter, sans-serif',
    },
    colors: [DASHBOARD_COLORS.primary.main, DASHBOARD_COLORS.accent.main, DASHBOARD_COLORS.secondary.main, DASHBOARD_COLORS.warning.main, '#94A3B8'],
    labels: ['Món chính', 'Đồ uống', 'Tráng miệng', 'Khai vị', 'Khác'],
    legend: {
      position: 'bottom',
      fontSize: '13px',
      fontWeight: 500,
      markers: {
        width: 12,
        height: 12,
        radius: 4,
      },
      itemMargin: { horizontal: 12, vertical: 8 },
    },
    plotOptions: {
      pie: {
        donut: {
          size: '72%',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '14px',
              fontWeight: 600,
              color: DASHBOARD_COLORS.text.primary,
            },
            value: {
              show: true,
              fontSize: '28px',
              fontWeight: 800,
              color: DASHBOARD_COLORS.text.primary,
              formatter: (val) => val,
            },
            total: {
              show: true,
              label: 'Tổng đơn',
              fontSize: '13px',
              fontWeight: 500,
              color: DASHBOARD_COLORS.text.muted,
              formatter: () => data?.bills || 0,
            },
          },
        },
      },
    },
    stroke: { width: 2, colors: ['#fff'] },
    dataLabels: { enabled: false },
    tooltip: {
      y: {
        formatter: (val) => val + ' đơn',
      },
    },
  };

  const categoryChartSeries = [44, 25, 15, 10, 6];

  const activities = (data?.recentActivities || []).map((a) => ({
    ...a,
    time: formatTimeAgo(a.createdAt),
  }));

  const shiftEmployees = data?.todayShifts || [];

  return (
    <MainLayout title="Dashboard">
      <Box
        component={motion.div}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        sx={{
          bgcolor: DASHBOARD_COLORS.background.main,
          minHeight: '100vh',
          p: { xs: 2, md: 3 },
          mx: -3,
          mt: -3,
        }}
      >
        {/* ========== GREETING & QUICK ACTIONS ========== */}
        <Box
          component={motion.div}
          variants={itemVariants}
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4,
            flexWrap: 'wrap',
            gap: 2,
            px: { xs: 1, md: 0 },
          }}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                fontSize: { xs: '1.5rem', md: '1.75rem' },
                color: DASHBOARD_COLORS.text.primary,
                mb: 0.5,
              }}
            >
              {getGreeting()}! 👋
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarToday sx={{ fontSize: 16, color: DASHBOARD_COLORS.text.muted }} />
              <Typography variant="body2" sx={{ color: DASHBOARD_COLORS.text.secondary }}>
                {currentDate}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Quick Actions */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <QuickAction
                icon={TableRestaurant}
                label="Sơ đồ bàn"
                gradient={DASHBOARD_COLORS.primary.gradient}
                onClick={() => navigate('/pos')}
              />
              <QuickAction
                icon={Add}
                label="Tạo đơn mới"
                gradient={DASHBOARD_COLORS.secondary.gradient}
                onClick={() => navigate('/pos/order')}
              />
              <QuickAction
                icon={Receipt}
                label="Thanh toán"
                gradient={DASHBOARD_COLORS.warning.gradient}
                onClick={() => navigate('/billing')}
              />
            </Box>

            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

            <Tooltip title="Làm mới dữ liệu">
              <IconButton
                onClick={() => refetch?.()}
                sx={{
                  width: 44,
                  height: 44,
                  bgcolor: 'white',
                  borderRadius: '12px',
                  border: '1px solid',
                  borderColor: alpha('#000', 0.06),
                  '&:hover': { bgcolor: alpha(DASHBOARD_COLORS.primary.main, 0.08) },
                }}
              >
                <Refresh sx={{ color: DASHBOARD_COLORS.text.secondary }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* ========== KPI CARDS ========== */}
        <Grid container spacing={3} sx={{ mb: 4, px: { xs: 1, md: 0 } }}>
          {kpiCards.map((card, index) => (
            <PermissionGate key={index} permission={card.permission}>
              <Grid item xs={12} sm={6} lg={3}>
                <KPICard {...card} isLoading={isLoading} />
              </Grid>
            </PermissionGate>
          ))}
        </Grid>

        {/* ========== CHARTS ROW ========== */}
        <Grid container spacing={3} sx={{ mb: 4, px: { xs: 1, md: 0 } }}>
          {/* Revenue Chart */}
          <PermissionGate permission={PERMISSIONS.REPORT_VIEW}>
            <Grid item xs={12} lg={8}>
              <ChartCard
                title={revenueChartTitle}
                subtitle={revenueChartSubtitle}
                icon={BarChart}
                action={<TimeRangeSelector value={timeRange} onChange={setTimeRange} />}
              >
                {isLoading ? (
                  <Skeleton variant="rectangular" height={350} sx={{ borderRadius: '12px' }} />
                ) : (
                  <Box sx={{ mt: 1 }}>
                    <Chart
                      options={revenueChartOptions}
                      series={revenueChartSeries}
                      type="area"
                      height={350}
                    />
                  </Box>
                )}
              </ChartCard>
            </Grid>
          </PermissionGate>

          {/* Category Chart */}
          <PermissionGate permission={PERMISSIONS.REPORT_VIEW}>
            <Grid item xs={12} lg={4}>
              <ChartCard
                title="Phân bố theo danh mục"
                subtitle="Tỷ lệ đơn hàng theo loại"
                icon={DonutLarge}
              >
                {isLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <Skeleton variant="circular" width={220} height={220} />
                  </Box>
                ) : (
                  <Chart
                    options={categoryChartOptions}
                    series={categoryChartSeries}
                    type="donut"
                    height={350}
                  />
                )}
              </ChartCard>
            </Grid>
          </PermissionGate>
        </Grid>

        {/* ========== BOTTOM ROW ========== */}
        <Grid container spacing={3} sx={{ px: { xs: 1, md: 0 } }}>
          {/* Best Sellers */}
          <PermissionGate permission={PERMISSIONS.MENU_VIEW}>
            <Grid item xs={12} md={6} lg={4}>
              <ChartCard
                title="Món bán chạy"
                subtitle="Top 5 món được đặt nhiều nhất"
                icon={Whatshot}
                action={
                  <Button
                    endIcon={<ArrowForward />}
                    size="small"
                    onClick={() => navigate('/reports/menu')}
                    sx={{
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      px: 2,
                      borderRadius: '10px',
                      background: DASHBOARD_COLORS.primary.gradient,
                      color: 'white',
                      boxShadow: `0 4px 12px ${DASHBOARD_COLORS.primary.glow}`,
                      '&:hover': {
                        background: DASHBOARD_COLORS.primary.gradient,
                        boxShadow: `0 6px 16px ${DASHBOARD_COLORS.primary.glow}`,
                      },
                    }}
                  >
                    Xem tất cả
                  </Button>
                }
                minHeight={400}
              >
                {isLoading ? (
                  <Stack spacing={2}>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} variant="rectangular" height={60} sx={{ borderRadius: '12px' }} />
                    ))}
                  </Stack>
                ) : data?.bestSellers?.length > 0 ? (
                  <Box>
                    {data.bestSellers.slice(0, 5).map((item, index) => (
                      <BestSellerItem key={item.monAnId} item={item} index={index} />
                    ))}
                  </Box>
                ) : (
                  <Box sx={{ py: 6, textAlign: 'center' }}>
                    <Box
                      component={motion.div}
                      animate={floatAnimation}
                      sx={{
                        width: 80,
                        height: 80,
                        mx: 'auto',
                        mb: 2,
                        borderRadius: '20px',
                        background: alpha(DASHBOARD_COLORS.primary.main, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Restaurant sx={{ fontSize: 40, color: DASHBOARD_COLORS.text.muted }} />
                    </Box>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      Chưa có dữ liệu
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Dữ liệu sẽ hiển thị khi có đơn hàng
                    </Typography>
                  </Box>
                )}
              </ChartCard>
            </Grid>
          </PermissionGate>

          {/* Stock Alerts */}
          <PermissionGate permission={PERMISSIONS.STOCK_VIEW}>
            <Grid item xs={12} md={6} lg={4}>
              <ChartCard
                title="Cảnh báo tồn kho"
                subtitle="Nguyên liệu cần nhập thêm"
                icon={Inventory}
                action={
                  <Chip
                    icon={<Warning sx={{ fontSize: 14 }} />}
                    label={data?.stockAlerts?.length || 0}
                    size="small"
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      height: 28,
                      background: (data?.stockAlerts?.length || 0) > 0
                        ? DASHBOARD_COLORS.danger.gradient
                        : DASHBOARD_COLORS.secondary.gradient,
                      color: 'white',
                      '& .MuiChip-icon': { color: 'white' },
                    }}
                  />
                }
                minHeight={400}
              >
                {isLoading ? (
                  <Stack spacing={2}>
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} variant="rectangular" height={100} sx={{ borderRadius: '12px' }} />
                    ))}
                  </Stack>
                ) : data?.stockAlerts?.length > 0 ? (
                  <Box>
                    {data.stockAlerts.map((item, index) => (
                      <StockAlertItem key={item.id} item={item} index={index} />
                    ))}
                  </Box>
                ) : (
                  <Box sx={{ py: 6, textAlign: 'center' }}>
                    <Box
                      component={motion.div}
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      sx={{
                        width: 80,
                        height: 80,
                        mx: 'auto',
                        mb: 2,
                        borderRadius: '50%',
                        background: alpha(DASHBOARD_COLORS.secondary.main, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <CheckCircle sx={{ fontSize: 40, color: DASHBOARD_COLORS.secondary.main }} />
                    </Box>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      Tuyệt vời! 🎉
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Tất cả nguyên liệu đều đủ mức tồn kho
                    </Typography>
                  </Box>
                )}
              </ChartCard>
            </Grid>
          </PermissionGate>

          {/* Activity Feed & Shift Schedule */}
          <PermissionGate permission={PERMISSIONS.HR_VIEW}>
            <Grid item xs={12} lg={4}>
              <Stack spacing={3}>
                {/* Activity Feed */}
                <ChartCard
                  title="Hoạt động gần đây"
                  subtitle="Cập nhật real-time"
                  icon={Timeline}
                >
                  {activities.length > 0 ? (
                    <Box>
                      {activities.map((activity) => (
                        <ActivityItem key={activity.id} {...activity} />
                      ))}
                    </Box>
                  ) : (
                    <Box sx={{ py: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Chưa có hoạt động gần đây.
                      </Typography>
                    </Box>
                  )}
                </ChartCard>

                {/* Shift Schedule */}
                <ChartCard
                  title="Ca làm việc hôm nay"
                  subtitle="Nhân viên đang làm việc"
                  icon={Schedule}
                >
                  {shiftEmployees.length > 0 ? (
                    <Box>
                      {shiftEmployees.map((emp) => (
                        <ShiftEmployee key={emp.id} {...emp} />
                      ))}
                    </Box>
                  ) : (
                    <Box sx={{ py: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Chưa có lịch phân ca cho hôm nay.
                      </Typography>
                    </Box>
                  )}
                </ChartCard>
              </Stack>
            </Grid>
          </PermissionGate>
        </Grid>
      </Box>
    </MainLayout>
  );
};

export default ManagerDashboard;
