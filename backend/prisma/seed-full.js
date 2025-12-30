/* Complete Seed Data for Testing All Features */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { prisma } = require('../src/config/db');
const { PERMISSIONS, ROLES, ROLE_PERMISSIONS } = require('../src/utils/permissions');

// ===================== PERMISSIONS & ROLES =====================
// Permission descriptions in Vietnamese
const permissionDescriptions = {
  // Account Management
  'ACCOUNT_CREATE': 'Tạo tài khoản',
  'ACCOUNT_MANAGE': 'Quản lý tài khoản',
  'ACCOUNT_DELETE': 'Xóa tài khoản',
  
  // Reports
  'REPORT_VIEW': 'Xem báo cáo',
  'REPORT_EXPORT': 'Xuất báo cáo',
  
  // Stock/Inventory
  'STOCK_MANAGE': 'Quản lý kho',
  'STOCK_IMPORT': 'Nhập kho',
  'STOCK_VIEW': 'Xem kho',
  
  // Menu Management
  'MENU_MANAGE': 'Quản lý thực đơn',
  'MENU_CREATE': 'Tạo món ăn',
  'MENU_UPDATE': 'Cập nhật món ăn',
  'MENU_DELETE': 'Xóa món ăn',
  'MENU_VIEW': 'Xem thực đơn',
  
  // Order Management
  'ORDER_CREATE': 'Tạo đơn hàng',
  'ORDER_UPDATE': 'Cập nhật đơn hàng',
  'ORDER_VIEW': 'Xem đơn hàng',
  'ORDER_VOID': 'Hủy đơn hàng',
  'ORDER_VOID_APPROVE': 'Duyệt hủy đơn',
  
  // Payment
  'PAYMENT_EXECUTE': 'Thực hiện thanh toán',
  'PAYMENT_VIEW': 'Xem thanh toán',
  
  // Shift Management (Ca thu ngân)
  'SHIFT_MANAGE': 'Quản lý ca thu ngân',
  'SHIFT_OPEN': 'Mở ca',
  'SHIFT_CLOSE': 'Đóng ca',
  
  // Kitchen Display System
  'KDS_VIEW': 'Xem màn hình bếp',
  'DISH_STATUS_UPDATE': 'Cập nhật trạng thái món',
  
  // Table Management
  'TABLE_VIEW': 'Xem bàn',
  'TABLE_MANAGE': 'Quản lý bàn',
  
  // Purchase Order
  'PO_CREATE': 'Tạo đơn mua hàng',
  'PO_APPROVE': 'Duyệt đơn mua hàng',
  'PO_VIEW': 'Xem đơn mua hàng',
  
  // HR Management
  'HR_MANAGE': 'Quản lý nhân sự',
  'HR_VIEW': 'Xem nhân sự',
  
  // Reservation
  'RESERVATION_CREATE': 'Tạo đặt bàn',
  'RESERVATION_MANAGE': 'Quản lý đặt bàn',
  'RESERVATION_VIEW': 'Xem đặt bàn',
  
  // Customer
  'CUSTOMER_VIEW': 'Xem khách hàng',
  'CUSTOMER_MANAGE': 'Quản lý khách hàng',
  
  // Shift Schedule Management (Lịch làm việc)
  'SHIFT_SCHEDULE_VIEW': 'Xem lịch làm việc',
  'SHIFT_SCHEDULE_MANAGE': 'Quản lý ca làm việc',
  
  // Attendance/Timekeeping
  'ATTENDANCE_VIEW': 'Xem chấm công',
  'ATTENDANCE_MANAGE': 'Quản lý chấm công',
};

// Sử dụng permissions từ file constants
const permissions = Object.values(PERMISSIONS);

// Role permissions mapping
const roles = {
  [ROLES.ADMIN]: ROLE_PERMISSIONS[ROLES.ADMIN],
  [ROLES.QUAN_LY]: ROLE_PERMISSIONS[ROLES.QUAN_LY],
  [ROLES.THU_NGAN]: ROLE_PERMISSIONS[ROLES.THU_NGAN],
  [ROLES.PHUC_VU]: ROLE_PERMISSIONS[ROLES.PHUC_VU],
  [ROLES.BEP]: ROLE_PERMISSIONS[ROLES.BEP],
  [ROLES.THU_KHO]: ROLE_PERMISSIONS[ROLES.THU_KHO],
};

