import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Stack,
  Button,
  Box,
  Chip,
  IconButton,
  ToggleButtonGroup,
  ToggleButton,
  Badge,
  Tooltip,
  alpha,
  LinearProgress,
  Divider,
  Collapse,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Restaurant as RestaurantIcon,
  LocalFireDepartment as FireIcon,
  LocalBar as BarIcon,
  Icecream as DessertIcon,
  Timer as TimerIcon,
  Warning as WarningIcon,
  Check as CheckIcon,
  PlayArrow as PlayIcon,
  Done as DoneIcon,
  DoneAll as DoneAllIcon,
  Notifications as NotificationIcon,
  ViewModule as GridViewIcon,
  ViewList as ListViewIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  TableBar as TableIcon,
  SoupKitchen as KitchenIcon,
  LocalDining as DiningIcon,
  Info as InfoIcon,
  AccessTime as ClockIcon,
  PriorityHigh as UrgentIcon,
  Notes as NotesIcon,
  Group as GroupIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import KdsLayout from '../../layouts/KdsLayout';
import { useKdsTickets, useUpdateKdsStatus } from '../../hooks/useKds';

// ==================== COLOR SYSTEM - KDS Light Theme (harmonized) ====================
const COLORS = {
  // Backgrounds
  bgPrimary: '#F8FAFC',       // page background similar to POS
  bgSecondary: '#FFFFFF',     // header/content background
  bgCard: '#FFFFFF',          // card background
  bgCardHover: '#F1F5F9',
  bgHighlight: '#F7FAFC',

  // Status Colors
  pending: '#64748B',         // Chờ xử lý - Gray
  cooking: '#0EA5E9',         // Đang làm - Blue (match POS primary)
  cookingGlow: 'rgba(14,165,233,0.12)',
  ready: '#F59E0B',           // Hoàn thành - Amber
  readyGlow: 'rgba(245,158,11,0.12)',
  served: '#10B981',          // Đã phục vụ - Green
  servedGlow: 'rgba(16,185,129,0.12)',

  // Urgency Colors
  normal: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  critical: '#DC2626',
  criticalGlow: 'rgba(220, 38, 38, 0.12)',

  // Category Colors - tuned to app palette
  catMain: '#0284C7',
  catGrill: '#FB923C',
  catNoodle: '#EC4899',
  catDrink: '#06B6D4',
  catDessert: '#A855F7',

  // Text
  textPrimary: '#1E293B',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',

  // Accent
  primary: '#00A76F',
  primaryLight: '#5BE49B',
  accent: '#22D3EE',

  // Border / shadows
  border: '#E6E9EE',
  borderLight: '#F1F5F9',
  shadowSm: '0 2px 8px rgba(2,6,23,0.06)',
  shadowMd: '0 4px 16px rgba(2,6,23,0.08)',
};

// ==================== STATUS CONFIG ====================
const STATUS_CONFIG = {
  CHOXULY: {
    label: 'Chờ',
    shortLabel: 'CHỜ',
    color: COLORS.pending,
    bgColor: alpha(COLORS.pending, 0.2),
    icon: <ClockIcon />,
  },
  DANGLAM: {
    label: 'Đang làm',
    shortLabel: 'ĐANG LÀM',
    color: COLORS.cooking,
    bgColor: alpha(COLORS.cooking, 0.2),
    glowColor: COLORS.cookingGlow,
    icon: <FireIcon />,
  },
  HOANTHANH: {
    label: 'Hoàn thành',
    shortLabel: 'XONG',
    color: COLORS.ready,
    bgColor: alpha(COLORS.ready, 0.2),
    glowColor: COLORS.readyGlow,
    icon: <DoneIcon />,
  },
  DAPHUCVU: {
    label: 'Đã phục vụ',
    shortLabel: 'ĐÃ RA',
    color: COLORS.served,
    bgColor: alpha(COLORS.served, 0.2),
    glowColor: COLORS.servedGlow,
    icon: <DoneAllIcon />,
  },
};

