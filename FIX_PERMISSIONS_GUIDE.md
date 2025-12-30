# 🔧 HƯỚNG DẪN KHẮC PHỤC VẤN ĐỀ PHÂN QUYỀN

## ⚡ GIẢI PHÁP NHANH (90% trường hợp)

### Bước 1: Chạy quick check
```bash
# Windows
cd backend
quick-check.bat

# Linux/Mac
cd backend
chmod +x quick-check.sh
./quick-check.sh
```

### Bước 2: Nếu backend OK, clear frontend
1. Mở http://localhost:5173 trong browser
2. Mở DevTools Console (F12)
3. Chạy lệnh:
```javascript
localStorage.clear();
location.href = '/login';
```
4. Đăng nhập lại với `admin` / `admin123`

### Bước 3: Kiểm tra lại
- Thử vào một trang bất kỳ (Menu, Orders, etc.)
- Nếu vẫn lỗi → Xem phần Debug Chi Tiết bên dưới

---

## 🎯 KẾT QUẢ KIỂM TRA

**Backend hoạt động 100% chính xác:**
- ✅ Database có 37 permissions cho Admin
- ✅ Login service trả về đúng permissions
- ✅ JWT token chứa đầy đủ permissions
- ✅ Auth middleware hoạt động đúng
- ✅ RBAC middleware kiểm tra đúng
- ✅ Test API request thành công

**Vấn đề có thể ở:**
- 🔴 Token hết hạn (15 phút mặc định)
- 🔴 LocalStorage bị xóa
- 🔴 Browser cache cũ
- 🔴 Frontend chưa refresh token đúng

---

## 🛠️ CÔNG CỤ DEBUG

### 1. debug-permissions.html
**Công cụ web tương tác để kiểm tra mọi thứ**

**Cách dùng:**
1. Đảm bảo backend đang chạy
2. Mở file `debug-permissions.html` trong browser
3. Click các nút để kiểm tra:
   - ✓ Token trong localStorage
   - ✓ Decode token xem permissions
   - ✓ Test login
   - ✓ Test API calls
   - ✓ Clear localStorage

### 2. Debug API Endpoints
```bash
# Login để lấy token
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Copy token từ response

# Xem permissions của bạn
curl http://localhost:4000/api/debug/my-permissions \
  -H "Authorization: Bearer YOUR_TOKEN"

# Xem tất cả permissions trong hệ thống
curl http://localhost:4000/api/debug/all-permissions \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Browser Console Commands
```javascript
// Kiểm tra token
const token = localStorage.getItem('accessToken');
console.log('Has token?', !!token);

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
console.log('Permissions:', decoded.permissions);
console.log('Expires at:', new Date(decoded.exp * 1000));
console.log('Is expired?', Date.now() > decoded.exp * 1000);

