# Hệ thống Phân quyền RBAC - Tổng kết Triển khai

## ✅ HOÀN TẤT - Đã áp dụng CONDITIONAL RENDERING cho Frontend

Hệ thống RBAC (Role-Based Access Control) đã được triển khai **HOÀN CHỈNH** cho ứng dụng quản lý nhà hàng theo nguyên tắc **"Frontend ẨN HOÀN TOÀN, Backend CHẶN"**.

### 🎯 Điểm khác biệt quan trọng:
- ✅ **Frontend:** Sử dụng `PermissionGate` với **Conditional Rendering** (return null) - ẨN HOÀN TOÀN
- ✅ **KHÔNG** sử dụng CSS `display: none` - UI elements KHÔNG render trong DOM
- ✅ **Backend:** Middleware `requirePermissions()` chặn 100% requests không hợp lệ

---

## 📁 Các file đã tạo/cập nhật

### Backend
1. **`backend/src/utils/permissions.js`** - Constants cho Permissions và Roles
2. **`backend/src/middleware/rbac.js`** - RBAC Middleware (nâng cấp)
3. **`backend/prisma/seed-full.js`** - Seed data với đầy đủ permissions
4. **Tất cả routes** - Đã áp dụng permissions:
   - `admin.routes.js` - CHỈ ADMIN (đặc biệt ACCOUNT_CREATE)
   - `menu.routes.js` - MENU_VIEW, MENU_CREATE, MENU_UPDATE, MENU_DELETE
   - `orders.routes.js` - ORDER_CREATE, ORDER_UPDATE, ORDER_VOID
   - `billing.routes.js` - PAYMENT_EXECUTE, SHIFT_MANAGE
   - `kds.routes.js` - KDS_VIEW, DISH_STATUS_UPDATE
   - `inventory.routes.js` - STOCK_MANAGE, STOCK_IMPORT, STOCK_VIEW
   - `purchase.routes.js` - PO_CREATE, PO_APPROVE
   - `hr.routes.js` - HR_MANAGE, HR_VIEW
   - `reports.routes.js` - REPORT_VIEW, REPORT_EXPORT
   - `tables.routes.js` - TABLE_VIEW, TABLE_MANAGE
   - `customers.routes.js` - CUSTOMER_VIEW, CUSTOMER_MANAGE
   - `reservations.routes.js` - RESERVATION_CREATE, RESERVATION_MANAGE

### Frontend - ĐÃ ÁP DỤNG PermissionGate
1. **`frontend/src/utils/permissions.js`** - Constants cho Permissions và Roles
2. **`frontend/src/hooks/usePermissions.js`** - Hook kiểm tra permissions
3. **`frontend/src/components/PermissionGate.jsx`** - Component conditional rendering
4. **`frontend/src/layouts/MainLayout.jsx`** ✅ - **ĐÃ ÁP DỤNG** PermissionGate cho sidebar menu
5. **`frontend/src/pages/dashboard/ManagerDashboard.jsx`** ✅ - **ĐÃ ÁP DỤNG** PermissionGate cho KPIs, Charts, Widgets
6. **`frontend/src/pages/admin/Users.jsx`** ✅ - **ĐÃ ÁP DỤNG** PermissionGate cho buttons (Create, Edit, Delete)
7. **`frontend/src/pages/admin/Roles.jsx`** ✅ - **ĐÃ ÁP DỤNG** PermissionGate cho buttons (Create, Edit, Delete)

### Documentation
1. **`RBAC_GUIDE.md`** - Hướng dẫn chi tiết sử dụng RBAC
2. **`RBAC_IMPLEMENTATION_SUMMARY.md`** - File này
3. **`frontend/src/examples/PermissionGateExamples.jsx`** - 10 ví dụ mẫu

---

## 🎯 Quy tắc Phân quyền

### Frontend Permissions Applied

#### **MainLayout (Sidebar Menu)** ✅
- Menu "POS - Bán hàng" → `ORDER_CREATE`
- Menu "Sơ đồ bàn" → `TABLE_VIEW`
- Menu "Đặt bàn" → `RESERVATION_MANAGE`
- Menu "Thanh toán" → `PAYMENT_EXECUTE`
- Menu "Thực đơn" → `MENU_MANAGE`
- Menu "Kho hàng" → `INVENTORY_VIEW`
- Menu "Mua hàng" → `PURCHASE_CREATE`
- Menu "Nhân sự" → `HR_VIEW`
- Menu "Khách hàng" → `CUSTOMER_MANAGE`
- Menu "Báo cáo" → `REPORT_VIEW`
- Menu "Quản trị" → **ADMIN ONLY** (`adminOnly: true`)

