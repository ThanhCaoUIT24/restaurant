import React, { useMemo, useState, useEffect } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
  alpha,
  Fade,
  Zoom,
  ToggleButton,
  ToggleButtonGroup,
  Badge,
  LinearProgress,
  Collapse,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Person as PersonIcon,
  Phone as PhoneIcon,
  Group as GroupIcon,
  AccessTime as TimeIcon,
  Notes as NotesIcon,
  CalendarMonth as CalendarIcon,
  EventSeat as SeatIcon,
  Restaurant as RestaurantIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  TableBar as TableIcon,
  LocationOn as LocationIcon,
  ArrowForward as ArrowIcon,
  Info as InfoIcon,
  Timer as TimerIcon,
  NotificationsActive as NotificationIcon,
  Celebration as CelebrationIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Lock as LockIcon,
  ChairAlt as ChairIcon,
  AutoAwesome as AutoIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  ViewWeek as ViewWeekIcon,
  ViewDay as ViewDayIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import MainLayout from '../../layouts/MainLayout';
import { useReservations, useCreateReservation, useUpdateReservation, useWeekReservations } from '../../hooks/useReservations';
import { useTables } from '../../hooks/useTables';

// ==================== COLOR SYSTEM - Premium Pastel ====================
const COLORS = {
  // Primary Palette - Soft Indigo
  primary: '#6366F1',
  primaryLight: '#A5B4FC',
  primaryDark: '#4F46E5',
  primaryPastel: '#EEF2FF',     // Tím nhạt premium

  // Secondary Palette - Mint Green
  secondary: '#10B981',
  secondaryLight: '#6EE7B7',
  secondaryPastel: '#ECFDF5',   // Xanh mint premium

  // Accent Colors
  warning: '#F59E0B',
  warningLight: '#FCD34D',
  warningPastel: '#FEF3C7',     // Vàng ấm premium

  danger: '#EF4444',
  dangerLight: '#FCA5A5',
  dangerPastel: '#FEF2F2',      // Rose nhạt premium

  info: '#3B82F6',
  infoLight: '#93C5FD',
  infoPastel: '#EFF6FF',        // Blue nhạt premium

  // Premium Gradients
  gradientPrimary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  gradientSuccess: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
  gradientWarning: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  gradientInfo: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',

  // Table Status Colors (Pastel Soft)
  tableEmpty: '#D1FAE5',       // Mint pastel - Trống
  tableEmptyGlow: 'rgba(16, 185, 129, 0.15)',
  tableReserved: '#DBEAFE',    // Blue pastel - Đã đặt
  tableReservedGlow: 'rgba(59, 130, 246, 0.15)',
  tableWaiting: '#FEF3C7',     // Amber pastel - Chờ khách
  tableWaitingGlow: 'rgba(245, 158, 11, 0.15)',
  tableOccupied: '#FECDD3',    // Rose pastel - Có khách
  tableOccupiedGlow: 'rgba(239, 68, 68, 0.15)',

  // Background - Soft & Clean
  background: '#F8FAFC',
  backgroundGradient: 'linear-gradient(180deg, #F8FAFC 0%, #EEF2FF 100%)',
  cardBg: '#FFFFFF',
  cardBgHover: '#FAFBFF',

  // Glass Effect
  glass: 'rgba(255, 255, 255, 0.7)',
  glassBorder: 'rgba(255, 255, 255, 0.3)',

  // Text
  textPrimary: '#1E293B',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',

  // Border - Softer
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  borderFocus: '#A5B4FC',

  // Shadows - Apple style soft ambient
  shadowSm: '0 2px 8px rgba(0, 0, 0, 0.04)',
  shadowMd: '0 4px 12px rgba(0, 0, 0, 0.05)',
  shadowLg: '0 8px 24px rgba(0, 0, 0, 0.08)',
  shadowXl: '0 12px 40px rgba(0, 0, 0, 0.1)',
  shadowPrimary: '0 8px 24px rgba(99, 102, 241, 0.25)',
  shadowSuccess: '0 8px 24px rgba(16, 185, 129, 0.25)',
  shadowWarning: '0 8px 24px rgba(245, 158, 11, 0.25)',
  shadowDanger: '0 8px 24px rgba(239, 68, 68, 0.2)',
};

// ==================== STATUS CONFIG - Enhanced with Premium Badges ====================
const STATUS_CONFIG = {
  CHODEN: {
    label: 'Chờ đến',
    color: COLORS.warning,
    bgColor: COLORS.warningPastel,
    gradient: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
    icon: <ScheduleIcon fontSize="small" />
  },
  DANHANBAN: {
    label: 'Đã nhận bàn',
    color: COLORS.info,
    bgColor: COLORS.infoPastel,
    gradient: 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)',
    icon: <CheckIcon fontSize="small" />
  },
  HUY: {
    label: 'Đã hủy',
    color: COLORS.danger,
    bgColor: COLORS.dangerPastel,
    gradient: 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)',
    icon: <CloseIcon fontSize="small" />
  },
  KHONGDEN: {
    label: 'Không đến',
    color: COLORS.textMuted,
    bgColor: '#F1F5F9',
    gradient: 'linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 100%)',
    icon: <WarningIcon fontSize="small" />
  },
};

// Badge Types for special occasions
const BADGE_TYPES = {
  VIP: { label: 'VIP', color: '#7C3AED', bgColor: '#EDE9FE', icon: '👑' },
  BIRTHDAY: { label: 'Sinh nhật', color: '#EC4899', bgColor: '#FCE7F3', icon: '🎂' },
  ANNIVERSARY: { label: 'Kỷ niệm', color: '#F59E0B', bgColor: '#FEF3C7', icon: '⭐' },
  FIRST_TIME: { label: 'Khách mới', color: '#10B981', bgColor: '#ECFDF5', icon: '🆕' },
  ALLERGY: { label: 'Dị ứng', color: '#EF4444', bgColor: '#FEF2F2', icon: '⚠️' },
  REGULAR: { label: 'Khách quen', color: '#3B82F6', bgColor: '#EFF6FF', icon: '💙' },
};

// Detect badges from notes
const detectBadges = (ghiChu = '') => {
  const badges = [];
  const note = ghiChu.toLowerCase();

  if (note.includes('vip') || note.includes('quan trọng')) badges.push('VIP');
  if (note.includes('sinh nhật') || note.includes('birthday')) badges.push('BIRTHDAY');
  if (note.includes('kỷ niệm') || note.includes('anniversary') || note.includes('ngày cưới')) badges.push('ANNIVERSARY');
  if (note.includes('dị ứng') || note.includes('allergy')) badges.push('ALLERGY');

  return badges;
};

const TABLE_STATUS_CONFIG = {
  TRONG: {
    label: 'Trống',
    color: COLORS.secondary,
    bgColor: COLORS.tableEmpty,
    glowColor: COLORS.tableEmptyGlow,
    gradient: 'linear-gradient(145deg, #D1FAE5 0%, #A7F3D0 50%, #6EE7B7 100%)',
    icon: <CheckIcon fontSize="small" />
  },
  DADAT: {
    label: 'Đã đặt',
    color: COLORS.info,
    bgColor: COLORS.tableReserved,
    glowColor: COLORS.tableReservedGlow,
    gradient: 'linear-gradient(145deg, #DBEAFE 0%, #BFDBFE 50%, #93C5FD 100%)',
    icon: <LockIcon fontSize="small" />
  },
  CHOKHACH: {
    label: 'Chờ khách',
    color: COLORS.warning,
    bgColor: COLORS.tableWaiting,
    glowColor: COLORS.tableWaitingGlow,
    gradient: 'linear-gradient(145deg, #FEF3C7 0%, #FDE68A 50%, #FCD34D 100%)',
    icon: <TimerIcon fontSize="small" />
  },
  COKHACH: {
    label: 'Có khách',
    color: COLORS.danger,
    bgColor: COLORS.tableOccupied,
    glowColor: COLORS.tableOccupiedGlow,
    gradient: 'linear-gradient(145deg, #FECDD3 0%, #FDA4AF 50%, #FB7185 100%)',
    icon: <PersonIcon fontSize="small" />
  },
};

// ==================== ANIMATION VARIANTS - Premium Smooth ====================
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0, scale: 0.95 },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 24 }
  }
};

const tableHoverVariants = {
  initial: { scale: 1, y: 0 },
  hover: {
    scale: 1.08,
    y: -4,
    boxShadow: '0 16px 32px rgba(0,0,0,0.12)',
    transition: { type: 'spring', stiffness: 400, damping: 17 }
  },
  tap: { scale: 0.95 }
};

const cardHoverVariants = {
  initial: { y: 0, boxShadow: COLORS.shadowMd },
  hover: {
    y: -4,
    boxShadow: COLORS.shadowLg,
    transition: { type: 'spring', stiffness: 400, damping: 17 }
  }
};

const pulseAnimation = {
  scale: [1, 1.02, 1],
  transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
};

const shimmerAnimation = {
  backgroundPosition: ['200% 0', '-200% 0'],
  transition: { duration: 3, repeat: Infinity, ease: 'linear' }
};