const users = [
  { username: 'admin', password: 'admin123', role: ROLES.ADMIN, hoTen: 'Nguyễn Văn Admin', soDienThoai: '0901000001' },
  { username: 'manager', password: 'manager123', role: ROLES.QUAN_LY, hoTen: 'Trần Thị Quản Lý', soDienThoai: '0901000002' },
  { username: 'cashier', password: 'cashier123', role: ROLES.THU_NGAN, hoTen: 'Lê Văn Thu Ngân', soDienThoai: '0901000003' },
  { username: 'waiter1', password: 'waiter123', role: ROLES.PHUC_VU, hoTen: 'Phạm Minh Phục Vụ 1', soDienThoai: '0901000004' },
  { username: 'waiter2', password: 'waiter123', role: ROLES.PHUC_VU, hoTen: 'Hoàng Thị Phục Vụ 2', soDienThoai: '0901000005' },
  { username: 'chef1', password: 'chef123', role: ROLES.BEP, hoTen: 'Đỗ Văn Bếp Trưởng', soDienThoai: '0901000006' },
  { username: 'chef2', password: 'chef123', role: ROLES.BEP, hoTen: 'Vũ Thị Bếp Phụ', soDienThoai: '0901000007' },
  { username: 'stock', password: 'stock123', role: ROLES.THU_KHO, hoTen: 'Bùi Văn Kho', soDienThoai: '0901000008' },
];

// ===================== MENU CATEGORIES =====================
const categories = [
  { ten: 'Khai vị', moTa: 'Các món khai vị, salad, soup' },
  { ten: 'Món chính', moTa: 'Các món chính từ thịt, cá, hải sản' },
  { ten: 'Cơm - Mì', moTa: 'Các món cơm, mì, phở' },
  { ten: 'Đồ uống', moTa: 'Nước ngọt, bia, rượu, trà, cà phê' },
  { ten: 'Tráng miệng', moTa: 'Bánh ngọt, kem, trái cây' },
  { ten: 'Đặc biệt', moTa: 'Món đặc sản của nhà hàng' },
];

