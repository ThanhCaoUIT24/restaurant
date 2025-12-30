const { prisma } = require('../config/db');

const list = async (query) => {
  const items = await prisma.donMuaHang.findMany({
    include: {
      nhaCungCap: true,
      chiTiet: { include: { nguyenVatLieu: true } },
      phieuNhap: true,
    },
    orderBy: { createdAt: 'desc' },
  });
  return { items, query };
};

const create = async (payload) => {
  const { nhaCungCapId, items } = payload;

  // Validate non-negative values
  if (items?.some(i => Number(i.soLuong) < 0 || Number(i.donGia) < 0)) {
    throw Object.assign(new Error('Số lượng và đơn giá không được âm'), { status: 400 });
  }

  return prisma.$transaction(async (tx) => {
    const po = await tx.donMuaHang.create({
      data: {
        nhaCungCapId,
        trangThai: 'MOITAO',
      },
    });
    if (items?.length) {
      await tx.chiTietDonMuaHang.createMany({
        data: items.map((i) => ({
          donMuaHangId: po.id,
          nguyenVatLieuId: i.nguyenVatLieuId,
          soLuong: Math.max(0, Number(i.soLuong)),
          donGia: Math.max(0, Number(i.donGia)),
        })),
      });
    }
    const full = await tx.donMuaHang.findUnique({
      where: { id: po.id },
      include: { chiTiet: true },
    });
    return full;
  });
};

const updateStatus = async (id, status) => {
  const po = await prisma.donMuaHang.update({ where: { id }, data: { trangThai: status } });
  return po;
};

const createReceipt = async (payload) => {
  const { donMuaHangId, nhanVienId = null, items } = payload;

  // Validate non-negative values
  if (items?.some(i => Number(i.soLuong) < 0 || Number(i.donGia) < 0)) {
    throw Object.assign(new Error('Số lượng và đơn giá không được âm'), { status: 400 });
  }

  return prisma.$transaction(async (tx) => {
    // 1. Fetch PO lines to compare quantities
    let poLines = [];
    if (donMuaHangId) {
      poLines = await tx.chiTietDonMuaHang.findMany({ where: { donMuaHangId } });
    }

    const receipt = await tx.phieuNhapKho.create({
      data: {
        donMuaHangId,
        nhanVienId,
      },
    });

    for (const item of items) {
      const soLuong = Math.max(0, Number(item.soLuong));
      const donGia = Math.max(0, Number(item.donGia));

      await tx.chiTietNhapKho.create({
        data: {
          phieuNhapKhoId: receipt.id,
          nguyenVatLieuId: item.nguyenVatLieuId,
          soLuong,
          donGia,
        },
      });

      const current = await tx.nguyenVatLieu.findUnique({ where: { id: item.nguyenVatLieuId } });
      await tx.nguyenVatLieu.update({
        where: { id: item.nguyenVatLieuId },
        data: {
          soLuongTon: Number(current.soLuongTon) + soLuong,
          giaNhapGanNhat: donGia,
        },
      });

      // Calculate discrepancy
      let note = donMuaHangId ? `Nhập từ đơn mua hàng #${donMuaHangId.slice(0, 8)}` : 'Nhập kho từ phiếu nhập';

      if (donMuaHangId) {
        const poLine = poLines.find(l => l.nguyenVatLieuId === item.nguyenVatLieuId);
        if (poLine) {
          const ordered = Number(poLine.soLuong);
          const diff = soLuong - ordered;
          if (diff !== 0) {
            const sign = diff > 0 ? '+' : '';
            note += ` (Lệch: ${sign}${diff} ${current.donViTinh})`;
          }
        }
      }

      // Log to inventory adjustment history (NhatKyXuatKho)
      await tx.nhatKyXuatKho.create({
        data: {
          loai: 'NHAPKHO',
          nguyenVatLieuId: item.nguyenVatLieuId,
          soLuong,
          ghiChu: note,
        },
      });
    }

    // Update PO status
    if (donMuaHangId) {
      const received = await tx.chiTietNhapKho.findMany({
        where: { phieuNhapKho: { donMuaHangId } },
      });
      const receivedMap = new Map();
      received.forEach((r) => {
        const total = receivedMap.get(r.nguyenVatLieuId) || 0;
        receivedMap.set(r.nguyenVatLieuId, total + Number(r.soLuong));
      });
      let full = true;
      poLines.forEach((l) => {
        const rec = receivedMap.get(l.nguyenVatLieuId) || 0;
        if (rec < Number(l.soLuong)) full = false;
      });
      await tx.donMuaHang.update({
        where: { id: donMuaHangId },
        data: { trangThai: full ? 'DANHANDU' : 'DANHANMOTPHAN' },
      });
    }

    return { message: 'Phiếu nhập tạo thành công', receiptId: receipt.id };
  });
};