// ==================== FORMAT HELPERS ====================
const formatPhoneNumber = (value) => {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length <= 4) return cleaned;
  if (cleaned.length <= 7) return `${cleaned.slice(0, 4)} ${cleaned.slice(4)}`;
  return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7, 10)}`;
};

const getTimeUntil = (dateTime) => {
  const now = new Date();
  const target = new Date(dateTime);
  const diff = target - now;

  if (diff < 0) {
    const minLate = Math.abs(Math.floor(diff / 60000));
    if (minLate > 10) return { text: 'Đã quá giờ', late: true, minutes: minLate };
    return { text: `Trễ ${minLate} phút`, late: true, minutes: minLate };
  }

  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);

  if (hours > 0) return { text: `Còn ${hours}h ${minutes}p`, late: false };
  return { text: `Còn ${minutes} phút`, late: false, minutes };
};

// ==================== BOOKING TICKET COMPONENT - Premium Design ====================
const BookingTicket = ({ reservation, isSelected, onSelect, onStatusChange }) => {
  const timeInfo = getTimeUntil(reservation.thoiGianDen);
  const status = STATUS_CONFIG[reservation.trangThai] || STATUS_CONFIG.CHODEN;
  const badges = detectBadges(reservation.ghiChu);
  // Multi-level urgency: 0-30min (very urgent), 30-60min (urgent), 60-120min (coming soon)
  const isVeryUrgent = !timeInfo.late && timeInfo.minutes && timeInfo.minutes <= 30;
  const isUrgent = !timeInfo.late && timeInfo.minutes && timeInfo.minutes > 30 && timeInfo.minutes <= 60;
  const isComingSoon = !timeInfo.late && timeInfo.minutes && timeInfo.minutes > 60 && timeInfo.minutes <= 120;

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      onClick={() => onSelect(reservation)}
    >
      <Paper
        sx={{
          p: 0,
          overflow: 'hidden',
          border: isSelected ? `2px solid ${COLORS.primary}` : `1px solid ${COLORS.border}`,
          borderRadius: 4,
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: isSelected
            ? COLORS.shadowPrimary
            : COLORS.shadowSm,
          background: isSelected
            ? `linear-gradient(135deg, ${alpha(COLORS.primaryPastel, 0.5)} 0%, ${COLORS.cardBg} 100%)`
            : COLORS.cardBg,
          position: 'relative',
          '&:hover': {
            borderColor: COLORS.primary,
            boxShadow: COLORS.shadowLg,
            transform: 'translateY(-2px)',
          },
          // Premium shimmer effect on hover
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
            transition: 'left 0.5s ease',
          },
          '&:hover::before': {
            left: '100%',
          }
        }}
      >
        {/* Coming Soon Indicator */}
        {isComingSoon && (
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: `linear-gradient(90deg, ${COLORS.warning}, ${COLORS.warningLight}, ${COLORS.warning})`,
            backgroundSize: '200% 100%',
            animation: 'shimmer 2s infinite',
            '@keyframes shimmer': {
              '0%': { backgroundPosition: '200% 0' },
              '100%': { backgroundPosition: '-200% 0' }
            }
          }} />
        )}

        {/* Header with status indicator */}
        <Box sx={{
          px: 2.5,
          py: 2,
          background: status.gradient || status.bgColor,
          borderBottom: `1px solid ${alpha(status.color, 0.1)}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{
              width: 44,
              height: 44,
              borderRadius: 3,
              bgcolor: COLORS.cardBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: COLORS.shadowMd,
              position: 'relative'
            }}>
              <PersonIcon sx={{ color: COLORS.primary, fontSize: 24 }} />
              {badges.includes('VIP') && (
                <Box sx={{
                  position: 'absolute',
                  top: -6,
                  right: -6,
                  fontSize: '14px',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                }}>👑</Box>
              )}
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: COLORS.textPrimary, fontSize: '1.05rem' }}>
                {reservation.khachHang?.hoTen || 'Khách hàng'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.3 }}>
                <PhoneIcon sx={{ fontSize: 13, color: COLORS.textSecondary }} />
                <Typography
                  variant="caption"
                  sx={{
                    color: COLORS.textSecondary,
                    cursor: 'pointer',
                    '&:hover': { color: COLORS.primary, textDecoration: 'underline' }
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    window.location.href = `tel:${reservation.khachHang?.soDienThoai}`;
                  }}
                >
                  {reservation.khachHang?.soDienThoai || '-'}
                </Typography>
                <Tooltip title="Gọi điện" arrow>
                  <IconButton
                    size="small"
                    sx={{
                      ml: 0.5,
                      width: 24,
                      height: 24,
                      bgcolor: alpha(COLORS.secondary, 0.1),
                      '&:hover': { bgcolor: alpha(COLORS.secondary, 0.2) }
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = `tel:${reservation.khachHang?.soDienThoai}`;
                    }}
                  >
                    <PhoneIcon sx={{ fontSize: 12, color: COLORS.secondary }} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
            <Chip
              icon={status.icon}
              label={status.label}
              size="small"
              sx={{
                bgcolor: alpha(status.color, 0.15),
                color: status.color,
                fontWeight: 600,
                fontSize: '0.75rem',
                border: `1px solid ${alpha(status.color, 0.2)}`,
                '& .MuiChip-icon': { color: status.color }
              }}
            />
          </Box>
        </Box>

        {/* Badges Row */}
        {badges.length > 0 && (
          <Box sx={{
            px: 2.5,
            py: 1,
            display: 'flex',
            gap: 1,
            flexWrap: 'wrap',
            borderBottom: `1px solid ${COLORS.borderLight}`,
            bgcolor: alpha(COLORS.primaryPastel, 0.3)
          }}>
            {badges.map(badgeKey => {
              const badge = BADGE_TYPES[badgeKey];
              return (
                <Chip
                  key={badgeKey}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <span>{badge.icon}</span>
                      <span>{badge.label}</span>
                    </Box>
                  }
                  size="small"
                  sx={{
                    height: 24,
                    bgcolor: badge.bgColor,
                    color: badge.color,
                    fontWeight: 600,
                    fontSize: '0.7rem',
                    border: `1px solid ${alpha(badge.color, 0.2)}`,
                  }}
                />
              );
            })}
          </Box>
        )}

        {/* Body */}
        <Box sx={{ p: 2.5 }}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                p: 1.5,
                borderRadius: 3,
                bgcolor: timeInfo.late ? alpha(COLORS.danger, 0.08) : alpha(COLORS.primary, 0.06),
                border: `1px solid ${timeInfo.late ? alpha(COLORS.danger, 0.15) : alpha(COLORS.primary, 0.1)}`
              }}>
                <Box sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  background: timeInfo.late
                    ? `linear-gradient(135deg, ${COLORS.dangerPastel} 0%, ${alpha(COLORS.danger, 0.2)} 100%)`
                    : `linear-gradient(135deg, ${COLORS.primaryPastel} 0%, ${alpha(COLORS.primary, 0.15)} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <TimeIcon sx={{ fontSize: 18, color: timeInfo.late ? COLORS.danger : COLORS.primary }} />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{
                    fontWeight: 800,
                    color: timeInfo.late ? COLORS.danger : COLORS.textPrimary,
                    fontSize: '1.15rem',
                    lineHeight: 1.2
                  }}>
                    {new Date(reservation.thoiGianDen).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                  <Typography variant="caption" sx={{ color: COLORS.textSecondary, fontSize: '0.7rem' }}>
                    {new Date(reservation.thoiGianDen).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={6}>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                p: 1.5,
                borderRadius: 3,
                bgcolor: alpha(COLORS.secondaryPastel, 0.6),
                border: `1px solid ${alpha(COLORS.secondary, 0.15)}`
              }}>
                <Box sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  background: `linear-gradient(135deg, ${COLORS.secondaryPastel} 0%, ${alpha(COLORS.secondary, 0.2)} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <GroupIcon sx={{ fontSize: 18, color: COLORS.secondary }} />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: COLORS.textPrimary, fontSize: '1.15rem', lineHeight: 1.2 }}>
                    {reservation.soKhach} khách
                  </Typography>
                  {reservation.ban && (
                    <Typography variant="caption" sx={{ color: COLORS.secondary, fontWeight: 600, fontSize: '0.7rem' }}>
                      Bàn {reservation.ban.ten}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Grid>
          </Grid>

          {/* Time countdown - Enhanced with gradient */}
          <Box sx={{
            mt: 2,
            p: 1.5,
            borderRadius: 3,
            background: timeInfo.late
              ? `linear-gradient(135deg, ${alpha(COLORS.danger, 0.12)} 0%, ${alpha(COLORS.danger, 0.06)} 100%)`
              : isComingSoon
                ? `linear-gradient(135deg, ${alpha(COLORS.warning, 0.15)} 0%, ${alpha(COLORS.warning, 0.08)} 100%)`
                : `linear-gradient(135deg, ${alpha(COLORS.primary, 0.1)} 0%, ${alpha(COLORS.primary, 0.04)} 100%)`,
            border: `1px solid ${timeInfo.late ? alpha(COLORS.danger, 0.2) : isComingSoon ? alpha(COLORS.warning, 0.2) : alpha(COLORS.primary, 0.15)}`,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5
          }}>
            {timeInfo.late ? (
              <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                <NotificationIcon sx={{ fontSize: 20, color: COLORS.danger }} />
              </motion.div>
            ) : isComingSoon ? (
              <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 1, repeat: Infinity }}>
                <NotificationIcon sx={{ fontSize: 20, color: COLORS.warning }} />
              </motion.div>
            ) : (
              <TimerIcon sx={{ fontSize: 20, color: COLORS.primary }} />
            )}
            <Typography variant="body2" sx={{
              fontWeight: 700,
              color: timeInfo.late ? COLORS.danger : isComingSoon ? COLORS.warning : COLORS.primary,
              fontSize: '0.9rem'
            }}>
              {timeInfo.text}
            </Typography>
            {(isVeryUrgent || isUrgent || isComingSoon) && (
              <Chip
                label={
                  isVeryUrgent ? "SẮP ĐẾN!" :
                    isUrgent ? "RẤT GẦN" :
                      "SẮP CÓ KHÁCH"
                }
                size="small"
                sx={{
                  ml: 'auto',
                  bgcolor: isVeryUrgent ? COLORS.dangerPastel : isUrgent ? alpha(COLORS.warning, 0.2) : COLORS.warningPastel,
                  color: isVeryUrgent ? COLORS.danger : isUrgent ? COLORS.warning : COLORS.warning,
                  fontWeight: 700,
                  fontSize: '0.65rem',
                  height: 22,
                  animation: isVeryUrgent ? 'pulse 1s infinite' : isUrgent ? 'pulse 1.5s infinite' : 'none',
                  '@keyframes pulse': {
                    '0%, 100%': { opacity: 1 },
                    '50%': { opacity: 0.7 }
                  }
                }}
              />
            )}
          </Box>

          {reservation.ghiChu && (
            <Box sx={{
              mt: 2,
              p: 1.5,
              borderRadius: 3,
              bgcolor: alpha(COLORS.infoPastel, 0.5),
              border: `1px dashed ${alpha(COLORS.info, 0.3)}`,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1
            }}>
              <NotesIcon sx={{ fontSize: 16, color: COLORS.info, mt: 0.2 }} />
              <Typography variant="caption" sx={{ color: COLORS.textSecondary, fontStyle: 'italic', lineHeight: 1.5 }}>
                {reservation.ghiChu}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Actions Footer - Enhanced */}
        <Box sx={{
          px: 2.5,
          py: 2,
          borderTop: `1px solid ${COLORS.borderLight}`,
          bgcolor: alpha(COLORS.background, 0.5),
          display: 'flex',
          gap: 1.5
        }}>
          {reservation.trangThai === 'CHODEN' && (
            <>
              <Button
                size="small"
                variant="contained"
                startIcon={<CheckIcon />}
                onClick={(e) => { e.stopPropagation(); onStatusChange(reservation, 'DANHANBAN'); }}
                sx={{
                  flex: 1,
                  py: 1,
                  background: `linear-gradient(135deg, ${COLORS.secondary} 0%, ${COLORS.secondaryLight} 100%)`,
                  borderRadius: 2.5,
                  textTransform: 'none',
                  fontWeight: 700,
                  boxShadow: COLORS.shadowSuccess,
                  '&:hover': {
                    background: `linear-gradient(135deg, ${COLORS.secondaryLight} 0%, ${COLORS.secondary} 100%)`,
                    transform: 'translateY(-1px)'
                  }
                }}
              >
                Khách đã đến
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="error"
                startIcon={<CloseIcon />}
                onClick={(e) => { e.stopPropagation(); onStatusChange(reservation, 'HUY'); }}
                sx={{
                  flex: 1,
                  py: 1,
                  borderRadius: 2.5,
                  textTransform: 'none',
                  fontWeight: 600,
                  borderWidth: 2,
                  '&:hover': {
                    borderWidth: 2,
                    bgcolor: alpha(COLORS.danger, 0.08)
                  }
                }}
              >
                Hủy
              </Button>
            </>
          )}
          {reservation.trangThai === 'DANHANBAN' && reservation.ban && (
            <Button
              fullWidth
              size="small"
              variant="contained"
              startIcon={<RestaurantIcon />}
              endIcon={<ArrowIcon />}
              sx={{
                py: 1,
                background: `linear-gradient(135deg, ${COLORS.info} 0%, ${COLORS.infoLight} 100%)`,
                borderRadius: 2.5,
                textTransform: 'none',
                fontWeight: 700,
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                '&:hover': {
                  background: `linear-gradient(135deg, ${COLORS.infoLight} 0%, ${COLORS.info} 100%)`,
                }
              }}
            >
              Chuyển sang POS Order
            </Button>
          )}
          {reservation.trangThai === 'DANHANBAN' && !reservation.ban && (
            <Chip
              icon={<CelebrationIcon />}
              label="Khách đã đến - Chờ gán bàn"
              color="success"
              sx={{ width: '100%', fontWeight: 600, py: 2 }}
            />
          )}
        </Box>
      </Paper>
    </motion.div>
  );
};