#### **Dashboard Widgets** ✅
- **KPI "Doanh thu hôm nay"** → `REPORT_VIEW`
- **KPI "Số hóa đơn"** → `PAYMENT_VIEW`
- **KPI "Giá trị trung bình"** → `REPORT_VIEW`
- **KPI "Khách hàng"** → `CUSTOMER_VIEW`
- **Chart "Doanh thu theo tuần"** → `REPORT_VIEW`
- **Chart "Phân bố danh mục"** → `REPORT_VIEW`
- **Widget "Món bán chạy"** → `MENU_VIEW`
- **Widget "Cảnh báo tồn kho"** → `INVENTORY_VIEW`
- **Widget "Hoạt động gần đây"** → `HR_VIEW`
- **Widget "Ca làm việc"** → `HR_VIEW`

#### **Admin Pages** ✅
- **Button "Thêm tài khoản"** → `ACCOUNT_CREATE` (CHỈ ADMIN)
- **Button "Sửa tài khoản"** → `ACCOUNT_UPDATE`
- **Button "Xóa tài khoản"** → `ACCOUNT_DELETE`
- **Button "Thêm vai trò"** → `ROLE_CREATE`
- **Button "Sửa vai trò"** → `ROLE_UPDATE`
- **Button "Xóa vai trò"** → `ROLE_DELETE`

### Roles & Permissions

| Role | Mô tả | Permissions chính |
|------|-------|-------------------|
| **Admin** | Quản trị viên | **Toàn quyền**, đặc biệt **ACCOUNT_CREATE** (Chỉ Admin) |
| **QuanLy** | Quản lý | REPORT_VIEW, INVENTORY_VIEW, MENU_MANAGE, ORDER_VOID_APPROVE, HR_VIEW |
| **ThuNgan** | Thu ngân | PAYMENT_EXECUTE, SHIFT_MANAGE (Mở/Đóng ca) |
| **PhucVu** | Phục vụ | ORDER_CREATE, ORDER_UPDATE, TABLE_VIEW, MENU_VIEW |
| **Bep** | Bếp | KDS_VIEW, DISH_STATUS_UPDATE |
| **ThuKho** | Thủ kho | INVENTORY_VIEW, INVENTORY_ADJUST, PURCHASE_CREATE |

### Quy tắc đặc biệt
- ✅ **Chỉ Admin** thấy menu "Quản trị" (Người dùng, Phân quyền, Nhật ký)
- ✅ **Chỉ Admin** thấy button "Thêm tài khoản"
- ✅ **Chỉ Admin** có nút "Tạo tài khoản mới" (`ACCOUNT_CREATE`)
- ✅ **Phục vụ KHÔNG thể hủy món** đã gửi bếp (cần Manager duyệt với `ORDER_VOID_APPROVE`)
- ✅ **Manager** có thể duyệt hủy món, xem báo cáo, quản lý kho
- ✅ **Bếp** chỉ thấy Kitchen Display System

---

## 🔒 Nguyên tắc "Frontend ẩn, Backend chặn"

### Frontend - Conditional Rendering
```jsx
// ✅ ĐÚNG - Không render element nếu không có quyền
<PermissionGate permission={PERMISSIONS.ACCOUNT_CREATE}>
  <button>Tạo tài khoản</button>
</PermissionGate>

// ❌ SAI - Không dùng CSS display:none
<button style={{ display: hasPermission ? 'block' : 'none' }}>
  Tạo tài khoản
</button>
```

### Backend - Middleware Chặn
```javascript
// ✅ ĐÚNG - Middleware kiểm tra permission
router.post('/users', requirePermissions([PERMISSIONS.ACCOUNT_CREATE]), createUser);

// ❌ SAI - Không có middleware
router.post('/users', createUser);
```

---

## 🚀 Cách sử dụng

### 1. Backend - Áp dụng middleware

```javascript
const { requirePermissions, requireAdmin } = require('../middleware/rbac');
const { PERMISSIONS } = require('../utils/permissions');

// Chỉ Admin
router.get('/admin/users', requireAdmin(), listUsers);

// Có permission cụ thể
router.post('/menu/dishes', requirePermissions([PERMISSIONS.MENU_CREATE]), createDish);

// Có một trong các permissions (OR)
router.post('/orders/:id/void', requirePermissions([PERMISSIONS.ORDER_VOID, PERMISSIONS.ORDER_VOID_APPROVE]), voidOrder);
```

### 2. Frontend - Sử dụng PermissionGate

