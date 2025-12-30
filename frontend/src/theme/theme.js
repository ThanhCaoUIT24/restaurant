import { createTheme, alpha } from '@mui/material/styles';

// Custom color palette
const primaryColor = {
  lighter: '#C8FAD6',
  light: '#5BE49B',
  main: '#00A76F',
  dark: '#007867',
  darker: '#004B50',
  contrastText: '#FFFFFF',
};

const secondaryColor = {
  lighter: '#EFD6FF',
  light: '#C684FF',
  main: '#8E33FF',
  dark: '#5119B7',
  darker: '#27097A',
  contrastText: '#FFFFFF',
};

const infoColor = {
  lighter: '#CAFDF5',
  light: '#61F3F3',
  main: '#00B8D9',
  dark: '#006C9C',
  darker: '#003768',
  contrastText: '#FFFFFF',
};

const successColor = {
  lighter: '#D3FCD2',
  light: '#77ED8B',
  main: '#22C55E',
  dark: '#118D57',
  darker: '#065E49',
  contrastText: '#FFFFFF',
};

const warningColor = {
  lighter: '#FFF5CC',
  light: '#FFD666',
  main: '#FFAB00',
  dark: '#B76E00',
  darker: '#7A4100',
  contrastText: '#212B36',
};

const errorColor = {
  lighter: '#FFE9D5',
  light: '#FFAC82',
  main: '#FF5630',
  dark: '#B71D18',
  darker: '#7A0916',
  contrastText: '#FFFFFF',
};

// Grey scale
const grey = {
  0: '#FFFFFF',
  100: '#F9FAFB',
  200: '#F4F6F8',
  300: '#DFE3E8',
  400: '#C4CDD5',
  500: '#919EAB',
  600: '#637381',
  700: '#454F5B',
  800: '#212B36',
  900: '#161C24',
};

