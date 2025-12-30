const bcrypt = require('bcryptjs');
const { prisma } = require('../src/config/db');
const billingService = require('../src/services/billing.service');

describe('Billing service - mergeInvoices and ZReport', () => {
  test('mergeInvoices should combine invoices from same table', async () => {
    // Create a table
    const ban = await prisma.ban.create({ data: { ten: 'Test Table 1' } });

    // Create two orders with items
    const order1 = await prisma.donHang.create({ data: { banId: ban.id, nhanVienId: null, trangThai: 'open' } });
    const order2 = await prisma.donHang.create({ data: { banId: ban.id, nhanVienId: null, trangThai: 'open' } });

    await prisma.chiTietDonHang.createMany({ data: [
      { donHangId: order1.id, monAnId: null, soLuong: 1, donGia: 10000, trangThai: 'OPEN' },
      { donHangId: order2.id, monAnId: null, soLuong: 2, donGia: 20000, trangThai: 'OPEN' },
    ]});

    const invoice1 = await prisma.hoaDon.create({ data: { donHangId: order1.id, tongTienHang: 10000, giamGia: 0, thueVAT: 0, tongThanhToan: 10000, trangThai: 'OPEN' } });
    const invoice2 = await prisma.hoaDon.create({ data: { donHangId: order2.id, tongTienHang: 40000, giamGia: 0, thueVAT: 0, tongThanhToan: 40000, trangThai: 'OPEN' } });

    const result = await billingService.mergeInvoices([invoice1.id, invoice2.id], { id: null });
    expect(result).toHaveProperty('message', 'Gộp hóa đơn thành công');
    expect(result.invoice).toBeDefined();
    expect(Number(result.invoice.tongThanhToan)).toBe(50000);

    // ensure old invoices removed
    const old1 = await prisma.hoaDon.findUnique({ where: { id: invoice1.id } });
    const old2 = await prisma.hoaDon.findUnique({ where: { id: invoice2.id } });
    expect(old1).toBeNull();
    expect(old2).toBeNull();

    // new order should contain 3 items total
    const newOrder = await prisma.donHang.findUnique({ where: { id: result.invoice.donHangId }, include: { chiTiet: true } });
    expect(newOrder.chiTiet.length).toBe(2);
  });

  test('closeShift should persist ZReport', async () => {
    // create a test cashier
    const role = await prisma.vaiTro.findFirst({ where: { ten: 'ThuNgan' } });
    const nv = await prisma.nhanVien.create({ data: { hoTen: 'Test Cashier', soDienThoai: 'test-cashier', vaiTroId: role ? role.id : null } });
    const hash = await bcrypt.hash('pass', 1);
    await prisma.taiKhoanNguoiDung.create({ data: { username: 'test-cashier', passwordHash: hash, nhanVienId: nv.id } });

    const shift = await prisma.caThuNgan.create({ data: { nhanVienId: nv.id, thoiGianMo: new Date(Date.now() - 1000 * 60 * 60), tienMatDauCa: 100000, trangThai: 'HOATDONG' } });

    // create some payments within shift
    await prisma.thanhToan.create({ data: { hoaDonId: prisma.hoaDon.create({ data: { donHangId: (await prisma.donHang.create({ data: { banId: null, trangThai: 'open' } })).id, tongTienHang: 50000, giamGia: 0, thueVAT: 0, tongThanhToan: 50000, trangThai: 'OPEN' } }).then(r => r.id), phuongThuc: 'TienMat', soTien: 50000 } });

    const res = await billingService.closeShift({ id: nv.id }, shift.id, { actualCash: 150000 });
    expect(res).toHaveProperty('shift');
    expect(res).toHaveProperty('summary');
    expect(res).toHaveProperty('expectedCash');
    expect(res).toHaveProperty('variance');

    const stored = await prisma.zReport.findUnique({ where: { shiftId: shift.id } });
    expect(stored).toBeDefined();
    expect(Number(stored.expectedCash)).toBeGreaterThanOrEqual(0);
  });
});
