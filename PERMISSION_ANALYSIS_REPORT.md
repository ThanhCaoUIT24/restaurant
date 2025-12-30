# 🔐 BÁO CÁO KIỂM TRA HỆ THỐNG PHÂN QUYỀN

## 📋 TÓM TẮT

Tôi đã kiểm tra kỹ càng toàn bộ hệ thống phân quyền của bạn và **BACKEND HOẠT ĐỘNG HOÀN TOÀN CHÍNH XÁC**.

### ✅ Backend - Hoạt động 100% đúng

1. **Database**: Có đầy đủ 37 permissions cho role Admin
2. **Login Service**: Trả về đúng user với đầy đủ permissions
3. **JWT Token**: Chứa đầy đủ permissions array trong payload
4. **Auth Middleware**: Decode token chính xác và đặt vào `req.user`
5. **RBAC Middleware**: Kiểm tra permissions chính xác
6. **Test thực tế**: Request API thành công với admin account

### ❓ Vấn đề có thể ở Frontend hoặc Browser

Vì backend hoạt động đúng 100%, vấn đề có thể nằm ở:

1. **Token đã hết hạn** (mặc định 15 phút)
2. **Token không được gửi kèm request** (lỗi axios interceptor)
3. **LocalStorage bị xóa** hoặc không có token
4. **Refresh token flow bị lỗi**
5. **Browser cache** chưa được clear
6. **Frontend chưa được start** hoặc proxy không hoạt động

## 🛠️ CÔNG CỤ VÀ HƯỚNG DẪN ĐÃ TẠO

### 1. File debug-permissions.html

**Công cụ web debug đầy đủ** - Mở file này trong browser để:
- Kiểm tra token trong localStorage
- Decode token và xem permissions
- Test login
- Test các API calls
- Kiểm tra backend connection
- Clear và reset localStorage

**Cách sử dụng:**
1. Mở terminal tại thư mục frontend
2. Chạy: `npm run dev`
3. Mở browser tới: http://localhost:5173
4. Trong tab mới, mở: `file:///C:/Users/F15/Downloads/restaurant-main2/debug-permissions.html`
5. Hoặc copy file này vào thư mục `frontend/public/` và truy cập http://localhost:5173/debug-permissions.html

### 2. API Debug Endpoints (MỚI)

Tôi đã thêm 2 endpoints debug trong development:

#### `/api/debug/my-permissions`
Xem chi tiết permissions của user hiện tại:
- Permissions từ database
- Permissions từ JWT token
- So sánh giữa database và token
- Thông tin token (exp, roles, etc.)

#### `/api/debug/all-permissions`
Xem tất cả permissions và roles trong hệ thống:
- Danh sách tất cả permissions
- Danh sách tất cả roles
- Số nhân viên của mỗi role
- Permissions của mỗi role

**Cách sử dụng:**
```bash
# Đăng nhập trước để lấy token
# Sau đó gọi API
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:4000/api/debug/my-permissions
```

### 3. File DEBUG_FULL_FLOW.md

Hướng dẫn debug chi tiết với:
- Các trường hợp có thể xảy ra
- Script kiểm tra token trong browser console
- Cách kiểm tra Network requests
- Giải pháp nhanh
- Checklist debug đầy đủ

## 🎯 HƯỚNG DẪN KHẮC PHỤC NHANH

### Bước 1: Khởi động lại hệ thống

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Bước 2: Clear browser và login lại

1. Mở http://localhost:5173
2. Mở DevTools Console (F12)
3. Chạy:
```javascript
localStorage.clear();
location.href = '/login';
```
4. Đăng nhập lại với:
   - Username: `admin`
   - Password: `admin123`

### Bước 3: Kiểm tra token

Sau khi login, chạy trong Console:
```javascript
const token = localStorage.getItem('accessToken');
function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(c => 
    '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
  ).join(''));
  return JSON.parse(jsonPayload);
}
console.log(parseJwt(token));
```

Bạn phải thấy:
- `permissions`: array với 37 phần tử
- `roles`: ["Admin"]
- `exp`: thời gian hết hạn (> thời gian hiện tại)

### Bước 4: Test một API call

```javascript
async function testAPI() {
  const token = localStorage.getItem('accessToken');
  const response = await fetch('/api/menu/dishes', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  console.log('Status:', response.status);
  console.log('Data:', await response.json());
}
testAPI();
```

Nếu response.status = 200 → Backend hoạt động OK
Nếu response.status = 401 → Token hết hạn hoặc invalid
Nếu response.status = 403 → Không có permission

## 📊 KẾT QUẢ KIỂM TRA CHI TIẾT

### Test 1: Database Connection ✅
```
✓ Database connected successfully
```

