/**
 * VÍ DỤ SỬ DỤNG PERMISSION GATE TRONG CÁC COMPONENTS
 * File này chứa các ví dụ cụ thể về cách áp dụng RBAC trong React components
 */

import React from 'react';
import { PermissionGate, AdminGate } from '../components/PermissionGate';
import { PERMISSIONS, ROLES } from '../utils/permissions';
import { usePermissions } from '../hooks/usePermissions';

// ========== VÍ DỤ 1: Menu Sidebar - Ẩn menu items dựa trên permissions ==========
const SidebarExample = () => {
  return (
    <nav>
      <ul>
        {/* Menu hiển thị cho tất cả user đã đăng nhập */}
        <li>
          <a href="/dashboard">Dashboard</a>
        </li>

        {/* Menu chỉ hiển thị cho user có quyền xem đơn hàng */}
        <PermissionGate permission={PERMISSIONS.ORDER_VIEW}>
          <li>
            <a href="/orders">Đơn hàng</a>
          </li>
        </PermissionGate>

        {/* Menu chỉ hiển thị cho user có quyền xem bàn */}
        <PermissionGate permission={PERMISSIONS.TABLE_VIEW}>
          <li>
            <a href="/tables">Sơ đồ bàn</a>
          </li>
        </PermissionGate>

        {/* Menu chỉ hiển thị cho Kitchen Staff */}
        <PermissionGate permission={PERMISSIONS.KDS_VIEW}>
          <li>
            <a href="/kitchen">Kitchen Display</a>
          </li>
        </PermissionGate>

        {/* Menu chỉ hiển thị cho user có quyền xem thực đơn */}
        <PermissionGate permission={PERMISSIONS.MENU_VIEW}>
          <li>
            <a href="/menu">Thực đơn</a>
          </li>
        </PermissionGate>

        {/* Menu chỉ hiển thị cho user có quyền xem kho */}
        <PermissionGate permission={PERMISSIONS.STOCK_VIEW}>
          <li>
            <a href="/inventory">Quản lý kho</a>
          </li>
        </PermissionGate>

        {/* Menu chỉ hiển thị cho user có quyền xem báo cáo */}
        <PermissionGate permission={PERMISSIONS.REPORT_VIEW}>
          <li>
            <a href="/reports">Báo cáo</a>
          </li>
        </PermissionGate>

        {/* Menu chỉ hiển thị cho user có quyền HR */}
        <PermissionGate permission={PERMISSIONS.HR_VIEW}>
          <li>
            <a href="/hr">Nhân sự</a>
          </li>
        </PermissionGate>

        {/* Menu CHỈ HIỂN THỊ CHO ADMIN - Đây là yêu cầu quan trọng */}
        <AdminGate>
          <li>
            <a href="/admin/accounts">⚙️ Quản lý Tài khoản</a>
          </li>
        </AdminGate>
      </ul>
    </nav>
  );
};

// ========== VÍ DỤ 2: Buttons trong trang - Ẩn buttons dựa trên permissions ==========
const MenuManagementPageExample = () => {
  return (
    <div>
      <h1>Quản lý Thực đơn</h1>

      {/* Nút "Thêm món mới" chỉ hiển thị cho user có quyền MENU_CREATE */}
      <PermissionGate permission={PERMISSIONS.MENU_CREATE}>
        <button onClick={() => console.log('Create new dish')}>
          + Thêm món mới
        </button>
      </PermissionGate>

      {/* Danh sách món ăn - hiển thị cho user có MENU_VIEW */}
      <PermissionGate permission={PERMISSIONS.MENU_VIEW}>
        <div className="dish-list">
          <DishItem dishId="1" />
        </div>
      </PermissionGate>
    </div>
  );
};

const DishItem = ({ dishId }) => {
  return (
    <div className="dish-item">
      <h3>Tên món</h3>
      <p>Giá: 100,000 VNĐ</p>

      {/* Nút "Sửa" chỉ hiển thị cho user có quyền MENU_UPDATE */}
      <PermissionGate permission={PERMISSIONS.MENU_UPDATE}>
        <button onClick={() => console.log('Edit dish', dishId)}>
          Sửa
        </button>
      </PermissionGate>

      {/* Nút "Xóa" chỉ hiển thị cho user có quyền MENU_DELETE */}
      <PermissionGate permission={PERMISSIONS.MENU_DELETE}>
        <button onClick={() => console.log('Delete dish', dishId)}>
          Xóa
        </button>
      </PermissionGate>
    </div>
  );
};

