// Permission constants - Các quyền hệ thống (Frontend)
// PHẢI ĐỒNG BỘ VỚI backend/src/utils/permissions.js
export const PERMISSIONS = {
  // Account Management - Chỉ Admin
  ACCOUNT_CREATE: 'ACCOUNT_CREATE',
  ACCOUNT_MANAGE: 'ACCOUNT_MANAGE',
  ACCOUNT_DELETE: 'ACCOUNT_DELETE',
  
  // Reports - Manager, Admin
  REPORT_VIEW: 'REPORT_VIEW',
  REPORT_EXPORT: 'REPORT_EXPORT',
  
  // Stock/Inventory Management - Manager, Admin, Thu Kho
  STOCK_MANAGE: 'STOCK_MANAGE',
  STOCK_IMPORT: 'STOCK_IMPORT',
  STOCK_VIEW: 'STOCK_VIEW',
  
  // Menu Management - Manager, Admin
  MENU_MANAGE: 'MENU_MANAGE',
  MENU_CREATE: 'MENU_CREATE',
  MENU_UPDATE: 'MENU_UPDATE',
  MENU_DELETE: 'MENU_DELETE',
  MENU_VIEW: 'MENU_VIEW',
  
  // Order Management
  ORDER_CREATE: 'ORDER_CREATE',
  ORDER_UPDATE: 'ORDER_UPDATE',
  ORDER_VIEW: 'ORDER_VIEW',
  ORDER_VOID: 'ORDER_VOID',
  ORDER_VOID_APPROVE: 'ORDER_VOID_APPROVE',
  
  // Payment - Cashier, Admin
  PAYMENT_EXECUTE: 'PAYMENT_EXECUTE',
  PAYMENT_VIEW: 'PAYMENT_VIEW',
  
  // Shift Management - Cashier, Admin
  SHIFT_MANAGE: 'SHIFT_MANAGE',
  SHIFT_OPEN: 'SHIFT_OPEN',
  SHIFT_CLOSE: 'SHIFT_CLOSE',
  
  // Kitchen Display System - Kitchen Staff
  KDS_VIEW: 'KDS_VIEW',
  DISH_STATUS_UPDATE: 'DISH_STATUS_UPDATE',
  
  // Table Management
  TABLE_VIEW: 'TABLE_VIEW',
  TABLE_MANAGE: 'TABLE_MANAGE',
  
  // Purchase Order - Thu Kho, Manager
  PO_CREATE: 'PO_CREATE',
  PO_APPROVE: 'PO_APPROVE',
  PO_VIEW: 'PO_VIEW',
  
  // HR Management - Manager, Admin
  HR_MANAGE: 'HR_MANAGE',
  HR_VIEW: 'HR_VIEW',
  
  // Reservation Management
  RESERVATION_CREATE: 'RESERVATION_CREATE',
  RESERVATION_MANAGE: 'RESERVATION_MANAGE',
  RESERVATION_VIEW: 'RESERVATION_VIEW',
  
  // Customer Management
  CUSTOMER_VIEW: 'CUSTOMER_VIEW',
  CUSTOMER_MANAGE: 'CUSTOMER_MANAGE',
  
  // Shift Schedule Management - Quản lý ca
  SHIFT_SCHEDULE_VIEW: 'SHIFT_SCHEDULE_VIEW',
  SHIFT_SCHEDULE_MANAGE: 'SHIFT_SCHEDULE_MANAGE',
  
  // Attendance/Timekeeping - Chấm công
  ATTENDANCE_VIEW: 'ATTENDANCE_VIEW',
  ATTENDANCE_MANAGE: 'ATTENDANCE_MANAGE',
};

// Role constants
export const ROLES = {
  ADMIN: 'Admin',
  QUAN_LY: 'QuanLy',
  THU_NGAN: 'ThuNgan',
  PHUC_VU: 'PhucVu',
  BEP: 'Bep',
  THU_KHO: 'ThuKho',
};
