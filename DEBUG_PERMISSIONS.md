# HƯỚNG DẪN DEBUG VẤN ĐỀ PHÂN QUYỀN

## Tóm tắt vấn đề
- Frontend hiển thị permissions nhưng backend không cho phép truy cập
- Account đáng lẽ có toàn bộ quyền nhưng bị từ chối

## Kết quả kiểm tra

### ✅ Backend hoạt động CHÍNH XÁC
1. Database có đầy đủ permissions (37 quyền cho Admin)
2. Login service trả về đúng permissions trong user object
3. JWT token chứa đầy đủ permissions
4. Auth middleware decode token đúng
5. RBAC middleware kiểm tra permissions chính xác

### ❓ Cần kiểm tra ở Frontend/Browser

## Các bước debug

### 1. Kiểm tra token trong browser
Mở DevTools Console và chạy:
```javascript
const token = localStorage.getItem('accessToken');
console.log('Token:', token);

// Decode token (copy paste function này)
function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
  return JSON.parse(jsonPayload);
}

const decoded = parseJwt(token);
console.log('Token payload:', decoded);
console.log('Permissions:', decoded.permissions);
console.log('Expires at:', new Date(decoded.exp * 1000));
```

### 2. Kiểm tra Network requests
1. Mở DevTools → Network tab
2. Thực hiện một hành động bị từ chối
3. Tìm request bị lỗi (status 401 hoặc 403)
4. Click vào request → Headers tab
5. Kiểm tra:
   - Request Headers có `Authorization: Bearer <token>` không?
   - Response là gì? (401 = chưa đăng nhập, 403 = không có quyền)

### 3. Nếu thiếu Authorization header
- Clear cache và localStorage
- Đăng nhập lại
- Kiểm tra file `frontend/src/api/client.js` có chạy đúng không

### 4. Nếu có Authorization header nhưng vẫn lỗi 403
Chạy trong Console:
```javascript
const response = await fetch('/api/auth/me', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
  }
});
const data = await response.json();
console.log('User from backend:', data);
```

Nếu backend trả về user với đầy đủ permissions → vấn đề ở frontend routing/checking
Nếu backend trả về lỗi → token hết hạn hoặc invalid

### 5. Debug chi tiết với backend logs

Tạm thời thêm logging vào backend:

File: `backend/src/middleware/auth.js`
```javascript
const authMiddleware = (req, res, next) => {
  // ... existing code ...
  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = payload;
    console.log('[AUTH] User logged in:', payload.id, 'Permissions:', payload.permissions?.length);
    return next();
  } catch (err) {
    console.log('[AUTH] Token verification failed:', err.message);
    return res.status(401).json({ message: 'Invalid token' });
  }
};
```

File: `backend/src/middleware/rbac.js`
```javascript
const requirePermissions = (required = []) => (req, res, next) => {
  console.log('[RBAC] Checking permissions:', required);
  console.log('[RBAC] User has:', req.user?.permissions);
  
  if (!req.user) {
    console.log('[RBAC] FAILED: No user');
    return res.status(401).json({ ... });
  }
  // ... rest of code
  
  const hasPermission = required.some((perm) => req.user.permissions.includes(perm));
  
  if (!hasPermission) {
    console.log('[RBAC] FAILED: Missing permission');
    return res.status(403).json({ ... });
  }
  
  console.log('[RBAC] PASSED');
  return next();
};
```

### 6. Giải pháp phổ biến

#### A. Token hết hạn
```javascript
// Clear và đăng nhập lại
localStorage.clear();
// Reload page và login lại
```

#### B. Token không được gửi
Kiểm tra `frontend/src/api/client.js`:
```javascript
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  console.log('Sending request with token:', token ? 'YES' : 'NO');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

#### C. Permissions không được load từ DB
Chạy script kiểm tra:
```bash
cd backend
node check-permissions.js
```

Kiểm tra account của bạn có đủ permissions không.

#### D. Database outdated
```bash
cd backend
npx prisma migrate dev
node prisma/seed-full.js
```

## Test scripts đã tạo

1. `backend/check-permissions.js` - Kiểm tra roles và permissions trong DB
2. `backend/test-login-token.js` - Test login và xem JWT payload
3. `backend/debug-permissions.js` - Test toàn bộ flow từ login → auth → permissions

## Kết luận

**Backend đang hoạt động HOÀN TOÀN BÌNH THƯỜNG**. Vấn đề chắc chắn ở một trong những điểm sau:

1. ❌ Token không được gửi từ frontend
2. ❌ Token đã hết hạn
3. ❌ Token lỗi/corrupted trong localStorage
4. ❌ Browser cache cũ
5. ❌ Frontend đang call sai endpoint

Hãy làm theo các bước debug ở trên để tìm ra nguyên nhân chính xác!