// ========== VÍ DỤ 3: Trang Quản lý Tài khoản - CHỈ ADMIN ==========
const AccountManagementPageExample = () => {
  const { isAdmin } = usePermissions();

  // Kiểm tra ở component level - redirect nếu không phải Admin
  if (!isAdmin()) {
    return <div>Access Denied - Chỉ Admin mới có quyền truy cập</div>;
  }

  return (
    <AdminGate fallback={<div>Access Denied</div>}>
      <div>
        <h1>Quản lý Tài khoản</h1>

        {/* Nút "Tạo tài khoản mới" - CHỈ ADMIN */}
        <PermissionGate permission={PERMISSIONS.ACCOUNT_CREATE}>
          <button onClick={() => console.log('Create new account')}>
            + Tạo tài khoản mới
          </button>
        </PermissionGate>

        {/* Danh sách tài khoản */}
        <div className="account-list">
          <AccountItem accountId="1" />
        </div>
      </div>
    </AdminGate>
  );
};

const AccountItem = ({ accountId }) => {
  return (
    <div className="account-item">
      <h3>Username</h3>
      <p>Vai trò: Admin</p>

      {/* Nút "Sửa" - ACCOUNT_MANAGE */}
      <PermissionGate permission={PERMISSIONS.ACCOUNT_MANAGE}>
        <button onClick={() => console.log('Edit account', accountId)}>
          Sửa
        </button>
      </PermissionGate>

      {/* Nút "Xóa" - ACCOUNT_DELETE */}
      <PermissionGate permission={PERMISSIONS.ACCOUNT_DELETE}>
        <button onClick={() => console.log('Delete account', accountId)}>
          Xóa
        </button>
      </PermissionGate>
    </div>
  );
};

// ========== VÍ DỤ 4: Order Page - Phục vụ tạo order, Manager void order ==========
const OrderPageExample = () => {
  return (
    <div>
      <h1>Quản lý Đơn hàng</h1>

      {/* Nút "Tạo đơn hàng" - PhucVu, Manager, Admin */}
      <PermissionGate permission={PERMISSIONS.ORDER_CREATE}>
        <button onClick={() => console.log('Create order')}>
          + Tạo đơn hàng mới
        </button>
      </PermissionGate>

      {/* Danh sách orders */}
      <div className="order-list">
        <OrderItem orderId="1" />
      </div>
    </div>
  );
};

const OrderItem = ({ orderId }) => {
  return (
    <div className="order-item">
      <h3>Bàn A01</h3>
      <p>Tổng: 500,000 VNĐ</p>

      {/* Nút "Sửa" - ORDER_UPDATE */}
      <PermissionGate permission={PERMISSIONS.ORDER_UPDATE}>
        <button onClick={() => console.log('Edit order', orderId)}>
          Sửa
        </button>
      </PermissionGate>

      {/* Nút "Hủy món" - ORDER_VOID hoặc ORDER_VOID_APPROVE (Manager/Admin) */}
      <PermissionGate permissions={[PERMISSIONS.ORDER_VOID, PERMISSIONS.ORDER_VOID_APPROVE]}>
        <button onClick={() => console.log('Void item', orderId)}>
          Hủy món
        </button>
      </PermissionGate>
    </div>
  );
};

// ========== VÍ DỤ 5: Cashier Page - Thu ngân thanh toán ==========
const CashierPageExample = () => {
  return (
    <div>
      <h1>Thu ngân</h1>

      {/* Nút "Thanh toán" - PAYMENT_EXECUTE (ThuNgan, Admin) */}
      <PermissionGate permission={PERMISSIONS.PAYMENT_EXECUTE}>
        <button onClick={() => console.log('Process payment')}>
          Thanh toán
        </button>
      </PermissionGate>

      {/* Nút "Mở ca" - SHIFT_OPEN */}
      <PermissionGate permission={PERMISSIONS.SHIFT_OPEN}>
        <button onClick={() => console.log('Open shift')}>
          Mở ca
        </button>
      </PermissionGate>

      {/* Nút "Đóng ca" - SHIFT_CLOSE */}
      <PermissionGate permission={PERMISSIONS.SHIFT_CLOSE}>
        <button onClick={() => console.log('Close shift')}>
          Đóng ca
        </button>
      </PermissionGate>
    </div>
  );
};

// ========== VÍ DỤ 6: Kitchen Display System - Bếp ==========
const KitchenPageExample = () => {
  return (
    <div>
      <h1>Kitchen Display</h1>

      {/* Toàn bộ KDS chỉ hiển thị cho Bếp */}
      <PermissionGate permission={PERMISSIONS.KDS_VIEW}>
        <div className="kds-container">
          <KDSTicket ticketId="1" />
        </div>
      </PermissionGate>
    </div>
  );
};

const KDSTicket = ({ ticketId }) => {
  return (
    <div className="kds-ticket">
      <h3>Bàn A01</h3>
      <p>Món: Phở bò</p>

      {/* Nút "Đang làm", "Hoàn thành" - DISH_STATUS_UPDATE */}
      <PermissionGate permission={PERMISSIONS.DISH_STATUS_UPDATE}>
        <button onClick={() => console.log('Start cooking', ticketId)}>
          Đang làm
        </button>
        <button onClick={() => console.log('Complete', ticketId)}>
          Hoàn thành
        </button>
      </PermissionGate>
    </div>
  );
};