// ===================== DISHES =====================
const dishes = [
  // Khai vị
  { ten: 'Gỏi cuốn tôm thịt', giaBan: 45000, danhMuc: 'Khai vị', moTa: '2 cuốn, sốt đậu phộng', tramCheBien: 'BEP_LANH', hinhAnh: '/images/dishes/goi-cuon-tom-thit.jpg' },
  { ten: 'Chả giò chiên', giaBan: 55000, danhMuc: 'Khai vị', moTa: '4 cuốn, sốt chua ngọt', tramCheBien: 'BEP_CHIÊN', hinhAnh: '/images/dishes/cha-gio-chien.jpg' },
  { ten: 'Súp hải sản', giaBan: 65000, danhMuc: 'Khai vị', moTa: 'Súp nấu từ tôm, mực, sò', tramCheBien: 'BEP_NONG', hinhAnh: '/images/dishes/sup-hai-san.jpg' },
  { ten: 'Salad trộn', giaBan: 50000, danhMuc: 'Khai vị', moTa: 'Salad rau củ tươi', tramCheBien: 'BEP_LANH', hinhAnh: '/images/dishes/salad-tron.jpg' },
  
  // Món chính
  { ten: 'Bò lúc lắc', giaBan: 165000, danhMuc: 'Món chính', moTa: 'Bò Úc xào rau củ', tramCheBien: 'BEP_NONG', hinhAnh: '/images/dishes/bo-luc-lac.jpg' },
  { ten: 'Sườn nướng BBQ', giaBan: 185000, danhMuc: 'Món chính', moTa: 'Sườn heo nướng sốt BBQ', tramCheBien: 'BEP_NUONG', hinhAnh: '/images/dishes/suon-nuong-bbq.jpg' },
  { ten: 'Cá hồi áp chảo', giaBan: 220000, danhMuc: 'Món chính', moTa: 'Cá hồi Na Uy, sốt chanh dây', tramCheBien: 'BEP_NONG', hinhAnh: '/images/dishes/ca-hoi-ap-chao.jpg' },
  { ten: 'Gà nướng nguyên con', giaBan: 280000, danhMuc: 'Món chính', moTa: 'Gà ta nướng muối ớt', tramCheBien: 'BEP_NUONG', hinhAnh: '/images/dishes/ga-nuong-nguyen-con.jpg' },
  { ten: 'Tôm sú nướng muối ớt', giaBan: 195000, danhMuc: 'Món chính', moTa: '300g tôm sú tươi', tramCheBien: 'BEP_NUONG', hinhAnh: '/images/dishes/tom-su-nuong-muoi-ot.jpg' },
  { ten: 'Mực xào sa tế', giaBan: 155000, danhMuc: 'Món chính', moTa: 'Mực tươi xào cay', tramCheBien: 'BEP_NONG', hinhAnh: '/images/dishes/muc-xao-sa-te.jpg' },
  
  // Cơm - Mì
  { ten: 'Cơm chiên dương châu', giaBan: 75000, danhMuc: 'Cơm - Mì', moTa: 'Cơm chiên với tôm, xá xíu', tramCheBien: 'BEP_NONG', hinhAnh: '/images/dishes/com-chien-duong-chau.jpg' },
  { ten: 'Phở bò tái', giaBan: 65000, danhMuc: 'Cơm - Mì', moTa: 'Phở nước trong, bò tái', tramCheBien: 'BEP_NONG', hinhAnh: '/images/dishes/pho-bo-tai.jpg' },
  { ten: 'Bún bò Huế', giaBan: 70000, danhMuc: 'Cơm - Mì', moTa: 'Bún bò đặc sản Huế', tramCheBien: 'BEP_NONG', hinhAnh: '/images/dishes/bun-bo-hue.jpg' },
  { ten: 'Mì xào hải sản', giaBan: 85000, danhMuc: 'Cơm - Mì', moTa: 'Mì trứng xào tôm, mực', tramCheBien: 'BEP_NONG', hinhAnh: '/images/dishes/mi-xao-hai-san.jpg' },
  
  // Đồ uống
  { ten: 'Coca-Cola', giaBan: 25000, danhMuc: 'Đồ uống', moTa: 'Lon 330ml', tramCheBien: 'BAR', hinhAnh: '/images/dishes/coca-cola.jpg' },
  { ten: 'Pepsi', giaBan: 25000, danhMuc: 'Đồ uống', moTa: 'Lon 330ml', tramCheBien: 'BAR', hinhAnh: '/images/dishes/pepsi.jpg' },
  { ten: 'Bia Tiger', giaBan: 35000, danhMuc: 'Đồ uống', moTa: 'Lon 330ml', tramCheBien: 'BAR', hinhAnh: '/images/dishes/bia-tiger.jpg' },
  { ten: 'Bia Heineken', giaBan: 40000, danhMuc: 'Đồ uống', moTa: 'Lon 330ml', tramCheBien: 'BAR', hinhAnh: '/images/dishes/bia-heineken.jpg' },
  { ten: 'Nước ép cam', giaBan: 45000, danhMuc: 'Đồ uống', moTa: 'Cam tươi vắt', tramCheBien: 'BAR', hinhAnh: '/images/dishes/nuoc-ep-cam.jpg' },
  { ten: 'Sinh tố bơ', giaBan: 50000, danhMuc: 'Đồ uống', moTa: 'Sinh tố bơ Đắk Lắk', tramCheBien: 'BAR', hinhAnh: '/images/dishes/sinh-to-bo.jpg' },
  { ten: 'Trà đào', giaBan: 35000, danhMuc: 'Đồ uống', moTa: 'Trà đào cam sả', tramCheBien: 'BAR', hinhAnh: '/images/dishes/tra-dao.jpg' },
  { ten: 'Cà phê sữa đá', giaBan: 30000, danhMuc: 'Đồ uống', moTa: 'Cà phê phin Việt Nam', tramCheBien: 'BAR', hinhAnh: '/images/dishes/ca-phe-sua-da.jpg' },
  
  // Tráng miệng
  { ten: 'Chè thái', giaBan: 35000, danhMuc: 'Tráng miệng', moTa: 'Chè thái trái cây', tramCheBien: 'BEP_LANH', hinhAnh: '/images/dishes/che-thai.jpg' },
  { ten: 'Bánh flan', giaBan: 30000, danhMuc: 'Tráng miệng', moTa: 'Bánh flan caramen', tramCheBien: 'BEP_LANH', hinhAnh: '/images/dishes/banh-flan.jpg' },
  { ten: 'Kem vanilla', giaBan: 40000, danhMuc: 'Tráng miệng', moTa: '2 viên kem vanilla', tramCheBien: 'BEP_LANH', hinhAnh: '/images/dishes/kem-vanilla.jpg' },
  { ten: 'Trái cây thập cẩm', giaBan: 55000, danhMuc: 'Tráng miệng', moTa: 'Dĩa trái cây tươi', tramCheBien: 'BEP_LANH', hinhAnh: '/images/dishes/trai-cay-thap-cam.jpg' },
  
  // Đặc biệt
  { ten: 'Lẩu thái hải sản', giaBan: 450000, danhMuc: 'Đặc biệt', moTa: 'Lẩu cho 4-6 người', tramCheBien: 'BEP_NONG', hinhAnh: '/images/dishes/lau-thai-hai-san.jpg' },
  { ten: 'Combo nướng BBQ', giaBan: 550000, danhMuc: 'Đặc biệt', moTa: 'Set nướng cho 4 người', tramCheBien: 'BEP_NUONG', hinhAnh: '/images/dishes/combo-nuong-bbq.jpg' },
  { ten: 'Hải sản tổng hợp', giaBan: 650000, danhMuc: 'Đặc biệt', moTa: 'Tôm, cua, ghẹ, sò', tramCheBien: 'BEP_NONG', hinhAnh: '/images/dishes/hai-san-tong-hop.jpg' },
];

