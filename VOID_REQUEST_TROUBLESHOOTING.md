# Hướng dẫn Fix Lỗi 400 Bad Request

## Nguyên nhân

Lỗi `400 Bad Request` khi tạo void request có thể do:

1. ❌ **Backend chưa chạy migration** - Bảng `YeuCauHuyMon` chưa tồn tại trong database
2. ❌ **Backend server chưa chạy**
3. ❌ **Request body không đúng format**

## Giải pháp

### Bước 1: Kiểm tra Backend đang chạy

Mở terminal backend, nếu chưa chạy:

```bash
cd backend
npm run dev
```

Phải thấy message: `Server running on port 4000`

### Bước 2: Chạy Migration (QUAN TRỌNG!)

**Đây là bước BẮT BUỘC** - Nếu chưa chạy migration, database không có bảng `YeuCauHuyMon`:

```bash
cd backend
npm exec prisma migrate dev -- --name add_void_requests
npm exec prisma generate
```

**Kết quả mong đợi:**
```
✔ Generated Prisma Client
The following migration(s) have been created and applied:
migrations/
  └─ 20251226164406_add_void_requests/
    └─ migration.sql
```

### Bước 3: Kiểm tra Database

Mở database tool (pgAdmin, DBeaver, etc.) và kiểm tra:

```sql
SELECT * FROM "YeuCauHuyMon";
```

Nếu lỗi "table does not exist" → Quay lại Bước 2

### Bước 4: Restart Backend

Sau khi chạy migration:

```bash
# Stop backend (Ctrl+C)
cd backend
npm run dev
```

### Bước 5: Test lại

1. Hard refresh frontend: `Ctrl + Shift + R`
2. Login as waiter
3. Thử hủy món
4. **Kết quả mong đợi**: "Đã gửi yêu cầu hủy món, chờ quản lý duyệt"

## Debug Thêm

Nếu vẫn lỗi, check backend console xem error message cụ thể:

```
POST /api/void-requests 400
Error: [error message here]
```

Gửi error message đó để tôi debug tiếp!

## Kiểm tra Migration đã chạy chưa

```bash
cd backend
npm exec prisma migrate status
```

Nếu thấy "Database schema is up to date!" → Migration đã chạy ✅
Nếu thấy "Pending migrations" → Chạy lại Bước 2 ❌