// ========== VÍ DỤ 7: Inventory Page - Thủ kho ==========
const InventoryPageExample = () => {
  return (
    <div>
      <h1>Quản lý Kho</h1>

      {/* Nút "Nhập hàng" - STOCK_IMPORT (ThuKho, Manager, Admin) */}
      <PermissionGate permission={PERMISSIONS.STOCK_IMPORT}>
        <button onClick={() => console.log('Import stock')}>
          + Nhập hàng
        </button>
      </PermissionGate>

      {/* Nút "Tạo đơn mua hàng" - PO_CREATE (ThuKho, Manager, Admin) */}
      <PermissionGate permission={PERMISSIONS.PO_CREATE}>
        <button onClick={() => console.log('Create PO')}>
          + Tạo đơn mua hàng
        </button>
      </PermissionGate>

      {/* Danh sách nguyên vật liệu */}
      <PermissionGate permission={PERMISSIONS.STOCK_VIEW}>
        <div className="material-list">
          <p>Danh sách nguyên vật liệu...</p>
        </div>
      </PermissionGate>
    </div>
  );
};

// ========== VÍ DỤ 8: Reports Page - Manager/Admin ==========
const ReportsPageExample = () => {
  return (
    <div>
      <h1>Báo cáo</h1>

      {/* Toàn bộ reports chỉ hiển thị cho Manager/Admin */}
      <PermissionGate
        permission={PERMISSIONS.REPORT_VIEW}
        fallback={<div>Bạn không có quyền xem báo cáo</div>}
      >
        <div className="reports-container">
          <h2>Báo cáo doanh thu</h2>
          <p>Doanh thu hôm nay: 10,000,000 VNĐ</p>

          {/* Nút "Xuất báo cáo" - REPORT_VIEW */}
          <PermissionGate permission={PERMISSIONS.REPORT_VIEW}>
            <Button variant="outlined" startIcon={<Download />}>
              Xuất báo cáo (Chỉ hiện nếu có quyền REPORT_VIEW)
            </Button>
          </PermissionGate>
        </div>
      </PermissionGate>
    </div>
  );
};

// ========== VÍ DỤ 9: Sử dụng hook usePermissions trực tiếp ==========
const CustomComponentExample = () => {
  const { hasPermission, hasAllPermissions, isAdmin, permissions } = usePermissions();

  // Kiểm tra permission trong logic
  const handleAction = () => {
    if (hasPermission(PERMISSIONS.ORDER_CREATE)) {
      console.log('User có quyền tạo order');
    } else {
      console.log('User không có quyền tạo order');
    }
  };

  // Kiểm tra nhiều permissions
  const canManageMenu = hasAllPermissions([
    PERMISSIONS.MENU_CREATE,
    PERMISSIONS.MENU_UPDATE,
    PERMISSIONS.MENU_DELETE,
  ]);

  return (
    <div>
      <h3>Custom Component</h3>
      <p>Quyền hiện tại: {permissions.join(', ')}</p>
      <p>Là Admin: {isAdmin() ? 'Có' : 'Không'}</p>
      <p>Có thể quản lý menu: {canManageMenu ? 'Có' : 'Không'}</p>
      <button onClick={handleAction}>Kiểm tra quyền</button>
    </div>
  );
};

// ========== VÍ DỤ 10: Conditional rendering trong JSX phức tạp ==========
const ComplexUIExample = () => {
  const { hasPermission, isAdmin } = usePermissions();

  return (
    <div>
      <h1>Dashboard</h1>

      {/* Cách 1: Sử dụng PermissionGate */}
      <PermissionGate permission={PERMISSIONS.REPORT_VIEW}>
        <ReportWidget />
      </PermissionGate>

      {/* Cách 2: Sử dụng if/else trong JSX */}
      {hasPermission(PERMISSIONS.ORDER_VIEW) && (
        <OrderSummaryWidget />
      )}

      {/* Cách 3: Sử dụng ternary operator */}
      {isAdmin() ? (
        <AdminDashboard />
      ) : (
        <UserDashboard />
      )}

      {/* Cách 4: Sử dụng nhiều điều kiện */}
      {hasPermission(PERMISSIONS.STOCK_VIEW) && hasPermission(PERMISSIONS.STOCK_MANAGE) && (
        <InventoryManagementWidget />
      )}
    </div>
  );
};

const ReportWidget = () => <div>Report Widget</div>;
const OrderSummaryWidget = () => <div>Order Summary Widget</div>;
const AdminDashboard = () => <div>Admin Dashboard</div>;
const UserDashboard = () => <div>User Dashboard</div>;
const InventoryManagementWidget = () => <div>Inventory Widget</div>;

// Export tất cả examples
export {
  SidebarExample,
  MenuManagementPageExample,
  AccountManagementPageExample,
  OrderPageExample,
  CashierPageExample,
  KitchenPageExample,
  InventoryPageExample,
  ReportsPageExample,
  CustomComponentExample,
  ComplexUIExample,
};
