const { prisma } = require('../config/db');
const { sendLowStockAlert } = require('./email.service');

const parseOrderIdFromNote = (note) => {
  if (!note) return null;
  const m = String(note).match(/Auto deduct for order\s+([0-9a-fA-F-]{36})/);
  return m?.[1] || null;
};

// ==================== MATERIALS ====================

const listMaterials = async () => {
  const items = await prisma.nguyenVatLieu.findMany({
    orderBy: { ten: 'asc' },
    include: { nhaCungCap: true },
  });
  return {
    items: items.map((m) => ({
      id: m.id,
      ten: m.ten,
      donViTinh: m.donViTinh,
      soLuongTon: Number(m.soLuongTon),
      // Frontend expects these names
      mucToiThieu: Number(m.mucTonToiThieu),
      giaNhap: m.giaNhapGanNhat ? Number(m.giaNhapGanNhat) : 0,
      // Keep legacy names for backwards compatibility
      mucTonToiThieu: Number(m.mucTonToiThieu),
      giaNhapGanNhat: m.giaNhapGanNhat ? Number(m.giaNhapGanNhat) : null,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
      nhaCungCapId: m.nhaCungCapId,
      nhaCungCap: m.nhaCungCap,
    })),
  };
};

const getMaterial = async (id) => {
  const mat = await prisma.nguyenVatLieu.findUnique({
    where: { id },
    include: { nhaCungCap: true },
  });
  if (!mat) throw Object.assign(new Error('Nguyên vật liệu không tồn tại'), { status: 404 });
  return {
    id: mat.id,
    ten: mat.ten,
    donViTinh: mat.donViTinh,
    soLuongTon: Number(mat.soLuongTon),
    mucToiThieu: Number(mat.mucTonToiThieu),
    giaNhap: mat.giaNhapGanNhat ? Number(mat.giaNhapGanNhat) : 0,
    createdAt: mat.createdAt,
    updatedAt: mat.updatedAt,
    nhaCungCapId: mat.nhaCungCapId,
    nhaCungCap: mat.nhaCungCap,
  };
};

const createMaterial = async (payload) => {
  const {
    ten,
    donViTinh,
    soLuongTon = 0,
    mucTonToiThieu,
    mucToiThieu,
    giaNhapGanNhat,
    giaNhap,
    nhaCungCapId,
  } = payload;
  if (!ten || !donViTinh) {
    throw Object.assign(new Error('Thiếu thông tin nguyên vật liệu'), { status: 400 });
  }

  const minStock = mucTonToiThieu !== undefined ? mucTonToiThieu : (mucToiThieu !== undefined ? mucToiThieu : 0);
  const unitPrice = giaNhapGanNhat !== undefined ? giaNhapGanNhat : (giaNhap !== undefined ? giaNhap : null);

  // Validate non-negative values
  if (Number(soLuongTon) < 0 || Number(minStock) < 0 || (unitPrice !== null && Number(unitPrice) < 0)) {
    throw Object.assign(new Error('Các giá trị số không được âm'), { status: 400 });
  }

  const mat = await prisma.nguyenVatLieu.create({
    data: {
      ten,
      donViTinh,
      soLuongTon: Math.max(0, Number(soLuongTon)),
      mucTonToiThieu: Math.max(0, Number(minStock)),
      giaNhapGanNhat: unitPrice !== null ? Math.max(0, Number(unitPrice)) : null,
      nhaCungCapId: nhaCungCapId || null,
    },
    include: { nhaCungCap: true },
  });
  return { message: 'Tạo nguyên vật liệu thành công', material: mat };
};