// ===================== MATERIALS (INGREDIENTS) =====================
const materials = [
  // Thịt
  { ten: 'Thịt bò Úc', donViTinh: 'kg', soLuongTon: 15, mucTonToiThieu: 5, giaNhapGanNhat: 350000 },
  { ten: 'Thịt heo', donViTinh: 'kg', soLuongTon: 20, mucTonToiThieu: 8, giaNhapGanNhat: 120000 },
  { ten: 'Thịt gà', donViTinh: 'kg', soLuongTon: 18, mucTonToiThieu: 5, giaNhapGanNhat: 85000 },
  { ten: 'Sườn heo', donViTinh: 'kg', soLuongTon: 10, mucTonToiThieu: 4, giaNhapGanNhat: 150000 },
  
  // Hải sản
  { ten: 'Tôm sú', donViTinh: 'kg', soLuongTon: 8, mucTonToiThieu: 3, giaNhapGanNhat: 280000 },
  { ten: 'Mực tươi', donViTinh: 'kg', soLuongTon: 5, mucTonToiThieu: 2, giaNhapGanNhat: 180000 },
  { ten: 'Cá hồi', donViTinh: 'kg', soLuongTon: 4, mucTonToiThieu: 2, giaNhapGanNhat: 450000 },
  { ten: 'Sò điệp', donViTinh: 'kg', soLuongTon: 2, mucTonToiThieu: 1, giaNhapGanNhat: 350000 },
  
  // Rau củ
  { ten: 'Rau xà lách', donViTinh: 'kg', soLuongTon: 5, mucTonToiThieu: 2, giaNhapGanNhat: 25000 },
  { ten: 'Cà chua', donViTinh: 'kg', soLuongTon: 8, mucTonToiThieu: 3, giaNhapGanNhat: 20000 },
  { ten: 'Hành tây', donViTinh: 'kg', soLuongTon: 10, mucTonToiThieu: 4, giaNhapGanNhat: 15000 },
  { ten: 'Ớt chuông', donViTinh: 'kg', soLuongTon: 3, mucTonToiThieu: 1, giaNhapGanNhat: 40000 },
  { ten: 'Khoai tây', donViTinh: 'kg', soLuongTon: 15, mucTonToiThieu: 5, giaNhapGanNhat: 18000 },
  
  // Gia vị
  { ten: 'Dầu ăn', donViTinh: 'lít', soLuongTon: 20, mucTonToiThieu: 5, giaNhapGanNhat: 35000 },
  { ten: 'Nước mắm', donViTinh: 'lít', soLuongTon: 10, mucTonToiThieu: 3, giaNhapGanNhat: 45000 },
  { ten: 'Đường', donViTinh: 'kg', soLuongTon: 15, mucTonToiThieu: 5, giaNhapGanNhat: 20000 },
  { ten: 'Muối', donViTinh: 'kg', soLuongTon: 10, mucTonToiThieu: 3, giaNhapGanNhat: 8000 },
  { ten: 'Bột ngọt', donViTinh: 'kg', soLuongTon: 5, mucTonToiThieu: 2, giaNhapGanNhat: 55000 },
  
  // Đồ uống
  { ten: 'Coca-Cola (thùng)', donViTinh: 'thùng', soLuongTon: 5, mucTonToiThieu: 2, giaNhapGanNhat: 220000 },
  { ten: 'Pepsi (thùng)', donViTinh: 'thùng', soLuongTon: 5, mucTonToiThieu: 2, giaNhapGanNhat: 210000 },
  { ten: 'Bia Tiger (thùng)', donViTinh: 'thùng', soLuongTon: 10, mucTonToiThieu: 3, giaNhapGanNhat: 330000 },
  { ten: 'Bia Heineken (thùng)', donViTinh: 'thùng', soLuongTon: 8, mucTonToiThieu: 3, giaNhapGanNhat: 420000 },
  { ten: 'Cam tươi', donViTinh: 'kg', soLuongTon: 10, mucTonToiThieu: 3, giaNhapGanNhat: 35000 },
  { ten: 'Bơ Đắk Lắk', donViTinh: 'kg', soLuongTon: 5, mucTonToiThieu: 2, giaNhapGanNhat: 60000 },
  { ten: 'Cà phê phin', donViTinh: 'kg', soLuongTon: 3, mucTonToiThieu: 1, giaNhapGanNhat: 180000 },
  
  // Low stock items for testing alerts
  { ten: 'Gạo', donViTinh: 'kg', soLuongTon: 3, mucTonToiThieu: 10, giaNhapGanNhat: 18000 },
  { ten: 'Bún tươi', donViTinh: 'kg', soLuongTon: 1, mucTonToiThieu: 5, giaNhapGanNhat: 15000 },
  { ten: 'Phở tươi', donViTinh: 'kg', soLuongTon: 2, mucTonToiThieu: 5, giaNhapGanNhat: 20000 },
];

