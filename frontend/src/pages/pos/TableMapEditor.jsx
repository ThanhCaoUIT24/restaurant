import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Divider,
  Alert,
  Snackbar,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  GridOn as GridOnIcon,
  GridOff as GridOffIcon,
  Visibility as PreviewIcon,
  VisibilityOff as EditModeIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  DragIndicator as DragIcon,
  Layers as LayersIcon,
  Home as AreaIcon,
  TableRestaurant as TableIcon,
  Close as CloseIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
  FitScreen as FitScreenIcon,
} from '@mui/icons-material';
import {
  useTables,
  useCreateTable,
  useUpdateTable,
  useDeleteTable,
  useUpdateTablePosition,
  useAreas,
  useCreateArea,
  useUpdateArea,
  useDeleteArea,
} from '../../hooks/useTables';

import { useTheme, alpha } from '@mui/material/styles';
import PermissionGate from '../../components/PermissionGate';
import { PERMISSIONS } from '../../utils/permissions';
import { usePermissions } from '../../hooks/usePermissions';

// ==================== PREMIUM EDITOR COLORS (theme-aware) ====================
const getEditorColors = (theme) => ({
  background: theme.palette.mode === 'light'
    ? `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`
    : `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
  surface: theme.palette.background.paper,
  surfaceHover: theme.palette.mode === 'light' ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.04)',
  primary: theme.palette.primary.main,
  primaryGlow: theme.palette.primary.light ? `${theme.palette.primary.light}33` : 'rgba(108, 99, 255, 0.4)',
  secondary: theme.palette.secondary.main,
  secondaryGlow: theme.palette.secondary.light ? `${theme.palette.secondary.light}33` : 'rgba(0, 217, 255, 0.4)',
  success: theme.palette.success?.main || '#4ADE80',
  warning: theme.palette.warning?.main || '#FBBF24',
  error: theme.palette.error?.main || '#F87171',
  text: theme.palette.text.primary,
  textMuted: theme.palette.text.secondary,
  border: theme.palette.divider,
  grid: theme.palette.mode === 'light' ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.04)',
  gridMajor: theme.palette.mode === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)',
  selection: theme.palette.primary.main + '33',

  // Table status colors - use uppercase to match API values
  TRONG: { bg: '#4ADE80', glow: 'rgba(74, 222, 128, 0.4)', label: 'Trống' },           // Green - Empty
  COKHACH: { bg: '#F87171', glow: 'rgba(248, 113, 113, 0.4)', label: 'Có khách' },      // Red - Occupied
  DADAT: { bg: '#FBBF24', glow: 'rgba(251, 191, 36, 0.4)', label: 'Đã đặt' },           // Yellow - Reserved
  CHOTHANHTOAN: { bg: '#60A5FA', glow: 'rgba(96, 165, 250, 0.4)', label: 'Chờ TT' },    // Blue - Waiting payment
  CANDON: { bg: '#A78BFA', glow: 'rgba(167, 139, 250, 0.4)', label: 'Cần dọn' },        // Purple - Need cleaning

  // Area colors - expanded palette
  areaColors: [
    { color: '#6C63FF', bg: 'rgba(108, 99, 255, 0.2)' },
    { color: '#00D9FF', bg: 'rgba(0, 217, 255, 0.2)' },
    { color: '#4ADE80', bg: 'rgba(74, 222, 128, 0.2)' },
    { color: '#FBBF24', bg: 'rgba(251, 191, 36, 0.2)' },
    { color: '#F472B6', bg: 'rgba(244, 114, 182, 0.2)' },
    { color: '#FB923C', bg: 'rgba(251, 146, 60, 0.2)' },
    { color: '#A78BFA', bg: 'rgba(167, 139, 250, 0.2)' },
    { color: '#2DD4BF', bg: 'rgba(45, 212, 191, 0.2)' },
  ],
});

// Default area colors (fallback for helpers)
const DEFAULT_AREA_COLORS = [
  { color: '#6C63FF', bg: 'rgba(108, 99, 255, 0.2)' },
  { color: '#00D9FF', bg: 'rgba(0, 217, 255, 0.2)' },
  { color: '#4ADE80', bg: 'rgba(74, 222, 128, 0.2)' },
  { color: '#FBBF24', bg: 'rgba(251, 191, 36, 0.2)' },
  { color: '#F472B6', bg: 'rgba(244, 114, 182, 0.2)' },
  { color: '#FB923C', bg: 'rgba(251, 146, 60, 0.2)' },
  { color: '#A78BFA', bg: 'rgba(167, 139, 250, 0.2)' },
  { color: '#2DD4BF', bg: 'rgba(45, 212, 191, 0.2)' },
];

// ==================== GRID CONFIG ====================
const GRID_SIZE = 20;
const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 800;

// ==================== SNAP TO GRID ====================
const snapToGrid = (value) => Math.round(value / GRID_SIZE) * GRID_SIZE;

// ==================== GET AREA COLOR BY INDEX ====================
const getAreaColorByIndex = (index) => {
  return DEFAULT_AREA_COLORS[index % DEFAULT_AREA_COLORS.length];
};

// ==================== DRAGGABLE TABLE COMPONENT ====================
const DraggableTable = ({
  table,
  isSelected,
  isPreview,
  zoom,
  onSelect,
  onDragEnd,
  onDoubleClick,
  areaColor,
  canEdit = true,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: table.posX || 0, y: table.posY || 0 });
  const dragRef = useRef(null);
  const startPos = useRef({ x: 0, y: 0 });
  const startMousePos = useRef({ x: 0, y: 0 });

  // Theme-aware colors for this component
  const theme = useTheme();
  const editorColors = getEditorColors(theme);

  useEffect(() => {
    setPosition({ x: table.posX || 0, y: table.posY || 0 });
  }, [table.posX, table.posY]);

  const handleMouseDown = (e) => {
    if (!canEdit || isPreview) return; // Disable drag if can't edit or in preview mode
    e.stopPropagation();
    onSelect(table.id);
    setIsDragging(true);
    startPos.current = { x: position.x, y: position.y };
    startMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    const dx = (e.clientX - startMousePos.current.x) / zoom;
    const dy = (e.clientY - startMousePos.current.y) / zoom;
    setPosition({
      x: snapToGrid(startPos.current.x + dx),
      y: snapToGrid(startPos.current.y + dy),
    });
  }, [isDragging, zoom]);

  const handleMouseUp = useCallback((e) => {
    if (isDragging) {
      setIsDragging(false);
      const movedX = Math.abs(position.x - startPos.current.x);
      const movedY = Math.abs(position.y - startPos.current.y);
      const hasMoved = movedX > 5 || movedY > 5;

      if (hasMoved) {
        // User dragged the table - save position
        if (position.x !== table.posX || position.y !== table.posY) {
          onDragEnd(table.id, position.x, position.y);
        }
      } else {
        // User clicked without dragging - open edit dialog
        onDoubleClick(table);
      }
    }
  }, [isDragging, position, table, onDragEnd, onDoubleClick]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const tableSize = Math.max(70, 50 + (table.soGhe || 4) * 5);
  const statusKey = table.trangThai || 'TRONG';
  const statusColor = editorColors[statusKey] || editorColors.TRONG;

  return (
    <motion.div
      ref={dragRef}
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: 1,
        opacity: 1,
        x: position.x,
        y: position.y,
      }}
      whileHover={!isPreview ? { scale: 1.05 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      style={{
        position: 'absolute',
        width: tableSize,
        height: tableSize,
        cursor: isPreview ? 'default' : isDragging ? 'grabbing' : 'grab',
        zIndex: isDragging ? 1000 : isSelected ? 100 : 10,
      }}
      onMouseDown={handleMouseDown}
      onClick={(e) => e.stopPropagation()}
      onDoubleClick={() => !isPreview && onDoubleClick(table)}
    >
      {/* Selection Ring */}
      <AnimatePresence>
        {isSelected && !isPreview && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            style={{
              position: 'absolute',
              inset: -8,
              borderRadius: table.shape === 'circle' ? '50%' : 16,
              border: `2px dashed ${editorColors.primary}`,
              background: editorColors.selection,
            }}
          />
        )}
      </AnimatePresence>

      {/* Table Shape */}
      <Box
        sx={{
          width: '100%',
          height: '100%',
          borderRadius: table.shape === 'circle' ? '50%' : 3,
          background: `linear-gradient(145deg, ${statusColor.bg}, ${statusColor.bg}dd)`,
          boxShadow: `
            0 4px 20px ${statusColor.glow},
            inset 0 1px 0 rgba(255,255,255,0.2),
            inset 0 -1px 0 rgba(0,0,0,0.1)
          `,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
          '&:hover': !isPreview ? {
            boxShadow: `
              0 8px 30px ${statusColor.glow},
              inset 0 1px 0 rgba(255,255,255,0.3)
            `,
          } : {},
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            color: '#fff',
            fontWeight: 700,
            textShadow: '0 1px 2px rgba(0,0,0,0.3)',
            fontSize: '0.85rem',
            textAlign: 'center',
            lineHeight: 1.2,
            px: 0.5,
          }}
        >
          {table.ten}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3, mt: 0.5 }}>
          <TableIcon sx={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }} />
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.7rem' }}>
            {table.soGhe || 4} ghế
          </Typography>
        </Box>
      </Box>

      {/* Drag Handle Indicator */}
      {isSelected && !isPreview && (
        <Box
          sx={{
            position: 'absolute',
            top: -22,
            left: '50%',
            transform: 'translateX(-50%)',
            background: editorColors.primary,
            borderRadius: 2,
            px: 1,
            py: 0.3,
          }}
        >
          <DragIcon sx={{ fontSize: 14, color: '#fff' }} />
        </Box>
      )}
    </motion.div>
  );
};

// ==================== AREA SECTION COMPONENT ====================
const AreaSection = ({ area, tables, colorConfig, onEditArea, onDeleteArea }) => {
  const theme = useTheme();
  const editorColors = getEditorColors(theme);
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <Paper
        sx={{
          background: colorConfig.bg || editorColors.surface,
          border: `1px solid ${colorConfig.color}40`,
          borderRadius: 2,
          mb: 1.5,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 1.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 14,
                height: 14,
                borderRadius: '50%',
                background: colorConfig.color,
                boxShadow: `0 0 10px ${colorConfig.color}80`,
              }}
            />
            <Typography variant="subtitle2" sx={{ color: editorColors.text, fontWeight: 600 }}>
              {area.ten}
            </Typography>
            <Chip
              label={`${tables.length} bàn`}
              size="small"
              sx={{
                height: 22,
                fontSize: '0.7rem',
                background: alpha(editorColors.textMuted, 0.08),
                color: editorColors.textMuted,
              }}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <PermissionGate permission={PERMISSIONS.TABLE_MANAGE}>
              <Tooltip title="Chỉnh sửa">
                <IconButton
                  size="small"
                  onClick={() => onEditArea(area)}
                  sx={{ color: editorColors.textMuted, '&:hover': { color: editorColors.primary } }}
                >
                  <EditIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </PermissionGate>
            <PermissionGate permission={PERMISSIONS.TABLE_MANAGE}>
              <Tooltip title="Xóa">
                <IconButton
                  size="small"
                  onClick={() => onDeleteArea(area.id)}
                  sx={{ color: editorColors.textMuted, '&:hover': { color: editorColors.error } }}
                >
                  <DeleteIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </PermissionGate>
          </Box>
        </Box>
      </Paper>
    </motion.div>
  );
};

// ==================== MAIN COMPONENT ====================
export default function TableMapEditor() {
  const theme = useTheme();
  const editorColors = getEditorColors(theme);
  const { hasPermission } = usePermissions();
  const canManageTables = hasPermission(PERMISSIONS.TABLE_MANAGE);

  const { data: tablesData, isLoading: tablesLoading } = useTables();
  const { data: areas = [], isLoading: areasLoading } = useAreas();
  const createTableMutation = useCreateTable();
  const updateTableMutation = useUpdateTable();
  const deleteTableMutation = useDeleteTable();
  const updatePositionMutation = useUpdateTablePosition();
  const createAreaMutation = useCreateArea();
  const updateAreaMutation = useUpdateArea();
  const deleteAreaMutation = useDeleteArea();

  const tables = tablesData?.items || [];

  // State
  const [selectedTableId, setSelectedTableId] = useState(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [filterArea, setFilterArea] = useState('all');

  // Dialogs
  const [tableDialog, setTableDialog] = useState({ open: false, table: null });
  const [areaDialog, setAreaDialog] = useState({ open: false, area: null });
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, type: null, id: null });

  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Canvas ref
  const canvasRef = useRef(null);

  // ==================== AREA COLOR MAP ====================
  const areaColorMap = useMemo(() => {
    const map = {};
    areas.forEach((area, index) => {
      map[area.id] = getAreaColorByIndex(index);
    });
    return map;
  }, [areas]);

  // ==================== HANDLERS ====================
  const handleSelectTable = (id) => {
    setSelectedTableId(id === selectedTableId ? null : id);
  };

  const handleDragEnd = async (id, x, y) => {
    try {
      await updatePositionMutation.mutateAsync({ id, posX: x, posY: y });
      setSnackbar({ open: true, message: 'Đã cập nhật vị trí bàn', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Lỗi cập nhật vị trí', severity: 'error' });
    }
  };

  const handleOpenTableDialog = (table = null) => {
    // Chỉ cho phép mở dialog khi có quyền TABLE_MANAGE
    if (!canManageTables) return;

    if (table) {
      // Edit mode - map from API response to dialog form
      setTableDialog({
        open: true,
        table: {
          id: table.id,
          ten: table.ten,
          soGhe: table.soGhe || 4,
          khuVucId: table.khuVuc?.id || areas[0]?.id || null,
          posX: table.posX || 100,
          posY: table.posY || 100,
        },
      });
    } else {
      // Create mode
      setTableDialog({
        open: true,
        table: {
          ten: '',
          soGhe: 4,
          khuVucId: areas[0]?.id || null,
          posX: 100,
          posY: 100,
        },
      });
    }
  };

  const handleSaveTable = async () => {
    const { table } = tableDialog;
    try {
      if (table.id) {
        await updateTableMutation.mutateAsync({
          id: table.id,
          ten: table.ten,
          soGhe: table.soGhe,
          khuVucId: table.khuVucId,
          posX: table.posX,
          posY: table.posY,
        });
        setSnackbar({ open: true, message: 'Đã cập nhật bàn', severity: 'success' });
      } else {
        await createTableMutation.mutateAsync({
          ten: table.ten,
          soGhe: table.soGhe,
          khuVucId: table.khuVucId,
          posX: table.posX || 100,
          posY: table.posY || 100,
        });
        setSnackbar({ open: true, message: 'Đã thêm bàn mới', severity: 'success' });
      }
      setTableDialog({ open: false, table: null });
    } catch (error) {
      setSnackbar({ open: true, message: error.message || 'Lỗi lưu bàn', severity: 'error' });
    }
  };

  const handleDeleteTable = async () => {
    try {
      await deleteTableMutation.mutateAsync(deleteConfirm.id);
      setSnackbar({ open: true, message: 'Đã xóa bàn', severity: 'success' });
      setDeleteConfirm({ open: false, type: null, id: null });
      setSelectedTableId(null);
    } catch (error) {
      setSnackbar({ open: true, message: 'Lỗi xóa bàn', severity: 'error' });
    }
  };

  const handleOpenAreaDialog = (area = null) => {
    // Chỉ cho phép mở dialog khi có quyền TABLE_MANAGE
    if (!canManageTables) return;

    setAreaDialog({
      open: true,
      area: area ? { id: area.id, ten: area.ten } : { ten: '' },
    });
  };

  const handleSaveArea = async () => {
    const { area } = areaDialog;
    try {
      if (area.id) {
        await updateAreaMutation.mutateAsync({
          id: area.id,
          ten: area.ten,
        });
        setSnackbar({ open: true, message: 'Đã cập nhật khu vực', severity: 'success' });
      } else {
        await createAreaMutation.mutateAsync({
          ten: area.ten,
        });
        setSnackbar({ open: true, message: 'Đã thêm khu vực mới', severity: 'success' });
      }
      setAreaDialog({ open: false, area: null });
    } catch (error) {
      setSnackbar({ open: true, message: error.message || 'Lỗi lưu khu vực', severity: 'error' });
    }
  };

  const handleDeleteArea = async () => {
    try {
      await deleteAreaMutation.mutateAsync(deleteConfirm.id);
      setSnackbar({ open: true, message: 'Đã xóa khu vực', severity: 'success' });
      setDeleteConfirm({ open: false, type: null, id: null });
    } catch (error) {
      setSnackbar({ open: true, message: 'Không thể xóa khu vực', severity: 'error' });
    }
  };

  const handleCanvasClick = (e) => {
    if (e.target === canvasRef.current) {
      setSelectedTableId(null);
    }
  };

  // ==================== COMPUTED ====================
  const filteredTables = useMemo(() => {
    if (filterArea === 'all') return tables;
    return tables.filter((t) => t.khuVuc?.id === filterArea);
  }, [tables, filterArea]);

  const selectedTable = tables.find((t) => t.id === selectedTableId);

  const getTableAreaColor = (table) => {
    if (!table.khuVuc?.id) return editorColors.primary;
    return areaColorMap[table.khuVuc.id]?.color || editorColors.primary;
  };

  // ==================== RENDER ====================
  if (tablesLoading || areasLoading) {
    return (
      <Box
        sx={{
          height: '100vh',
          background: editorColors.background,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <TableIcon sx={{ fontSize: 60, color: editorColors.primary }} />
        </motion.div>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: '100vh',
        background: editorColors.background,
        display: 'flex',
        overflow: 'hidden',
      }}
    >
      {/* ==================== LEFT SIDEBAR ==================== */}
      <Paper
        elevation={0}
        sx={{
          width: 280,
          background: editorColors.surface,
          borderRight: `1px solid ${editorColors.border}`,
          display: 'flex',
          flexDirection: 'column',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Header */}
        <Box sx={{ p: 2, borderBottom: `1px solid ${editorColors.border}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${editorColors.primary}, ${editorColors.secondary})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <LayersIcon sx={{ color: '#fff', fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ color: editorColors.text, fontWeight: 700, lineHeight: 1.2 }}>
                Table Map
              </Typography>
              <Typography variant="caption" sx={{ color: editorColors.textMuted }}>
                Editor v2.0
              </Typography>
            </Box>
          </Box>

          {/* Quick Stats */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip
              icon={<TableIcon sx={{ fontSize: 14 }} />}
              label={`${tables.length} bàn`}
              size="small"
              sx={{
                background: alpha(editorColors.primary, 0.18),
                color: editorColors.primary,
                border: `1px solid ${editorColors.primary}40`,
              }}
            />
            <Chip
              icon={<AreaIcon sx={{ fontSize: 14 }} />}
              label={`${areas.length} khu vực`}
              size="small"
              sx={{
                background: 'rgba(0, 217, 255, 0.2)',
                color: editorColors.secondary,
                border: `1px solid ${editorColors.secondary}40`,
              }}
            />
          </Box>
        </Box>

        {/* Areas List */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="subtitle2" sx={{ color: editorColors.textMuted, fontWeight: 600, letterSpacing: 1 }}>
              KHU VỰC
            </Typography>
            <PermissionGate permission={PERMISSIONS.TABLE_MANAGE}>
              <Tooltip title="Thêm khu vực">
                <IconButton
                  size="small"
                  onClick={() => handleOpenAreaDialog()}
                  sx={{
                    background: editorColors.primary,
                    color: '#fff',
                    width: 26,
                    height: 26,
                    '&:hover': { background: editorColors.primary, opacity: 0.9 },
                  }}
                >
                  <AddIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </PermissionGate>
          </Box>

          <AnimatePresence>
            {areas.map((area, index) => {
              const areaTables = tables.filter((t) => t.khuVuc?.id === area.id);
              return (
                <AreaSection
                  key={area.id}
                  area={area}
                  tables={areaTables}
                  colorConfig={getAreaColorByIndex(index)}
                  onEditArea={handleOpenAreaDialog}
                  onDeleteArea={(id) => setDeleteConfirm({ open: true, type: 'area', id })}
                />
              );
            })}
          </AnimatePresence>

          {areas.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <AreaIcon sx={{ fontSize: 40, color: editorColors.textMuted, opacity: 0.3, mb: 1 }} />
              <Typography variant="body2" sx={{ color: editorColors.textMuted }}>
                Chưa có khu vực nào
              </Typography>
              <PermissionGate permission={PERMISSIONS.TABLE_MANAGE}>
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenAreaDialog()}
                  sx={{ mt: 1, color: editorColors.primary }}
                >
                  Thêm khu vực
                </Button>
              </PermissionGate>
            </Box>
          )}
        </Box>

        {/* Add Table Button */}
        <Box sx={{ p: 2, borderTop: `1px solid ${editorColors.border}` }}>
          <PermissionGate permission={PERMISSIONS.TABLE_MANAGE}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenTableDialog()}
              disabled={areas.length === 0}
              sx={{
                background: `linear-gradient(135deg, ${editorColors.primary}, ${editorColors.secondary})`,
                py: 1.5,
                borderRadius: 2,
                fontWeight: 600,
                boxShadow: `0 4px 20px ${editorColors.primaryGlow}`,
                '&:hover': {
                  boxShadow: `0 6px 30px ${editorColors.primaryGlow}`,
                },
                '&:disabled': {
                  background: 'rgba(255,255,255,0.1)',
                  color: editorColors.textMuted,
                },
              }}
            >
              Thêm Bàn Mới
            </Button>
            {areas.length === 0 && (
              <Typography variant="caption" sx={{ color: editorColors.warning, display: 'block', mt: 1, textAlign: 'center' }}>
                Vui lòng tạo khu vực trước
              </Typography>
            )}
          </PermissionGate>
        </Box>
      </Paper>

      {/* ==================== MAIN CANVAS ==================== */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Toolbar */}
        <Paper
          elevation={0}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 1.5,
            background: alpha(editorColors.surface, 0.05),
            borderBottom: `1px solid ${editorColors.border}`,
            backdropFilter: 'blur(6px)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* View Mode Toggle */}
            <ToggleButtonGroup
              value={isPreviewMode ? 'preview' : 'edit'}
              exclusive
              onChange={(e, v) => v && setIsPreviewMode(v === 'preview')}
              size="small"
              sx={{
                '& .MuiToggleButton-root': {
                  color: editorColors.textMuted,
                  borderColor: editorColors.border,
                  px: 2,
                  '&.Mui-selected': {
                    background: editorColors.primary,
                    color: '#fff',
                    '&:hover': { background: editorColors.primary },
                  },
                },
              }}
            >
              <ToggleButton value="edit">
                <EditModeIcon sx={{ mr: 1, fontSize: 18 }} /> Chỉnh sửa
              </ToggleButton>
              <ToggleButton value="preview">
                <PreviewIcon sx={{ mr: 1, fontSize: 18 }} /> Xem trước
              </ToggleButton>
            </ToggleButtonGroup>

            <Divider orientation="vertical" flexItem sx={{ borderColor: editorColors.border }} />

            {/* Grid Toggle */}
            <Tooltip title={showGrid ? 'Ẩn lưới' : 'Hiện lưới'}>
              <IconButton
                onClick={() => setShowGrid(!showGrid)}
                sx={{
                  color: showGrid ? editorColors.primary : editorColors.textMuted,
                  background: showGrid ? alpha(editorColors.primary, 0.15) : 'transparent',
                }}
              >
                {showGrid ? <GridOnIcon /> : <GridOffIcon />}
              </IconButton>
            </Tooltip>

            {/* Area Filter */}
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <Select
                value={filterArea}
                onChange={(e) => setFilterArea(e.target.value)}
                sx={{
                  color: editorColors.text,
                  '.MuiOutlinedInput-notchedOutline': { borderColor: editorColors.border },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: editorColors.primary },
                  '.MuiSvgIcon-root': { color: editorColors.textMuted },
                }}
              >
                <MenuItem value="all">Tất cả khu vực</MenuItem>
                {areas.map((area) => (
                  <MenuItem key={area.id} value={area.id}>
                    {area.ten}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Zoom Controls */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, background: alpha(editorColors.textMuted, 0.06), borderRadius: 2, px: 1.5, py: 0.5 }}>
              <IconButton
                size="small"
                onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
                sx={{ color: editorColors.textMuted }}
              >
                <ZoomOutIcon sx={{ fontSize: 18 }} />
              </IconButton>
              <Typography variant="caption" sx={{ color: editorColors.text, minWidth: 45, textAlign: 'center' }}>
                {Math.round(zoom * 100)}%
              </Typography>
              <IconButton
                size="small"
                onClick={() => setZoom((z) => Math.min(2, z + 0.1))}
                sx={{ color: editorColors.textMuted }}
              >
                <ZoomInIcon sx={{ fontSize: 18 }} />
              </IconButton>
              <Tooltip title="Fit to screen">
                <IconButton
                  size="small"
                  onClick={() => setZoom(1)}
                  sx={{ color: editorColors.textMuted }}
                >
                  <FitScreenIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Paper>

        {/* Canvas Area */}
        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3,
          }}
        >
          <Box
            ref={canvasRef}
            onClick={handleCanvasClick}
            sx={{
              width: CANVAS_WIDTH,
              height: CANVAS_HEIGHT,
              minWidth: CANVAS_WIDTH,
              minHeight: CANVAS_HEIGHT,
              background: editorColors.surface,
              borderRadius: 4,
              position: 'relative',
              transform: `scale(${zoom})`,
              transformOrigin: 'center center',
              transition: 'transform 0.2s ease',
              boxShadow: `
                0 0 0 1px ${editorColors.border},
                0 20px 60px rgba(0, 0, 0, 0.06)
              `,
              // Grid pattern
              ...(showGrid && {
                backgroundImage: `
                  linear-gradient(${editorColors.grid} 1px, transparent 1px),
                  linear-gradient(90deg, ${editorColors.grid} 1px, transparent 1px),
                  linear-gradient(${editorColors.gridMajor} 1px, transparent 1px),
                  linear-gradient(90deg, ${editorColors.gridMajor} 1px, transparent 1px)
                `,
                backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px, ${GRID_SIZE}px ${GRID_SIZE}px, ${GRID_SIZE * 5}px ${GRID_SIZE * 5}px, ${GRID_SIZE * 5}px ${GRID_SIZE * 5}px`,
              }),
            }}
          >
            {/* Tables */}
            <AnimatePresence>
              {filteredTables.map((table) => (
                <DraggableTable
                  key={table.id}
                  table={table}
                  isSelected={selectedTableId === table.id}
                  isPreview={isPreviewMode}
                  zoom={zoom}
                  onSelect={handleSelectTable}
                  onDragEnd={handleDragEnd}
                  onDoubleClick={handleOpenTableDialog}
                  areaColor={getTableAreaColor(table)}
                  canEdit={canManageTables}
                />
              ))}
            </AnimatePresence>

            {/* Legend - Chú thích trạng thái bàn */}
            <Paper
              elevation={0}
              sx={{
                position: 'absolute',
                bottom: 16,
                right: 16,
                background: alpha(editorColors.surface, 0.95),
                backdropFilter: 'blur(10px)',
                borderRadius: 2,
                p: 2,
                border: `1px solid ${editorColors.border}`,
                minWidth: 180,
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{
                  color: editorColors.text,
                  fontWeight: 600,
                  mb: 1.5,
                  fontSize: '0.8rem',
                  letterSpacing: 0.5,
                }}
              >
                CHÚ THÍCH TRẠNG THÁI
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {[
                  { key: 'TRONG', label: 'Trống', color: editorColors.TRONG.bg },
                  { key: 'COKHACH', label: 'Có khách', color: editorColors.COKHACH.bg },
                  { key: 'DADAT', label: 'Đã đặt trước', color: editorColors.DADAT.bg },
                ].map((status) => (
                  <Box
                    key={status.key}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                    }}
                  >
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        background: status.color,
                        boxShadow: `0 2px 8px ${status.color}60`,
                        flexShrink: 0,
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        color: editorColors.textMuted,
                        fontSize: '0.75rem',
                      }}
                    >
                      {status.label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>

            {/* Empty State */}
            {filteredTables.length === 0 && (
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <TableIcon sx={{ fontSize: 80, color: editorColors.textMuted, opacity: 0.3, mb: 2 }} />
                <Typography variant="h6" sx={{ color: editorColors.textMuted }}>
                  {filterArea === 'all' ? 'Chưa có bàn nào' : 'Không có bàn trong khu vực này'}
                </Typography>
                <Typography variant="body2" sx={{ color: editorColors.textMuted, mb: 3 }}>
                  {areas.length === 0 ? 'Tạo khu vực trước, sau đó thêm bàn' : 'Nhấn "Thêm Bàn Mới" để bắt đầu'}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* ==================== RIGHT SIDEBAR - Selected Table Info ==================== */}
      <AnimatePresence>
        {selectedTable && !isPreviewMode && (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <Paper
              elevation={0}
              sx={{
                width: 280,
                height: '100%',
                background: editorColors.surface,
                borderLeft: `1px solid ${editorColors.border}`,
                backdropFilter: 'blur(20px)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Header */}
              <Box sx={{ p: 2, borderBottom: `1px solid ${editorColors.border}` }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle1" sx={{ color: editorColors.text, fontWeight: 700 }}>
                    Chi tiết bàn
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => setSelectedTableId(null)}
                    sx={{ color: editorColors.textMuted }}
                  >
                    <CloseIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Box>
                <Typography variant="h5" sx={{ color: editorColors.primary, fontWeight: 700 }}>
                  {selectedTable.ten}
                </Typography>
              </Box>

              {/* Properties */}
              <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="caption" sx={{ color: editorColors.textMuted, mb: 1, display: 'block', letterSpacing: 1 }}>
                    SỐ GHẾ
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TableIcon sx={{ color: editorColors.primary }} />
                    <Typography variant="h6" sx={{ color: editorColors.text }}>
                      {selectedTable.soGhe} ghế
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="caption" sx={{ color: editorColors.textMuted, mb: 1, display: 'block', letterSpacing: 1 }}>
                    KHU VỰC
                  </Typography>
                  <Chip
                    label={selectedTable.khuVuc?.ten || 'Không xác định'}
                    sx={{
                      background: 'rgba(108, 99, 255, 0.2)',
                      color: editorColors.primary,
                      border: `1px solid ${editorColors.primary}40`,
                    }}
                  />
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="caption" sx={{ color: editorColors.textMuted, mb: 1, display: 'block', letterSpacing: 1 }}>
                    VỊ TRÍ
                  </Typography>
                  <Typography variant="body2" sx={{ color: editorColors.text }}>
                    X: {selectedTable.posX || 0}px, Y: {selectedTable.posY || 0}px
                  </Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="caption" sx={{ color: editorColors.textMuted, mb: 1, display: 'block', letterSpacing: 1 }}>
                    TRẠNG THÁI
                  </Typography>
                  <Chip
                    label={
                      selectedTable.trangThai === 'TRONG' ? 'Trống' :
                        selectedTable.trangThai === 'DANGPHUCVU' ? 'Đang phục vụ' :
                          selectedTable.trangThai === 'DATRUOC' ? 'Đã đặt trước' :
                            selectedTable.trangThai === 'GHEP' ? 'Ghép bàn' :
                              selectedTable.trangThai || 'Trống'
                    }
                    sx={{
                      background: (editorColors[selectedTable.trangThai] || editorColors.TRONG).glow,
                      color: '#fff',
                      fontWeight: 600,
                    }}
                  />
                </Box>
              </Box>

              {/* Actions */}
              <Box sx={{ p: 2, borderTop: `1px solid ${editorColors.border}`, display: 'flex', gap: 1 }}>
                <PermissionGate permission={PERMISSIONS.TABLE_MANAGE}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => handleOpenTableDialog(selectedTable)}
                    sx={{
                      color: editorColors.primary,
                      borderColor: editorColors.primary,
                      '&:hover': {
                        background: 'rgba(108, 99, 255, 0.1)',
                        borderColor: editorColors.primary,
                      },
                    }}
                  >
                    Sửa
                  </Button>
                </PermissionGate>
                <PermissionGate permission={PERMISSIONS.TABLE_MANAGE}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<DeleteIcon />}
                    onClick={() => setDeleteConfirm({ open: true, type: 'table', id: selectedTable.id })}
                    sx={{
                      color: editorColors.error,
                      borderColor: editorColors.error,
                      '&:hover': {
                        background: 'rgba(248, 113, 113, 0.1)',
                        borderColor: editorColors.error,
                      },
                    }}
                  >
                    Xóa
                  </Button>
                </PermissionGate>
              </Box>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== TABLE DIALOG ==================== */}
      <Dialog
        open={tableDialog.open}
        onClose={() => setTableDialog({ open: false, table: null })}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: editorColors.surface,
            borderRadius: 3,
            border: `1px solid ${editorColors.border}`,
          },
        }}
      >
        <DialogTitle sx={{ color: editorColors.text, borderBottom: `1px solid ${editorColors.border}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <TableIcon sx={{ color: editorColors.primary }} />
            {tableDialog.table?.id ? 'Chỉnh sửa bàn' : 'Thêm bàn mới'}
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
            <TextField
              label="Tên bàn"
              fullWidth
              value={tableDialog.table?.ten || ''}
              onChange={(e) => setTableDialog((prev) => ({
                ...prev,
                table: { ...prev.table, ten: e.target.value },
              }))}
              placeholder="VD: Bàn 1, VIP 01..."
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: editorColors.text,
                  '& fieldset': { borderColor: editorColors.border },
                  '&:hover fieldset': { borderColor: editorColors.primary },
                  '&.Mui-focused fieldset': { borderColor: editorColors.primary },
                },
                '& .MuiInputLabel-root': { color: editorColors.textMuted },
              }}
            />

            <TextField
              label="Số ghế"
              type="number"
              fullWidth
              value={tableDialog.table?.soGhe || 4}
              onChange={(e) => setTableDialog((prev) => ({
                ...prev,
                table: { ...prev.table, soGhe: parseInt(e.target.value) || 4 },
              }))}
              inputProps={{ min: 1, max: 20 }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: editorColors.text,
                  '& fieldset': { borderColor: editorColors.border },
                  '&:hover fieldset': { borderColor: editorColors.primary },
                  '&.Mui-focused fieldset': { borderColor: editorColors.primary },
                },
                '& .MuiInputLabel-root': { color: editorColors.textMuted },
              }}
            />

            <FormControl fullWidth>
              <InputLabel sx={{ color: editorColors.textMuted }}>Khu vực</InputLabel>
              <Select
                value={tableDialog.table?.khuVucId || ''}
                onChange={(e) => setTableDialog((prev) => ({
                  ...prev,
                  table: { ...prev.table, khuVucId: e.target.value },
                }))}
                label="Khu vực"
                sx={{
                  color: editorColors.text,
                  '.MuiOutlinedInput-notchedOutline': { borderColor: editorColors.border },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: editorColors.primary },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: editorColors.primary },
                  '.MuiSvgIcon-root': { color: editorColors.textMuted },
                }}
              >
                {areas.map((area) => (
                  <MenuItem key={area.id} value={area.id}>
                    {area.ten}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: `1px solid ${editorColors.border}`, justifyContent: 'space-between' }}>
          {/* Nút Xóa - chỉ hiển thị khi đang chỉnh sửa bàn */}
          {tableDialog.table?.id ? (
            <Button
              onClick={() => {
                setTableDialog({ open: false, table: null });
                setDeleteConfirm({ open: true, type: 'table', id: tableDialog.table.id });
              }}
              startIcon={<DeleteIcon />}
              sx={{
                color: editorColors.error,
                '&:hover': {
                  background: 'rgba(248, 113, 113, 0.1)',
                },
              }}
            >
              Xóa bàn
            </Button>
          ) : (
            <Box /> // Placeholder để giữ layout
          )}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              onClick={() => setTableDialog({ open: false, table: null })}
              sx={{ color: editorColors.textMuted }}
            >
              Hủy
            </Button>
            <Button
              onClick={handleSaveTable}
              variant="contained"
              startIcon={<CheckIcon />}
              disabled={!tableDialog.table?.ten || !tableDialog.table?.khuVucId}
              sx={{
                background: `linear-gradient(135deg, ${editorColors.primary}, ${editorColors.secondary})`,
                '&:disabled': { background: 'rgba(255,255,255,0.1)' },
              }}
            >
              {tableDialog.table?.id ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* ==================== AREA DIALOG ==================== */}
      <Dialog
        open={areaDialog.open}
        onClose={() => setAreaDialog({ open: false, area: null })}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: editorColors.surface,
            borderRadius: 3,
            border: `1px solid ${editorColors.border}`,
          },
        }}
      >
        <DialogTitle sx={{ color: editorColors.text, borderBottom: `1px solid ${editorColors.border}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <AreaIcon sx={{ color: editorColors.secondary }} />
            {areaDialog.area?.id ? 'Chỉnh sửa khu vực' : 'Thêm khu vực mới'}
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
            <TextField
              label="Tên khu vực"
              fullWidth
              value={areaDialog.area?.ten || ''}
              onChange={(e) => setAreaDialog((prev) => ({
                ...prev,
                area: { ...prev.area, ten: e.target.value },
              }))}
              placeholder="VD: Tầng 1, Sân vườn, VIP..."
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: editorColors.text,
                  '& fieldset': { borderColor: editorColors.border },
                  '&:hover fieldset': { borderColor: editorColors.primary },
                  '&.Mui-focused fieldset': { borderColor: editorColors.primary },
                },
                '& .MuiInputLabel-root': { color: editorColors.textMuted },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: `1px solid ${editorColors.border}` }}>
          <Button
            onClick={() => setAreaDialog({ open: false, area: null })}
            sx={{ color: editorColors.textMuted }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSaveArea}
            variant="contained"
            startIcon={<CheckIcon />}
            disabled={!areaDialog.area?.ten}
            sx={{
              background: `linear-gradient(135deg, ${editorColors.secondary}, ${editorColors.primary})`,
              '&:disabled': { background: 'rgba(255,255,255,0.1)' },
            }}
          >
            {areaDialog.area?.id ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ==================== DELETE CONFIRM DIALOG ==================== */}
      <Dialog
        open={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, type: null, id: null })}
        PaperProps={{
          sx: {
            background: editorColors.surface,
            borderRadius: 3,
            border: `1px solid ${editorColors.error}40`,
          },
        }}
      >
        <DialogTitle sx={{ color: editorColors.error }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <WarningIcon />
            Xác nhận xóa
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: editorColors.text }}>
            Bạn có chắc chắn muốn xóa {deleteConfirm.type === 'table' ? 'bàn' : 'khu vực'} này?
            {deleteConfirm.type === 'area' && (
              <Box component="span" sx={{ display: 'block', color: editorColors.warning, mt: 1 }}>
                Lưu ý: Các bàn trong khu vực sẽ được chuyển sang "Khu vực chung"
              </Box>
            )}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setDeleteConfirm({ open: false, type: null, id: null })}
            sx={{ color: editorColors.textMuted }}
          >
            Hủy
          </Button>
          <Button
            onClick={deleteConfirm.type === 'table' ? handleDeleteTable : handleDeleteArea}
            variant="contained"
            startIcon={<DeleteIcon />}
            sx={{
              background: editorColors.error,
              '&:hover': { background: '#dc2626' },
            }}
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      {/* ==================== SNACKBAR ==================== */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{
            background: snackbar.severity === 'success' ? 'rgba(74, 222, 128, 0.9)' : 'rgba(248, 113, 113, 0.9)',
            color: '#fff',
            fontWeight: 600,
            borderRadius: 2,
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