// ==================== TABLE BUBBLE COMPONENT - 3D Soft Premium ====================
const TableBubble = ({ table, isHighlighted, isRecommended, onSelect, selectedResvId, reservation }) => {
  const [showPopup, setShowPopup] = useState(false);
  const status = TABLE_STATUS_CONFIG[table.trangThai] || TABLE_STATUS_CONFIG.TRONG;
  const isAssigned = table.reservationId === selectedResvId;

  const seats = table.soGhe || 4;
  const size = Math.max(85, 65 + seats * 8);

  return (
    <Tooltip
      open={showPopup}
      onOpen={() => setShowPopup(true)}
      onClose={() => setShowPopup(false)}
      arrow
      placement="top"
      TransitionComponent={Zoom}
      componentsProps={{
        tooltip: {
          sx: {
            bgcolor: COLORS.cardBg,
            color: COLORS.textPrimary,
            boxShadow: COLORS.shadowXl,
            borderRadius: 4,
            p: 0,
            maxWidth: 300,
            border: `1px solid ${COLORS.border}`,
            overflow: 'hidden',
          }
        },
        arrow: {
          sx: {
            color: COLORS.cardBg,
            '&::before': {
              border: `1px solid ${COLORS.border}`,
            }
          }
        }
      }}
      title={
        <Box>
          {/* Popover Header */}
          <Box sx={{
            p: 2,
            background: status.gradient,
            borderBottom: `1px solid ${alpha(status.color, 0.2)}`
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{
                width: 40,
                height: 40,
                borderRadius: 3,
                bgcolor: COLORS.cardBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: COLORS.shadowMd
              }}>
                <TableIcon sx={{ color: status.color, fontSize: 22 }} />
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: COLORS.textPrimary }}>
                  Bàn {table.ten}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <ChairIcon sx={{ fontSize: 12, color: COLORS.textSecondary }} />
                  <Typography variant="caption" sx={{ color: COLORS.textSecondary, fontWeight: 600 }}>
                    {seats} ghế
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ ml: 'auto' }}>
                {React.cloneElement(status.icon, {
                  sx: {
                    fontSize: 20,
                    color: status.color,
                    bgcolor: alpha(status.color, 0.15),
                    p: 0.5,
                    borderRadius: 1
                  }
                })}
              </Box>
            </Box>
          </Box>

          {/* Popover Body */}
          <Box sx={{ p: 2 }}>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              p: 1.5,
              borderRadius: 2,
              bgcolor: status.bgColor,
              border: `1px solid ${alpha(status.color, 0.2)}`
            }}>
              {status.icon}
              <Typography variant="body2" sx={{ color: status.color, fontWeight: 700 }}>
                {status.label}
              </Typography>
            </Box>

            {reservation && (
              <Box sx={{
                mt: 2,
                p: 1.5,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${COLORS.infoPastel} 0%, ${alpha(COLORS.info, 0.08)} 100%)`,
                border: `1px solid ${alpha(COLORS.info, 0.2)}`
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <PersonIcon sx={{ fontSize: 16, color: COLORS.info }} />
                  <Typography variant="caption" sx={{ color: COLORS.textSecondary, fontWeight: 600 }}>
                    Khách đặt
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 700, color: COLORS.textPrimary }}>
                  {reservation.khachHang?.hoTen}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                  <TimeIcon sx={{ fontSize: 12, color: COLORS.textSecondary }} />
                  <Typography variant="caption" sx={{ color: COLORS.textSecondary }}>
                    Đến lúc: {new Date(reservation.thoiGianDen).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                </Box>
                {reservation.khachHang?.soDienThoai && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    <PhoneIcon sx={{ fontSize: 12, color: COLORS.textSecondary }} />
                    <Typography variant="caption" sx={{ color: COLORS.textSecondary }}>
                      {reservation.khachHang.soDienThoai}
                    </Typography>
                  </Box>
                )}
              </Box>
            )}

            {selectedResvId && table.trangThai === 'TRONG' && (
              <Button
                fullWidth
                variant="contained"
                size="small"
                startIcon={<ArrowIcon />}
                sx={{
                  mt: 2,
                  py: 1,
                  background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryLight} 100%)`,
                  borderRadius: 2.5,
                  textTransform: 'none',
                  fontWeight: 700,
                  boxShadow: COLORS.shadowPrimary,
                  '&:hover': {
                    background: `linear-gradient(135deg, ${COLORS.primaryLight} 0%, ${COLORS.primary} 100%)`,
                  }
                }}
              >
                Gán bàn này
              </Button>
            )}
          </Box>
        </Box>
      }
    >
      <motion.div
        variants={tableHoverVariants}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        animate={isAssigned ? { scale: [1, 1.03, 1] } : {}}
        transition={isAssigned ? { duration: 1.5, repeat: Infinity } : {}}
        style={{
          position: 'absolute',
          left: table.posX || 0,
          top: table.posY || 0,
        }}
      >
        <Paper
          onClick={() => onSelect(table)}
          elevation={0}
          sx={{
            width: size,
            height: size,
            borderRadius: table.shape === 'circle' ? '50%' : 4,
            background: status.gradient,
            border: isAssigned
              ? `3px solid ${COLORS.primary}`
              : isHighlighted
                ? `3px solid ${COLORS.secondary}`
                : isRecommended
                  ? `3px dashed ${COLORS.warning}`
                  : `2px solid ${alpha(status.color, 0.4)}`,
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'visible',
            // 3D Soft Bubble Effect
            boxShadow: isAssigned
              ? `0 8px 32px ${alpha(COLORS.primary, 0.4)}, inset 0 -4px 12px ${alpha(status.color, 0.15)}, inset 0 4px 8px rgba(255,255,255,0.4)`
              : isRecommended
                ? `0 8px 24px ${alpha(COLORS.warning, 0.35)}, inset 0 -3px 10px ${alpha(status.color, 0.1)}, inset 0 3px 6px rgba(255,255,255,0.3)`
                : `0 4px 16px ${status.glowColor || 'rgba(0,0,0,0.08)'}, inset 0 -2px 8px ${alpha(status.color, 0.1)}, inset 0 2px 4px rgba(255,255,255,0.3)`,
            // Glossy top highlight
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '8%',
              left: '15%',
              right: '15%',
              height: '25%',
              borderRadius: '50%',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 100%)',
              pointerEvents: 'none',
            },
            '&:hover': {
              borderColor: COLORS.primary,
              transform: 'translateY(-4px)',
              boxShadow: `0 12px 36px ${alpha(COLORS.primary, 0.3)}, inset 0 -4px 12px ${alpha(status.color, 0.15)}, inset 0 4px 8px rgba(255,255,255,0.5)`,
            }
          }}
        >
          {/* Status Icon Badge - 3D Effect */}
          <Box sx={{
            position: 'absolute',
            top: -10,
            right: -10,
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: `linear-gradient(145deg, ${status.color} 0%, ${alpha(status.color, 0.8)} 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 4px 12px ${alpha(status.color, 0.4)}, inset 0 2px 4px rgba(255,255,255,0.3)`,
            color: '#fff',
            border: '2px solid #fff',
          }}>
            {React.cloneElement(status.icon, { sx: { fontSize: 14 } })}
          </Box>

          {/* Recommended Badge - Animated */}
          {isRecommended && (
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                position: 'absolute',
                top: -14,
                left: '50%',
                transform: 'translateX(-50%)',
              }}
            >
              <Box sx={{
                px: 1.5,
                py: 0.4,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${COLORS.warning} 0%, ${COLORS.warningLight} 100%)`,
                color: '#fff',
                fontSize: '0.65rem',
                fontWeight: 800,
                whiteSpace: 'nowrap',
                boxShadow: COLORS.shadowWarning,
                display: 'flex',
                alignItems: 'center',
                gap: 0.3,
                border: '2px solid #fff',
              }}>
                <AutoIcon sx={{ fontSize: 11 }} />
                Phù hợp
              </Box>
            </motion.div>
          )}

          <Typography variant="subtitle1" sx={{
            fontWeight: 800,
            color: COLORS.textPrimary,
            fontSize: '1.1rem',
            textShadow: '0 1px 2px rgba(255,255,255,0.5)'
          }}>
            {table.ten}
          </Typography>

          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            mt: 0.5,
            px: 1,
            py: 0.3,
            borderRadius: 1.5,
            bgcolor: alpha(COLORS.cardBg, 0.7),
            backdropFilter: 'blur(4px)'
          }}>
            <ChairIcon sx={{ fontSize: 12, color: COLORS.textSecondary }} />
            <Typography variant="caption" sx={{ color: COLORS.textSecondary, fontWeight: 700, fontSize: '0.7rem' }}>
              {seats} ghế
            </Typography>
          </Box>

          {/* Reserved Time indicator */}
          {table.trangThai === 'DADAT' && reservation && (
            <Box sx={{
              position: 'absolute',
              bottom: -10,
              left: '50%',
              transform: 'translateX(-50%)',
              px: 1,
              py: 0.3,
              borderRadius: 1,
              bgcolor: COLORS.info,
              color: '#fff',
              fontSize: '0.65rem',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: 0.3
            }}>
              <LockIcon sx={{ fontSize: 10 }} />
              {new Date(reservation.thoiGianDen).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
            </Box>
          )}
        </Paper>
      </motion.div>
    </Tooltip>
  );
};

// ==================== TABLE MAP COMPONENT - Enhanced Filters ====================
const TableMap = ({ tables, onAssign, selectedResvId, reservations, suggestedSeats }) => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterZone, setFilterZone] = useState('all');
  const [filterSeats, setFilterSeats] = useState('all');
  const [showComingSoon, setShowComingSoon] = useState(false);

  const zones = [...new Set(tables.flat().flatMap(([zone]) => zone))];
  const seatOptions = [2, 4, 6, 8, 10];

  const getTableReservation = (tableId) => {
    return reservations.find(r => r.banId === tableId && r.trangThai === 'CHODEN');
  };

  // Check if table has reservation coming in next 2 hours (extended from 15 minutes)
  const hasComingSoonReservation = (tableId) => {
    const reservation = reservations.find(r => r.banId === tableId && r.trangThai === 'CHODEN');
    if (!reservation) return false;

    const now = new Date();
    const arrivalTime = new Date(reservation.thoiGianDen);
    const diff = arrivalTime - now;
    const TWO_HOURS = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
    return diff > 0 && diff <= TWO_HOURS;
  };

  const isRecommended = (table) => {
    if (!suggestedSeats || !selectedResvId) return false;
    const seats = table.soGhe || 4;
    return table.trangThai === 'TRONG' && seats >= suggestedSeats && seats <= suggestedSeats + 2;
  };

  return (
    <Box>
      {/* Enhanced Filters */}
      <Box sx={{
        mb: 3,
        p: 2.5,
        borderRadius: 4,
        background: `linear-gradient(135deg, ${COLORS.primaryPastel} 0%, ${alpha(COLORS.infoPastel, 0.5)} 100%)`,
        border: `1px solid ${alpha(COLORS.primary, 0.1)}`
      }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: COLORS.textPrimary, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterIcon sx={{ fontSize: 18 }} />
          Bộ lọc thông minh
        </Typography>

        <Stack spacing={2}>
          {/* Status Filter - Tab Style */}
          <Box>
            <Typography variant="caption" sx={{ color: COLORS.textSecondary, fontWeight: 600, mb: 1, display: 'block' }}>
              Trạng thái bàn
            </Typography>
            <ToggleButtonGroup
              value={filterStatus}
              exclusive
              onChange={(e, val) => val && setFilterStatus(val)}
              size="small"
              sx={{
                flexWrap: 'wrap',
                gap: 0.5,
                '& .MuiToggleButton-root': {
                  borderRadius: 3,
                  px: 2,
                  py: 0.8,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  border: `1px solid ${COLORS.border}`,
                  '&.Mui-selected': {
                    bgcolor: COLORS.primary,
                    color: '#fff',
                    '&:hover': { bgcolor: COLORS.primaryDark }
                  }
                }
              }}
            >
              <ToggleButton value="all">Tất cả</ToggleButton>
              <ToggleButton value="TRONG">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: COLORS.secondary }} />
                  Trống
                </Box>
              </ToggleButton>
              <ToggleButton value="DADAT">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: COLORS.info }} />
                  Đã đặt
                </Box>
              </ToggleButton>
              <ToggleButton value="CHOKHACH">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: COLORS.warning }} />
                  Chờ khách
                </Box>
              </ToggleButton>
              <ToggleButton value="COKHACH">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: COLORS.danger }} />
                  Có khách
                </Box>
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Grid container spacing={2}>
            {/* Seats Filter */}
            <Grid item xs={12} sm={4}>
              <Typography variant="caption" sx={{ color: COLORS.textSecondary, fontWeight: 600, mb: 1, display: 'block' }}>
                <ChairIcon sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
                Số ghế
              </Typography>
              <ToggleButtonGroup
                value={filterSeats}
                exclusive
                onChange={(e, val) => val && setFilterSeats(val)}
                size="small"
                sx={{
                  '& .MuiToggleButton-root': {
                    borderRadius: 2,
                    px: 1.5,
                    minWidth: 40,
                    fontWeight: 600,
                    '&.Mui-selected': {
                      bgcolor: COLORS.secondary,
                      color: '#fff',
                    }
                  }
                }}
              >
                <ToggleButton value="all">All</ToggleButton>
                {seatOptions.map(num => (
                  <ToggleButton key={num} value={num}>{num}</ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Grid>

            {/* Zone Filter */}
            {zones.length > 1 && (
              <Grid item xs={12} sm={4}>
                <Typography variant="caption" sx={{ color: COLORS.textSecondary, fontWeight: 600, mb: 1, display: 'block' }}>
                  <LocationIcon sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
                  Khu vực
                </Typography>
                <TextField
                  select
                  size="small"
                  value={filterZone}
                  onChange={(e) => setFilterZone(e.target.value)}
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2.5,
                      bgcolor: COLORS.cardBg,
                    }
                  }}
                >
                  <MenuItem value="all">Tất cả khu vực</MenuItem>
                  {zones.map(z => (
                    <MenuItem key={z} value={z}>{z}</MenuItem>
                  ))}
                </TextField>
              </Grid>
            )}

            {/* Coming Soon Toggle */}
            <Grid item xs={12} sm={4}>
              <Typography variant="caption" sx={{ color: COLORS.textSecondary, fontWeight: 600, mb: 1, display: 'block' }}>
                <TimerIcon sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
                Khách sắp đến
              </Typography>
              <Button
                variant={showComingSoon ? 'contained' : 'outlined'}
                size="small"
                startIcon={<NotificationIcon />}
                onClick={() => setShowComingSoon(!showComingSoon)}
                sx={{
                  borderRadius: 2.5,
                  textTransform: 'none',
                  fontWeight: 600,
                  bgcolor: showComingSoon ? COLORS.warning : 'transparent',
                  borderColor: COLORS.warning,
                  color: showComingSoon ? '#fff' : COLORS.warning,
                  '&:hover': {
                    bgcolor: showComingSoon ? COLORS.warningLight : alpha(COLORS.warning, 0.1),
                    borderColor: COLORS.warning,
                  }
                }}
              >
                15 phút tới
              </Button>
            </Grid>
          </Grid>
        </Stack>
      </Box>

      {/* Legend - Premium Style */}
      <Box sx={{
        display: 'flex',
        gap: 2,
        mb: 3,
        p: 2,
        borderRadius: 3,
        bgcolor: COLORS.cardBg,
        border: `1px solid ${COLORS.border}`,
        boxShadow: COLORS.shadowSm,
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        {Object.entries(TABLE_STATUS_CONFIG).map(([key, config]) => (
          <Box key={key} sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 1.5,
            py: 0.5,
            borderRadius: 2,
            bgcolor: alpha(config.bgColor, 0.5),
            border: `1px solid ${alpha(config.color, 0.2)}`
          }}>
            <Box sx={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              background: config.gradient,
              border: `2px solid ${alpha(config.color, 0.5)}`,
              boxShadow: `inset 0 2px 4px rgba(255,255,255,0.3)`
            }} />
            <Typography variant="caption" sx={{ fontWeight: 700, color: config.color }}>
              {config.label}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Table zones */}
      <Stack spacing={4}>
        {tables.map(([zone, list]) => {
          if (filterZone !== 'all' && zone !== filterZone) return null;

          let filteredList = filterStatus === 'all'
            ? list
            : list.filter(t => t.trangThai === filterStatus);

          // Filter by seats
          if (filterSeats !== 'all') {
            filteredList = filteredList.filter(t => (t.soGhe || 4) >= filterSeats);
          }

          // Filter by coming soon
          if (showComingSoon) {
            filteredList = filteredList.filter(t => hasComingSoonReservation(t.id));
          }

          if (!filteredList.length) return null;

          const emptyCount = filteredList.filter(t => t.trangThai === 'TRONG').length;

          return (
            <Box key={zone}>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                mb: 2.5,
                pb: 1.5,
                borderBottom: `3px solid transparent`,
                borderImage: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.primaryLight}, transparent) 1`
              }}>
                <Box sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryLight} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: COLORS.shadowPrimary
                }}>
                  <LocationIcon sx={{ color: '#fff', fontSize: 20 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: COLORS.textPrimary }}>
                  {zone}
                </Typography>
                <Chip
                  label={`${emptyCount}/${filteredList.length} bàn trống`}
                  size="small"
                  sx={{
                    background: `linear-gradient(135deg, ${COLORS.secondaryPastel} 0%, ${alpha(COLORS.secondary, 0.15)} 100%)`,
                    color: COLORS.secondary,
                    fontWeight: 700,
                    border: `1px solid ${alpha(COLORS.secondary, 0.2)}`
                  }}
                />
              </Box>

              <Box sx={{
                position: 'relative',
                minHeight: 400,
                border: `2px dashed ${alpha(COLORS.primary, 0.15)}`,
                borderRadius: 5,
                background: `linear-gradient(180deg, ${alpha(COLORS.primaryPastel, 0.3)} 0%, ${alpha(COLORS.infoPastel, 0.2)} 100%)`,
                p: 4,
                overflow: 'visible',
                boxShadow: `inset 0 2px 8px ${alpha(COLORS.primary, 0.05)}`
              }}>
                <AnimatePresence>
                  {filteredList.map((t) => (
                    <TableBubble
                      key={t.id}
                      table={t}
                      isHighlighted={t.reservationId === selectedResvId}
                      isRecommended={isRecommended(t)}
                      onSelect={onAssign}
                      selectedResvId={selectedResvId}
                      reservation={getTableReservation(t.id)}
                    />
                  ))}
                </AnimatePresence>
              </Box>
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
};

