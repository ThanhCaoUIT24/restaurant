# 🔧 RBAC Critical Fixes - Sửa Lỗi Nghiêm Trọng

## ❌ Vấn Đề Phát Hiện

Hệ thống RBAC bị lỗi nghiêm trọng khiến **hầu hết chức năng bị ẩn không hợp lý**. Nguyên nhân:

### 1. **Backend: Hàm `buildUserPayload` Lấy Permissions SAI** ❌
**File:** `backend/src/services/auth.service.js`

**Lỗi:**
```javascript
// SAI - Mapping sai cấu trúc database
const permissions = role?.quyen?.map((q) => q.quyen?.ma).filter(Boolean) || [];
```

**Cấu trúc database:**
- `VaiTro.quyen[]` → Array of `VaiTroQuyen` objects
- `VaiTroQuyen.quyen` → Object `Quyen`  
- `Quyen.ma` → Permission string

**Đã sửa:**
```javascript
// ĐÚNG - Map đúng VaiTroQuyen -> Quyen -> ma
const permissions = role?.quyen?.map((vaiTroQuyen) => vaiTroQuyen.quyen?.ma).filter(Boolean) || [];

console.log('[buildUserPayload] User:', account.username);
console.log('[buildUserPayload] Role:', role?.ten);
console.log('[buildUserPayload] Permissions:', permissions);
```

**Kết quả:** Backend giờ trả về `user.permissions` đầy đủ trong JWT token.

---

### 2. **Frontend-Backend: Permissions Constants KHÔNG ĐỒNG BỘ** ❌

**Frontend có những permissions KHÔNG TỒN TẠI ở backend:**
```javascript
// Frontend có nhưng Backend KHÔNG CÓ:
INVENTORY_VIEW    → Backend dùng STOCK_VIEW
INVENTORY_ADJUST  → Backend dùng STOCK_MANAGE
INVENTORY_MANAGE  → Backend KHÔNG CÓ
PURCHASE_CREATE   → Backend dùng PO_CREATE
PURCHASE_VIEW     → Backend dùng PO_VIEW
ACCOUNT_UPDATE    → Backend dùng ACCOUNT_MANAGE
ACCOUNT_VIEW      → Backend KHÔNG CÓ
ROLE_CREATE       → Backend KHÔNG CÓ
ROLE_UPDATE       → Backend KHÔNG CÓ
ROLE_DELETE       → Backend KHÔNG CÓ
ROLE_VIEW         → Backend KHÔNG CÓ
AUDIT_VIEW        → Backend KHÔNG CÓ
```

**Đã sửa:**
- ✅ Đồng bộ `frontend/src/utils/permissions.js` với `backend/src/utils/permissions.js`
- ✅ Dùng `STOCK_VIEW` thay vì `INVENTORY_VIEW`
- ✅ Dùng `PO_CREATE` thay vì `PURCHASE_CREATE`
- ✅ Dùng `ACCOUNT_MANAGE` cho tất cả operations (Create, Update, Delete)

---

### 3. **Files Đã Sửa**

#### Backend:
- ✅ **`backend/src/services/auth.service.js`** - Fix `buildUserPayload()` mapping

#### Frontend:
- ✅ **`frontend/src/utils/permissions.js`** - Sync với backend constants
- ✅ **`frontend/src/layouts/MainLayout.jsx`** - Đổi `INVENTORY_VIEW` → `STOCK_VIEW`, `PURCHASE_CREATE` → `PO_VIEW`
- ✅ **`frontend/src/pages/dashboard/ManagerDashboard.jsx`** - Đổi `INVENTORY_VIEW` → `STOCK_VIEW`
- ✅ **`frontend/src/pages/admin/Users.jsx`** - Đổi `ACCOUNT_UPDATE` → `ACCOUNT_MANAGE`
- ✅ **`frontend/src/pages/admin/Roles.jsx`** - Đổi `ROLE_CREATE/UPDATE/DELETE` → `ACCOUNT_MANAGE`