// ==================== CATEGORY CONFIG ====================
const CATEGORY_CONFIG = {
  'Món chính': { color: COLORS.catMain, icon: <RestaurantIcon />, label: 'Món chính' },
  'Món nướng': { color: COLORS.catGrill, icon: <FireIcon />, label: 'Nướng' },
  'Món nước': { color: COLORS.catNoodle, icon: <KitchenIcon />, label: 'Nước' },
  'Đồ uống': { color: COLORS.catDrink, icon: <BarIcon />, label: 'Đồ uống' },
  'Tráng miệng': { color: COLORS.catDessert, icon: <DessertIcon />, label: 'Tráng miệng' },
  'default': { color: COLORS.primary, icon: <DiningIcon />, label: 'Khác' },
};

// ==================== HELPER FUNCTIONS ====================
const getUrgencyLevel = (seconds) => {
  if (seconds < 300) return { level: 'normal', color: COLORS.normal, label: 'Bình thường' };
  if (seconds < 600) return { level: 'warning', color: COLORS.warning, label: 'Chú ý' };
  if (seconds < 1200) return { level: 'danger', color: COLORS.danger, label: 'Trễ' };
  return { level: 'critical', color: COLORS.critical, label: 'Rất trễ' };
};

const formatTime = (seconds) => {
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  return `${mm}:${ss}`;
};

const getCategoryFromItem = (item) => {
  const name = (item.monAn?.ten || item.name || '').toLowerCase();
  if (name.includes('nướng') || name.includes('bbq') || name.includes('grill')) return 'Món nướng';
  if (name.includes('bún') || name.includes('phở') || name.includes('mì')) return 'Món nước';
  if (name.includes('bia') || name.includes('nước') || name.includes('coca') || name.includes('trà')) return 'Đồ uống';
  if (name.includes('kem') || name.includes('flan') || name.includes('chè')) return 'Tráng miệng';
  return 'Món chính';
};

// ==================== ANIMATION VARIANTS ====================
const cardVariants = {
  initial: { opacity: 0, y: 20, scale: 0.95 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 25 }
  },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
  new: {
    scale: [1, 1.02, 1],
    boxShadow: [
      '0 0 0 0 rgba(99, 102, 241, 0)',
      '0 0 0 8px rgba(99, 102, 241, 0.3)',
      '0 0 0 0 rgba(99, 102, 241, 0)',
    ],
    transition: { duration: 1.5, ease: 'easeOut' }
  }
};

const shakeAnimation = {
  x: [0, -3, 3, -3, 3, 0],
  transition: { duration: 0.4, repeat: Infinity, repeatDelay: 2 }
};