// ==================== WEEK CALENDAR COMPONENT ====================
const WeekCalendar = ({ onSelectDate, selectedDate, reservations = [] }) => {
  const [weekStart, setWeekStart] = useState(() => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Monday start
    const monday = new Date(now);
    monday.setDate(monday.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
  });

  const weekDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      days.push(day);
    }
    return days;
  }, [weekStart]);

  const weekEndDate = useMemo(() => {
    const end = new Date(weekStart);
    end.setDate(end.getDate() + 6);
    return end;
  }, [weekStart]);

  const goToPrevWeek = () => {
    const prev = new Date(weekStart);
    prev.setDate(prev.getDate() - 7);
    setWeekStart(prev);
  };

  const goToNextWeek = () => {
    const next = new Date(weekStart);
    next.setDate(next.getDate() + 7);
    setWeekStart(next);
  };

  const goToCurrentWeek = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(monday.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    setWeekStart(monday);
  };

  const getReservationsForDay = (day) => {
    const dayStr = day.toISOString().slice(0, 10);
    return reservations.filter(r => {
      const resvDate = new Date(r.thoiGianDen).toISOString().slice(0, 10);
      return resvDate === dayStr;
    });
  };

  const isToday = (day) => {
    const today = new Date();
    return day.toDateString() === today.toDateString();
  };

  const isSelected = (day) => {
    return day.toISOString().slice(0, 10) === selectedDate;
  };

  const dayNames = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  return (
    <Box>
      {/* Week Navigation Header */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        mb: 2,
        pb: 2,
        borderBottom: `1px solid ${COLORS.border}`
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            onClick={goToPrevWeek}
            sx={{
              bgcolor: alpha(COLORS.primary, 0.1),
              '&:hover': { bgcolor: alpha(COLORS.primary, 0.2) }
            }}
          >
            <ChevronLeftIcon />
          </IconButton>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: COLORS.textPrimary, minWidth: 200, textAlign: 'center' }}>
            {weekStart.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })} - {weekEndDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
          </Typography>
          <IconButton
            onClick={goToNextWeek}
            sx={{
              bgcolor: alpha(COLORS.primary, 0.1),
              '&:hover': { bgcolor: alpha(COLORS.primary, 0.2) }
            }}
          >
            <ChevronRightIcon />
          </IconButton>
        </Box>
        <Button
          size="small"
          variant="outlined"
          onClick={goToCurrentWeek}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            borderColor: COLORS.primary,
            color: COLORS.primary
          }}
        >
          Tuần này
        </Button>
      </Box>

      {/* Week Grid */}
      <Grid container spacing={1}>
        {weekDays.map((day, index) => {
          const dayReservations = getReservationsForDay(day);
          const isPast = day < new Date(new Date().setHours(0, 0, 0, 0));
          const pendingCount = dayReservations.filter(r => r.trangThai === 'CHODEN').length;
          const confirmedCount = dayReservations.filter(r => r.trangThai === 'DANHANBAN').length;

          return (
            <Grid item xs={12 / 7} key={index}>
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Paper
                  onClick={() => onSelectDate(day.toISOString().slice(0, 10))}
                  sx={{
                    p: 1.5,
                    cursor: 'pointer',
                    borderRadius: 3,
                    textAlign: 'center',
                    minHeight: 120,
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.2s ease',
                    border: isSelected(day)
                      ? `2px solid ${COLORS.primary}`
                      : isToday(day)
                        ? `2px solid ${COLORS.secondary}`
                        : `1px solid ${COLORS.border}`,
                    background: isSelected(day)
                      ? `linear-gradient(135deg, ${alpha(COLORS.primaryPastel, 0.8)} 0%, ${alpha(COLORS.primary, 0.1)} 100%)`
                      : isToday(day)
                        ? `linear-gradient(135deg, ${alpha(COLORS.secondaryPastel, 0.6)} 0%, ${alpha(COLORS.secondary, 0.1)} 100%)`
                        : isPast
                          ? alpha(COLORS.background, 0.5)
                          : COLORS.cardBg,
                    opacity: isPast ? 0.6 : 1,
                    boxShadow: isSelected(day) ? COLORS.shadowPrimary : COLORS.shadowSm,
                    '&:hover': {
                      boxShadow: COLORS.shadowMd,
                      borderColor: COLORS.primary,
                    }
                  }}
                >
                  {/* Day Name */}
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      color: isToday(day) ? COLORS.secondary : COLORS.textSecondary,
                      textTransform: 'uppercase',
                      fontSize: '0.65rem',
                      letterSpacing: 1
                    }}
                  >
                    {dayNames[index]}
                  </Typography>

                  {/* Day Number */}
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 800,
                      color: isSelected(day) ? COLORS.primary : isToday(day) ? COLORS.secondary : COLORS.textPrimary,
                      my: 0.5
                    }}
                  >
                    {day.getDate()}
                  </Typography>

                  {/* Reservation Count Badges */}
                  <Box sx={{ mt: 'auto', display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {dayReservations.length > 0 ? (
                      <>
                        {pendingCount > 0 && (
                          <Chip
                            size="small"
                            label={`${pendingCount} chờ`}
                            sx={{
                              height: 20,
                              fontSize: '0.65rem',
                              fontWeight: 700,
                              bgcolor: alpha(COLORS.warning, 0.15),
                              color: COLORS.warning,
                              '& .MuiChip-label': { px: 1 }
                            }}
                          />
                        )}
                        {confirmedCount > 0 && (
                          <Chip
                            size="small"
                            label={`${confirmedCount} xong`}
                            sx={{
                              height: 20,
                              fontSize: '0.65rem',
                              fontWeight: 700,
                              bgcolor: alpha(COLORS.secondary, 0.15),
                              color: COLORS.secondary,
                              '& .MuiChip-label': { px: 1 }
                            }}
                          />
                        )}
                      </>
                    ) : (
                      <Typography variant="caption" sx={{ color: COLORS.textMuted, fontSize: '0.6rem' }}>
                        Trống
                      </Typography>
                    )}
                  </Box>

                  {/* Today indicator */}
                  {isToday(day) && (
                    <Box sx={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: COLORS.secondary,
                      boxShadow: `0 0 8px ${COLORS.secondary}`
                    }} />
                  )}
                </Paper>
              </motion.div>
            </Grid>
          );
        })}
      </Grid>

      {/* Weekly Summary */}
      <Box sx={{
        mt: 2,
        p: 2,
        borderRadius: 3,
        bgcolor: alpha(COLORS.infoPastel, 0.5),
        border: `1px solid ${alpha(COLORS.info, 0.2)}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: COLORS.primary }}>
            {reservations.length}
          </Typography>
          <Typography variant="caption" sx={{ color: COLORS.textSecondary, fontWeight: 600 }}>
            Tổng đặt bàn tuần
          </Typography>
        </Box>
        <Divider orientation="vertical" flexItem />
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: COLORS.warning }}>
            {reservations.filter(r => r.trangThai === 'CHODEN').length}
          </Typography>
          <Typography variant="caption" sx={{ color: COLORS.textSecondary, fontWeight: 600 }}>
            Chờ đến
          </Typography>
        </Box>
        <Divider orientation="vertical" flexItem />
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: COLORS.secondary }}>
            {reservations.filter(r => r.trangThai === 'DANHANBAN').length}
          </Typography>
          <Typography variant="caption" sx={{ color: COLORS.textSecondary, fontWeight: 600 }}>
            Đã nhận bàn
          </Typography>
        </Box>
        <Divider orientation="vertical" flexItem />
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: COLORS.danger }}>
            {reservations.filter(r => r.trangThai === 'HUY' || r.trangThai === 'KHONGDEN').length}
          </Typography>
          <Typography variant="caption" sx={{ color: COLORS.textSecondary, fontWeight: 600 }}>
            Hủy/Không đến
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

// ==================== MAIN COMPONENT ====================
const Reservations = () => {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [viewMode, setViewMode] = useState('day'); // 'day' or 'week'
  const [form, setForm] = useState({
    tenKhach: '',
    soDienThoai: '',
    soKhach: 2,
    thoiGianDen: `${today}T19:00`,
    ghiChu: '',
    banId: null, // Add table selection
  });
  const [selectedResv, setSelectedResv] = useState(null);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [confirmDialog, setConfirmDialog] = useState({ open: false, table: null });

  // Calculate week dates for week view
  const weekDates = useMemo(() => {
    const selected = new Date(date);
    const dayOfWeek = selected.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(selected);
    monday.setDate(monday.getDate() + diff);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    return {
      start: monday.toISOString().slice(0, 10),
      end: sunday.toISOString().slice(0, 10)
    };
  }, [date]);

  const { data: reservations = [], refetch, isLoading } = useReservations({ date });
  const { data: weekReservations = [], isLoading: weekLoading } = useWeekReservations(weekDates.start, weekDates.end);
  const { data: tableData } = useTables();
  const tables = tableData?.items || [];

  const groupedTables = useMemo(() => {
    const groups = {};
    tables.forEach((t) => {
      const zone = t.khuVuc?.ten || 'Khu vực chung';
      if (!groups[zone]) groups[zone] = [];
      groups[zone].push(t);
    });
    return Object.entries(groups);
  }, [tables]);

  const filteredReservations = useMemo(() => {
    return reservations.filter(r => {
      const matchSearch = !searchQuery ||
        r.khachHang?.hoTen?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.khachHang?.soDienThoai?.includes(searchQuery);
      const matchStatus = statusFilter === 'all' || r.trangThai === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [reservations, searchQuery, statusFilter]);

  const createReservation = useCreateReservation();
  const updateReservation = useUpdateReservation();

  const handleSubmit = () => {
    if (!form.tenKhach.trim()) {
      setFeedback({ type: 'error', message: 'Vui lòng nhập tên khách' });
      return;
    }
    if (!form.soDienThoai.trim()) {
      setFeedback({ type: 'error', message: 'Vui lòng nhập số điện thoại' });
      return;
    }

    setFeedback({ type: '', message: '' });
    createReservation
      .mutateAsync(form)
      .then(() => {
        setForm({ ...form, tenKhach: '', soDienThoai: '', ghiChu: '', banId: null });
        setFeedback({ type: 'success', message: 'Đặt bàn thành công!' });
        refetch();
      })
      .catch((err) => setFeedback({
        type: 'error',
        message: err?.response?.data?.message || 'Không thể tạo đặt bàn'
      }));
  };

  const handleAssignTable = (table) => {
    if (!selectedResv) {
      setFeedback({ type: 'warning', message: 'Vui lòng chọn một đặt bàn trước khi gán' });
      return;
    }
    if (table.trangThai !== 'TRONG' && table.id !== selectedResv.banId) {
      setFeedback({ type: 'warning', message: 'Bàn này đang có khách hoặc đã được đặt' });
      return;
    }
    setConfirmDialog({ open: true, table });
  };

  const confirmAssign = () => {
    const table = confirmDialog.table;
    setConfirmDialog({ open: false, table: null });

    updateReservation
      .mutateAsync({ id: selectedResv.id, payload: { status: selectedResv.trangThai, banId: table.id } })
      .then(() => {
        setFeedback({ type: 'success', message: `Đã gán bàn ${table.ten} thành công!` });
        refetch();
      })
      .catch((err) => setFeedback({
        type: 'error',
        message: err?.response?.data?.message || 'Không thể gán bàn'
      }));
  };

  const updateStatus = (resv, status) => {
    setFeedback({ type: '', message: '' });
    updateReservation
      .mutateAsync({ id: resv.id, payload: { status, banId: resv.banId } })
      .then(() => {
        setFeedback({ type: 'success', message: 'Cập nhật trạng thái thành công!' });
        refetch();
      })
      .catch((err) => setFeedback({
        type: 'error',
        message: err?.response?.data?.message || 'Không thể cập nhật trạng thái'
      }));
  };

  // Clear feedback after 3 seconds
  useEffect(() => {
    if (feedback.message) {
      const timer = setTimeout(() => setFeedback({ type: '', message: '' }), 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const guestOptions = [2, 4, 6, 8, 10];

  return (
    <MainLayout title="Đặt bàn & Sơ đồ bàn">
      <Box sx={{
        background: COLORS.backgroundGradient,
        minHeight: '100vh',
        mx: -3,
        mt: -3,
        p: 3,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 300,
          background: `linear-gradient(135deg, ${alpha(COLORS.primaryPastel, 0.6)} 0%, ${alpha(COLORS.secondaryPastel, 0.4)} 50%, ${alpha(COLORS.infoPastel, 0.3)} 100%)`,
          borderRadius: '0 0 50% 50% / 0 0 30px 30px',
          zIndex: 0
        }
      }}>
        {/* Global Feedback - Enhanced */}
        <Collapse in={!!feedback.message}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Alert
              severity={feedback.type || 'info'}
              onClose={() => setFeedback({ type: '', message: '' })}
              sx={{
                mb: 3,
                borderRadius: 4,
                boxShadow: COLORS.shadowMd,
                backdropFilter: 'blur(10px)',
                bgcolor: alpha(COLORS.cardBg, 0.95),
                position: 'relative',
                zIndex: 10
              }}
            >
              {feedback.message}
            </Alert>
          </motion.div>
        </Collapse>

        <Grid container spacing={3} sx={{ position: 'relative', zIndex: 1 }}>
          {/* LEFT COLUMN - Form & Date */}
          <Grid item xs={12} lg={4}>
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
              {/* Create Reservation Card - Premium Glass Effect */}
              <motion.div variants={itemVariants}>
                <Paper sx={{
                  p: 3,
                  borderRadius: 5,
                  border: `1px solid ${alpha(COLORS.primary, 0.1)}`,
                  boxShadow: COLORS.shadowLg,
                  background: `linear-gradient(135deg, ${alpha(COLORS.cardBg, 0.95)} 0%, ${alpha(COLORS.primaryPastel, 0.3)} 100%)`,
                  backdropFilter: 'blur(20px)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    background: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.primaryLight}, ${COLORS.secondary})`,
                  }
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <motion.div whileHover={{ rotate: 10, scale: 1.1 }} transition={{ type: 'spring', stiffness: 300 }}>
                      <Box sx={{
                        width: 52,
                        height: 52,
                        borderRadius: 4,
                        background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryLight} 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: COLORS.shadowPrimary
                      }}>
                        <CalendarIcon sx={{ color: '#fff', fontSize: 28 }} />
                      </Box>
                    </motion.div>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: COLORS.textPrimary }}>
                        Tạo đặt bàn mới
                      </Typography>
                      <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
                        Điền thông tin khách hàng
                      </Typography>
                    </Box>
                  </Box>

                  <Grid container spacing={2.5}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Tên khách"
                        placeholder="Nhập tên khách hàng"
                        value={form.tenKhach}
                        onChange={(e) => setForm((prev) => ({ ...prev, tenKhach: e.target.value }))}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PersonIcon sx={{ color: COLORS.primary }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            bgcolor: alpha(COLORS.cardBg, 0.8),
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              bgcolor: COLORS.cardBg,
                              boxShadow: COLORS.shadowSm
                            },
                            '&.Mui-focused': {
                              bgcolor: COLORS.cardBg,
                              boxShadow: `0 0 0 3px ${alpha(COLORS.primary, 0.15)}`
                            },
                            '&:hover fieldset': { borderColor: COLORS.primary },
                            '&.Mui-focused fieldset': { borderColor: COLORS.primary, borderWidth: 2 },
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Số điện thoại"
                        placeholder="0xxx xxx xxx"
                        value={form.soDienThoai}
                        onChange={(e) => {
                          const formatted = formatPhoneNumber(e.target.value);
                          setForm((prev) => ({ ...prev, soDienThoai: formatted }));
                        }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PhoneIcon sx={{ color: COLORS.primary }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            bgcolor: alpha(COLORS.cardBg, 0.8),
                            transition: 'all 0.3s ease',
                            '&:hover': { bgcolor: COLORS.cardBg, boxShadow: COLORS.shadowSm },
                            '&.Mui-focused': { bgcolor: COLORS.cardBg, boxShadow: `0 0 0 3px ${alpha(COLORS.primary, 0.15)}` },
                          }
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="caption" sx={{ color: COLORS.textSecondary, fontWeight: 700, mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <GroupIcon sx={{ fontSize: 16 }} />
                        Số khách
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                        {guestOptions.map((num) => (
                          <motion.div key={num} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                              variant={form.soKhach === num ? 'contained' : 'outlined'}
                              size="medium"
                              onClick={() => setForm(prev => ({ ...prev, soKhach: num }))}
                              sx={{
                                minWidth: 52,
                                height: 44,
                                borderRadius: 3,
                                fontWeight: 700,
                                fontSize: '1rem',
                                background: form.soKhach === num
                                  ? `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryLight} 100%)`
                                  : 'transparent',
                                borderColor: form.soKhach === num ? 'transparent' : COLORS.border,
                                boxShadow: form.soKhach === num ? COLORS.shadowPrimary : 'none',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  background: form.soKhach === num
                                    ? `linear-gradient(135deg, ${COLORS.primaryDark} 0%, ${COLORS.primary} 100%)`
                                    : alpha(COLORS.primary, 0.08),
                                  borderColor: COLORS.primary,
                                  transform: 'translateY(-2px)'
                                }
                              }}
                            >
                              {num}
                            </Button>
                          </motion.div>
                        ))}
                        {/* Custom input for any guest count */}
                        <TextField
                          type="number"
                          placeholder="Khác"
                          value={!guestOptions.includes(form.soKhach) ? form.soKhach : ''}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 1;
                            setForm(prev => ({ ...prev, soKhach: Math.max(1, val) }));
                          }}
                          inputProps={{ min: 1, max: 100 }}
                          sx={{
                            width: 80,
                            '& .MuiOutlinedInput-root': {
                              height: 44,
                              borderRadius: 3,
                              bgcolor: !guestOptions.includes(form.soKhach) && form.soKhach > 0
                                ? alpha(COLORS.primary, 0.1)
                                : alpha(COLORS.cardBg, 0.8),
                              '& fieldset': {
                                borderColor: !guestOptions.includes(form.soKhach) && form.soKhach > 0
                                  ? COLORS.primary
                                  : COLORS.border,
                              },
                              '&:hover fieldset': { borderColor: COLORS.primary },
                              '&.Mui-focused fieldset': { borderColor: COLORS.primary },
                            },
                            '& input': {
                              textAlign: 'center',
                              fontWeight: 700,
                            }
                          }}
                        />
                      </Box>
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Thời gian đến"
                        type="datetime-local"
                        value={form.thoiGianDen}
                        onChange={(e) => setForm((prev) => ({ ...prev, thoiGianDen: e.target.value }))}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <TimeIcon sx={{ color: COLORS.primary }} />
                            </InputAdornment>
                          ),
                        }}
                        InputLabelProps={{ shrink: true }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            bgcolor: alpha(COLORS.cardBg, 0.8),
                            '&:hover': { bgcolor: COLORS.cardBg, boxShadow: COLORS.shadowSm },
                            '&.Mui-focused': { bgcolor: COLORS.cardBg, boxShadow: `0 0 0 3px ${alpha(COLORS.primary, 0.15)}` },
                          }
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Ghi chú"
                        placeholder="VD: Sinh nhật 🎂, kỷ niệm ⭐, dị ứng ⚠️, VIP 👑..."
                        value={form.ghiChu}
                        onChange={(e) => setForm((prev) => ({ ...prev, ghiChu: e.target.value }))}
                        multiline
                        minRows={2}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                              <NotesIcon sx={{ color: COLORS.primary }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            bgcolor: alpha(COLORS.cardBg, 0.8),
                            '&:hover': { bgcolor: COLORS.cardBg },
                          }
                        }}
                      />
                      {/* Quick Note Tags */}
                      <Box sx={{ display: 'flex', gap: 0.5, mt: 1, flexWrap: 'wrap' }}>
                        {['Sinh nhật 🎂', 'Kỷ niệm ⭐', 'VIP 👑', 'Dị ứng ⚠️'].map(tag => (
                          <Chip
                            key={tag}
                            label={tag}
                            size="small"
                            onClick={() => setForm(prev => ({
                              ...prev,
                              ghiChu: prev.ghiChu ? `${prev.ghiChu}, ${tag}` : tag
                            }))}
                            sx={{
                              cursor: 'pointer',
                              fontSize: '0.7rem',
                              height: 24,
                              bgcolor: alpha(COLORS.infoPastel, 0.5),
                              '&:hover': { bgcolor: COLORS.infoPastel }
                            }}
                          />
                        ))}
                      </Box>
                    </Grid>

                    {/* Table Selection */}
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        select
                        label="Chọn bàn (tùy chọn)"
                        value={form.banId || ''}
                        onChange={(e) => setForm((prev) => ({ ...prev, banId: e.target.value || null }))}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <TableIcon sx={{ color: COLORS.primary }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            bgcolor: alpha(COLORS.cardBg, 0.8),
                            '&:hover': { bgcolor: COLORS.cardBg, boxShadow: COLORS.shadowSm },
                            '&.Mui-focused': { bgcolor: COLORS.cardBg, boxShadow: `0 0 0 3px ${alpha(COLORS.primary, 0.15)}` },
                          }
                        }}
                        helperText="Có thể chọn bàn ngay hoặc gán sau"
                      >
                        <MenuItem value="">Không chọn (gán sau)</MenuItem>
                        {tables
                          .filter(t => t.trangThai === 'TRONG' && t.soGhe >= form.soKhach)
                          .sort((a, b) => a.soGhe - b.soGhe)
                          .map((table) => (
                            <MenuItem key={table.id} value={table.id}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
                                <TableIcon sx={{ color: COLORS.secondary, fontSize: 20 }} />
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    Bàn {table.ten}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: COLORS.textSecondary }}>
                                    {table.soGhe} ghế • {table.khuVuc?.ten || 'Khu vực chung'}
                                  </Typography>
                                </Box>
                                {table.soGhe === form.soKhach && (
                                  <Chip
                                    label="Phù hợp"
                                    size="small"
                                    sx={{
                                      height: 20,
                                      fontSize: '0.65rem',
                                      bgcolor: COLORS.secondaryPastel,
                                      color: COLORS.secondary,
                                      fontWeight: 700
                                    }}
                                  />
                                )}
                              </Box>
                            </MenuItem>
                          ))}
                      </TextField>
                    </Grid>

                    <Grid item xs={12}>
                      <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                        <Button
                          fullWidth
                          variant="contained"
                          size="large"
                          startIcon={<CalendarIcon />}
                          onClick={handleSubmit}
                          disabled={createReservation.isLoading}
                          sx={{
                            py: 1.8,
                            borderRadius: 4,
                            background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)`,
                            fontWeight: 800,
                            fontSize: '1.05rem',
                            textTransform: 'none',
                            boxShadow: COLORS.shadowPrimary,
                            position: 'relative',
                            overflow: 'hidden',
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              left: '-100%',
                              width: '100%',
                              height: '100%',
                              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                              transition: 'left 0.5s ease',
                            },
                            '&:hover': {
                              background: `linear-gradient(135deg, ${COLORS.primaryLight} 0%, ${COLORS.primary} 100%)`,
                              transform: 'translateY(-2px)',
                              boxShadow: `0 12px 32px ${alpha(COLORS.primary, 0.4)}`,
                              '&::before': { left: '100%' }
                            }
                          }}
                        >
                          {createReservation.isLoading ? 'Đang tạo...' : '✨ Tạo đặt bàn'}
                        </Button>
                      </motion.div>
                    </Grid>
                  </Grid>
                </Paper>
              </motion.div>

              {/* Date Picker Card - Premium with View Mode Toggle */}
              <motion.div variants={itemVariants}>
                <Paper sx={{
                  p: 3,
                  mt: 3,
                  borderRadius: 5,
                  border: `1px solid ${alpha(COLORS.warning, 0.15)}`,
                  boxShadow: COLORS.shadowMd,
                  background: `linear-gradient(135deg, ${alpha(COLORS.cardBg, 0.95)} 0%, ${alpha(COLORS.warningPastel, 0.3)} 100%)`,
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 3,
                        background: `linear-gradient(135deg, ${COLORS.warning} 0%, ${COLORS.warningLight} 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: COLORS.shadowWarning
                      }}>
                        <CalendarIcon sx={{ color: '#fff', fontSize: 24 }} />
                      </Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: COLORS.textPrimary }}>
                        Lịch đặt bàn
                      </Typography>
                    </Box>

                    {/* View Mode Toggle */}
                    <ToggleButtonGroup
                      value={viewMode}
                      exclusive
                      onChange={(e, val) => val && setViewMode(val)}
                      size="small"
                      sx={{
                        '& .MuiToggleButton-root': {
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 700,
                          px: 1.5,
                          py: 0.5,
                          '&.Mui-selected': {
                            bgcolor: COLORS.primary,
                            color: '#fff',
                            '&:hover': { bgcolor: COLORS.primaryDark }
                          }
                        }
                      }}
                    >
                      <ToggleButton value="day">
                        <ViewDayIcon sx={{ fontSize: 18, mr: 0.5 }} />
                        Ngày
                      </ToggleButton>
                      <ToggleButton value="week">
                        <ViewWeekIcon sx={{ fontSize: 18, mr: 0.5 }} />
                        Tuần
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </Box>

                  {viewMode === 'day' ? (
                    <>
                      <TextField
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            fontWeight: 700,
                            bgcolor: alpha(COLORS.cardBg, 0.8),
                            '&:hover': { bgcolor: COLORS.cardBg },
                          }
                        }}
                      />

                      {/* Quick date buttons - Enhanced */}
                      <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
                        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} style={{ flex: 1 }}>
                          <Button
                            fullWidth
                            size="medium"
                            variant={date === today ? 'contained' : 'outlined'}
                            onClick={() => setDate(today)}
                            sx={{
                              borderRadius: 3,
                              py: 1,
                              textTransform: 'none',
                              fontWeight: 700,
                              background: date === today ? `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryLight} 100%)` : 'transparent',
                              boxShadow: date === today ? COLORS.shadowPrimary : 'none',
                            }}
                          >
                            Hôm nay
                          </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} style={{ flex: 1 }}>
                          <Button
                            fullWidth
                            size="medium"
                            variant="outlined"
                            onClick={() => {
                              const tomorrow = new Date();
                              tomorrow.setDate(tomorrow.getDate() + 1);
                              setDate(tomorrow.toISOString().slice(0, 10));
                            }}
                            sx={{ borderRadius: 3, py: 1, textTransform: 'none', fontWeight: 700 }}
                          >
                            Ngày mai
                          </Button>
                        </motion.div>
                      </Stack>
                    </>
                  ) : (
                    <WeekCalendar
                      onSelectDate={setDate}
                      selectedDate={date}
                      reservations={weekReservations}
                    />
                  )}
                </Paper>
              </motion.div>

              {/* Stats Card - Premium Glassmorphism */}
              <motion.div variants={itemVariants}>
                <Paper sx={{
                  p: 3,
                  mt: 3,
                  borderRadius: 5,
                  border: `1px solid ${alpha(COLORS.primary, 0.1)}`,
                  background: `linear-gradient(135deg, ${alpha(COLORS.primaryPastel, 0.4)} 0%, ${alpha(COLORS.secondaryPastel, 0.3)} 100%)`,
                  backdropFilter: 'blur(10px)',
                  boxShadow: COLORS.shadowMd,
                }}>
                  <Typography variant="subtitle2" sx={{
                    fontWeight: 800,
                    color: COLORS.textPrimary,
                    mb: 2.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <Box sx={{
                      width: 28,
                      height: 28,
                      borderRadius: 2,
                      bgcolor: COLORS.primary,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <InfoIcon sx={{ color: '#fff', fontSize: 16 }} />
                    </Box>
                    Thống kê hôm nay
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <motion.div whileHover={{ scale: 1.03 }}>
                        <Box sx={{
                          p: 2.5,
                          borderRadius: 4,
                          bgcolor: COLORS.cardBg,
                          textAlign: 'center',
                          border: `1px solid ${alpha(COLORS.primary, 0.1)}`,
                          boxShadow: COLORS.shadowSm,
                          position: 'relative',
                          overflow: 'hidden',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: 3,
                            background: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.primaryLight})`
                          }
                        }}>
                          <Typography variant="h3" sx={{
                            fontWeight: 900,
                            background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryLight} 100%)`,
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                          }}>
                            {reservations.length}
                          </Typography>
                          <Typography variant="caption" sx={{ color: COLORS.textSecondary, fontWeight: 600 }}>
                            Tổng đặt bàn
                          </Typography>
                        </Box>
                      </motion.div>
                    </Grid>
                    <Grid item xs={6}>
                      <motion.div whileHover={{ scale: 1.03 }}>
                        <Box sx={{
                          p: 2.5,
                          borderRadius: 4,
                          bgcolor: COLORS.cardBg,
                          textAlign: 'center',
                          border: `1px solid ${alpha(COLORS.secondary, 0.1)}`,
                          boxShadow: COLORS.shadowSm,
                          position: 'relative',
                          overflow: 'hidden',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: 3,
                            background: `linear-gradient(90deg, ${COLORS.secondary}, ${COLORS.secondaryLight})`
                          }
                        }}>
                          <Typography variant="h3" sx={{
                            fontWeight: 900,
                            background: `linear-gradient(135deg, ${COLORS.secondary} 0%, ${COLORS.secondaryLight} 100%)`,
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                          }}>
                            {reservations.filter(r => r.trangThai === 'CHODEN').length}
                          </Typography>
                          <Typography variant="caption" sx={{ color: COLORS.textSecondary, fontWeight: 600 }}>
                            Chờ đến
                          </Typography>
                        </Box>
                      </motion.div>
                    </Grid>
                  </Grid>
                </Paper>
              </motion.div>
            </motion.div>
          </Grid>

          {/* RIGHT COLUMN - Booking List & Table Map */}
          <Grid item xs={12} lg={8}>
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
              {/* Booking List - Premium */}
              <motion.div variants={itemVariants}>
                <Paper sx={{
                  p: 3,
                  borderRadius: 5,
                  border: `1px solid ${alpha(COLORS.secondary, 0.1)}`,
                  boxShadow: COLORS.shadowLg,
                  background: `linear-gradient(135deg, ${alpha(COLORS.cardBg, 0.98)} 0%, ${alpha(COLORS.secondaryPastel, 0.2)} 100%)`,
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    background: `linear-gradient(90deg, ${COLORS.secondary}, ${COLORS.secondaryLight}, ${COLORS.info})`,
                  }
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <motion.div whileHover={{ rotate: 10, scale: 1.1 }} transition={{ type: 'spring', stiffness: 300 }}>
                        <Box sx={{
                          width: 52,
                          height: 52,
                          borderRadius: 4,
                          background: `linear-gradient(135deg, ${COLORS.secondary} 0%, ${COLORS.secondaryLight} 100%)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: COLORS.shadowSuccess
                        }}>
                          <RestaurantIcon sx={{ color: '#fff', fontSize: 28 }} />
                        </Box>
                      </motion.div>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: COLORS.textPrimary }}>
                          Danh sách đặt bàn
                        </Typography>
                        <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
                          {new Date(date).toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                      <Badge badgeContent={filteredReservations.length} color="primary" max={99}>
                        <Chip
                          label="Đặt bàn"
                          sx={{
                            fontWeight: 700,
                            bgcolor: COLORS.primaryPastel,
                            color: COLORS.primary
                          }}
                        />
                      </Badge>
                    </Box>
                  </Box>

                  {/* Search & Filter - Enhanced */}
                  <Box sx={{
                    p: 2,
                    mb: 3,
                    borderRadius: 4,
                    bgcolor: alpha(COLORS.background, 0.7),
                    border: `1px solid ${COLORS.border}`
                  }}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                      <TextField
                        size="small"
                        placeholder="🔍 Tìm theo tên hoặc SĐT..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        sx={{
                          flex: 1,
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            bgcolor: COLORS.cardBg,
                            '&:hover': { boxShadow: COLORS.shadowSm }
                          }
                        }}
                      />
                      <ToggleButtonGroup
                        value={statusFilter}
                        exclusive
                        onChange={(e, val) => val && setStatusFilter(val)}
                        size="small"
                        sx={{
                          '& .MuiToggleButton-root': {
                            borderRadius: 3,
                            textTransform: 'none',
                            fontWeight: 700,
                            px: 2,
                            '&.Mui-selected': {
                              bgcolor: COLORS.primary,
                              color: '#fff',
                            }
                          }
                        }}
                      >
                        <ToggleButton value="all">Tất cả</ToggleButton>
                        <ToggleButton value="CHODEN">⏳ Chờ đến</ToggleButton>
                        <ToggleButton value="DANHANBAN">✅ Đã nhận</ToggleButton>
                      </ToggleButtonGroup>
                    </Stack>
                  </Box>

                  {isLoading && <LinearProgress sx={{ mb: 2, borderRadius: 2, height: 6 }} />}

                  {/* Booking tickets - Premium Scroll */}
                  <Box sx={{
                    maxHeight: 480,
                    overflowY: 'auto',
                    pr: 1,
                    '&::-webkit-scrollbar': {
                      width: 6,
                    },
                    '&::-webkit-scrollbar-track': {
                      bgcolor: COLORS.borderLight,
                      borderRadius: 3,
                    },
                    '&::-webkit-scrollbar-thumb': {
                      bgcolor: COLORS.textMuted,
                      borderRadius: 3,
                      '&:hover': { bgcolor: COLORS.textSecondary }
                    }
                  }}>
                    <motion.div variants={containerVariants}>
                      <Stack spacing={2}>
                        <AnimatePresence>
                          {filteredReservations.map((r) => (
                            <BookingTicket
                              key={r.id}
                              reservation={r}
                              isSelected={r.id === selectedResv?.id}
                              onSelect={setSelectedResv}
                              onStatusChange={updateStatus}
                            />
                          ))}
                        </AnimatePresence>
                      </Stack>
                    </motion.div>

                    {!filteredReservations.length && !isLoading && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <Box sx={{
                          py: 8,
                          textAlign: 'center',
                          color: COLORS.textSecondary,
                          borderRadius: 4,
                          background: `linear-gradient(135deg, ${alpha(COLORS.primaryPastel, 0.3)} 0%, ${alpha(COLORS.infoPastel, 0.3)} 100%)`,
                        }}>
                          <CalendarIcon sx={{ fontSize: 64, color: COLORS.textMuted, mb: 2, opacity: 0.5 }} />
                          <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.textSecondary }}>
                            Chưa có đặt bàn nào
                          </Typography>
                          <Typography variant="body2" sx={{ color: COLORS.textMuted, mt: 1 }}>
                            Tạo đặt bàn mới ở form bên trái
                          </Typography>
                        </Box>
                      </motion.div>
                    )}
                  </Box>
                </Paper>
              </motion.div>

              {/* Table Map - Premium */}
              <motion.div variants={itemVariants}>
                <Paper sx={{
                  p: 3,
                  mt: 3,
                  borderRadius: 5,
                  border: `1px solid ${alpha(COLORS.info, 0.1)}`,
                  boxShadow: COLORS.shadowLg,
                  background: `linear-gradient(135deg, ${alpha(COLORS.cardBg, 0.98)} 0%, ${alpha(COLORS.infoPastel, 0.2)} 100%)`,
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    background: `linear-gradient(90deg, ${COLORS.info}, ${COLORS.infoLight}, ${COLORS.primary})`,
                  }
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <motion.div whileHover={{ rotate: 10, scale: 1.1 }} transition={{ type: 'spring', stiffness: 300 }}>
                        <Box sx={{
                          width: 52,
                          height: 52,
                          borderRadius: 4,
                          background: `linear-gradient(135deg, ${COLORS.info} 0%, ${COLORS.infoLight} 100%)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)'
                        }}>
                          <TableIcon sx={{ color: '#fff', fontSize: 28 }} />
                        </Box>
                      </motion.div>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: COLORS.textPrimary }}>
                          Sơ đồ bàn
                        </Typography>
                        <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
                          {selectedResv
                            ? `Đang gán cho: ${selectedResv.khachHang?.hoTen} (${selectedResv.soKhach} khách)`
                            : 'Chọn đặt bàn rồi click vào bàn để gán'}
                        </Typography>
                      </Box>
                    </Box>

                    {selectedResv && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        <Chip
                          icon={<AutoIcon />}
                          label="✨ Gợi ý bàn phù hợp"
                          sx={{
                            fontWeight: 700,
                            background: `linear-gradient(135deg, ${COLORS.warning} 0%, ${COLORS.warningLight} 100%)`,
                            color: '#fff',
                            boxShadow: COLORS.shadowWarning,
                            '& .MuiChip-icon': { color: '#fff' }
                          }}
                        />
                      </motion.div>
                    )}
                  </Box>

                  <TableMap
                    tables={groupedTables}
                    onAssign={handleAssignTable}
                    selectedResvId={selectedResv?.id}
                    reservations={reservations}
                    suggestedSeats={selectedResv?.soKhach}
                  />
                </Paper>
              </motion.div>
            </motion.div>
          </Grid>
        </Grid>

        {/* Confirm Dialog - Premium */}
        <Dialog
          open={confirmDialog.open}
          onClose={() => setConfirmDialog({ open: false, table: null })}
          PaperProps={{
            sx: {
              borderRadius: 5,
              p: 2,
              minWidth: 420,
              background: `linear-gradient(135deg, ${COLORS.cardBg} 0%, ${alpha(COLORS.primaryPastel, 0.3)} 100%)`,
              boxShadow: COLORS.shadowXl,
              border: `1px solid ${alpha(COLORS.primary, 0.1)}`,
              overflow: 'hidden',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                background: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.primaryLight}, ${COLORS.secondary})`,
              }
            }
          }}
        >
          <DialogTitle sx={{ textAlign: 'center', pb: 1, pt: 3 }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Box sx={{
                width: 72,
                height: 72,
                borderRadius: 4,
                background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryLight} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
                boxShadow: COLORS.shadowPrimary
              }}>
                <TableIcon sx={{ fontSize: 36, color: '#fff' }} />
              </Box>
            </motion.div>
            <Typography variant="h5" sx={{ fontWeight: 800, color: COLORS.textPrimary }}>
              Xác nhận gán bàn
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Box sx={{
              p: 3,
              borderRadius: 4,
              background: `linear-gradient(135deg, ${COLORS.secondaryPastel} 0%, ${alpha(COLORS.secondary, 0.08)} 100%)`,
              border: `1px solid ${alpha(COLORS.secondary, 0.2)}`,
              textAlign: 'center'
            }}>
              <Typography variant="body1" sx={{ mb: 1.5, color: COLORS.textSecondary }}>
                Gán bàn
              </Typography>
              <Chip
                label={confirmDialog.table?.ten}
                sx={{
                  fontSize: '1.2rem',
                  fontWeight: 800,
                  py: 2.5,
                  px: 1,
                  background: `linear-gradient(135deg, ${COLORS.info} 0%, ${COLORS.infoLight} 100%)`,
                  color: '#fff',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                }}
              />
              <Typography variant="body1" sx={{ mt: 1.5, mb: 1, color: COLORS.textSecondary }}>
                cho khách
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: COLORS.primary }}>
                {selectedResv?.khachHang?.hoTen}
              </Typography>
              <Box sx={{
                display: 'flex',
                gap: 2,
                justifyContent: 'center',
                mt: 1.5,
                flexWrap: 'wrap'
              }}>
                <Chip
                  icon={<GroupIcon />}
                  label={`${selectedResv?.soKhach} khách`}
                  size="small"
                  sx={{ bgcolor: COLORS.primaryPastel, color: COLORS.primary, fontWeight: 600 }}
                />
                <Chip
                  icon={<TimeIcon />}
                  label={selectedResv && new Date(selectedResv.thoiGianDen).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  size="small"
                  sx={{ bgcolor: COLORS.warningPastel, color: COLORS.warning, fontWeight: 600 }}
                />
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', gap: 2, pb: 3, px: 3 }}>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="outlined"
                onClick={() => setConfirmDialog({ open: false, table: null })}
                sx={{
                  borderRadius: 3,
                  px: 4,
                  py: 1.2,
                  textTransform: 'none',
                  fontWeight: 700,
                  borderWidth: 2,
                  '&:hover': { borderWidth: 2 }
                }}
              >
                Hủy
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="contained"
                startIcon={<CheckIcon />}
                onClick={confirmAssign}
                sx={{
                  borderRadius: 3,
                  px: 4,
                  py: 1.2,
                  textTransform: 'none',
                  fontWeight: 700,
                  background: `linear-gradient(135deg, ${COLORS.secondary} 0%, ${COLORS.secondaryLight} 100%)`,
                  boxShadow: COLORS.shadowSuccess,
                  '&:hover': {
                    background: `linear-gradient(135deg, ${COLORS.secondaryLight} 0%, ${COLORS.secondary} 100%)`,
                  }
                }}
              >
                ✅ Đồng ý gán
              </Button>
            </motion.div>
          </DialogActions>
        </Dialog>
      </Box>
    </MainLayout>
  );
};

export default Reservations;