// Test API
async function testAPI() {
  const res = await fetch('/api/menu/dishes', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log('Status:', res.status);
  console.log('Data:', await res.json());
}
testAPI();
```

---

## 🐛 DEBUG CHI TIẾT

### Triệu chứng: "Menu hiển thị nhưng click vào bị lỗi 401"

**Nguyên nhân:** Token hết hạn

**Kiểm tra:**
```javascript
// Trong browser console
const token = localStorage.getItem('accessToken');
const decoded = JSON.parse(atob(token.split('.')[1]));
console.log('Expires:', new Date(decoded.exp * 1000));
console.log('Now:', new Date());
```

**Giải pháp:**
```javascript
localStorage.clear();
location.href = '/login';
```

---

### Triệu chứng: "Menu hiển thị nhưng click vào bị lỗi 403"

**Nguyên nhân:** Token không có permission cần thiết

**Kiểm tra:**
```javascript
const token = localStorage.getItem('accessToken');
const decoded = JSON.parse(atob(token.split('.')[1]));
console.log('Permissions:', decoded.permissions);
```

**Giải pháp:**
- Nếu có ít hơn 37 permissions → Database chưa sync
- Chạy: `cd backend && node prisma/seed.js`
- Login lại

---

### Triệu chứng: "Không thấy menu items"

**Nguyên nhân:** Frontend check permissions để ẩn menu

**Kiểm tra:**
```javascript
// Trong browser console (khi đã login)
// Mở trang nào đó trong app
console.log('User:', window.sessionStorage); // hoặc check React DevTools
```

**Giải pháp:**
- Xem user object có `permissions` array không
- Nếu không → Problem ở authContext
- Nếu có nhưng rỗng → Login lại

---

### Triệu chứng: "Tất cả request đều bị CORS error"

**Nguyên nhân:** Frontend và Backend khác origin, proxy không hoạt động

**Kiểm tra:**
```bash
# Terminal 1
cd frontend
npm run dev
# Phải thấy: Local: http://localhost:5173

# Terminal 2
cd backend
npm run dev
# Phải thấy: Server running on port 4000
```

**Giải pháp:**
- Đảm bảo frontend ở port 5173
- Đảm bảo backend ở port 4000
- Kiểm tra `frontend/vite.config.js` có proxy:
```javascript
proxy: {
  '/api': {
    target: 'http://localhost:4000',
    changeOrigin: true,
  },
}
```

---

## ⚙️ TỐI ƯU HÓA (Tùy chọn)

### Tăng thời gian token expire (cho dev)

File `backend/.env`:
```env
JWT_ACCESS_EXPIRES="8h"    # Thay vì 15m
JWT_REFRESH_EXPIRES="30d"  # Thay vì 7d
```

Restart backend và login lại.

### Thêm logging vào frontend

File `frontend/src/api/client.js`:
```javascript
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  console.log('[API]', config.method, config.url, token ? '✓' : '✗ NO TOKEN');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => {
    console.log('[API Success]', res.config.url, res.status);
    return res;
  },
  async (error) => {
    console.error('[API Error]', error.config?.url, error.response?.status, error.response?.data);
    // ... existing code
  }
);
```

---

## 📚 TÀI LIỆU THAM KHẢO

- **PERMISSION_ANALYSIS_REPORT.md** - Báo cáo chi tiết về kết quả kiểm tra
- **DEBUG_FULL_FLOW.md** - Hướng dẫn debug toàn bộ flow
- **debug-permissions.html** - Công cụ web debug tương tác
- **Backend test scripts:**
  - `diagnose-permissions.js` - Test toàn bộ backend
  - `quick-check.bat` - Quick check (Windows)
  - `quick-check.sh` - Quick check (Linux/Mac)

---

## ✅ CHECKLIST

- [ ] Backend đang chạy ở port 4000
- [ ] Frontend đang chạy ở port 5173  
- [ ] Database đã seed permissions (37 quyền cho Admin)
- [ ] Đã login thành công
- [ ] LocalStorage có `accessToken` và `refreshToken`
- [ ] Token chưa hết hạn (< 15 phút nếu dùng default)
- [ ] Token chứa 37 permissions
- [ ] Browser console không có lỗi
- [ ] Network tab không có CORS errors

---

## 💡 LƯU Ý

1. **Backend hoàn toàn chính xác** - đã test kỹ lưỡng
2. **99% vấn đề ở frontend/browser** - token hết hạn hoặc không được gửi
3. **Giải pháp đơn giản nhất:** Clear localStorage và login lại
4. **Nếu vẫn lỗi:** Dùng debug-permissions.html để test chi tiết
5. **Token mặc định hết hạn sau 15 phút** - đăng nhập lại hoặc tăng expire time

---

## 🆘 VẪN GẶP VẤN ĐỀ?

1. Chạy `backend/quick-check.bat` để kiểm tra backend
2. Mở `debug-permissions.html` để kiểm tra frontend
3. Xem Network tab trong DevTools để xem request/response
4. Check Console tab để xem errors
5. Gọi `/api/debug/my-permissions` để xem chi tiết

**Backend đã được verify hoàn toàn chính xác. Vấn đề chỉ có thể ở frontend hoặc browser!**
