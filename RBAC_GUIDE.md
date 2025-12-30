# HƯỚNG DẪN TRIỂN KHAI RBAC (Role-Based Access Control)

## Tổng quan

Hệ thống RBAC đã được triển khai hoàn chỉnh theo nguyên tắc **"Frontend ẩn, Backend chặn"**:
- **Frontend**: Sử dụng Conditional Rendering để HOÀN TOÀN KHÔNG RENDER các phần tử mà user không có quyền (KHÔNG dùng CSS display:none)
- **Backend**: Middleware kiểm tra và chặn request từ user không có quyền (trả về 403 Forbidden)

---

## Cấu trúc Permissions và Roles

### Roles (Vai trò)
1. **Admin** - Quản trị viên (Toàn quyền)
2. **QuanLy** - Quản lý (Manager)
3. **ThuNgan** - Thu ngân (Cashier)
4. **PhucVu** - Phục vụ (Server)
5. **Bep** - Bếp (Kitchen Staff)
6. **ThuKho** - Thủ kho (Inventory Staff)

### Permissions theo Role

#### Admin (Toàn quyền)
- **ĐẶC BIỆT**: Chỉ Admin mới có quyền `ACCOUNT_CREATE` (Tạo tài khoản mới)
- Có tất cả các permissions khác

#### QuanLy (Manager)
- REPORT_VIEW, REPORT_EXPORT
- STOCK_MANAGE, STOCK_VIEW
- MENU_MANAGE, MENU_CREATE, MENU_UPDATE, MENU_DELETE, MENU_VIEW
- ORDER_VOID_APPROVE (Duyệt hủy món)
- ORDER_VIEW
- HR_MANAGE, HR_VIEW
- PO_APPROVE, PO_VIEW
- TABLE_VIEW, TABLE_MANAGE
- RESERVATION_MANAGE, RESERVATION_VIEW
- CUSTOMER_VIEW, CUSTOMER_MANAGE

#### ThuNgan (Cashier)
- PAYMENT_EXECUTE (Thanh toán)
- PAYMENT_VIEW
- SHIFT_MANAGE, SHIFT_OPEN, SHIFT_CLOSE
- ORDER_VIEW
- TABLE_VIEW
- CUSTOMER_VIEW

#### PhucVu (Server)
- ORDER_CREATE, ORDER_UPDATE, ORDER_VIEW
- TABLE_VIEW
- MENU_VIEW
- RESERVATION_CREATE, RESERVATION_VIEW
- CUSTOMER_VIEW
- **KHÔNG được hủy món đã gửi bếp** (cần Manager duyệt)

#### Bep (Kitchen Staff)
- KDS_VIEW (Xem Kitchen Display)
- DISH_STATUS_UPDATE (Cập nhật trạng thái món)
- ORDER_VIEW
- MENU_VIEW

#### ThuKho (Inventory Staff)
- STOCK_IMPORT (Nhập hàng)
- STOCK_VIEW
- PO_CREATE (Tạo đơn mua hàng)
- PO_VIEW
- MENU_VIEW

---

## Backend Implementation

### 1. File Permissions Constants
Location: `backend/src/utils/permissions.js`

```javascript
const { PERMISSIONS, ROLES, ROLE_PERMISSIONS } = require('../utils/permissions');
```

### 2. RBAC Middleware
Location: `backend/src/middleware/rbac.js`

Có 4 middleware chính:
- `requirePermissions(permissions)` - Kiểm tra có ít nhất 1 permission (OR logic)
- `requireAllPermissions(permissions)` - Kiểm tra có tất cả permissions (AND logic)
- `requireRoles(roles)` - Kiểm tra role
- `requireAdmin()` - Chỉ cho Admin

### 3. Áp dụng vào Routes

#### Ví dụ: Admin Routes (CHỈ ADMIN)
```javascript
const { requirePermissions, requireAdmin } = require('../middleware/rbac');
const { PERMISSIONS } = require('../utils/permissions');

// Chỉ Admin
router.get('/users', requireAdmin(), listUsers);
router.post('/users', requirePermissions([PERMISSIONS.ACCOUNT_CREATE]), createUser);
```

