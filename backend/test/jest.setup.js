// Basic test env setup
process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'test-access-secret';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test-refresh-secret';
process.env.BCRYPT_SALT_ROUNDS = '1'; // speed up tests

const { prisma } = require('../src/config/db');

// Utility to clean test data after each test run
afterEach(async () => {
  // Keep migrations/schema, but try to remove created test data where possible
  // Caution: Only remove records that are safe to delete in test environment
  await prisma.zReport.deleteMany().catch(() => {});
  await prisma.hoaDon.deleteMany().catch(() => {});
  await prisma.thanhToan.deleteMany().catch(() => {});
  await prisma.chiTietDonHang.deleteMany().catch(() => {});
  await prisma.donHang.deleteMany().catch(() => {});
  await prisma.caThuNgan.deleteMany().catch(() => {});
  await prisma.taiKhoanNguoiDung.deleteMany({ where: { username: { contains: 'test-' } } }).catch(() => {});
  await prisma.nhanVien.deleteMany({ where: { hoTen: { contains: 'Test' } } }).catch(() => {});
});

afterAll(async () => {
  await prisma.$disconnect();
});