const updateMaterial = async (id, payload) => {
  const { ten, donViTinh, soLuongTon, mucTonToiThieu, mucToiThieu, giaNhapGanNhat, giaNhap, nhaCungCapId } = payload;
  const existing = await prisma.nguyenVatLieu.findUnique({ where: { id } });
  if (!existing) throw Object.assign(new Error('Nguyên vật liệu không tồn tại'), { status: 404 });

  const minStock = mucTonToiThieu !== undefined ? mucTonToiThieu : mucToiThieu;
  const unitPrice = giaNhapGanNhat !== undefined ? giaNhapGanNhat : giaNhap;
  // Convert empty string to null for foreign key
  const supplierId = nhaCungCapId === '' ? null : nhaCungCapId;

  // Validate non-negative values
  if ((soLuongTon !== undefined && Number(soLuongTon) < 0) ||
    (minStock !== undefined && Number(minStock) < 0) ||
    (unitPrice !== undefined && Number(unitPrice) < 0)) {
    throw Object.assign(new Error('Các giá trị số không được âm'), { status: 400 });
  }

  const mat = await prisma.nguyenVatLieu.update({
    where: { id },
    data: {
      ...(ten && { ten }),
      ...(donViTinh && { donViTinh }),
      ...(soLuongTon !== undefined && { soLuongTon: Math.max(0, Number(soLuongTon)) }),
      ...(minStock !== undefined && { mucTonToiThieu: Math.max(0, Number(minStock)) }),
      ...(unitPrice !== undefined && { giaNhapGanNhat: Math.max(0, Number(unitPrice)) }),
      ...(supplierId !== undefined && { nhaCungCapId: supplierId }),
    },
    include: { nhaCungCap: true },
  });
  return { message: 'Cập nhật nguyên vật liệu thành công', material: mat };
};

const deleteMaterial = async (id) => {
  // Check if material exists
  const material = await prisma.nguyenVatLieu.findUnique({ where: { id } });
  if (!material) {
    throw Object.assign(new Error('Nguyên vật liệu không tồn tại'), { status: 404 });
  }

  // Check if used in recipes
  const recipeCount = await prisma.congThucMon.count({ where: { nguyenVatLieuId: id } });
  if (recipeCount > 0) {
    throw Object.assign(new Error('Không thể xóa nguyên vật liệu đang sử dụng trong công thức'), { status: 400 });
  }

  // Check if used in purchase order details
  const poDetailCount = await prisma.chiTietDonMuaHang.count({ where: { nguyenVatLieuId: id } });
  if (poDetailCount > 0) {
    throw Object.assign(new Error('Không thể xóa nguyên vật liệu có trong đơn mua hàng'), { status: 400 });
  }

  // Check if used in import receipt details
  const importCount = await prisma.chiTietNhapKho.count({ where: { nguyenVatLieuId: id } });
  if (importCount > 0) {
    throw Object.assign(new Error('Không thể xóa nguyên vật liệu có trong phiếu nhập kho'), { status: 400 });
  }

  // Check if has stock adjustment logs
  const adjustmentCount = await prisma.nhatKyXuatKho.count({ where: { nguyenVatLieuId: id } });
  if (adjustmentCount > 0) {
    throw Object.assign(new Error('Không thể xóa nguyên vật liệu có lịch sử điều chỉnh kho'), { status: 400 });
  }

  await prisma.nguyenVatLieu.delete({ where: { id } });
  return { message: 'Xóa nguyên vật liệu thành công' };
};

// ==================== ALERTS ====================

const listAlerts = async () => {
  const all = await prisma.nguyenVatLieu.findMany({
    include: { nhaCungCap: true },
  });
  const alerts = all.filter((i) => Number(i.soLuongTon) <= Number(i.mucTonToiThieu));
  return {
    alerts: alerts.map((m) => ({
      id: m.id,
      nguyenVatLieuId: m.id,
      ten: m.ten,
      donViTinh: m.donViTinh,
      soLuongTon: Number(m.soLuongTon),
      mucTonToiThieu: Number(m.mucTonToiThieu),
      nhaCungCapId: m.nhaCungCapId,
      nhaCungCap: m.nhaCungCap,
    })),
  };
};

// Check and send email alert for low stock items
const checkAndSendLowStockAlert = async () => {
  const { alerts } = await listAlerts();
  if (alerts.length > 0) {
    const result = await sendLowStockAlert(alerts);
    return { alertCount: alerts.length, emailResult: result };
  }
  return { alertCount: 0, message: 'No low stock items' };
};