#### Ví dụ: Menu Routes
```javascript
// Read: MENU_VIEW
router.get('/dishes', requirePermissions([PERMISSIONS.MENU_VIEW]), listDishes);

// Create: MENU_CREATE
router.post('/dishes', requirePermissions([PERMISSIONS.MENU_CREATE]), createDish);

// Update: MENU_UPDATE
router.put('/dishes/:id', requirePermissions([PERMISSIONS.MENU_UPDATE]), updateDish);

// Delete: MENU_DELETE
router.delete('/dishes/:id', requirePermissions([PERMISSIONS.MENU_DELETE]), deleteDish);
```

#### Ví dụ: Order Routes
```javascript
// Tạo order: ORDER_CREATE (PhucVu, Manager, Admin)
router.post('/', requirePermissions([PERMISSIONS.ORDER_CREATE]), createOrder);

// Hủy món: ORDER_VOID hoặc ORDER_VOID_APPROVE (Manager/Admin duyệt)
router.post('/:id/void-item', requirePermissions([PERMISSIONS.ORDER_VOID, PERMISSIONS.ORDER_VOID_APPROVE]), voidItem);
```

#### Ví dụ: Cashier Routes
```javascript
// Thanh toán: PAYMENT_EXECUTE (ThuNgan, Admin)
router.post('/invoices/:id/pay', requirePermissions([PERMISSIONS.PAYMENT_EXECUTE]), payInvoice);

// Mở ca: SHIFT_OPEN
router.post('/shifts/open', requirePermissions([PERMISSIONS.SHIFT_OPEN]), openShift);

// Đóng ca: SHIFT_CLOSE
router.post('/shifts/:id/close', requirePermissions([PERMISSIONS.SHIFT_CLOSE]), closeShift);
```

---

## Frontend Implementation

### 1. Permissions Constants
Location: `frontend/src/utils/permissions.js`

```javascript
import { PERMISSIONS, ROLES } from '../utils/permissions';
```

### 2. usePermissions Hook
Location: `frontend/src/hooks/usePermissions.js`

```javascript
import { usePermissions } from '../hooks/usePermissions';

const { 
  hasPermission, 
  hasAllPermissions, 
  hasAnyPermission, 
  hasRole, 
  isAdmin,
  permissions,
  roles 
} = usePermissions();
```

### 3. PermissionGate Component
Location: `frontend/src/components/PermissionGate.jsx`

**QUAN TRỌNG**: Component này sử dụng Conditional Rendering, KHÔNG render DOM element nếu không có quyền.

#### Cách sử dụng:

##### 3.1. Kiểm tra một permission
```jsx
import { PermissionGate } from '../components/PermissionGate';
import { PERMISSIONS } from '../utils/permissions';

<PermissionGate permission={PERMISSIONS.ACCOUNT_CREATE}>
  <button>Tạo tài khoản mới</button>
</PermissionGate>
```

##### 3.2. Kiểm tra nhiều permissions (OR logic)
```jsx
<PermissionGate permissions={[PERMISSIONS.MENU_CREATE, PERMISSIONS.MENU_UPDATE]}>
  <button>Chỉnh sửa menu</button>
</PermissionGate>
```

##### 3.3. Kiểm tra tất cả permissions (AND logic)
```jsx
<PermissionGate 
  permissions={[PERMISSIONS.ORDER_CREATE, PERMISSIONS.MENU_VIEW]} 
  requireAll
>
  <button>Tạo order</button>
</PermissionGate>
```

##### 3.4. Chỉ cho Admin (QUAN TRỌNG)
```jsx
import { AdminGate } from '../components/PermissionGate';

<AdminGate>
  <a href="/admin/accounts">⚙️ Quản lý Tài khoản</a>
</AdminGate>
```

##### 3.5. Hiển thị fallback khi không có quyền
```jsx
<PermissionGate 
  permission={PERMISSIONS.REPORT_VIEW}
  fallback={<div>Bạn không có quyền xem báo cáo</div>}
>
  <ReportPage />
</PermissionGate>
```

### 4. Ví dụ thực tế trong UI