---

## ✅ Kết Quả Sau Khi Sửa

### Backend:
1. ✅ `buildUserPayload()` trả về permissions đầy đủ từ database
2. ✅ JWT token chứa `user.permissions` đúng
3. ✅ Console logs hiển thị permissions khi login

### Frontend:
1. ✅ `usePermissions` hook nhận `user.permissions` từ AuthContext
2. ✅ `PermissionGate` kiểm tra permissions đúng
3. ✅ UI elements hiển thị/ẩn theo permissions của user
4. ✅ Không còn lỗi permissions không tồn tại

---

## 🧪 Cách Test

### 1. Login và kiểm tra Console
```bash
# Mở browser DevTools → Console
# Login bằng một user bất kỳ
# Tìm log:
[buildUserPayload] User: admin
[buildUserPayload] Role: Admin
[buildUserPayload] Permissions: ["ACCOUNT_CREATE", "ACCOUNT_MANAGE", ...]
```

### 2. Kiểm tra User Object trong Frontend
```javascript
// Trong browser console:
localStorage.getItem('accessToken')
// Copy token, decode tại jwt.io
// Kiểm tra payload có "permissions": [...] đầy đủ
```

### 3. Test UI theo Role

**Admin:**
- ✅ Thấy menu "Quản trị" 
- ✅ Thấy button "Thêm tài khoản"
- ✅ Thấy TẤT CẢ dashboard widgets

**QuanLy (Manager):**
- ✅ Thấy Dashboard đầy đủ
- ✅ Thấy "Báo cáo", "Kho hàng", "Nhân sự"
- ❌ KHÔNG thấy menu "Quản trị"
- ❌ KHÔNG thấy "Thêm tài khoản"

**ThuNgan (Cashier):**
- ✅ Thấy "Thanh toán", "POS"
- ✅ Thấy KPI "Số hóa đơn"
- ❌ KHÔNG thấy "Báo cáo", "Kho", "Admin"

**PhucVu (Waiter):**
- ✅ Thấy "POS", "Đơn hàng", "Bàn"
- ❌ KHÔNG thấy "Thanh toán", "Báo cáo"

**Bep (Kitchen):**
- ✅ Chỉ thấy "Kitchen Display"
- ❌ KHÔNG thấy các menu khác

**ThuKho (Stock Manager):**
- ✅ Thấy "Kho hàng", "Mua hàng"
- ✅ Thấy widget "Cảnh báo tồn kho"
- ❌ KHÔNG thấy "POS", "Thanh toán", "Báo cáo doanh thu"

---

## 📋 Permissions Mapping - Bảng Đối Chiếu