// ==================== STOCK ADJUSTMENTS ====================

const ADJUSTMENT_TYPES = {
  NHAP: 'NHAP',      // Add stock
  XUAT: 'XUAT',      // Remove stock (usage)
  HUYHANG: 'HUYHANG', // Waste/disposal
  DIEUCHINH: 'DIEUCHINH', // Manual adjustment
};

const listAdjustments = async (query = {}) => {
  const where = {};
  if (query.nguyenVatLieuId) where.nguyenVatLieuId = query.nguyenVatLieuId;
  if (query.loai) where.loai = query.loai;
  if (query.startDate || query.endDate) {
    where.createdAt = {};
    if (query.startDate) where.createdAt.gte = new Date(query.startDate);
    if (query.endDate) {
      const end = new Date(query.endDate);
      end.setHours(23, 59, 59, 999);
      where.createdAt.lte = end;
    }
  }

  const items = await prisma.nhatKyXuatKho.findMany({
    where,
    include: { nguyenVatLieu: true },
    orderBy: { createdAt: 'desc' },
  });
  return {
    items: items.map((a) => ({
      id: a.id,
      loai: a.loai,
      soLuong: Number(a.soLuong),
      ghiChu: a.ghiChu,
      createdAt: a.createdAt,
      nguyenVatLieu: a.nguyenVatLieu ? {
        id: a.nguyenVatLieu.id,
        ten: a.nguyenVatLieu.ten,
        donViTinh: a.nguyenVatLieu.donViTinh,
      } : null,
    })),
  };
};

const createAdjustment = async (payload, user = null) => {
  const { nguyenVatLieuId, loai, soLuong, ghiChu } = payload;

  if (!nguyenVatLieuId || !loai || soLuong === undefined) {
    throw Object.assign(new Error('Thiếu thông tin điều chỉnh'), { status: 400 });
  }
  if (!Object.values(ADJUSTMENT_TYPES).includes(loai)) {
    throw Object.assign(new Error('Loại điều chỉnh không hợp lệ'), { status: 400 });
  }

  const mat = await prisma.nguyenVatLieu.findUnique({ where: { id: nguyenVatLieuId } });
  if (!mat) throw Object.assign(new Error('Nguyên vật liệu không tồn tại'), { status: 404 });

  const quantity = Number(soLuong);
  let newStock = Number(mat.soLuongTon);

  // Calculate new stock based on adjustment type
  if (loai === ADJUSTMENT_TYPES.NHAP) {
    newStock += quantity;
  } else if (loai === ADJUSTMENT_TYPES.XUAT || loai === ADJUSTMENT_TYPES.HUYHANG) {
    newStock -= quantity;
    if (newStock < 0) {
      throw Object.assign(new Error('Số lượng tồn không đủ'), { status: 400 });
    }
  } else if (loai === ADJUSTMENT_TYPES.DIEUCHINH) {
    // Direct set to the quantity
    newStock = quantity;
  }

  // Create adjustment record and update stock
  const [adjustment] = await prisma.$transaction([
    prisma.nhatKyXuatKho.create({
      data: { nguyenVatLieuId, loai, soLuong: quantity, ghiChu: ghiChu || null },
    }),
    prisma.nguyenVatLieu.update({
      where: { id: nguyenVatLieuId },
      data: { soLuongTon: newStock },
    }),
  ]);

  // Audit log for critical inventory adjustment
  await prisma.nhatKyHeThong.create({
    data: {
      hanhDong: 'INVENTORY_ADJUST',
      thongTinBoSung: JSON.stringify({
        nguyenVatLieuId,
        tenNVL: mat.ten,
        loai,
        soLuong: quantity,
        soLuongTruoc: Number(mat.soLuongTon),
        soLuongSau: newStock,
        ghiChu,
        userId: user?.id || null,
        username: user?.username || null,
      }),
    },
  });

  return { message: 'Điều chỉnh tồn kho thành công', adjustment, newStock };
};