// ===================== TABLE AREAS & TABLES =====================
const areas = [
  { ten: 'Tầng 1 - Trong nhà' },
  { ten: 'Tầng 1 - Sân vườn' },
  { ten: 'Tầng 2 - VIP' },
  { ten: 'Tầng 3 - Sân thượng' },
];

const tables = [
  // Tầng 1 - Trong nhà
  { ten: 'A01', soGhe: 4, khuVuc: 'Tầng 1 - Trong nhà', trangThai: 'TRONG', posX: 50, posY: 50 },
  { ten: 'A02', soGhe: 4, khuVuc: 'Tầng 1 - Trong nhà', trangThai: 'COKHACH', posX: 150, posY: 50 },
  { ten: 'A03', soGhe: 6, khuVuc: 'Tầng 1 - Trong nhà', trangThai: 'TRONG', posX: 250, posY: 50 },
  { ten: 'A04', soGhe: 4, khuVuc: 'Tầng 1 - Trong nhà', trangThai: 'DADAT', posX: 50, posY: 150 },
  { ten: 'A05', soGhe: 4, khuVuc: 'Tầng 1 - Trong nhà', trangThai: 'TRONG', posX: 150, posY: 150 },
  { ten: 'A06', soGhe: 8, khuVuc: 'Tầng 1 - Trong nhà', trangThai: 'CHOTHANHTOAN', posX: 250, posY: 150 },
  
  // Tầng 1 - Sân vườn
  { ten: 'B01', soGhe: 4, khuVuc: 'Tầng 1 - Sân vườn', trangThai: 'TRONG', posX: 50, posY: 50 },
  { ten: 'B02', soGhe: 4, khuVuc: 'Tầng 1 - Sân vườn', trangThai: 'COKHACH', posX: 150, posY: 50 },
  { ten: 'B03', soGhe: 6, khuVuc: 'Tầng 1 - Sân vườn', trangThai: 'TRONG', posX: 250, posY: 50 },
  { ten: 'B04', soGhe: 4, khuVuc: 'Tầng 1 - Sân vườn', trangThai: 'TRONG', posX: 50, posY: 150 },
  
  // Tầng 2 - VIP
  { ten: 'V01', soGhe: 10, khuVuc: 'Tầng 2 - VIP', trangThai: 'DADAT', posX: 100, posY: 100 },
  { ten: 'V02', soGhe: 12, khuVuc: 'Tầng 2 - VIP', trangThai: 'TRONG', posX: 250, posY: 100 },
  { ten: 'V03', soGhe: 8, khuVuc: 'Tầng 2 - VIP', trangThai: 'TRONG', posX: 175, posY: 200 },
  
  // Tầng 3 - Sân thượng
  { ten: 'T01', soGhe: 4, khuVuc: 'Tầng 3 - Sân thượng', trangThai: 'TRONG', posX: 50, posY: 50 },
  { ten: 'T02', soGhe: 4, khuVuc: 'Tầng 3 - Sân thượng', trangThai: 'COKHACH', posX: 150, posY: 50 },
  { ten: 'T03', soGhe: 6, khuVuc: 'Tầng 3 - Sân thượng', trangThai: 'TRONG', posX: 250, posY: 50 },
];

// ===================== CUSTOMERS =====================
const customers = [
  { hoTen: 'Nguyễn Văn An', soDienThoai: '0912345678', hangThe: 'GOLD', diemTichLuy: 1500 },
  { hoTen: 'Trần Thị Bình', soDienThoai: '0923456789', hangThe: 'SILVER', diemTichLuy: 800 },
  { hoTen: 'Lê Văn Cường', soDienThoai: '0934567890', hangThe: 'BRONZE', diemTichLuy: 300 },
  { hoTen: 'Phạm Thị Dung', soDienThoai: '0945678901', hangThe: 'GOLD', diemTichLuy: 2000 },
  { hoTen: 'Hoàng Văn Em', soDienThoai: '0956789012', hangThe: null, diemTichLuy: 50 },
  { hoTen: 'Vũ Thị Fương', soDienThoai: '0967890123', hangThe: 'SILVER', diemTichLuy: 600 },
  { hoTen: 'Đỗ Văn Giang', soDienThoai: '0978901234', hangThe: null, diemTichLuy: 100 },
  { hoTen: 'Bùi Thị Hà', soDienThoai: '0989012345', hangThe: 'PLATINUM', diemTichLuy: 5000 },
];

