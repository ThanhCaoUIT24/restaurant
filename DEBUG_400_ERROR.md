# Quick Debug Script

## Bước 1: Kiểm tra Backend Console

**QUAN TRỌNG**: Mở terminal backend và xem log khi bạn click "Gửi yêu cầu"

Bạn sẽ thấy một trong các lỗi sau:

### Lỗi 1: Table does not exist
```
Error: relation "YeuCauHuyMon" does not exist
```
**Giải pháp**: Migration chưa chạy
```bash
cd backend
node_modules\.bin\prisma migrate deploy
node_modules\.bin\prisma generate
```

### Lỗi 2: Cannot read property 'id' of undefined
```
TypeError: Cannot read properties of undefined (reading 'id')
```
**Giải pháp**: Authentication issue - `req.user` is undefined

### Lỗi 3: Validation error
```
ValidationError: "orderId" is required
```
**Giải pháp**: Frontend gửi sai format

## Bước 2: Test Migration Manually

Mở PostgreSQL client và chạy:

```sql
-- Check if table exists
SELECT * FROM "YeuCauHuyMon" LIMIT 1;

-- If error "relation does not exist", run migration manually:
-- Copy content from: backend/prisma/migrations/20251226164406_/migration.sql
-- And execute it in PostgreSQL
```

## Bước 3: Test API Directly

Dùng Postman hoặc curl:

```bash
curl -X POST http://localhost:4000/api/void-requests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "orderId": "your-order-id",
    "orderItemId": "your-item-id",
    "reason": "Test reason"
  }'
```

## Bước 4: Enable Debug Logging

Thêm vào `backend/src/controllers/voidRequests.controller.js`:

```javascript
const createVoidRequest = async (req, res, next) => {
    try {
        console.log('=== CREATE VOID REQUEST ===');
        console.log('User:', req.user);
        console.log('Body:', req.body);
        
        const data = await voidRequestsService.createVoidRequest(req.user, req.body);
        res.status(201).json(data);
    } catch (err) {
        console.error('Error creating void request:', err);
        next(err);
    }
};
```

Restart backend và test lại.

## Bước 5: Check Database Connection

```bash
cd backend
node -e "const {prisma} = require('./src/config/db'); prisma.yeuCauHuyMon.findMany().then(console.log).catch(console.error).finally(() => prisma.$disconnect())"
```

Nếu lỗi "Table does not exist" → Migration chưa chạy
