# Migration Guide - Void Order Approval System

## Prerequisites

Đảm bảo bạn đang ở branch `feature/void-order-approval-with-pin`:

```bash
git branch
# * feature/void-order-approval-with-pin
```

## Step 1: Run Database Migration

### Option A: Using npm (Recommended)

```bash
cd backend
npm exec prisma migrate dev -- --name add_void_requests
```

### Option B: Using npx

```bash
cd backend
npx prisma migrate dev --name add_void_requests
```

### Option C: Using global Prisma

```bash
cd backend
prisma migrate dev --name add_void_requests
```

**Expected Output**:
```
Prisma schema loaded from prisma\schema.prisma
Datasource "db": PostgreSQL database "restaurant_db"

Applying migration `20251226_add_void_requests`

The following migration(s) have been created and applied from new schema changes:

migrations/
  └─ 20251226_add_void_requests/
    └─ migration.sql

✔ Generated Prisma Client
```

## Step 2: Generate Prisma Client

```bash
npm exec prisma generate
```

## Step 3: Verify Migration

### Check Database Tables

```sql
-- Connect to your PostgreSQL database
\dt

-- Should see new table
YeuCauHuyMon
```

### Verify Enum

```sql
SELECT enum_range(NULL::VoidRequestStatus);
-- Should return: {PENDING,APPROVED,REJECTED}
```

## Step 4: Start Backend Server

```bash
cd backend
npm run dev
```

**Expected Output**:
```
Server running on port 4000
Database connected
```

## Step 5: Start Frontend

```bash
cd frontend
npm run dev
```

## Step 6: Test the System

### Test 1: Create Void Request (API)

```bash
# Login as waiter first to get token
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"waiter1","password":"waiter123"}'

# Use the token to create void request
curl -X POST http://localhost:4000/api/void-requests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "orderId": "<ORDER_ID>",
    "orderItemId": "<ORDER_ITEM_ID>",
    "reason": "Khách đổi ý"
  }'
```

### Test 2: View Void Requests (Manager UI)

1. Login as manager: `manager` / `manager123`
2. Navigate to: `http://localhost:5173/manager/void-requests`
3. Should see the void request created in Test 1

### Test 3: Approve with PIN

1. Click "Duyệt" button
2. Enter PIN: `manager123`
3. Click "Xác nhận"
4. Request should disappear or show "Approved" status

## Troubleshooting

### Error: "npx is not recognized"

**Solution**: Add Node.js to PATH or use full path:

```bash
"C:\Program Files\nodejs\npx.exe" prisma migrate dev --name add_void_requests
```

### Error: "Database connection failed"

**Solution**: Check `.env` file:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/restaurant_db"
```

### Error: "Migration already exists"

**Solution**: Reset migrations (CAUTION: Development only):

```bash
npm exec prisma migrate reset
npm exec prisma migrate dev
```

### Error: "Cannot find module 'voidRequests.service'"

**Solution**: Restart backend server:

```bash
# Stop server (Ctrl+C)
npm run dev
```

## Rollback (If Needed)

### Rollback Migration

```bash
cd backend
npm exec prisma migrate resolve --rolled-back 20251226_add_void_requests
```

### Revert Git Changes

```bash
git checkout main
git branch -D feature/void-order-approval-with-pin
```

## Next Steps After Migration

1. ✅ Test all API endpoints
2. ✅ Update waiter UI to create void requests
3. ✅ Add navigation menu item for managers
4. ✅ Test with real data
5. ✅ Merge to main branch when ready

## Migration SQL Preview

The migration will create:

```sql
-- CreateEnum
CREATE TYPE "VoidRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "YeuCauHuyMon" (
    "id" TEXT NOT NULL,
    "donHangId" TEXT NOT NULL,
    "chiTietDonHangId" TEXT NOT NULL,
    "lyDo" TEXT NOT NULL,
    "trangThai" "VoidRequestStatus" NOT NULL DEFAULT 'PENDING',
    "nguoiYeuCauId" TEXT,
    "nguoiDuyetId" TEXT,
    "ghiChuDuyet" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "YeuCauHuyMon_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "YeuCauHuyMon" ADD CONSTRAINT "YeuCauHuyMon_donHangId_fkey" 
    FOREIGN KEY ("donHangId") REFERENCES "DonHang"("id");

ALTER TABLE "YeuCauHuyMon" ADD CONSTRAINT "YeuCauHuyMon_chiTietDonHangId_fkey" 
    FOREIGN KEY ("chiTietDonHangId") REFERENCES "ChiTietDonHang"("id");

ALTER TABLE "YeuCauHuyMon" ADD CONSTRAINT "YeuCauHuyMon_nguoiYeuCauId_fkey" 
    FOREIGN KEY ("nguoiYeuCauId") REFERENCES "NhanVien"("id");

ALTER TABLE "YeuCauHuyMon" ADD CONSTRAINT "YeuCauHuyMon_nguoiDuyetId_fkey" 
    FOREIGN KEY ("nguoiDuyetId") REFERENCES "NhanVien"("id");
```