// ===================== SUPPLIERS =====================
const suppliers = [
  { ten: 'Công ty Thực phẩm Sạch', dienThoai: '0281234567', diaChi: '123 Nguyễn Văn Linh, Q.7, TP.HCM' },
  { ten: 'Hải sản Biển Đông', dienThoai: '0287654321', diaChi: '456 Lê Văn Việt, Q.9, TP.HCM' },
  { ten: 'Đại lý bia rượu Hoàng Long', dienThoai: '0289876543', diaChi: '789 Võ Văn Kiệt, Q.1, TP.HCM' },
  { ten: 'Rau củ Đà Lạt', dienThoai: '02633456789', diaChi: '321 Trần Hưng Đạo, Đà Lạt' },
  { ten: 'Gia vị Việt', dienThoai: '0282345678', diaChi: '654 Nguyễn Thị Minh Khai, Q.3, TP.HCM' },
];

// ===================== WORK SHIFTS =====================
const shifts = [
  { ten: 'Ca sáng', batDau: '06:00', ketThuc: '14:00' },
  { ten: 'Ca chiều', batDau: '14:00', ketThuc: '22:00' },
  { ten: 'Ca tối', batDau: '18:00', ketThuc: '02:00' },
  { ten: 'Ca full-time', batDau: '09:00', ketThuc: '21:00' },
];

// ===================== DISH OPTIONS =====================
const dishOptions = [
  { ten: 'Thêm cơm', giaThem: 10000 },
  { ten: 'Thêm rau', giaThem: 5000 },
  { ten: 'Không hành', giaThem: 0 },
  { ten: 'Ít cay', giaThem: 0 },
  { ten: 'Cay nhiều', giaThem: 5000 },
  { ten: 'Size lớn', giaThem: 20000 },
  { ten: 'Đá riêng', giaThem: 0 },
  { ten: 'Ít đường', giaThem: 0 },
];

// ===================== SYSTEM CONFIG =====================
const configs = [
  { key: 'RESTAURANT_NAME', value: 'Nhà hàng Phong Vị Việt' },
  { key: 'RESTAURANT_ADDRESS', value: '123 Nguyễn Huệ, Quận 1, TP.HCM' },
  { key: 'RESTAURANT_PHONE', value: '028.1234.5678' },
  { key: 'VAT_RATE', value: '10' },
  { key: 'SERVICE_CHARGE', value: '5' },
  { key: 'POINT_RATE', value: '1000' }, // 1000đ = 1 điểm
  { key: 'POINT_VALUE', value: '100' }, // 1 điểm = 100đ
];