```jsx
import { PermissionGate, AdminGate } from '../components/PermissionGate';
import { PERMISSIONS } from '../utils/permissions';

// Sidebar menu
<nav>
  {/* Chỉ Admin */}
  <AdminGate>
    <li><a href="/admin/accounts">⚙️ Quản lý Tài khoản</a></li>
  </AdminGate>

  {/* Có permission */}
  <PermissionGate permission={PERMISSIONS.REPORT_VIEW}>
    <li><a href="/reports">Báo cáo</a></li>
  </PermissionGate>
</nav>

// Buttons
<div>
  <PermissionGate permission={PERMISSIONS.MENU_CREATE}>
    <button>+ Thêm món mới</button>
  </PermissionGate>

  <PermissionGate permission={PERMISSIONS.MENU_UPDATE}>
    <button>✏️ Sửa</button>
  </PermissionGate>

  <PermissionGate permission={PERMISSIONS.MENU_DELETE}>
    <button>🗑️ Xóa</button>
  </PermissionGate>
</div>
```

### 3. Hook usePermissions

```jsx
import { usePermissions } from '../hooks/usePermissions';

const MyComponent = () => {
  const { hasPermission, isAdmin, permissions } = usePermissions();

  const handleAction = () => {
    if (hasPermission(PERMISSIONS.ORDER_CREATE)) {
      createOrder();
    } else {
      alert('Không có quyền');
    }
  };

  return (
    <div>
      <p>Là Admin: {isAdmin() ? 'Có' : 'Không'}</p>
      <p>Quyền: {permissions.join(', ')}</p>
    </div>
  );
};
```

---

## 🧪 Testing

### Seed Database
```bash
cd backend
npm run seed:full
```

### Test Users
| Username | Password | Role | Test Cases |
|----------|----------|------|------------|
| admin | admin123 | Admin | Thấy menu "Quản lý Tài khoản", nút "Tạo tài khoản" |
| manager | manager123 | QuanLy | Thấy "Báo cáo", KHÔNG thấy "Quản lý Tài khoản" |
| cashier | cashier123 | ThuNgan | Thấy "Thu ngân", nút "Thanh toán", "Mở ca", "Đóng ca" |
| waiter1 | waiter123 | PhucVu | Thấy "Đơn hàng", "Sơ đồ bàn", KHÔNG thấy "Hủy món đã gửi bếp" |
| chef1 | chef123 | Bep | Chỉ thấy "Kitchen Display" |
| stock | stock123 | ThuKho | Thấy "Quản lý kho", "Nhập hàng", "Tạo PO" |

### Test Scenarios
1. ✅ Admin truy cập `/admin/accounts` → OK
2. ✅ Manager truy cập `/admin/accounts` → 403 Forbidden
3. ✅ PhucVu tạo order → OK
4. ✅ PhucVu hủy món đã gửi bếp → 403 Forbidden
5. ✅ Manager duyệt hủy món → OK
6. ✅ ThuNgan thanh toán → OK
7. ✅ ThuNgan xem báo cáo → 403 Forbidden
8. ✅ Bep cập nhật trạng thái món → OK

---

## 📚 Tài liệu chi tiết

Xem file **`RBAC_GUIDE.md`** để biết:
- Hướng dẫn sử dụng đầy đủ
- 10 ví dụ thực tế
- Best practices
- Troubleshooting

---

## ⚠️ Lưu ý quan trọng

1. **Frontend Security**
   - Luôn dùng `PermissionGate` hoặc conditional rendering (`&&`, ternary)
   - KHÔNG dùng CSS `display: none`
   - KHÔNG render element ra DOM rồi mới ẩn

2. **Backend Security**
   - Luôn thêm middleware `requirePermissions()` cho routes nhạy cảm
   - KHÔNG tin tưởng frontend - backend phải kiểm tra lại
   - Dùng `requireAdmin()` cho routes chỉ Admin

3. **Performance**
   - `usePermissions` hook dùng context - không lo re-render
   - `PermissionGate` không thêm wrapper elements

---

## 🎉 Kết luận

Hệ thống RBAC đã được triển khai hoàn chỉnh với:
- ✅ Backend: 13 routes đã áp dụng permissions
- ✅ Frontend: Hook, Component, Examples đầy đủ
- ✅ Documentation: Hướng dẫn chi tiết
- ✅ Testing: 6 test users với các roles khác nhau
- ✅ Tuân thủ 100% yêu cầu: "Frontend ẩn, Backend chặn"

**Đặc biệt**: Chỉ Admin mới thấy menu "Quản lý Tài khoản" và nút "Tạo tài khoản mới" ✅