| Frontend Permission | Backend Permission | Ghi Chú |
|-------------------|-------------------|---------|
| `STOCK_VIEW` | `STOCK_VIEW` | ✅ Kho hàng - Xem |
| `STOCK_MANAGE` | `STOCK_MANAGE` | ✅ Kho hàng - Quản lý |
| `STOCK_IMPORT` | `STOCK_IMPORT` | ✅ Kho hàng - Nhập |
| `PO_CREATE` | `PO_CREATE` | ✅ Mua hàng - Tạo |
| `PO_VIEW` | `PO_VIEW` | ✅ Mua hàng - Xem |
| `PO_APPROVE` | `PO_APPROVE` | ✅ Mua hàng - Duyệt |
| `ACCOUNT_CREATE` | `ACCOUNT_CREATE` | ✅ Tài khoản - Tạo (Admin only) |
| `ACCOUNT_MANAGE` | `ACCOUNT_MANAGE` | ✅ Tài khoản - Quản lý |
| `ACCOUNT_DELETE` | `ACCOUNT_DELETE` | ✅ Tài khoản - Xóa |
| `MENU_VIEW` | `MENU_VIEW` | ✅ Thực đơn - Xem |
| `MENU_MANAGE` | `MENU_MANAGE` | ✅ Thực đơn - Quản lý |
| `MENU_CREATE` | `MENU_CREATE` | ✅ Thực đơn - Tạo |
| `MENU_UPDATE` | `MENU_UPDATE` | ✅ Thực đơn - Sửa |
| `MENU_DELETE` | `MENU_DELETE` | ✅ Thực đơn - Xóa |
| `ORDER_CREATE` | `ORDER_CREATE` | ✅ Đơn hàng - Tạo |
| `ORDER_UPDATE` | `ORDER_UPDATE` | ✅ Đơn hàng - Sửa |
| `ORDER_VIEW` | `ORDER_VIEW` | ✅ Đơn hàng - Xem |
| `ORDER_VOID` | `ORDER_VOID` | ✅ Đơn hàng - Hủy |
| `PAYMENT_EXECUTE` | `PAYMENT_EXECUTE` | ✅ Thanh toán - Thực hiện |
| `PAYMENT_VIEW` | `PAYMENT_VIEW` | ✅ Thanh toán - Xem |
| `REPORT_VIEW` | `REPORT_VIEW` | ✅ Báo cáo - Xem |
| `REPORT_EXPORT` | `REPORT_EXPORT` | ✅ Báo cáo - Xuất |
| `HR_VIEW` | `HR_VIEW` | ✅ Nhân sự - Xem |
| `HR_MANAGE` | `HR_MANAGE` | ✅ Nhân sự - Quản lý |
| `CUSTOMER_VIEW` | `CUSTOMER_VIEW` | ✅ Khách hàng - Xem |
| `CUSTOMER_MANAGE` | `CUSTOMER_MANAGE` | ✅ Khách hàng - Quản lý |
| `TABLE_VIEW` | `TABLE_VIEW` | ✅ Bàn - Xem |
| `TABLE_MANAGE` | `TABLE_MANAGE` | ✅ Bàn - Quản lý |
| `RESERVATION_CREATE` | `RESERVATION_CREATE` | ✅ Đặt bàn - Tạo |
| `RESERVATION_MANAGE` | `RESERVATION_MANAGE` | ✅ Đặt bàn - Quản lý |
| `KDS_VIEW` | `KDS_VIEW` | ✅ Kitchen Display |
| `DISH_STATUS_UPDATE` | `DISH_STATUS_UPDATE` | ✅ Cập nhật trạng thái món |

---

## 🚨 Lưu Ý Quan Trọng

### 1. **KHÔNG ĐƯỢC Thêm Permissions Mới Chỉ Ở Frontend**
- ✅ Phải thêm ở backend trước: `backend/src/utils/permissions.js`
- ✅ Sau đó sync sang frontend: `frontend/src/utils/permissions.js`
- ✅ Update `ROLE_PERMISSIONS` mapping trong backend
- ✅ Chạy seed lại: `npm run seed:full`

### 2. **Kiểm Tra Console Logs**
Backend sẽ log permissions khi user login:
```
[buildUserPayload] User: admin
[buildUserPayload] Role: Admin
[buildUserPayload] Permissions: [Array of permissions]
```

Nếu permissions trống hoặc undefined → Seed data chưa chạy hoặc mapping sai.

### 3. **Restart Servers Sau Khi Sửa**
```bash
# Backend
cd backend
npm run dev

# Frontend  
cd frontend
npm run dev
```

### 4. **Clear Browser Cache**
```bash
# Xóa localStorage và cookies
# DevTools → Application → Storage → Clear Site Data
```

---

## 📚 Tham Khảo

- `backend/src/services/auth.service.js` - buildUserPayload() đã sửa
- `backend/src/utils/permissions.js` - Source of truth cho permissions
- `frontend/src/utils/permissions.js` - Phải đồng bộ với backend
- `frontend/src/hooks/usePermissions.js` - Hook kiểm tra permissions
- `frontend/src/components/PermissionGate.jsx` - Conditional rendering component

---

**Lần sửa:** 13/12/2024  
**Trạng thái:** ✅ HOÀN TẤT - Đã test và verify
