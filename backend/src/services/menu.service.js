const { prisma } = require('../config/db');

// Helper: Tính giá vốn món ăn từ công thức
const computeFoodCost = (congThuc) =>
  congThuc.reduce(
    (sum, ct) => sum + Number(ct.soLuong) * Number(ct.nguyenVatLieu?.giaNhapGanNhat || 0),
    0,
  );

// ==================== CATEGORIES ====================

const listCategories = async () => {
  const categories = await prisma.danhMucMon.findMany({
    include: { monAn: true },
    orderBy: { ten: 'asc' },
  });
  return {
    items: categories.map((c) => ({
      id: c.id,
      ten: c.ten,
      moTa: c.moTa,
      soMon: c.monAn.length,
    })),
  };
};

const getCategory = async (id) => {
  const category = await prisma.danhMucMon.findUnique({ where: { id } });
  if (!category) throw Object.assign(new Error('Danh mục không tồn tại'), { status: 404 });
  return category;
};

const createCategory = async (payload) => {
  const { ten, moTa } = payload;

  // Check for duplicate category name
  const existing = await prisma.danhMucMon.findFirst({ where: { ten } });
  if (existing) {
    throw Object.assign(new Error('Tên danh mục đã tồn tại'), { status: 400 });
  }

  const category = await prisma.danhMucMon.create({ data: { ten, moTa: moTa || null } });
  return { message: 'Tạo danh mục thành công', category };
};

const updateCategory = async (id, payload) => {
  const { ten, moTa } = payload;
  const category = await prisma.danhMucMon.findUnique({ where: { id } });
  if (!category) throw Object.assign(new Error('Danh mục không tồn tại'), { status: 404 });

  // Check for duplicate category name (exclude current category)
  if (ten && ten !== category.ten) {
    const existing = await prisma.danhMucMon.findFirst({ where: { ten } });
    if (existing) {
      throw Object.assign(new Error('Tên danh mục đã tồn tại'), { status: 400 });
    }
  }

  const updated = await prisma.danhMucMon.update({
    where: { id },
    data: {
      ...(ten && { ten }),
      ...(moTa !== undefined && { moTa }),
    },
  });
  return { message: 'Cập nhật danh mục thành công', category: updated };
};

const deleteCategory = async (id) => {
  const category = await prisma.danhMucMon.findUnique({
    where: { id },
    include: { _count: { select: { monAn: true } } },
  });
  if (!category) throw Object.assign(new Error('Danh mục không tồn tại'), { status: 404 });
  if (category._count.monAn > 0) {
    throw Object.assign(new Error('Không thể xóa danh mục có món ăn'), { status: 400 });
  }

  await prisma.danhMucMon.delete({ where: { id } });
  return { message: 'Xóa danh mục thành công' };
};

// ==================== DISHES ====================

const listDishes = async (query = {}) => {
  const where = {};
  if (query.categoryId) where.danhMucId = query.categoryId;
  if (query.q) where.ten = { contains: query.q, mode: 'insensitive' };
  if (query.activeOnly === 'true') where.trangThai = true;

  const dishes = await prisma.monAn.findMany({
    where,
    include: {
      danhMuc: true,
      congThuc: { include: { nguyenVatLieu: true } },
    },
    orderBy: { ten: 'asc' },
  });
  return {
    items: dishes.map((d) => ({
      id: d.id,
      ten: d.ten,
      moTa: d.moTa,
      giaBan: Number(d.giaBan),
      hinhAnh: d.hinhAnh,
      giaVon: computeFoodCost(d.congThuc), // QĐ-COST: Giá vốn tự động tính
      trangThai: d.trangThai,
      danhMuc: d.danhMuc ? { id: d.danhMuc.id, ten: d.danhMuc.ten } : null,
      tramCheBien: d.tramCheBien,
      congThuc: d.congThuc.map((ct) => ({
        id: ct.id,
        nguyenVatLieuId: ct.nguyenVatLieuId,
        ten: ct.nguyenVatLieu.ten,
        soLuong: Number(ct.soLuong),
        donViTinh: ct.nguyenVatLieu.donViTinh,
        giaNhap: Number(ct.nguyenVatLieu.giaNhapGanNhat || 0), // Giá nhập NVL
      })),
    })),
  };
};

const getDish = async (id) => {
  const dish = await prisma.monAn.findUnique({
    where: { id },
    include: {
      danhMuc: true,
      congThuc: { include: { nguyenVatLieu: true } },
    },
  });
  if (!dish) throw Object.assign(new Error('Món ăn không tồn tại'), { status: 404 });

  return {
    id: dish.id,
    ten: dish.ten,
    moTa: dish.moTa,
    giaBan: Number(dish.giaBan),
    hinhAnh: dish.hinhAnh,
    trangThai: dish.trangThai,
    tramCheBien: dish.tramCheBien,
    danhMuc: dish.danhMuc ? { id: dish.danhMuc.id, ten: dish.danhMuc.ten } : null,
    congThuc: dish.congThuc.map((ct) => ({
      id: ct.id,
      nguyenVatLieuId: ct.nguyenVatLieuId,
      ten: ct.nguyenVatLieu.ten,
      soLuong: Number(ct.soLuong),
      donViTinh: ct.nguyenVatLieu.donViTinh,
    })),
  };
};