// Common settings
const commonSettings = {
  typography: {
    fontFamily: '"Inter", "Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    h1: {
      fontWeight: 800,
      fontSize: '2.5rem',
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontWeight: 800,
      fontSize: '2rem',
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontWeight: 700,
      fontSize: '1.5rem',
      lineHeight: 1.4,
    },
    h4: {
      fontWeight: 700,
      fontSize: '1.25rem',
      lineHeight: 1.5,
    },
    h5: {
      fontWeight: 700,
      fontSize: '1.125rem',
      lineHeight: 1.5,
    },
    h6: {
      fontWeight: 700,
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    subtitle1: {
      fontWeight: 600,
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    subtitle2: {
      fontWeight: 600,
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      fontWeight: 700,
      fontSize: '0.875rem',
      textTransform: 'none',
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.5,
    },
    overline: {
      fontWeight: 700,
      fontSize: '0.75rem',
      textTransform: 'uppercase',
      letterSpacing: '1.1px',
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    'none',
    '0px 1px 2px 0px rgba(145, 158, 171, 0.16)',
    '0px 1px 2px 0px rgba(145, 158, 171, 0.2)',
    '0px 2px 4px -1px rgba(145, 158, 171, 0.12)',
    '0px 4px 8px -2px rgba(145, 158, 171, 0.12)',
    '0px 6px 12px -4px rgba(145, 158, 171, 0.12)',
    '0px 8px 16px -4px rgba(145, 158, 171, 0.12)',
    '0px 12px 24px -4px rgba(145, 158, 171, 0.12)',
    '0px 16px 32px -4px rgba(145, 158, 171, 0.12)',
    '0px 20px 40px -4px rgba(145, 158, 171, 0.12)',
    '0px 24px 48px -4px rgba(145, 158, 171, 0.12)',
    '0px 2px 4px 0px rgba(145, 158, 171, 0.2)',
    '0px 4px 8px 0px rgba(145, 158, 171, 0.2)',
    '0px 8px 16px 0px rgba(145, 158, 171, 0.2)',
    '0px 12px 24px 0px rgba(145, 158, 171, 0.2)',
    '0px 16px 32px 0px rgba(145, 158, 171, 0.2)',
    '0px 20px 40px 0px rgba(145, 158, 171, 0.2)',
    '0px 24px 48px 0px rgba(145, 158, 171, 0.2)',
    '0px 2px 8px 0px rgba(145, 158, 171, 0.24)',
    '0px 4px 16px 0px rgba(145, 158, 171, 0.24)',
    '0px 8px 24px 0px rgba(145, 158, 171, 0.24)',
    '0px 12px 32px 0px rgba(145, 158, 171, 0.24)',
    '0px 16px 40px 0px rgba(145, 158, 171, 0.24)',
    '0px 20px 48px 0px rgba(145, 158, 171, 0.24)',
    '0px 24px 56px 0px rgba(145, 158, 171, 0.24)',
  ],
};

// Component overrides factory
const createComponentOverrides = (mode) => {
  const isLight = mode === 'light';
  const bgPaper = isLight ? '#FFFFFF' : grey[800];
  const bgDefault = isLight ? grey[100] : grey[900];

  return {
    MuiCssBaseline: {
      styleOverrides: {
        '*': {
          boxSizing: 'border-box',
        },
        html: {
          margin: 0,
          padding: 0,
          width: '100%',
          height: '100%',
          WebkitOverflowScrolling: 'touch',
        },
        body: {
          margin: 0,
          padding: 0,
          width: '100%',
          height: '100%',
        },
        '#root': {
          width: '100%',
          height: '100%',
        },
        '::-webkit-scrollbar': {
          width: '8px',
          height: '8px',
        },
        '::-webkit-scrollbar-track': {
          background: isLight ? grey[200] : grey[800],
        },
        '::-webkit-scrollbar-thumb': {
          background: isLight ? grey[400] : grey[600],
          borderRadius: '4px',
        },
        '::-webkit-scrollbar-thumb:hover': {
          background: grey[500],
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 700,
          boxShadow: 'none',
          padding: '8px 16px',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        sizeLarge: {
          height: 48,
          minWidth: 48,
          fontSize: 15,
          padding: '8px 22px',
        },
        sizeMedium: {
          height: 40,
          minWidth: 40,
        },
        sizeSmall: {
          height: 32,
          minWidth: 32,
          fontSize: 13,
          padding: '4px 10px',
        },
        containedPrimary: {
          boxShadow: `0 8px 16px 0 ${alpha(primaryColor.main, 0.24)}`,
          '&:hover': {
            boxShadow: `0 8px 16px 0 ${alpha(primaryColor.main, 0.4)}`,
            backgroundColor: primaryColor.dark,
          },
        },
        containedSecondary: {
          boxShadow: `0 8px 16px 0 ${alpha(secondaryColor.main, 0.24)}`,
          '&:hover': {
            boxShadow: `0 8px 16px 0 ${alpha(secondaryColor.main, 0.4)}`,
          },
        },
        containedError: {
          boxShadow: `0 8px 16px 0 ${alpha(errorColor.main, 0.24)}`,
          '&:hover': {
            boxShadow: `0 8px 16px 0 ${alpha(errorColor.main, 0.4)}`,
          },
        },
        containedSuccess: {
          boxShadow: `0 8px 16px 0 ${alpha(successColor.main, 0.24)}`,
          '&:hover': {
            boxShadow: `0 8px 16px 0 ${alpha(successColor.main, 0.4)}`,
          },
        },
        outlinedInherit: {
          borderColor: alpha(grey[500], 0.32),
          '&:hover': {
            backgroundColor: isLight ? grey[200] : alpha(grey[500], 0.08),
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: isLight
            ? '0px 0px 2px 0px rgba(145, 158, 171, 0.2), 0px 12px 24px -4px rgba(145, 158, 171, 0.12)'
            : '0px 0px 2px 0px rgba(0, 0, 0, 0.2), 0px 12px 24px -4px rgba(0, 0, 0, 0.12)',
          borderRadius: 16,
          position: 'relative',
          zIndex: 0,
          backgroundImage: !isLight ? `linear-gradient(${alpha(grey[500], 0.04)}, ${alpha(grey[500], 0.04)})` : 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        rounded: {
          borderRadius: 16,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          backgroundColor: isLight ? grey[200] : grey[800],
        },
        root: {
          borderBottom: `1px solid ${alpha(grey[500], 0.16)}`,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        size: 'small',
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderWidth: 2,
          },
        },
        input: {
          padding: '12px 14px',
        },
        notchedOutline: {
          borderColor: alpha(grey[500], isLight ? 0.2 : 0.24),
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          '&.MuiInputLabel-shrink': {
            fontWeight: 600,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          borderRadius: 8,
        },
        filled: {
          '&.MuiChip-colorDefault': {
            backgroundColor: alpha(grey[500], 0.16),
          },
        },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: 'none',
          borderRadius: 12,
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: isLight ? grey[200] : grey[800],
            borderRadius: '12px 12px 0 0',
          },
          '& .MuiDataGrid-columnHeaderTitle': {
            fontWeight: 600,
          },
          '& .MuiDataGrid-cell': {
            borderBottom: `1px solid ${alpha(grey[500], 0.08)}`,
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: alpha(grey[500], 0.08),
          },
          '& .MuiDataGrid-footerContainer': {
            borderTop: `1px solid ${alpha(grey[500], 0.16)}`,
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          boxShadow: '0px 24px 48px -4px rgba(145, 158, 171, 0.24)',
          backgroundImage: !isLight ? `linear-gradient(${alpha(grey[500], 0.04)}, ${alpha(grey[500], 0.04)})` : 'none',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          padding: '24px 24px 16px',
          fontSize: '1.125rem',
          fontWeight: 700,
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: '0 24px 24px',
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: '16px 24px 24px',
          gap: 8,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: 0,
          boxShadow: '0 8px 16px 0 rgba(145, 158, 171, 0.16)',
          backgroundImage: !isLight ? `linear-gradient(${alpha(grey[500], 0.04)}, ${alpha(grey[500], 0.04)})` : 'none',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          backdropFilter: 'blur(6px)',
          backgroundColor: alpha(bgPaper, 0.8),
          color: isLight ? grey[800] : '#FFFFFF',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          marginBottom: 4,
          padding: '10px 12px',
          '&.Mui-selected': {
            backgroundColor: alpha(primaryColor.main, isLight ? 0.08 : 0.16),
            color: primaryColor.main,
            '& .MuiListItemIcon-root': {
              color: primaryColor.main,
            },
            '&:hover': {
              backgroundColor: alpha(primaryColor.main, isLight ? 0.16 : 0.24),
            },
          },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          minWidth: 40,
          color: grey[600],
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
        standardSuccess: {
          backgroundColor: alpha(successColor.main, 0.16),
          color: isLight ? successColor.dark : successColor.light,
          '& .MuiAlert-icon': {
            color: successColor.main,
          },
        },
        standardError: {
          backgroundColor: alpha(errorColor.main, 0.16),
          color: isLight ? errorColor.dark : errorColor.light,
          '& .MuiAlert-icon': {
            color: errorColor.main,
          },
        },
        standardWarning: {
          backgroundColor: alpha(warningColor.main, 0.16),
          color: isLight ? warningColor.dark : warningColor.light,
          '& .MuiAlert-icon': {
            color: warningColor.main,
          },
        },
        standardInfo: {
          backgroundColor: alpha(infoColor.main, 0.16),
          color: isLight ? infoColor.dark : infoColor.light,
          '& .MuiAlert-icon': {
            color: infoColor.main,
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: grey[800],
          borderRadius: 6,
          fontSize: '0.75rem',
        },
        arrow: {
          color: grey[800],
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          overflow: 'hidden',
          height: 6,
          backgroundColor: alpha(primaryColor.main, 0.24),
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem',
          fontWeight: 600,
        },
        colorDefault: {
          backgroundColor: isLight ? grey[300] : grey[700],
          color: isLight ? grey[700] : grey[200],
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          textTransform: 'none',
          minHeight: 48,
          padding: '12px 16px',
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          height: 3,
          borderRadius: '3px 3px 0 0',
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          width: 52,
          height: 32,
          padding: 0,
        },
        switchBase: {
          padding: 4,
          '&.Mui-checked': {
            transform: 'translateX(20px)',
            '& + .MuiSwitch-track': {
              opacity: 1,
              backgroundColor: primaryColor.main,
            },
          },
        },
        thumb: {
          width: 24,
          height: 24,
          boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
        },
        track: {
          borderRadius: 16,
          opacity: 1,
          backgroundColor: grey[400],
        },
      },
    },
    MuiBadge: {
      styleOverrides: {
        dot: {
          width: 10,
          height: 10,
          borderRadius: '50%',
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 8,
          boxShadow: '0px 8px 16px 0px rgba(145, 158, 171, 0.24)',
        },
        list: {
          padding: 8,
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          padding: '8px 12px',
          marginBottom: 2,
          '&:last-of-type': {
            marginBottom: 0,
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        select: {
          '&.MuiInputBase-input': {
            padding: '12px 14px',
          },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: alpha(grey[500], 0.16),
        },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: {
          backgroundColor: alpha(grey[500], 0.12),
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          boxShadow: '0 8px 16px 0 rgba(145, 158, 171, 0.24)',
          '&:hover': {
            boxShadow: '0 12px 24px -4px rgba(145, 158, 171, 0.24)',
          },
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '&:before': {
            display: 'none',
          },
          '&.Mui-expanded': {
            margin: 0,
            boxShadow: '0px 4px 8px -2px rgba(145, 158, 171, 0.12)',
          },
        },
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          padding: '0 16px',
          minHeight: 48,
          '&.Mui-expanded': {
            minHeight: 48,
          },
        },
        content: {
          margin: '12px 0',
          '&.Mui-expanded': {
            margin: '12px 0',
          },
        },
      },
    },
    MuiAccordionDetails: {
      styleOverrides: {
        root: {
          padding: '8px 16px 16px',
        },
      },
    },
    MuiBreadcrumbs: {
      styleOverrides: {
        separator: {
          marginLeft: 12,
          marginRight: 12,
        },
      },
    },
    MuiSnackbar: {
      styleOverrides: {
        root: {
          '& .MuiAlert-root': {
            boxShadow: '0px 8px 16px 0px rgba(145, 158, 171, 0.24)',
          },
        },
      },
    },
  };
};

// Light theme
export const lightTheme = createTheme({
  ...commonSettings,
  palette: {
    mode: 'light',
    primary: primaryColor,
    secondary: secondaryColor,
    info: infoColor,
    success: successColor,
    warning: warningColor,
    error: errorColor,
    grey,
    text: {
      primary: grey[800],
      secondary: grey[600],
      disabled: grey[500],
    },
    background: {
      paper: '#FFFFFF',
      default: grey[100],
      neutral: grey[200],
    },
    action: {
      active: grey[600],
      hover: alpha(grey[500], 0.08),
      selected: alpha(grey[500], 0.16),
      disabled: alpha(grey[500], 0.8),
      disabledBackground: alpha(grey[500], 0.24),
      focus: alpha(grey[500], 0.24),
      hoverOpacity: 0.08,
      disabledOpacity: 0.48,
    },
    divider: alpha(grey[500], 0.2),
  },
  components: createComponentOverrides('light'),
});

// Dark theme
export const darkTheme = createTheme({
  ...commonSettings,
  palette: {
    mode: 'dark',
    primary: primaryColor,
    secondary: secondaryColor,
    info: infoColor,
    success: successColor,
    warning: warningColor,
    error: errorColor,
    grey,
    text: {
      primary: '#FFFFFF',
      secondary: grey[500],
      disabled: grey[600],
    },
    background: {
      paper: grey[800],
      default: grey[900],
      neutral: alpha(grey[500], 0.12),
    },
    action: {
      active: grey[500],
      hover: alpha(grey[500], 0.08),
      selected: alpha(grey[500], 0.16),
      disabled: alpha(grey[500], 0.8),
      disabledBackground: alpha(grey[500], 0.24),
      focus: alpha(grey[500], 0.24),
      hoverOpacity: 0.08,
      disabledOpacity: 0.48,
    },
    divider: alpha(grey[500], 0.24),
  },
  components: createComponentOverrides('dark'),
});

// Default export for backward compatibility
export default lightTheme;