// ==================== ITEM CARD COMPONENT ====================
const ItemCard = ({ item, ticketId, elapsedSeconds, onStatusChange, isNew }) => {
  const isVoided = item.trangThai === 'DAHUY';
  const status = STATUS_CONFIG[item.trangThai] || STATUS_CONFIG.CHOXULY;
  const urgency = getUrgencyLevel(elapsedSeconds);
  const category = getCategoryFromItem(item);
  const catConfig = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.default;
  const hasNotes = item.ghiChu || (item.tuyChon?.length > 0);
  const isCritical = urgency.level === 'critical' && !isVoided;

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate={isNew ? "new" : "animate"}
      exit="exit"
      layout
    >
      <motion.div animate={isCritical ? shakeAnimation : {}}>
        <Paper
          sx={{
            p: 2,
            bgcolor: isVoided ? alpha(COLORS.danger, 0.05) : COLORS.bgCard,
            borderRadius: 3,
            border: isVoided
              ? `2px solid ${COLORS.danger}`
              : `2px solid ${urgency.color}`,
            borderLeft: `6px solid ${isVoided ? COLORS.danger : catConfig.color}`,
            boxShadow: isCritical
              ? `0 0 20px ${COLORS.criticalGlow}, ${COLORS.shadowMd}`
              : COLORS.shadowSm,
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden',
            opacity: isVoided ? 0.6 : 1,
            '&:hover': {
              bgcolor: isVoided ? alpha(COLORS.danger, 0.08) : COLORS.bgCardHover,
              transform: 'translateY(-2px)',
              boxShadow: COLORS.shadowMd,
            },
            // Glow effect for status
            '&::before': status.glowColor && !isVoided ? {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `radial-gradient(ellipse at top right, ${status.glowColor} 0%, transparent 70%)`,
              pointerEvents: 'none',
            } : {},
          }}
        >
          {/* Voided Badge */}
          {isVoided && (
            <Chip
              label="ĐÃ HỦY"
              size="small"
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                bgcolor: COLORS.danger,
                color: '#fff',
                fontWeight: 800,
                fontSize: '0.7rem',
                zIndex: 1,
              }}
            />
          )}

          {/* Header: Name + Timer */}
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
            <Box sx={{ flex: 1 }}>
              <Stack direction="row" alignItems="center" gap={1} mb={0.5}>
                <Box sx={{
                  color: isVoided ? COLORS.danger : catConfig.color,
                  display: 'flex',
                  '& svg': { fontSize: 18 }
                }}>
                  {catConfig.icon}
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    color: isVoided ? COLORS.danger : COLORS.textPrimary,
                    fontSize: '1.1rem',
                    lineHeight: 1.2,
                    textDecoration: isVoided ? 'line-through' : 'none',
                  }}
                >
                  {item.monAn?.ten || item.name}
                </Typography>
              </Stack>

              {/* Quantity badge */}
              {(item.soLuong || 1) > 1 && (
                <Chip
                  label={`x${item.soLuong}`}
                  size="small"
                  sx={{
                    bgcolor: alpha(isVoided ? COLORS.danger : catConfig.color, 0.2),
                    color: isVoided ? COLORS.danger : catConfig.color,
                    fontWeight: 800,
                    fontSize: '0.75rem',
                    height: 22,
                    textDecoration: isVoided ? 'line-through' : 'none',
                  }}
                />
              )}
            </Box>

            {/* Timer */}
            {!isVoided && (
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                px: 1.5,
                py: 0.5,
                borderRadius: 2,
                bgcolor: alpha(urgency.color, 0.15),
                border: `1px solid ${alpha(urgency.color, 0.3)}`,
              }}>
                <TimerIcon sx={{ fontSize: 16, color: urgency.color }} />
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 900,
                    color: urgency.color,
                    fontSize: '1.2rem',
                    fontFamily: 'monospace',
                  }}
                >
                  {formatTime(elapsedSeconds)}
                </Typography>
              </Box>
            )}
          </Stack>

          {/* Notes Section */}
          {hasNotes && !isVoided && (
            <Box sx={{
              mb: 1.5,
              p: 1.5,
              borderRadius: 2,
              bgcolor: alpha(COLORS.warning, 0.1),
              border: `1px dashed ${alpha(COLORS.warning, 0.4)}`,
            }}>
              {item.tuyChon?.length > 0 && (
                <Stack direction="row" alignItems="center" gap={0.5} mb={0.5}>
                  <InfoIcon sx={{ fontSize: 14, color: COLORS.ready }} />
                  <Typography variant="caption" sx={{ color: COLORS.ready, fontWeight: 700 }}>
                    {item.tuyChon.map((t) => t.tuyChonMon?.ten).filter(Boolean).join(', ')}
                  </Typography>
                </Stack>
              )}
              {item.ghiChu && (
                <Stack direction="row" alignItems="flex-start" gap={0.5}>
                  <WarningIcon sx={{ fontSize: 14, color: COLORS.warning, mt: 0.2 }} />
                  <Typography variant="caption" sx={{ color: COLORS.warning, fontWeight: 800 }}>
                    {item.ghiChu}
                  </Typography>
                </Stack>
              )}
            </Box>
          )}

          {/* Status Buttons or Voided Message */}
          {isVoided ? (
            <Typography
              variant="body2"
              sx={{
                textAlign: 'center',
                color: COLORS.danger,
                fontWeight: 700,
                fontStyle: 'italic',
                py: 1,
              }}
            >
              Món này đã được hủy bởi quản lý - Không cần chế biến
            </Typography>
          ) : (
            <Stack direction="row" spacing={1}>
              {Object.entries(STATUS_CONFIG).filter(([key]) => key !== 'CHOXULY').map(([key, config]) => {
                const isActive = item.trangThai === key;
                // DAPHUCVU button only enabled when item is HOANTHANH
                const canClickDaPhucVu = key === 'DAPHUCVU' && item.trangThai !== 'HOANTHANH';
                const isDisabled = canClickDaPhucVu;

                return (
                  <Button
                    key={key}
                    size="medium"
                    variant={isActive ? 'contained' : 'outlined'}
                    startIcon={config.icon}
                    onClick={() => onStatusChange(item.id, key)}
                    disabled={isDisabled}
                    sx={{
                      flex: 1,
                      py: 1,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      bgcolor: isActive ? config.color : 'transparent',
                      borderColor: isDisabled ? alpha(config.color, 0.3) : config.color,
                      color: isActive ? '#fff' : (isDisabled ? alpha(config.color, 0.4) : config.color),
                      boxShadow: isActive ? `0 4px 12px ${alpha(config.color, 0.4)}` : 'none',
                      opacity: isDisabled ? 0.5 : 1,
                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                      '&:hover': {
                        bgcolor: isActive ? config.color : alpha(config.color, 0.15),
                        borderColor: config.color,
                        transform: isDisabled ? 'none' : 'translateY(-1px)',
                      },
                      '&.Mui-disabled': {
                        borderColor: alpha(config.color, 0.3),
                        color: alpha(config.color, 0.4),
                      },
                      '& .MuiButton-startIcon': {
                        marginRight: 0.5,
                        '& svg': { fontSize: 18 }
                      }
                    }}
                  >
                    {config.shortLabel}
                  </Button>
                );
              })}
            </Stack>
          )}
        </Paper>
      </motion.div>
    </motion.div>
  );
};