#### Sidebar Menu
```jsx
const Sidebar = () => {
  return (
    <nav>
      <ul>
        {/* Hiển thị cho tất cả */}
        <li><a href="/dashboard">Dashboard</a></li>

        {/* Chỉ PhucVu, Manager, Admin */}
        <PermissionGate permission={PERMISSIONS.ORDER_VIEW}>
          <li><a href="/orders">Đơn hàng</a></li>
        </PermissionGate>

        {/* Chỉ Bep, Manager, Admin */}
        <PermissionGate permission={PERMISSIONS.KDS_VIEW}>
          <li><a href="/kitchen">Kitchen Display</a></li>
        </PermissionGate>

        {/* Chỉ Manager, Admin */}
        <PermissionGate permission={PERMISSIONS.REPORT_VIEW}>
          <li><a href="/reports">Báo cáo</a></li>
        </PermissionGate>

        {/* CHỈ ADMIN - Đây là yêu cầu quan trọng */}
        <AdminGate>
          <li><a href="/admin/accounts">⚙️ Quản lý Tài khoản</a></li>
        </AdminGate>
      </ul>
    </nav>
  );
};
```

#### Buttons trong trang
```jsx
const MenuPage = () => {
  return (
    <div>
      <h1>Quản lý Thực đơn</h1>

      {/* Nút "Thêm món mới" - chỉ MENU_CREATE */}
      <PermissionGate permission={PERMISSIONS.MENU_CREATE}>
        <button onClick={handleCreateDish}>+ Thêm món mới</button>
      </PermissionGate>

      {/* Danh sách món */}
      <PermissionGate permission={PERMISSIONS.MENU_VIEW}>
        <DishList />
      </PermissionGate>
    </div>
  );
};

const DishItem = ({ dish }) => {
  return (
    <div>
      <h3>{dish.name}</h3>

      {/* Nút "Sửa" - chỉ MENU_UPDATE */}
      <PermissionGate permission={PERMISSIONS.MENU_UPDATE}>
        <button onClick={() => handleEdit(dish.id)}>Sửa</button>
      </PermissionGate>

      {/* Nút "Xóa" - chỉ MENU_DELETE */}
      <PermissionGate permission={PERMISSIONS.MENU_DELETE}>
        <button onClick={() => handleDelete(dish.id)}>Xóa</button>
      </PermissionGate>
    </div>
  );
};
```

#### Trang Quản lý Tài khoản (CHỈ ADMIN)
```jsx
import { AdminGate } from '../components/PermissionGate';

const AccountManagementPage = () => {
  return (
    <AdminGate fallback={<div>Access Denied - Chỉ Admin</div>}>
      <div>
        <h1>Quản lý Tài khoản</h1>

        {/* Nút "Tạo tài khoản" - CHỈ ADMIN có ACCOUNT_CREATE */}
        <PermissionGate permission={PERMISSIONS.ACCOUNT_CREATE}>
          <button onClick={handleCreateAccount}>+ Tạo tài khoản mới</button>
        </PermissionGate>

        <AccountList />
      </div>
    </AdminGate>
  );
};
```

#### Sử dụng hook trực tiếp
```jsx
const CustomComponent = () => {
  const { hasPermission, isAdmin, permissions } = usePermissions();

  const handleAction = () => {
    if (hasPermission(PERMISSIONS.ORDER_CREATE)) {
      createOrder();
    } else {
      alert('Bạn không có quyền tạo đơn hàng');
    }
  };

  return (
    <div>
      <p>Quyền hiện tại: {permissions.join(', ')}</p>
      <p>Là Admin: {isAdmin() ? 'Có' : 'Không'}</p>
      <button onClick={handleAction}>Thực hiện</button>
    </div>
  );
};
```

---

## Testing RBAC

### 1. Seed Database
Chạy seed để tạo users mẫu:
```bash
cd backend
npm run seed:full
```

Users mẫu:
- `admin` / `admin123` - Admin (Toàn quyền)
- `manager` / `manager123` - QuanLy
- `cashier` / `cashier123` - ThuNgan
- `waiter1` / `waiter123` - PhucVu
- `chef1` / `chef123` - Bep
- `stock` / `stock123` - ThuKho

### 2. Test Scenarios