const listOptions = async () => {
  const options = await prisma.tuyChonMon.findMany({ orderBy: { ten: 'asc' } });
  return { items: options.map((o) => ({ id: o.id, ten: o.ten, giaThem: Number(o.giaThem) })) };
};

const createDish = async (payload) => {
  const { ten, moTa, giaBan, hinhAnh, danhMucId, tramCheBien, trangThai = true, congThuc = [] } = payload;

  // Validation: giaBan must be >= 0
  if (giaBan === undefined || giaBan === null) {
    throw Object.assign(new Error('Giá bán là bắt buộc'), { status: 400 });
  }
  if (typeof giaBan !== 'number' || giaBan < 0) {
    throw Object.assign(new Error('Giá bán phải là số >= 0'), { status: 400 });
  }

  const dish = await prisma.$transaction(async (tx) => {
    const newDish = await tx.monAn.create({
      data: {
        ten,
        moTa: moTa || null,
        giaBan,
        hinhAnh: hinhAnh || null,
        danhMucId: danhMucId || null,
        tramCheBien: tramCheBien || 'Bếp',
        trangThai,
      },
    });

    // Create recipe if provided
    if (congThuc.length > 0) {
      await tx.congThucMon.createMany({
        data: congThuc.map((ct) => ({
          monAnId: newDish.id,
          nguyenVatLieuId: ct.nguyenVatLieuId,
          soLuong: ct.soLuong,
        })),
      });
    }

    return newDish;
  });

  return { message: 'Tạo món ăn thành công', dish };
};

const updateDish = async (id, payload) => {
  const { ten, moTa, giaBan, hinhAnh, danhMucId, tramCheBien, trangThai, congThuc } = payload;

  // Validation: giaBan must be >= 0 if provided
  if (giaBan !== undefined && (typeof giaBan !== 'number' || giaBan < 0)) {
    throw Object.assign(new Error('Giá bán phải là số >= 0'), { status: 400 });
  }

  const existing = await prisma.monAn.findUnique({ where: { id } });
  if (!existing) throw Object.assign(new Error('Món ăn không tồn tại'), { status: 404 });

  const dish = await prisma.$transaction(async (tx) => {
    const updated = await tx.monAn.update({
      where: { id },
      data: {
        ...(ten && { ten }),
        ...(moTa !== undefined && { moTa }),
        ...(giaBan !== undefined && { giaBan }),
        ...(hinhAnh !== undefined && { hinhAnh }),
        ...(danhMucId !== undefined && { danhMucId }),
        ...(tramCheBien !== undefined && { tramCheBien }),
        ...(trangThai !== undefined && { trangThai }),
      },
    });

    // Update recipe if provided
    if (congThuc !== undefined) {
      await tx.congThucMon.deleteMany({ where: { monAnId: id } });
      if (congThuc.length > 0) {
        await tx.congThucMon.createMany({
          data: congThuc.map((ct) => ({
            monAnId: id,
            nguyenVatLieuId: ct.nguyenVatLieuId,
            soLuong: ct.soLuong,
          })),
        });
      }
    }

    return updated;
  });

  return { message: 'Cập nhật món ăn thành công', dish };
};

const updateDishStatus = async (id, status) => {
  const updated = await prisma.monAn.update({ where: { id }, data: { trangThai: status } }).catch(() => null);
  if (!updated) throw Object.assign(new Error('Món ăn không tồn tại'), { status: 404 });
  return { message: 'Cập nhật trạng thái thành công', id, status };
};

const deleteDish = async (id) => {
  const dish = await prisma.monAn.findUnique({ where: { id } });
  if (!dish) throw Object.assign(new Error('Món ăn không tồn tại'), { status: 404 });

  await prisma.$transaction(async (tx) => {
    await tx.congThucMon.deleteMany({ where: { monAnId: id } });
    await tx.chiTietTuyChonMon.deleteMany({ where: { monAnId: id } });
    await tx.monAn.delete({ where: { id } });
  });

  return { message: 'Xóa món ăn thành công' };
};

// ==================== OPTIONS ====================

const createOption = async (payload) => {
  const { ten, giaThem = 0 } = payload;
  const option = await prisma.tuyChonMon.create({ data: { ten, giaThem } });
  return { message: 'Tạo tùy chọn thành công', option };
};

const updateOption = async (id, payload) => {
  const { ten, giaThem } = payload;
  const option = await prisma.tuyChonMon.update({
    where: { id },
    data: {
      ...(ten && { ten }),
      ...(giaThem !== undefined && { giaThem }),
    },
  }).catch(() => null);
  if (!option) throw Object.assign(new Error('Tùy chọn không tồn tại'), { status: 404 });
  return { message: 'Cập nhật tùy chọn thành công', option };
};

const deleteOption = async (id) => {
  await prisma.chiTietTuyChonMon.deleteMany({ where: { tuyChonMonId: id } });
  await prisma.tuyChonMon.delete({ where: { id } }).catch(() => null);
  return { message: 'Xóa tùy chọn thành công' };
};

module.exports = {
  listCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  listDishes,
  getDish,
  listOptions,
  createDish,
  updateDish,
  updateDishStatus,
  deleteDish,
  createOption,
  updateOption,
  deleteOption,
};
