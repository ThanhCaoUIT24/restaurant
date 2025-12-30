const request = require('supertest');
const app = require('../src/app');
const { prisma } = require('../src/config/db');
const bcrypt = require('bcryptjs');

let token = null;

beforeAll(async () => {
  // create a cashier user for testing
  const role = await prisma.vaiTro.findFirst({ where: { ten: 'ThuNgan' } });
  const nv = await prisma.nhanVien.create({ data: { hoTen: 'Test Cashier 2', soDienThoai: 'test-cashier2', vaiTroId: role ? role.id : null } });
  const hash = await bcrypt.hash('testpass', 1);
  await prisma.taiKhoanNguoiDung.create({ data: { username: 'test-cashier2', passwordHash: hash, nhanVienId: nv.id } });

  // login
  const res = await request(app).post('/api/auth/login').send({ username: 'test-cashier2', password: 'testpass' });
  expect(res.status).toBe(200);
  token = res.body.accessToken;
});

afterAll(async () => {
  await prisma.$disconnect();
});

test('POST /api/billing/invoices/merge should merge invoices (integration)', async () => {
  // create a table and two orders/invoices
  const ban = await prisma.ban.create({ data: { ten: 'Integration Table' } });
  const order1 = await prisma.donHang.create({ data: { banId: ban.id, nhanVienId: null, trangThai: 'open' } });
  const order2 = await prisma.donHang.create({ data: { banId: ban.id, nhanVienId: null, trangThai: 'open' } });
  await prisma.chiTietDonHang.createMany({ data: [
    { donHangId: order1.id, monAnId: null, soLuong: 1, donGia: 10000, trangThai: 'OPEN' },
    { donHangId: order2.id, monAnId: null, soLuong: 2, donGia: 20000, trangThai: 'OPEN' },
  ]});
  const invoice1 = await prisma.hoaDon.create({ data: { donHangId: order1.id, tongTienHang: 10000, giamGia: 0, thueVAT: 0, tongThanhToan: 10000, trangThai: 'OPEN' } });
  const invoice2 = await prisma.hoaDon.create({ data: { donHangId: order2.id, tongTienHang: 40000, giamGia: 0, thueVAT: 0, tongThanhToan: 40000, trangThai: 'OPEN' } });

  const res = await request(app)
    .post('/api/billing/invoices/merge')
    .set('Authorization', `Bearer ${token}`)
    .send({ invoiceIds: [invoice1.id, invoice2.id] });

  expect(res.status).toBe(201);
  expect(res.body).toHaveProperty('invoice');
  expect(Number(res.body.invoice.tongThanhToan)).toBe(50000);
});

test('POST /api/billing/invoices/merge should fail when invoices belong to different tables', async () => {
  const tableA = await prisma.ban.create({ data: { ten: 'Table A' } });
  const tableB = await prisma.ban.create({ data: { ten: 'Table B' } });
  const o1 = await prisma.donHang.create({ data: { banId: tableA.id, trangThai: 'open' } });
  const o2 = await prisma.donHang.create({ data: { banId: tableB.id, trangThai: 'open' } });
  const i1 = await prisma.hoaDon.create({ data: { donHangId: o1.id, tongTienHang: 10000, giamGia: 0, thueVAT: 0, tongThanhToan: 10000, trangThai: 'OPEN' } });
  const i2 = await prisma.hoaDon.create({ data: { donHangId: o2.id, tongTienHang: 20000, giamGia: 0, thueVAT: 0, tongThanhToan: 20000, trangThai: 'OPEN' } });

  const res = await request(app)
    .post('/api/billing/invoices/merge')
    .set('Authorization', `Bearer ${token}`)
    .send({ invoiceIds: [i1.id, i2.id] });

  expect(res.status).toBe(400);
  expect(res.body.message).toMatch(/Cùng 1 bàn|Chỉ có thể gộp/);
});

test('POST /api/billing/invoices/merge should fail when an invoice is PAID', async () => {
  const table = await prisma.ban.create({ data: { ten: 'Table C' } });
  const o1 = await prisma.donHang.create({ data: { banId: table.id, trangThai: 'open' } });
  const o2 = await prisma.donHang.create({ data: { banId: table.id, trangThai: 'open' } });
  const i1 = await prisma.hoaDon.create({ data: { donHangId: o1.id, tongTienHang: 10000, giamGia: 0, thueVAT: 0, tongThanhToan: 10000, trangThai: 'PAID' } });
  const i2 = await prisma.hoaDon.create({ data: { donHangId: o2.id, tongTienHang: 20000, giamGia: 0, thueVAT: 0, tongThanhToan: 20000, trangThai: 'OPEN' } });

  const res = await request(app)
    .post('/api/billing/invoices/merge')
    .set('Authorization', `Bearer ${token}`)
    .send({ invoiceIds: [i1.id, i2.id] });

  expect(res.status).toBe(400);
  expect(res.body.message).toMatch(/gộp hóa đơn đã thanh toán|Không thể gộp/);
});
