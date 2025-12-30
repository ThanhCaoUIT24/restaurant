# 🔍 HƯỚNG DẪN DEBUG TOÀN BỘ VẤN ĐỀ PHÂN QUYỀN

## ✅ KẾT QUẢ KIỂM TRA

### Backend - HOẠT ĐỘNG HOÀN HẢO ✓
- Database có đầy đủ 37 permissions cho Admin
- Login service trả về đúng permissions
- JWT token chứa đầy đủ permissions
- Auth middleware decode token chính xác
- RBAC middleware kiểm tra permissions đúng
- Test thực tế với request API: **THÀNH CÔNG**

### Vấn đề CÓ THỂ XẢY RA Ở Frontend

## 🎯 CÁC TRƯỜNG HỢP VÀ CÁCH KHẮC PHỤC

### Trường hợp 1: Token đã hết hạn
**Triệu chứng:** Frontend hiển thị UI nhưng mọi request đều bị 401
**Cách kiểm tra:**
1. Mở DevTools Console
2. Chạy:
```javascript
const token = localStorage.getItem('accessToken');
console.log('Token:', token);

// Decode token
function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(c => 
    '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
  ).join(''));
  return JSON.parse(jsonPayload);
}

const decoded = parseJwt(token);
console.log('Expires at:', new Date(decoded.exp * 1000));
console.log('Current time:', new Date());
console.log('Is expired?', Date.now() > decoded.exp * 1000);
```

**Giải pháp:** Đăng xuất và đăng nhập lại

### Trường hợp 2: Frontend và Backend chạy khác origin
**Triệu chứng:** CORS errors, hoặc token không được gửi
**Cách kiểm tra:**
1. Mở DevTools Network tab
2. Xem request bị lỗi
3. Kiểm tra Request Headers có `Authorization: Bearer <token>` không

**Giải pháp:** 
- Đảm bảo backend chạy ở port 4000
- Đảm bảo frontend chạy ở port 5173 với proxy đúng

### Trường hợp 3: LocalStorage bị xóa
**Triệu chứng:** Không có token trong localStorage
**Cách kiểm tra:**
```javascript
console.log('Access Token:', localStorage.getItem('accessToken'));
console.log('Refresh Token:', localStorage.getItem('refreshToken'));
```

**Giải pháp:** Đăng nhập lại

### Trường hợp 4: Refresh token flow bị lỗi
**Triệu chứng:** Token hết hạn, refresh token cũng hết hạn hoặc lỗi
**Cách kiểm tra:** Xem Network tab, request `/api/auth/refresh` có lỗi không

**Giải pháp:** Đăng nhập lại

## 🔧 CÁCH DEBUG CHI TIẾT

### Bước 1: Kiểm tra token trong browser
```javascript
// Copy paste vào Console
const token = localStorage.getItem('accessToken');
if (!token) {
  console.error('❌ NO TOKEN - Cần đăng nhập');
} else {
  function parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(c => 
      '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    ).join(''));
    return JSON.parse(jsonPayload);
  }
  
  try {
    const decoded = parseJwt(token);
    console.log('✓ Token payload:', decoded);
    console.log('✓ Permissions:', decoded.permissions);
    console.log('✓ Roles:', decoded.roles);
    console.log('✓ Expires at:', new Date(decoded.exp * 1000));
    console.log('✓ Is expired?', Date.now() > decoded.exp * 1000);
  } catch (e) {
    console.error('❌ Invalid token:', e);
  }
}
```

### Bước 2: Kiểm tra Network requests
1. Mở DevTools → Network tab
2. Thử thực hiện một hành động (ví dụ: vào trang Menu)
3. Tìm request API bị lỗi
4. Click vào request → Headers tab
5. Kiểm tra:
   - **Request Headers** có `Authorization: Bearer <token>` không?
   - **Response Status** là gì? (401 = chưa auth, 403 = không có quyền)
   - **Response Body** nói gì?

### Bước 3: Test một API call trực tiếp
```javascript
// Copy paste vào Console
async function testAPI() {
  const token = localStorage.getItem('accessToken');
  
  const response = await fetch('/api/menu/dishes', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  console.log('Status:', response.status);
  const data = await response.json();
  console.log('Response:', data);
  
  if (response.status === 401) {
    console.error('❌ Token invalid or expired');
  } else if (response.status === 403) {
    console.error('❌ No permission');
  } else if (response.ok) {
    console.log('✓ Success!');
  }
}

testAPI();
```

## 🚀 GIẢI PHÁP NHANH

### Giải pháp 1: Clear và Login lại
```javascript
// Copy paste vào Console
localStorage.removeItem('accessToken');
localStorage.removeItem('refreshToken');
location.href = '/login';
```

### Giải pháp 2: Tăng thời gian expire của token (cho dev)
Chỉnh file `backend/.env`:
```env
JWT_ACCESS_SECRET="your-secret-key-change-in-production"
JWT_REFRESH_SECRET="your-refresh-secret-key-change-in-production"
JWT_ACCESS_EXPIRES="24h"    # Tăng lên 24 giờ thay vì 15 phút
JWT_REFRESH_EXPIRES="30d"   # Tăng lên 30 ngày
```

Sau đó restart backend và đăng nhập lại.

### Giải pháp 3: Bật logging để debug
Mở file `frontend/src/api/client.js`, thêm logging:

```javascript
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  console.log('[API] Request:', config.method, config.url, token ? '✓ has token' : '✗ no token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => {
    console.log('[API] Success:', res.config.url, res.status);
    return res;
  },
  async (error) => {
    console.error('[API] Error:', error.config?.url, error.response?.status, error.response?.data);
    // ... rest of code
  }
);
```

## 📝 CHECKLIST DEBUG

- [ ] Backend đang chạy ở port 4000
- [ ] Frontend đang chạy ở port 5173
- [ ] Đã đăng nhập thành công
- [ ] LocalStorage có accessToken và refreshToken
- [ ] Token chưa hết hạn (kiểm tra exp)
- [ ] Token chứa đúng permissions (37 quyền cho Admin)
- [ ] Network requests có header Authorization
- [ ] Không có CORS errors
- [ ] Response từ backend là 200 (không phải 401 hoặc 403)

## 🎓 HIỂU RÕ VẤN ĐỀ

### Backend (✅ HOẠT ĐỘNG ĐÚNG):
1. Database có đủ permissions cho Admin (37 quyền)
2. Login API trả về user với đầy đủ permissions
3. JWT token chứa permissions array
4. Auth middleware decode token và đặt vào req.user
5. RBAC middleware kiểm tra req.user.permissions

### Frontend (❓ CẦN KIỂM TRA):
1. Nhận token từ login API
2. Lưu token vào localStorage
3. Đặt token vào header Authorization cho mọi request
4. Decode token để lấy user info (permissions, roles)
5. Dùng usePermissions hook để kiểm tra UI
6. Gửi request với token trong header

### Điểm có thể bị lỗi:
- Token hết hạn (15 phút mặc định)
- Token không được gửi kèm request
- LocalStorage bị xóa
- Refresh token flow bị lỗi
- CORS issues
- Backend chưa chạy hoặc chạy sai port

## 💡 LƯU Ý

- Backend **HOÀN TOÀN CHÍNH XÁC** - đã test kỹ
- Vấn đề 99% ở **frontend hoặc browser**
- Đơn giản nhất: **Đăng xuất và đăng nhập lại**
- Nếu vẫn lỗi: **Clear localStorage và login lại**
- Nếu vẫn lỗi: **Kiểm tra Network tab để xem request thực tế**