const listSuppliers = async () => {
  const items = await prisma.nhaCungCap.findMany({ orderBy: { ten: 'asc' } });
  // Frontend Suppliers page expects richer fields (soDienThoai, maNCC, ...)
  // Our current schema only stores ten/dienThoai/diaChi; return a compatible shape.
  return {
    items: items.map((s) => ({
      id: s.id,
      ten: s.ten,
      dienThoai: s.dienThoai || null,
      soDienThoai: s.dienThoai || null,
      diaChi: s.diaChi || null,
      maNCC: null,
      nguoiLienHe: null,
      email: null,
      ghiChu: null,
      trangThai: 'active',
    })),
  };
};

const createSupplier = async (payload) => {
  const ten = (payload?.ten || '').trim();
  const dienThoai = (payload?.dienThoai || payload?.soDienThoai || '').trim() || null;
  const diaChi = (payload?.diaChi || '').trim() || null;
  if (!ten) throw Object.assign(new Error('Thiếu tên nhà cung cấp'), { status: 400 });

  const created = await prisma.nhaCungCap.create({
    data: { ten, dienThoai, diaChi },
  });

  return {
    supplier: {
      id: created.id,
      ten: created.ten,
      dienThoai: created.dienThoai || null,
      soDienThoai: created.dienThoai || null,
      diaChi: created.diaChi || null,
      maNCC: null,
      nguoiLienHe: null,
      email: null,
      ghiChu: null,
      trangThai: 'active',
    },
  };
};

const updateSupplier = async (id, payload) => {
  const ten = payload?.ten != null ? String(payload.ten).trim() : undefined;
  const dienThoai = payload?.dienThoai != null || payload?.soDienThoai != null
    ? String(payload?.dienThoai || payload?.soDienThoai || '').trim() || null
    : undefined;
  const diaChi = payload?.diaChi != null ? String(payload.diaChi).trim() || null : undefined;

  const data = {};
  if (ten !== undefined) data.ten = ten;
  if (dienThoai !== undefined) data.dienThoai = dienThoai;
  if (diaChi !== undefined) data.diaChi = diaChi;
  if (Object.keys(data).length === 0) throw Object.assign(new Error('Không có dữ liệu cập nhật'), { status: 400 });
  if (data.ten !== undefined && !data.ten) throw Object.assign(new Error('Tên nhà cung cấp không hợp lệ'), { status: 400 });

  const updated = await prisma.nhaCungCap.update({ where: { id }, data });
  return {
    supplier: {
      id: updated.id,
      ten: updated.ten,
      dienThoai: updated.dienThoai || null,
      soDienThoai: updated.dienThoai || null,
      diaChi: updated.diaChi || null,
      maNCC: null,
      nguoiLienHe: null,
      email: null,
      ghiChu: null,
      trangThai: 'active',
    },
  };
};

const deleteSupplier = async (id) => {
  const poCount = await prisma.donMuaHang.count({ where: { nhaCungCapId: id } });
  if (poCount > 0) {
    throw Object.assign(new Error('Không thể xoá nhà cung cấp đã có đơn mua hàng'), { status: 400 });
  }
  await prisma.nhaCungCap.delete({ where: { id } });
  return { message: 'Đã xoá nhà cung cấp' };
};

module.exports = {
  list,
  create,
  updateStatus,
  createReceipt,
  listSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
};