// ===================== MAIN SEED FUNCTION =====================
async function main() {
  console.log('🌱 Starting seed...\n');

  // 1. Permissions & Roles
  console.log('📋 Creating permissions...');
  const permRecords = {};
  for (const p of permissions) {
    permRecords[p] = await prisma.quyen.upsert({
      where: { ma: p },
      update: { moTa: permissionDescriptions[p] || p },
      create: { ma: p, moTa: permissionDescriptions[p] || p },
    });
  }

  console.log('👥 Creating roles...');
  const roleRecords = {};
  for (const [roleName, perms] of Object.entries(roles)) {
    const role = await prisma.vaiTro.upsert({
      where: { ten: roleName },
      update: {},
      create: { ten: roleName },
    });
    roleRecords[roleName] = role;
    for (const perm of perms) {
      await prisma.vaiTroQuyen.upsert({
        where: { vaiTroId_quyenId: { vaiTroId: role.id, quyenId: permRecords[perm].id } },
        update: {},
        create: { vaiTroId: role.id, quyenId: permRecords[perm].id },
      });
    }
  }

  // 2. Users (Employees)
  console.log('👤 Creating users...');
  const userRecords = {};
  for (const u of users) {
    const hash = await bcrypt.hash(u.password, 10);
    const nv = await prisma.nhanVien.upsert({
      where: { soDienThoai: u.soDienThoai },
      update: { hoTen: u.hoTen, vaiTroId: roleRecords[u.role].id },
      create: { hoTen: u.hoTen, soDienThoai: u.soDienThoai, vaiTroId: roleRecords[u.role].id },
    });
    userRecords[u.username] = nv;
    await prisma.taiKhoanNguoiDung.upsert({
      where: { username: u.username },
      update: { passwordHash: hash, nhanVienId: nv.id },
      create: { username: u.username, passwordHash: hash, nhanVienId: nv.id },
    });
  }

  // 3. Menu Categories
  console.log('📂 Creating menu categories...');
  const categoryRecords = {};
  for (const cat of categories) {
    const created = await prisma.danhMucMon.upsert({
      where: { id: cat.ten }, // Use name as pseudo-unique for upsert
      update: { moTa: cat.moTa },
      create: { ten: cat.ten, moTa: cat.moTa },
    });
    // Actually need to find or create
    const found = await prisma.danhMucMon.findFirst({ where: { ten: cat.ten } });
    if (!found) {
      categoryRecords[cat.ten] = await prisma.danhMucMon.create({ data: { ten: cat.ten, moTa: cat.moTa } });
    } else {
      categoryRecords[cat.ten] = found;
    }
  }

  // 4. Dishes
  console.log('🍽️ Creating dishes...');
  const dishRecords = {};
  for (const dish of dishes) {
    const found = await prisma.monAn.findFirst({ where: { ten: dish.ten } });
    if (!found) {
      dishRecords[dish.ten] = await prisma.monAn.create({
        data: {
          ten: dish.ten,
          moTa: dish.moTa,
          giaBan: dish.giaBan,
          hinhAnh: dish.hinhAnh,
          trangThai: true,
          tramCheBien: dish.tramCheBien,
          danhMucId: categoryRecords[dish.danhMuc]?.id,
        },
      });
    } else {
      // Cập nhật hình ảnh cho món đã tồn tại
      dishRecords[dish.ten] = await prisma.monAn.update({
        where: { id: found.id },
        data: {
          hinhAnh: dish.hinhAnh,
          moTa: dish.moTa,
          giaBan: dish.giaBan,
          tramCheBien: dish.tramCheBien,
          danhMucId: categoryRecords[dish.danhMuc]?.id,
        },
      });
    }
  }

  // 5. Materials
  console.log('📦 Creating materials...');
  const materialRecords = {};
  for (const mat of materials) {
    const found = await prisma.nguyenVatLieu.findFirst({ where: { ten: mat.ten } });
    if (!found) {
      materialRecords[mat.ten] = await prisma.nguyenVatLieu.create({
        data: {
          ten: mat.ten,
          donViTinh: mat.donViTinh,
          soLuongTon: mat.soLuongTon,
          mucTonToiThieu: mat.mucTonToiThieu,
          giaNhapGanNhat: mat.giaNhapGanNhat,
        },
      });
    } else {
      materialRecords[mat.ten] = found;
    }
  }

  // 6. Table Areas
  console.log('🏠 Creating table areas...');
  const areaRecords = {};
  for (const area of areas) {
    const found = await prisma.khuVucBan.findFirst({ where: { ten: area.ten } });
    if (!found) {
      areaRecords[area.ten] = await prisma.khuVucBan.create({ data: { ten: area.ten } });
    } else {
      areaRecords[area.ten] = found;
    }
  }

  // 7. Tables
  console.log('🪑 Creating tables...');
  for (const table of tables) {
    const found = await prisma.ban.findFirst({ where: { ten: table.ten } });
    if (!found) {
      await prisma.ban.create({
        data: {
          ten: table.ten,
          trangThai: table.trangThai,
          khuVucId: areaRecords[table.khuVuc]?.id,
          posX: table.posX,
          posY: table.posY,
          shape: 'circle',
        },
      });
    }
  }

  // 8. Customers
  console.log('👨‍👩‍👧‍👦 Creating customers...');
  const customerRecords = {};
  for (const cust of customers) {
    const found = await prisma.khachHang.findFirst({ where: { soDienThoai: cust.soDienThoai } });
    if (!found) {
      customerRecords[cust.soDienThoai] = await prisma.khachHang.create({
        data: {
          hoTen: cust.hoTen,
          soDienThoai: cust.soDienThoai,
          hangThe: cust.hangThe,
          diemTichLuy: cust.diemTichLuy,
        },
      });
    } else {
      customerRecords[cust.soDienThoai] = found;
    }
  }

  // 9. Suppliers
  console.log('🏭 Creating suppliers...');
  const supplierRecords = {};
  for (const sup of suppliers) {
    const found = await prisma.nhaCungCap.findFirst({ where: { ten: sup.ten } });
    if (!found) {
      supplierRecords[sup.ten] = await prisma.nhaCungCap.create({
        data: {
          ten: sup.ten,
          dienThoai: sup.dienThoai,
          diaChi: sup.diaChi,
        },
      });
    } else {
      supplierRecords[sup.ten] = found;
    }
  }

  // 10. Work Shifts
  console.log('⏰ Creating work shifts...');
  const shiftRecords = {};
  for (const shift of shifts) {
    const found = await prisma.caLamViec.findFirst({ where: { ten: shift.ten } });
    if (!found) {
      shiftRecords[shift.ten] = await prisma.caLamViec.create({
        data: {
          ten: shift.ten,
          batDau: shift.batDau,
          ketThuc: shift.ketThuc,
        },
      });
    } else {
      shiftRecords[shift.ten] = found;
    }
  }

  // 11. Dish Options
  console.log('🔧 Creating dish options...');
  for (const opt of dishOptions) {
    const found = await prisma.tuyChonMon.findFirst({ where: { ten: opt.ten } });
    if (!found) {
      await prisma.tuyChonMon.create({
        data: {
          ten: opt.ten,
          giaThem: opt.giaThem,
        },
      });
    }
  }

  // 12. System Config
  console.log('⚙️ Creating system config...');
  for (const cfg of configs) {
    await prisma.cauHinhHeThong.upsert({
      where: { key: cfg.key },
      update: { value: cfg.value },
      create: { key: cfg.key, value: cfg.value },
    });
  }

  // 13. Create sample reservations for today and tomorrow
  console.log('📅 Creating sample reservations...');
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const allTables = await prisma.ban.findMany();
  const allCustomers = await prisma.khachHang.findMany();
  
  if (allCustomers.length > 0 && allTables.length > 0) {
    const reservations = [
      { khachHangId: allCustomers[0].id, banId: allTables[0].id, soKhach: 4, thoiGianDen: new Date(today.setHours(12, 0, 0, 0)), ghiChu: 'Sinh nhật', trangThai: 'CHODEN' },
      { khachHangId: allCustomers[1].id, banId: allTables[1].id, soKhach: 6, thoiGianDen: new Date(today.setHours(18, 30, 0, 0)), ghiChu: 'Họp công ty', trangThai: 'CHODEN' },
      { khachHangId: allCustomers[2].id, banId: allTables[2].id, soKhach: 2, thoiGianDen: new Date(tomorrow.setHours(19, 0, 0, 0)), ghiChu: 'Kỷ niệm ngày cưới', trangThai: 'CHODEN' },
    ];
    
    for (const res of reservations) {
      const exists = await prisma.datBan.findFirst({
        where: {
          khachHangId: res.khachHangId,
          thoiGianDen: res.thoiGianDen,
        },
      });
      if (!exists) {
        await prisma.datBan.create({ data: res });
      }
    }
  }

  // 14. Create sample orders with items (for testing KDS and billing)
  console.log('🧾 Creating sample orders...');
  const occupiedTables = await prisma.ban.findMany({ where: { trangThai: 'COKHACH' } });
  const allDishes = await prisma.monAn.findMany({ take: 10 });
  
  for (const table of occupiedTables) {
    const existingOrder = await prisma.donHang.findFirst({ where: { banId: table.id, trangThai: 'open' } });
    if (!existingOrder && allDishes.length > 0) {
      const order = await prisma.donHang.create({
        data: {
          banId: table.id,
          nhanVienId: userRecords['waiter1']?.id,
          trangThai: 'open',
        },
      });
      
      // Add 2-4 random dishes to order
      const numItems = Math.floor(Math.random() * 3) + 2;
      const selectedDishes = allDishes.sort(() => 0.5 - Math.random()).slice(0, numItems);
      
      for (const dish of selectedDishes) {
        await prisma.chiTietDonHang.create({
          data: {
            donHangId: order.id,
            monAnId: dish.id,
            soLuong: Math.floor(Math.random() * 3) + 1,
            donGia: dish.giaBan,
            trangThai: ['CHOCHEBIEN', 'DANGLAM', 'HOANTHANH'][Math.floor(Math.random() * 3)],
          },
        });
      }
    }
  }

  console.log('\n✅ Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - ${users.length} users`);
  console.log(`   - ${categories.length} menu categories`);
  console.log(`   - ${dishes.length} dishes`);
  console.log(`   - ${materials.length} materials`);
  console.log(`   - ${tables.length} tables in ${areas.length} areas`);
  console.log(`   - ${customers.length} customers`);
  console.log(`   - ${suppliers.length} suppliers`);
  console.log(`   - ${shifts.length} work shifts`);
  console.log('\n🔐 Test accounts:');
  console.log('   admin/admin123 (Admin)');
  console.log('   manager/manager123 (Manager)');
  console.log('   cashier/cashier123 (ThuNgan)');
  console.log('   waiter1/waiter123 (PhucVu)');
  console.log('   chef1/chef123 (Bep)');
  console.log('   stock/stock123 (ThuKho)');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