// Bulk adjustment for multiple materials
const createBulkAdjustment = async (payload, user = null) => {
  const { items, loai, ghiChu } = payload;

  if (!items || items.length === 0) {
    throw Object.assign(new Error('Danh sách nguyên vật liệu trống'), { status: 400 });
  }

  const results = [];
  for (const item of items) {
    try {
      const result = await createAdjustment({
        nguyenVatLieuId: item.nguyenVatLieuId,
        loai,
        soLuong: item.soLuong,
        ghiChu,
      }, user);
      results.push({ ...item, success: true, newStock: result.newStock });
    } catch (err) {
      results.push({ ...item, success: false, error: err.message });
    }
  }

  return { message: `Đã xử lý ${results.filter((r) => r.success).length}/${results.length} mục`, results };
};

const getAdjustmentOrder = async (adjustmentId) => {
  const adj = await prisma.nhatKyXuatKho.findUnique({ where: { id: adjustmentId } });
  if (!adj) throw Object.assign(new Error('Điều chỉnh không tồn tại'), { status: 404 });

  const orderId = parseOrderIdFromNote(adj.ghiChu);
  if (!orderId) throw Object.assign(new Error('Điều chỉnh này không gắn với đơn hàng'), { status: 404 });

  const order = await prisma.donHang.findUnique({
    where: { id: orderId },
    include: {
      ban: true,
      chiTiet: {
        include: {
          monAn: true,
          tuyChon: { include: { tuyChonMon: true } },
        },
      },
      nhanVien: true,
    },
  });
  if (!order) throw Object.assign(new Error('Đơn hàng không tồn tại'), { status: 404 });

  return {
    order: {
      id: order.id,
      ban: order.ban ? { id: order.ban.id, ten: order.ban.ten } : null,
      trangThai: order.trangThai,
      ghiChu: order.ghiChu,
      createdAt: order.createdAt,
      items: (order.chiTiet || []).map((l) => ({
        id: l.id,
        monAn: l.monAn ? { id: l.monAn.id, ten: l.monAn.ten } : null,
        soLuong: l.soLuong,
        donGia: Number(l.donGia),
        trangThai: l.trangThai,
        ghiChu: l.ghiChu,
        tuyChon: (l.tuyChon || []).map((t) => ({
          id: t.id,
          ten: t.tuyChonMon?.ten,
          giaThem: t.tuyChonMon?.giaThem ? Number(t.tuyChonMon.giaThem) : 0,
        })),
      })),
      nhanVien: order.nhanVien ? { id: order.nhanVien.id, hoTen: order.nhanVien.hoTen } : null,
    },
  };
};

// ==================== RECIPES ====================

const computeCost = (lines) =>
  lines.reduce(
    (sum, line) => sum + Number(line.soLuong) * Number(line.nguyenVatLieu?.giaNhapGanNhat || 0),
    0,
  );

const upsertRecipe = async (payload) => {
  const { monAnId, ingredients } = payload;
  const recipe = await prisma.$transaction(async (tx) => {
    await tx.congThucMon.deleteMany({ where: { monAnId } });
    if (ingredients?.length) {
      await tx.congThucMon.createMany({
        data: ingredients.map((i) => ({
          monAnId,
          nguyenVatLieuId: i.nguyenVatLieuId,
          soLuong: i.soLuong,
        })),
      });
    }
    const recipe = await tx.congThucMon.findMany({
      where: { monAnId },
      include: { nguyenVatLieu: true },
    });
    return recipe;
  });
  const foodCost = computeCost(recipe);
  return { monAnId, recipe, foodCost };
};

const getRecipe = async (monAnId) => {
  const recipe = await prisma.congThucMon.findMany({
    where: { monAnId },
    include: { nguyenVatLieu: true },
  });
  const foodCost = computeCost(recipe);
  return { monAnId, recipe, foodCost };
};

module.exports = {
  listMaterials,
  getMaterial,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  listAlerts,
  checkAndSendLowStockAlert,
  listAdjustments,
  createAdjustment,
  createBulkAdjustment,
  getAdjustmentOrder,
  upsertRecipe,
  getRecipe,
};