### Test 2: Roles and Permissions ✅
```
✓ Found 6 roles
✓ Admin role exists with 37 permissions
```

### Test 3: Admin Account ✅
```
✓ Admin account exists
✓ Employee: Nguyễn Văn Admin
✓ Role: Admin
✓ Has 37 permissions
```

### Test 4: Login Service ✅
```
✓ Login successful
✓ User ID: 2e1c622e-a9c1-49a3-95ff-b9b171734c02
✓ Roles: [Admin]
✓ Permissions count: 37
✓ Has all key permissions
```

### Test 5: JWT Token ✅
```
✓ Token contains permissions array
✓ Token permissions count: 37
✓ Token is valid (expires in 15 minutes)
```

### Test 6: Middleware ✅
```
✓ Auth middleware works correctly
✓ req.user populated with 37 permissions
✓ RBAC middleware works correctly
```

### Test 7: Real API Request ✅
```
✓ SUCCESS! Backend accepted the request with proper permissions
Response Status: 200
```

## 🔍 37 PERMISSIONS CỦA ADMIN

```
ACCOUNT_CREATE      ACCOUNT_MANAGE      ACCOUNT_DELETE
REPORT_VIEW         REPORT_EXPORT       
STOCK_MANAGE        STOCK_IMPORT        STOCK_VIEW
MENU_MANAGE         MENU_CREATE         MENU_UPDATE
MENU_DELETE         MENU_VIEW
ORDER_CREATE        ORDER_UPDATE        ORDER_VIEW
ORDER_VOID          ORDER_VOID_APPROVE
PAYMENT_EXECUTE     PAYMENT_VIEW
SHIFT_MANAGE        SHIFT_OPEN          SHIFT_CLOSE
KDS_VIEW            DISH_STATUS_UPDATE
TABLE_VIEW          TABLE_MANAGE
PO_CREATE           PO_APPROVE          PO_VIEW
HR_MANAGE           HR_VIEW
RESERVATION_CREATE  RESERVATION_MANAGE  RESERVATION_VIEW
CUSTOMER_VIEW       CUSTOMER_MANAGE
```

## 💡 CÁC TRƯỜNG HỢP THƯỜNG GẶP

### 1. "Tôi thấy menu nhưng click vào bị lỗi 401"
→ **Token hết hạn**. Đăng xuất và đăng nhập lại.

### 2. "Tôi thấy menu nhưng click vào bị lỗi 403"
→ **Không có permission**. Kiểm tra xem token có đúng permissions không.

### 3. "Tôi không thấy menu items"
→ **Frontend kiểm tra permissions để ẩn menu**. Kiểm tra user.permissions trong authContext.

### 4. "Backend trả về lỗi CORS"
→ **Frontend và Backend khác origin**. Đảm bảo dùng proxy Vite.

### 5. "Token luôn hết hạn sau 15 phút"
→ **Đúng rồi, đó là design**. Muốn thay đổi, edit `backend/.env`:
```env
JWT_ACCESS_EXPIRES="24h"  # Thay vì 15m
```

## 🚀 TỐI ƯU HÓA ĐỀ XUẤT

### 1. Tăng thời gian expire token trong development

File `backend/.env`:
```env
JWT_ACCESS_EXPIRES="8h"   # 8 giờ cho dev
JWT_REFRESH_EXPIRES="30d" # 30 ngày
```

### 2. Thêm logging vào frontend

File `frontend/src/api/client.js`:
```javascript
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  console.log('[API Request]', config.method, config.url, token ? '✓' : '✗');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => {
    console.log('[API Success]', res.config.url, res.status);
    return res;
  },
  async (error) => {
    console.error('[API Error]', error.config?.url, error.response?.status);
    // ... existing code
  }
);
```

### 3. Thêm error boundary trong frontend

Để catch và hiển thị lỗi permissions một cách user-friendly.

## 📞 HỖ TRỢ THÊM

Nếu sau khi làm theo các bước trên vẫn gặp vấn đề:

1. **Kiểm tra Console log** (F12 → Console tab)
2. **Kiểm tra Network tab** để xem request/response thực tế
3. **Sử dụng debug-permissions.html** để test từng bước
4. **Gọi API debug endpoints** để xem chi tiết permissions

## ✅ KẾT LUẬN

**Backend của bạn hoạt động HOÀN HẢO**. Tất cả logic phân quyền đều chính xác:
- Database có đủ permissions
- Login trả về đúng data
- Token được tạo đúng
- Middleware kiểm tra đúng
- API endpoints require đúng permissions

Vấn đề có thể là:
- Token hết hạn → Login lại
- Token không được gửi → Kiểm tra axios interceptor
- LocalStorage trống → Login lại
- Browser cache cũ → Clear và reload

**Giải pháp nhanh nhất: Clear localStorage và login lại!**