// ==================== TABLE CARD COMPONENT ====================
const TableCard = ({ ticket, now, onStatusChange, isNew }) => {
  /* Check if there are any active items */
  const hasActiveItems = ticket.items?.some(i => i.trangThai !== 'DAHUY');

  const elapsedSeconds = ticket.createdAt
    ? Math.max(0, Math.floor((now - new Date(ticket.createdAt).getTime()) / 1000))
    : 0;

  /* If all items are voided, use neutral color/status instead of time-based urgency */
  const urgency = !hasActiveItems
    ? { level: 'normal', color: COLORS.textSecondary, label: 'Đã hủy' }
    : getUrgencyLevel(elapsedSeconds);
  const tableName = ticket.table || ticket.ban?.ten || 'Không rõ';

  // Calculate stats
  const totalItems = ticket.items?.reduce((sum, item) => sum + (item.soLuong || 1), 0) || 0;
  const cookingItems = ticket.items?.filter(i => i.trangThai === 'DANGLAM').length || 0;
  const readyItems = ticket.items?.filter(i => i.trangThai === 'HOANTHANH').length || 0;

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate={isNew ? "new" : "animate"}
      exit="exit"
      layout
    >
      <Paper
        sx={{
          bgcolor: COLORS.bgSecondary,
          borderRadius: 4,
          overflow: 'hidden',
          border: `1px solid ${COLORS.border}`,
          boxShadow: COLORS.shadowMd,
        }}
      >
        {/* Table Header */}
        <Box sx={{
          p: 2,
          background: `linear-gradient(135deg, ${COLORS.bgHighlight} 0%, ${COLORS.bgSecondary} 100%)`,
          borderBottom: `1px solid ${COLORS.border}`,
        }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" alignItems="center" gap={1.5}>
              <Box sx={{
                width: 44,
                height: 44,
                borderRadius: 3,
                bgcolor: alpha(urgency.color, 0.15),
                border: `2px solid ${urgency.color}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <TableIcon sx={{ color: urgency.color, fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 900, color: COLORS.textPrimary }}>
                  {tableName}
                </Typography>
                <Stack direction="row" gap={1} mt={0.5}>
                  <Chip
                    size="small"
                    label={`${totalItems} món`}
                    sx={{
                      height: 20,
                      bgcolor: alpha(COLORS.textSecondary, 0.2),
                      color: COLORS.textSecondary,
                      fontWeight: 600,
                      fontSize: '0.7rem'
                    }}
                  />
                  {cookingItems > 0 && (
                    <Chip
                      size="small"
                      icon={<FireIcon sx={{ fontSize: '12px !important' }} />}
                      label={`${cookingItems} đang làm`}
                      sx={{
                        height: 20,
                        bgcolor: alpha(COLORS.cooking, 0.2),
                        color: COLORS.cooking,
                        fontWeight: 600,
                        fontSize: '0.7rem',
                        '& .MuiChip-icon': { color: COLORS.cooking }
                      }}
                    />
                  )}
                  {readyItems > 0 && (
                    <Chip
                      size="small"
                      icon={<DoneIcon sx={{ fontSize: '12px !important' }} />}
                      label={`${readyItems} xong`}
                      sx={{
                        height: 20,
                        bgcolor: alpha(COLORS.ready, 0.2),
                        color: COLORS.ready,
                        fontWeight: 600,
                        fontSize: '0.7rem',
                        '& .MuiChip-icon': { color: COLORS.ready }
                      }}
                    />
                  )}
                </Stack>
              </Box>
            </Stack>

            {/* Big Timer - Only show if there are active items */}
            {ticket.items?.some(i => i.trangThai !== 'DAHUY') && (
              <Box sx={{
                px: 2,
                py: 1,
                borderRadius: 3,
                bgcolor: alpha(urgency.color, 0.15),
                border: `2px solid ${urgency.color}`,
                textAlign: 'center',
              }}>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 900,
                    color: urgency.color,
                    fontFamily: 'monospace',
                    lineHeight: 1,
                  }}
                >
                  {formatTime(elapsedSeconds)}
                </Typography>
                <Typography variant="caption" sx={{ color: urgency.color, fontWeight: 600 }}>
                  {urgency.label}
                </Typography>
              </Box>
            )}
          </Stack>
        </Box>

        {/* Items List */}
        <Box sx={{ p: 2 }}>
          <Stack spacing={1.5}>
            <AnimatePresence mode="popLayout">
              {ticket.items?.map((item, idx) => (
                <ItemCard
                  key={`${item.id}-${idx}`}
                  item={item}
                  ticketId={ticket.id}
                  elapsedSeconds={elapsedSeconds}
                  onStatusChange={onStatusChange}
                  isNew={isNew}
                />
              ))}
            </AnimatePresence>
          </Stack>
        </Box>
      </Paper>
    </motion.div>
  );
};

// ==================== STATS HEADER COMPONENT ====================
const StatsHeader = ({ tickets, viewMode, setViewMode, filterStatus, setFilterStatus }) => {
  // Calculate stats
  const allItems = tickets.flatMap(t => t.items || []);
  const stats = {
    total: allItems.length,
    pending: allItems.filter(i => !i.trangThai || i.trangThai === 'CHOXULY').length,
    cooking: allItems.filter(i => i.trangThai === 'DANGLAM').length,
    ready: allItems.filter(i => i.trangThai === 'HOANTHANH').length,
    served: allItems.filter(i => i.trangThai === 'DAPHUCVU').length,
    overdue: 0, // Would need to calculate based on time
  };

  return (
    <Box sx={{
      mb: 3,
      p: 2,
      borderRadius: 4,
      bgcolor: COLORS.bgSecondary,
      border: `1px solid ${COLORS.border}`,
    }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', md: 'center' }}
        gap={2}
      >
        {/* Stats Chips */}
        <Stack direction="row" spacing={2} flexWrap="wrap">
          <Tooltip title="Tổng số món">
            <Chip
              icon={<RestaurantIcon />}
              label={`Tổng: ${stats.total}`}
              sx={{
                bgcolor: alpha(COLORS.primary, 0.2),
                color: COLORS.primary,
                fontWeight: 700,
                fontSize: '0.9rem',
                py: 2.5,
                '& .MuiChip-icon': { color: COLORS.primary }
              }}
            />
          </Tooltip>

          <Tooltip title="Đang chế biến">
            <Chip
              icon={<FireIcon />}
              label={`Đang làm: ${stats.cooking}`}
              sx={{
                bgcolor: alpha(COLORS.cooking, 0.2),
                color: COLORS.cooking,
                fontWeight: 700,
                fontSize: '0.9rem',
                py: 2.5,
                '& .MuiChip-icon': { color: COLORS.cooking }
              }}
            />
          </Tooltip>

          <Tooltip title="Đã hoàn thành, chờ phục vụ">
            <Chip
              icon={<DoneIcon />}
              label={`Hoàn thành: ${stats.ready}`}
              sx={{
                bgcolor: alpha(COLORS.ready, 0.2),
                color: COLORS.ready,
                fontWeight: 700,
                fontSize: '0.9rem',
                py: 2.5,
                '& .MuiChip-icon': { color: COLORS.ready }
              }}
            />
          </Tooltip>

          <Tooltip title="Món bị trễ (>10 phút)">
            <Badge badgeContent={stats.overdue} color="error">
              <Chip
                icon={<WarningIcon />}
                label="Trễ"
                sx={{
                  bgcolor: alpha(COLORS.danger, 0.2),
                  color: COLORS.danger,
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  py: 2.5,
                  '& .MuiChip-icon': { color: COLORS.danger }
                }}
              />
            </Badge>
          </Tooltip>
        </Stack>

        {/* Controls */}
        <Stack direction="row" spacing={2} alignItems="center">
          {/* View Mode Toggle */}
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(e, v) => v && setViewMode(v)}
            size="small"
            sx={{
              bgcolor: COLORS.bgCard,
              '& .MuiToggleButton-root': {
                color: COLORS.textSecondary,
                border: 'none',
                px: 2,
                '&.Mui-selected': {
                  bgcolor: COLORS.primary,
                  color: '#fff',
                }
              }
            }}
          >
            <ToggleButton value="table">
              <Tooltip title="Xem theo bàn">
                <GridViewIcon />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="item">
              <Tooltip title="Xem theo món">
                <ListViewIcon />
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>

          {/* Filter by Status */}
          <ToggleButtonGroup
            value={filterStatus}
            exclusive
            onChange={(e, v) => setFilterStatus(v || 'all')}
            size="small"
            sx={{
              bgcolor: COLORS.bgCard,
              '& .MuiToggleButton-root': {
                color: COLORS.textSecondary,
                border: 'none',
                px: 1.5,
                '&.Mui-selected': {
                  bgcolor: alpha(COLORS.accent, 0.2),
                  color: COLORS.accent,
                }
              }
            }}
          >
            <ToggleButton value="all">Tất cả</ToggleButton>
            <ToggleButton value="DANGLAM">Đang làm</ToggleButton>
            <ToggleButton value="HOANTHANH">Xong</ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      </Stack>
    </Box>
  );
};

// ==================== ITEM VIEW COMPONENT (Group by item) ====================
const ItemViewMode = ({ tickets, now, onStatusChange }) => {
  // Group all items by name
  const groupedItems = useMemo(() => {
    const groups = {};
    tickets.forEach(ticket => {
      const elapsedSeconds = ticket.createdAt
        ? Math.max(0, Math.floor((now - new Date(ticket.createdAt).getTime()) / 1000))
        : 0;

      ticket.items?.forEach(item => {
        const name = item.monAn?.ten || item.name || 'Không rõ';
        if (!groups[name]) {
          groups[name] = {
            name,
            items: [],
            category: getCategoryFromItem(item),
            totalQty: 0,
          };
        }
        groups[name].items.push({
          ...item,
          tableName: ticket.table || ticket.ban?.ten,
          elapsedSeconds,
          ticketId: ticket.id,
        });
        groups[name].totalQty += item.soLuong || 1;
      });
    });
    return Object.values(groups).sort((a, b) => b.totalQty - a.totalQty);
  }, [tickets, now]);

  return (
    <Grid container spacing={2}>
      {groupedItems.map((group) => {
        const catConfig = CATEGORY_CONFIG[group.category] || CATEGORY_CONFIG.default;
        return (
          <Grid item xs={12} md={6} lg={4} key={group.name}>
            <Paper sx={{
              bgcolor: COLORS.bgSecondary,
              borderRadius: 4,
              overflow: 'hidden',
              border: `1px solid ${COLORS.border}`,
            }}>
              {/* Group Header */}
              <Box sx={{
                p: 2,
                background: `linear-gradient(135deg, ${alpha(catConfig.color, 0.15)} 0%, ${COLORS.bgSecondary} 100%)`,
                borderBottom: `1px solid ${COLORS.border}`,
                borderLeft: `4px solid ${catConfig.color}`,
              }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Stack direction="row" alignItems="center" gap={1}>
                    <Box sx={{ color: catConfig.color }}>{catConfig.icon}</Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: COLORS.textPrimary }}>
                      {group.name}
                    </Typography>
                  </Stack>
                  <Chip
                    label={`x${group.totalQty}`}
                    sx={{
                      bgcolor: catConfig.color,
                      color: '#fff',
                      fontWeight: 800,
                      fontSize: '1rem',
                    }}
                  />
                </Stack>
              </Box>

              {/* Items by Table */}
              <Box sx={{ p: 2 }}>
                <Stack spacing={1}>
                  {group.items.map((item, idx) => (
                    <Box
                      key={`${item.id}-${idx}`}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: COLORS.bgCard,
                        border: `1px solid ${COLORS.border}`,
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                        <Stack direction="row" alignItems="center" gap={1}>
                          <TableIcon sx={{ fontSize: 16, color: COLORS.textSecondary }} />
                          <Typography variant="body2" sx={{ fontWeight: 700, color: COLORS.textPrimary }}>
                            {item.tableName}
                          </Typography>
                          {(item.soLuong || 1) > 1 && (
                            <Chip label={`x${item.soLuong}`} size="small" sx={{ height: 18, fontSize: '0.65rem' }} />
                          )}
                        </Stack>
                        {item.trangThai !== 'DAHUY' ? (
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 700,
                              color: getUrgencyLevel(item.elapsedSeconds).color,
                              fontFamily: 'monospace',
                            }}
                          >
                            {formatTime(item.elapsedSeconds)}
                          </Typography>
                        ) : (
                          <Typography variant="caption" sx={{ color: COLORS.textSecondary, fontWeight: 700, fontStyle: 'italic' }}>
                            Đã hủy
                          </Typography>
                        )}
                      </Stack>

                      <Stack direction="row" spacing={0.5}>
                        {item.trangThai === 'DAHUY' ? (
                          <Typography variant="caption" sx={{ color: COLORS.danger, width: '100%', textAlign: 'center', py: 0.5 }}>
                            Món đã hủy
                          </Typography>
                        ) : (
                          Object.entries(STATUS_CONFIG).filter(([key]) => key !== 'CHOXULY').map(([key, config]) => {
                            const isActive = item.trangThai === key;
                            return (
                              <Button
                                key={key}
                                size="small"
                                variant={isActive ? 'contained' : 'outlined'}
                                onClick={() => onStatusChange(item.id, key)}
                                sx={{
                                  flex: 1,
                                  py: 0.5,
                                  minWidth: 0,
                                  borderRadius: 1.5,
                                  textTransform: 'none',
                                  fontWeight: 700,
                                  fontSize: '0.65rem',
                                  bgcolor: isActive ? config.color : 'transparent',
                                  borderColor: alpha(config.color, 0.5),
                                  color: isActive ? '#fff' : config.color,
                                  '&:hover': {
                                    bgcolor: isActive ? config.color : alpha(config.color, 0.1),
                                  },
                                }}
                              >
                                {config.shortLabel}
                              </Button>
                            );
                          })
                        )}
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Paper>
          </Grid>
        );
      })}
    </Grid>
  );
};

// ==================== MAIN KDS BOARD COMPONENT ====================
const KdsBoard = ({ station }) => {
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));
  const { data = [], isLoading, refetch } = useKdsTickets(station);
  const updateStatus = useUpdateKdsStatus();
  const [now, setNow] = useState(Date.now());
  const [viewMode, setViewMode] = useState('table');
  const [filterStatus, setFilterStatus] = useState('all');
  const [newTicketIds, setNewTicketIds] = useState(new Set());

  // Update time every second
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // Track new tickets for animation
  useEffect(() => {
    const currentIds = new Set(data.map(t => t.id));
    const newIds = [...currentIds].filter(id => !newTicketIds.has(id));
    if (newIds.length > 0) {
      setNewTicketIds(prev => new Set([...prev, ...newIds]));
      // Clear new status after animation
      setTimeout(() => {
        setNewTicketIds(prev => {
          const updated = new Set(prev);
          newIds.forEach(id => updated.delete(id));
          return updated;
        });
      }, 2000);
    }
  }, [data]);

  // Sort and filter tickets
  const tickets = useMemo(() => {
    let result = [...data].sort((a, b) =>
      new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
    );

    // Filter by status if needed
    if (filterStatus !== 'all') {
      result = result.map(ticket => ({
        ...ticket,
        items: ticket.items?.filter(item => item.trangThai === filterStatus)
      })).filter(ticket => ticket.items?.length > 0);
    }

    return result;
  }, [data, filterStatus]);

  const handleStatusChange = useCallback((itemId, status) => {
    updateStatus.mutate({ itemId, status, station });
  }, [updateStatus, station]);

  // Calculate columns based on screen size
  const getGridSize = () => {
    if (isLargeScreen) return { xs: 12, sm: 6, md: 4, lg: 4, xl: 3 };
    return { xs: 12, sm: 6, md: 4 };
  };

  return (
    <KdsLayout>
      {/* Stats Header */}
      <StatsHeader
        tickets={data}
        viewMode={viewMode}
        setViewMode={setViewMode}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
      />

      {/* Loading */}
      {isLoading && (
        <Box sx={{ mb: 3 }}>
          <LinearProgress
            sx={{
              borderRadius: 2,
              bgcolor: COLORS.bgCard,
              '& .MuiLinearProgress-bar': {
                bgcolor: COLORS.primary,
              }
            }}
          />
          <Typography sx={{ color: COLORS.textSecondary, mt: 1, textAlign: 'center' }}>
            Đang tải đơn hàng...
          </Typography>
        </Box>
      )}

      {/* No tickets */}
      {!isLoading && tickets.length === 0 && (
        <Box sx={{
          py: 10,
          textAlign: 'center',
          borderRadius: 4,
          bgcolor: COLORS.bgSecondary,
          border: `2px dashed ${COLORS.border}`,
        }}>
          <KitchenIcon sx={{ fontSize: 80, color: COLORS.textMuted, mb: 2 }} />
          <Typography variant="h5" sx={{ color: COLORS.textSecondary, fontWeight: 700 }}>
            Không có đơn hàng nào
          </Typography>
          <Typography variant="body1" sx={{ color: COLORS.textMuted, mt: 1 }}>
            Đơn mới sẽ hiển thị ở đây
          </Typography>
        </Box>
      )}

      {/* Content based on view mode */}
      {viewMode === 'table' ? (
        <Grid container spacing={2}>
          <AnimatePresence mode="popLayout">
            {tickets.map((ticket) => (
              <Grid item {...getGridSize()} key={ticket.id}>
                <TableCard
                  ticket={ticket}
                  now={now}
                  onStatusChange={handleStatusChange}
                  isNew={newTicketIds.has(ticket.id)}
                />
              </Grid>
            ))}
          </AnimatePresence>
        </Grid>
      ) : (
        <ItemViewMode
          tickets={tickets}
          now={now}
          onStatusChange={handleStatusChange}
        />
      )}
    </KdsLayout>
  );
};

export default KdsBoard;