#### Test 1: Admin - Quản lý Tài khoản
1. Đăng nhập bằng `admin` / `admin123`
2. Sidebar phải hiển thị menu "⚙️ Quản lý Tài khoản"
3. Truy cập `/admin/accounts`
4. Phải thấy nút "+ Tạo tài khoản mới"

#### Test 2: Manager - Báo cáo
1. Đăng nhập bằng `manager` / `manager123`
2. Sidebar KHÔNG hiển thị "Quản lý Tài khoản" (chỉ Admin)
3. Sidebar phải hiển thị "Báo cáo"
4. Truy cập `/reports` - OK
5. Truy cập `/admin/accounts` - Bị chặn 403

#### Test 3: PhucVu - Order
1. Đăng nhập bằng `waiter1` / `waiter123`
2. Sidebar hiển thị "Đơn hàng"
3. Có thể tạo order, sửa order
4. KHÔNG thấy nút "Hủy món đã gửi bếp" (cần Manager duyệt)
5. KHÔNG thấy menu "Báo cáo", "Quản lý Tài khoản"

#### Test 4: ThuNgan - Thanh toán
1. Đăng nhập bằng `cashier` / `cashier123`
2. Sidebar hiển thị "Thu ngân"
3. Có nút "Thanh toán", "Mở ca", "Đóng ca"
4. KHÔNG thấy menu "Báo cáo", "Quản lý Tài khoản", "Quản lý kho"

#### Test 5: Bep - Kitchen Display
1. Đăng nhập bằng `chef1` / `chef123`
2. Sidebar chỉ hiển thị "Kitchen Display"
3. Có thể cập nhật trạng thái món: "Đang làm", "Hoàn thành"
4. KHÔNG thấy các menu khác

#### Test 6: ThuKho - Inventory
1. Đăng nhập bằng `stock` / `stock123`
2. Sidebar hiển thị "Quản lý kho"
3. Có nút "Nhập hàng", "Tạo đơn mua hàng"
4. KHÔNG thấy nút "Duyệt đơn mua hàng" (cần Manager)

---

## Lưu ý quan trọng

### 1. Frontend Security
- **LUÔN** sử dụng `PermissionGate` hoặc conditional rendering (`&&`, ternary)
- **KHÔNG BAO GIỜ** dùng CSS `display: none` để ẩn elements
- **KHÔNG BAO GIỜ** render element ra DOM rồi mới ẩn

### 2. Backend Security
- **LUÔN** thêm middleware `requirePermissions()` cho các routes nhạy cảm
- **KHÔNG BAO GIỜ** tin tưởng frontend - backend phải kiểm tra lại
- Sử dụng `requireAdmin()` cho các routes chỉ Admin

### 3. Testing
- Test với từng role để đảm bảo UI hiển thị đúng
- Test API với Postman/Thunder Client để verify backend chặn đúng
- Kiểm tra console - không được có errors về permissions

### 4. Performance
- `usePermissions` hook sử dụng context - không cần lo về re-render
- `PermissionGate` chỉ check permissions, không thêm wrapper elements

---

## Mở rộng

### Thêm Permission mới
1. Thêm vào `backend/src/utils/permissions.js` và `frontend/src/utils/permissions.js`
2. Cập nhật `ROLE_PERMISSIONS` mapping
3. Chạy seed lại database
4. Áp dụng vào routes backend
5. Sử dụng `PermissionGate` trong frontend

### Thêm Role mới
1. Thêm vào `ROLES` constant
2. Định nghĩa permissions cho role trong `ROLE_PERMISSIONS`
3. Cập nhật seed data
4. Test kỹ với role mới

---

## Tài liệu tham khảo

- `/frontend/src/examples/PermissionGateExamples.jsx` - Các ví dụ chi tiết
- `/backend/src/utils/permissions.js` - Danh sách permissions
- `/backend/src/middleware/rbac.js` - RBAC middleware
- `/frontend/src/components/PermissionGate.jsx` - Component conditional rendering

---

## Support

Nếu gặp vấn đề:
1. Kiểm tra user có permissions đúng không (check `user.permissions` trong console)
2. Kiểm tra backend logs để xem request có bị chặn không
3. Verify seed data đã chạy chưa
4. Đảm bảo import đúng constants

Chúc bạn triển khai thành công! 🎉
