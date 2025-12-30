/* Seed roles, permissions, and demo users. */
const bcrypt = require('bcryptjs');
const { prisma } = require('../src/config/db');

const permissions = [
  'VOID_ITEM',           // Hủy món
  'DISCOUNT',            // Giảm giá
  'PAYMENT_EXECUTE',     // Thanh toán
  'INVENTORY_ADJUST',    // Điều chỉnh kho
  'PURCHASE_APPROVE',    // Duyệt đơn mua hàng
  'REPORT_VIEW',         // Xem báo cáo
  'ADMIN_MANAGE',        // Quản trị hệ thống
  'MENU_MANAGE',         // Quản lý thực đơn
  'TABLE_MANAGE',        // Quản lý bàn/khu vực  
  'HR_MANAGE',           // Quản lý nhân sự
  'ORDER_CREATE',        // Tạo/sửa order (Phục vụ)
  'KDS_VIEW',            // Truy cập bếp (KDS)
];

const roles = {
  Admin: permissions,  // Admin có tất cả quyền
  Manager: [
    'VOID_ITEM', 'DISCOUNT', 'PAYMENT_EXECUTE', 'REPORT_VIEW', 
    'PURCHASE_APPROVE', 'MENU_MANAGE', 'TABLE_MANAGE', 'HR_MANAGE',
    'ORDER_CREATE', 'KDS_VIEW', 'INVENTORY_ADJUST'
  ],
  ThuNgan: ['PAYMENT_EXECUTE'],  // Thu ngân chỉ thanh toán
  PhucVu: ['ORDER_CREATE'],      // Phục vụ chỉ gọi món
  Bep: ['KDS_VIEW'],           // Bếp chỉ xem KDS
  ThuKho: ['INVENTORY_ADJUST', 'PURCHASE_APPROVE'],  // Thủ kho quản lý kho + mua hàng
};

const users = [
  { username: 'admin', password: 'admin123', role: 'Admin', hoTen: 'Admin User' },
  { username: 'manager', password: 'manager123', role: 'Manager', hoTen: 'Manager User' },
  { username: 'cashier', password: 'cashier123', role: 'ThuNgan', hoTen: 'Cashier User' },
  { username: 'waiter', password: 'waiter123', role: 'PhucVu', hoTen: 'Waiter User' },
  { username: 'chef', password: 'chef123', role: 'Bep', hoTen: 'Chef User' },
  { username: 'stock', password: 'stock123', role: 'ThuKho', hoTen: 'Stock User' },
];

async function main() {
  const permRecords = {};
  for (const p of permissions) {
    permRecords[p] = await prisma.quyen.upsert({
      where: { ma: p },
      update: {},
      create: { ma: p, moTa: p },
    });
  }

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

  for (const u of users) {
    const hash = await bcrypt.hash(u.password, 10);
    const nv = await prisma.nhanVien.upsert({
      where: { soDienThoai: u.username },
      update: { hoTen: u.hoTen, vaiTroId: roleRecords[u.role].id },
      create: { hoTen: u.hoTen, soDienThoai: u.username, vaiTroId: roleRecords[u.role].id },
    });
    await prisma.taiKhoanNguoiDung.upsert({
      where: { username: u.username },
      update: { passwordHash: hash, nhanVienId: nv.id },
      create: { username: u.username, passwordHash: hash, nhanVienId: nv.id },
    });
  }

  // ==================== SYSTEM CONFIGS ====================
  const defaultConfigs = [
    { key: 'VAT_RATE', value: '10' },                    // Thuế VAT 10%
    { key: 'LOYALTY_EARN_RATE', value: '10000' },        // 10,000đ = 1 điểm
    { key: 'LOYALTY_REDEEM_RATE', value: '1000' },       // 1 điểm = 1,000đ
    { key: 'RESTAURANT_NAME', value: 'Nhà Hàng Demo' },
    { key: 'RESTAURANT_ADDRESS', value: '123 Đường ABC, Quận 1, TP.HCM' },
    { key: 'RESTAURANT_PHONE', value: '0901234567' },
  ];

  for (const cfg of defaultConfigs) {
    await prisma.cauHinhHeThong.upsert({
      where: { key: cfg.key },
      update: {},
      create: cfg,
    });
  }

  // ==================== LOYALTY TIERS ====================
  const loyaltyTiers = [
    { ten: 'Thành viên', mucTichDiem: 10000, tyLeQuyDoi: 1000, diemToiThieu: 0 },
    { ten: 'Bạc', mucTichDiem: 10000, tyLeQuyDoi: 1200, diemToiThieu: 100 },
    { ten: 'Vàng', mucTichDiem: 8000, tyLeQuyDoi: 1500, diemToiThieu: 500 },
    { ten: 'Kim cương', mucTichDiem: 5000, tyLeQuyDoi: 2000, diemToiThieu: 1000 },
  ];

  for (const tier of loyaltyTiers) {
    await prisma.hangThanhVien.upsert({
      where: { ten: tier.ten },
      update: { mucTichDiem: tier.mucTichDiem, tyLeQuyDoi: tier.tyLeQuyDoi, diemToiThieu: tier.diemToiThieu },
      create: tier,
    });
  }

  console.log('Seed completed');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
