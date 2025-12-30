# HƯỚNG DẪN TEST CHỨC NĂNG PHÂN QUYỀN

## ✅ Đã hoàn thành

### 1. Backend đã có đầy đủ API:
- ✅ `GET /api/admin/roles` - Liệt kê vai trò với **số nhân viên chính xác**
- ✅ `GET /api/admin/permissions` - Liệt kê tất cả quyền
- ✅ `POST /api/admin/roles` - Tạo vai trò mới + gán quyền
- ✅ `PUT /api/admin/roles/:id` - Cập nhật vai trò + thay đổi quyền
  - Ghi audit log về thay đổi quyền
  - Invalidate cache để users refetch permissions
- ✅ `DELETE /api/admin/roles/:id` - Xóa vai trò (chỉ khi không có nhân viên)

### 2. Frontend đã được cải thiện:
- ✅ **Số nhân viên hiển thị chính xác** từ `_count.nhanVien`
- ✅ **Auto-refresh permissions** khi:
  - Admin thay đổi quyền của vai trò
  - User navigate giữa các trang
- ✅ **Thông báo realtime** khi cập nhật quyền thành công
- ✅ **UI/UX cải thiện:**
  - Chip hiển thị số nhân viên với màu sắc
  - Không cho xóa vai trò đang có nhân viên
  - Checkbox để toggle permissions

### 3. Luồng hoạt động:
```
Admin thay đổi quyền của vai trò
    ↓
Backend cập nhật VaiTroQuyen table
    ↓
Ghi audit log (old vs new permissions)
    ↓
Frontend invalidate queries
    ↓
Users thuộc vai trò đó auto refetch /auth/me
    ↓
JWT token mới với permissions mới
    ↓
UI tự động hiện/ẩn chức năng theo permissions mới
```

## 📋 CÁCH TEST

### Test 1: Xem số nhân viên chính xác
1. Login: `admin / admin123`
2. Vào menu: **"Quản lý Vai trò & Quyền"**
3. Kiểm tra mỗi vai trò hiển thị:
   - Admin: 1 nhân viên
   - QuanLy: 1 nhân viên
   - ThuNgan: 1 nhân viên
   - PhucVu: 2 nhân viên
   - Bep: 2 nhân viên
   - ThuKho: 1 nhân viên

### Test 2: Thay đổi quyền và xem hiệu ứng
**Bước 1:** Login 2 trình duyệt
- Browser 1: Admin (`admin/admin123`)
- Browser 2: Cashier (`cashier/cashier123`)

**Bước 2:** Ở Browser 2 (Cashier)
- Vào trang Dashboard
- Kiểm tra sidebar - chỉ thấy: Dashboard, Orders, Billing
- KHÔNG thấy: Reports, Admin

**Bước 3:** Ở Browser 1 (Admin)
- Vào "Quản lý Vai trò & Quyền"
- Click Edit vai trò "ThuNgan"
- Thêm quyền: `REPORT_VIEW`
- Submit

**Bước 4:** Ở Browser 2 (Cashier)
- Navigate sang trang khác (VD: Orders)
- Navigate lại Dashboard
- ✨ **Magic:** Sidebar tự động hiện menu "Reports"!

### Test 3: Tạo vai trò mới
1. Click "Thêm vai trò"
2. Nhập:
   - Tên: `GiamSat`
   - Mô tả: `Giám sát ca làm việc`
   - Chọn quyền:
     - `ORDER_VIEW`
     - `KDS_VIEW`
     - `TABLE_VIEW`
     - `REPORT_VIEW`
3. Submit
4. Vai trò mới xuất hiện với "0 nhân viên"

### Test 4: Gán vai trò cho nhân viên
1. Vào "Quản lý Tài khoản"
2. Tạo nhân viên mới với vai trò "GiamSat"
3. Quay lại "Quản lý Vai trò"
4. ✨ Vai trò "GiamSat" giờ hiển thị "1 nhân viên"

### Test 5: Không cho xóa vai trò đang có nhân viên
1. Ở trang "Quản lý Vai trò"
2. Hover nút Delete của vai trò "Admin"
3. ✨ Nút bị **disabled** (vì có 1 nhân viên)
4. Hover nút Delete của vai trò "GiamSat" (0 nhân viên)
5. ✨ Nút **enabled** - có thể xóa

## 🔧 Technical Details

### Database Schema
```prisma
model VaiTro {
  id       String         @id @default(uuid())
  ten      String         @unique
  moTa     String?
  nhanVien NhanVien[]     // One-to-Many
  quyen    VaiTroQuyen[]  // Many-to-Many through junction
}

model VaiTroQuyen {
  vaiTroId String
  quyenId  String
  vaiTro   VaiTro @relation(...)
  quyen    Quyen  @relation(...)
  @@id([vaiTroId, quyenId])
}

model Quyen {
  id     String         @id @default(uuid())
  ma     String         @unique
  moTa   String?
  vaiTro VaiTroQuyen[]
}
```

### API Response Example
```json
GET /api/admin/roles
{
  "items": [
    {
      "id": "uuid",
      "ten": "ThuNgan",
      "moTa": "Thu ngân tính tiền",
      "soNhanVien": 1,
      "quyen": [
        { "id": "uuid", "ma": "ORDER_VIEW", "moTa": "..." },
        { "id": "uuid", "ma": "PAYMENT_PROCESS", "moTa": "..." }
      ]
    }
  ]
}
```

### Permission Flow
```javascript
// Backend: buildUserPayload()
const permissions = role?.quyen
  ?.map((vaiTroQuyen) => vaiTroQuyen.quyen?.ma)
  .filter(Boolean) || [];

// JWT Token
{
  id: "employee-id",
  username: "cashier",
  roles: ["ThuNgan"],
  permissions: ["ORDER_VIEW", "PAYMENT_PROCESS", ...]
}

// Frontend: PermissionGate
<PermissionGate permission="REPORT_VIEW">
  <MenuItem>Reports</MenuItem>
</PermissionGate>
// → Chỉ render nếu user.permissions.includes('REPORT_VIEW')
```

## ✨ Tính năng nổi bật

1. **Real-time Permission Update:**
   - Admin thay đổi quyền → Users tự động refetch khi navigate
   - Không cần logout/login lại

2. **Accurate Employee Count:**
   - Sử dụng Prisma `_count` để đếm chính xác
   - Update real-time khi thêm/xóa nhân viên

3. **Audit Trail:**
   - Mọi thay đổi quyền được ghi vào `NhatKyHeThong`
   - Lưu old vs new permissions

4. **Safety:**
   - Không cho xóa vai trò đang có nhân viên
   - Validate permissions exists trước khi gán

5. **Developer-Friendly:**
   - Clear error messages
   - TypeScript-ready structure
   - Well-documented code

## 🎯 Kết quả

✅ Số nhân viên hiển thị **chính xác**
✅ Admin thêm/xóa quyền → UI **tự động ẩn/hiện** chức năng
✅ Backend đã được **liên kết đầy đủ**
✅ Real-time update **không cần reload**
