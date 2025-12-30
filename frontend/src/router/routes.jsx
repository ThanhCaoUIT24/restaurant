import React from 'react';
import { RequireAuth, RequireRole, RequirePermission } from './guards.jsx';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ManagerDashboard from '../pages/dashboard/ManagerDashboard';
import TablesView from '../pages/pos/TablesView';
import TableMapEditor from '../pages/pos/TableMapEditor';
import OrderPad from '../pages/pos/OrderPad';
import KdsBoard from '../pages/kds/KdsBoard';
import PosFallback from '../pages/pos/PosFallback';
import OpenBills from '../pages/billing/OpenBills';
import CashierShift from '../pages/billing/CashierShift';
import Categories from '../pages/menu/Categories';
import Dishes from '../pages/menu/Dishes';
import InventoryView from '../pages/inventory/InventoryView';
import Materials from '../pages/inventory/Materials';
import Alerts from '../pages/inventory/Alerts';
import PurchaseOrders from '../pages/purchase/PurchaseOrders';
import Receipts from '../pages/purchase/Receipts';
import Suppliers from '../pages/purchase/Suppliers';
import Adjustments from '../pages/stock/Adjustments';
import Reservations from '../pages/reservations/Reservations';
import Customers from '../pages/customers/Customers';
import Loyalty from '../pages/loyalty/Loyalty';
import CashierShifts from '../pages/shifts/CashierShifts';
import Schedules from '../pages/hr/Schedules';
import Attendance from '../pages/hr/Attendance';
import Employees from '../pages/hr/Employees';
import ReportsDashboard from '../pages/reports/ReportsDashboard';
import SalesReport from '../pages/reports/SalesReport';
import MenuPerformance from '../pages/reports/MenuPerformance';
import InventoryReport from '../pages/reports/InventoryReport';
import { PERMISSIONS } from '../utils/permissions';
import AttendanceReport from '../pages/reports/AttendanceReport';
import Users from '../pages/admin/Users';
import Roles from '../pages/admin/Roles';
import AuditLogs from '../pages/admin/AuditLogs';
import Config from '../pages/admin/Config';
import VoidRequestsPage from '../pages/manager/VoidRequestsPage';

const routes = [
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  {
    element: <RequireAuth />,
    children: [
      // Dashboard - accessible to all authenticated
      { path: '/', element: <ManagerDashboard /> },

      // POS/Tables view - require TABLE_VIEW permission (only users with table access)
      {
        element: <RequirePermission permissions={[PERMISSIONS.TABLE_VIEW]} fallback={<PosFallback />} />,
        children: [
          { path: '/pos', element: <TablesView /> },
        ],
      },

      // Orders - requires ORDER_CREATE permission (PhucVu, Manager, Admin)
      {
        element: <RequirePermission permissions={['ORDER_CREATE']} />,
        children: [
          { path: '/pos/order', element: <OrderPad /> },
        ],
      },

      // Table Editor - requires TABLE_VIEW permission (view only, edit requires TABLE_MANAGE)
      {
        element: <RequirePermission permissions={[PERMISSIONS.TABLE_VIEW]} />,
        children: [
          { path: '/pos/tables', element: <TableMapEditor /> },
        ],
      },

      // KDS - requires KDS_VIEW permission (Bep, Manager, Admin)
      {
        element: <RequirePermission permissions={[PERMISSIONS.KDS_VIEW]} />,
        children: [
          { path: '/kds', element: <KdsBoard /> },
        ],
      },

      // Billing - requires PAYMENT_EXECUTE permission (ThuNgan, Manager, Admin)
      {
        element: <RequirePermission permissions={[PERMISSIONS.PAYMENT_EXECUTE]} />,
        children: [
          { path: '/billing', element: <OpenBills /> },
          { path: '/billing/shifts', element: <CashierShift /> },
          { path: '/shifts', element: <CashierShifts /> },
        ],
      },

      // Menu management - requires MENU_MANAGE permission (Manager, Admin)
      {
        element: <RequirePermission permissions={['MENU_MANAGE']} />,
        children: [
          { path: '/menu/categories', element: <Categories /> },
          { path: '/menu/dishes', element: <Dishes /> },
        ],
      },

      // Inventory - requires STOCK_VIEW permission (ThuKho, Manager, Admin)
      {
        element: <RequirePermission permissions={['STOCK_VIEW']} />,
        children: [
          { path: '/inventory', element: <InventoryView /> },
          { path: '/inventory/materials', element: <Materials /> },
          { path: '/inventory/alerts', element: <Alerts /> },
          { path: '/stock/adjustments', element: <Adjustments /> },
        ],
      },

      // Purchase - requires PO_VIEW permission (ThuKho, Manager, Admin)
      {
        element: <RequirePermission permissions={['PO_VIEW']} />,
        children: [
          { path: '/purchase/orders', element: <PurchaseOrders /> },
          { path: '/purchase/receipts', element: <Receipts /> },
          { path: '/purchase/suppliers', element: <Suppliers /> },
        ],
      },

      // Reservations - accessible to all authenticated (PhucVu can manage)
      { path: '/reservations', element: <Reservations /> },

      // Customers - accessible to all authenticated
      { path: '/customers', element: <Customers /> },
      { path: '/loyalty', element: <Loyalty /> },

      // HR - requires HR_MANAGE permission (Manager, Admin)
      {
        element: <RequirePermission permissions={['HR_MANAGE']} />,
        children: [
          { path: '/hr/schedules', element: <Schedules /> },
          { path: '/hr/employees', element: <Employees /> },
        ],
      },
      // Attendance - requires ATTENDANCE_VIEW permission
      {
        element: <RequirePermission permissions={[PERMISSIONS.ATTENDANCE_VIEW]} />,
        children: [
          { path: '/hr/attendance', element: <Attendance /> },
        ],
      },

      // Reports - requires REPORT_VIEW permission (Manager, Admin)
      {
        element: <RequirePermission permissions={['REPORT_VIEW']} />,
        children: [
          { path: '/reports', element: <ReportsDashboard /> },
          { path: '/reports/sales', element: <SalesReport /> },
          { path: '/reports/menu', element: <MenuPerformance /> },
          { path: '/reports/inventory', element: <InventoryReport /> },
          { path: '/reports/attendance', element: <AttendanceReport /> },
        ],
      },

      // Void Requests - requires ORDER_VOID_APPROVE permission (Manager, Admin)
      {
        element: <RequirePermission permissions={['ORDER_VOID_APPROVE']} />,
        children: [
          { path: '/manager/void-requests', element: <VoidRequestsPage /> },
        ],
      },

      // Admin - requires ACCOUNT_MANAGE permission (Admin only)
      {
        element: <RequirePermission permissions={['ACCOUNT_MANAGE']} />,
        children: [
          { path: '/admin/users', element: <Users /> },
          { path: '/admin/roles', element: <Roles /> },
          { path: '/admin/audit', element: <AuditLogs /> },
          { path: '/admin/audit-logs', element: <AuditLogs /> },
          { path: '/admin/config', element: <Config /> },
        ],
      },
    ],
  },
];

export default routes;
