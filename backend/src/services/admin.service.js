const { prisma } = require('../config/db');
const bcrypt = require('bcrypt');

// ==================== USER MANAGEMENT ====================

/**
 * List all users with their roles
 */
const listUsers = async (query = {}) => {
  const where = {};
  if (query.q) {
    where.OR = [
      { username: { contains: query.q, mode: 'insensitive' } },
      { nhanVien: { hoTen: { contains: query.q, mode: 'insensitive' } } },
    ];
  }

  const users = await prisma.taiKhoanNguoiDung.findMany({
    where,
    include: {
      nhanVien: {
        include: { vaiTro: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return {
    items: users.map((u) => ({
      id: u.id,
      username: u.username,
      nhanVienId: u.nhanVienId,
      hoTen: u.nhanVien?.hoTen,
      soDienThoai: u.nhanVien?.soDienThoai,
      vaiTro: u.nhanVien?.vaiTro ? { id: u.nhanVien.vaiTro.id, ten: u.nhanVien.vaiTro.ten } : null,
      createdAt: u.createdAt,
    })),
  };
};

/**
 * Get user by ID
 */
const getUser = async (id) => {
  const user = await prisma.taiKhoanNguoiDung.findUnique({
    where: { id },
    include: {
      nhanVien: { include: { vaiTro: true } },
    },
  });
  if (!user) throw Object.assign(new Error('Tài khoản không tồn tại'), { status: 404 });
  return user;
};

/**
 * Create new user account
 * Supports 2 modes:
 * 1. Create account for existing employee (nhanVienId provided)
 * 2. Create new employee + account (hoTen, soDienThoai, vaiTroId provided)
 */
const createUser = async (payload) => {
  const { username, password, nhanVienId, hoTen, soDienThoai, vaiTroId } = payload;

  // Check username exists
  const existing = await prisma.taiKhoanNguoiDung.findUnique({ where: { username } });
  if (existing) throw Object.assign(new Error('Tên đăng nhập đã tồn tại'), { status: 400 });

  let employeeId = nhanVienId;

  // Mode 1: Use existing employee
  if (nhanVienId) {
    const employee = await prisma.nhanVien.findUnique({ where: { id: nhanVienId } });
    if (!employee) throw Object.assign(new Error('Nhân viên không tồn tại'), { status: 404 });

    const existingAccount = await prisma.taiKhoanNguoiDung.findUnique({ where: { nhanVienId } });
    if (existingAccount) throw Object.assign(new Error('Nhân viên này đã có tài khoản'), { status: 400 });
  }
  // Mode 2: Create new employee first
  else if (hoTen && vaiTroId) {
    // Validate role exists
    const role = await prisma.vaiTro.findUnique({ where: { id: vaiTroId } });
    if (!role) throw Object.assign(new Error('Vai trò không tồn tại'), { status: 404 });

    // Check phone number uniqueness if provided
    if (soDienThoai) {
      const existingPhone = await prisma.nhanVien.findUnique({ where: { soDienThoai } });
      if (existingPhone) throw Object.assign(new Error('Số điện thoại đã được sử dụng'), { status: 400 });
    }

    // Create new employee
    const newEmployee = await prisma.nhanVien.create({
      data: {
        hoTen,
        soDienThoai,
        vaiTroId,
      },
    });
    employeeId = newEmployee.id;
  } else {
    throw Object.assign(new Error('Vui lòng cung cấp nhanVienId hoặc (hoTen + vaiTroId)'), { status: 400 });
  }

  // Create account
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.taiKhoanNguoiDung.create({
    data: {
      username,
      passwordHash,
      nhanVienId: employeeId,
    },
    include: {
      nhanVien: {
        include: { vaiTro: true }
      }
    },
  });

  return {
    message: hoTen ? 'Tạo nhân viên và tài khoản thành công' : 'Tạo tài khoản thành công',
    user: {
      id: user.id,
      username: user.username,
      hoTen: user.nhanVien?.hoTen,
      vaiTro: user.nhanVien?.vaiTro?.ten,
    }
  };
};

/**
 * Update user (change password or role)
 */
const updateUser = async (id, payload) => {
  const { password, vaiTroId, username, hoTen, soDienThoai } = payload;

  const user = await prisma.taiKhoanNguoiDung.findUnique({ where: { id }, include: { nhanVien: true } });
  if (!user) throw Object.assign(new Error('Tài khoản không tồn tại'), { status: 404 });

  // Update username if provided and different
  if (username && username !== user.username) {
    const existing = await prisma.taiKhoanNguoiDung.findUnique({ where: { username } });
    if (existing) throw Object.assign(new Error('Tên đăng nhập đã tồn tại'), { status: 400 });

    await prisma.taiKhoanNguoiDung.update({
      where: { id },
      data: { username },
    });
  }

  // Update password if provided
  if (password) {
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.taiKhoanNguoiDung.update({
      where: { id },
      data: { passwordHash },
    });
  }

  // Update role if provided
  if (vaiTroId !== undefined) {
    await prisma.nhanVien.update({
      where: { id: user.nhanVienId },
      data: { vaiTroId: vaiTroId || null },
    });
  }

  // Update employee name if provided
  if (hoTen && hoTen !== user.nhanVien?.hoTen) {
    await prisma.nhanVien.update({
      where: { id: user.nhanVienId },
      data: { hoTen },
    });
  }

  // Update employee phone if provided
  if (soDienThoai && soDienThoai !== user.nhanVien?.soDienThoai) {
    const existingPhone = await prisma.nhanVien.findFirst({
      where: {
        soDienThoai,
        id: { not: user.nhanVienId } // Exclude current employee
      },
    });
    if (existingPhone) throw Object.assign(new Error('Số điện thoại đã được sử dụng'), { status: 400 });

    await prisma.nhanVien.update({
      where: { id: user.nhanVienId },
      data: { soDienThoai },
    });
  }

  return { message: 'Cập nhật thành công' };
};

/**
 * Delete user account
 */
const deleteUser = async (id) => {
  const user = await prisma.taiKhoanNguoiDung.findUnique({ where: { id } });
  if (!user) throw Object.assign(new Error('Tài khoản không tồn tại'), { status: 404 });

  await prisma.taiKhoanNguoiDung.delete({ where: { id } });
  return { message: 'Xóa tài khoản thành công' };
};

// ==================== ROLE MANAGEMENT ====================

/**
 * List all roles with permissions
 */
const listRoles = async () => {
  const roles = await prisma.vaiTro.findMany({
    include: {
      quyen: { include: { quyen: true } },
      _count: { select: { nhanVien: true } },
    },
    orderBy: { ten: 'asc' },
  });

  return {
    items: roles.map((r) => ({
      id: r.id,
      ten: r.ten,
      moTa: r.moTa,
      soNhanVien: r._count.nhanVien,
      quyen: r.quyen.map((vq) => ({ id: vq.quyen.id, ma: vq.quyen.ma, moTa: vq.quyen.moTa })),
    })),
  };
};

/**
 * Get all available permissions
 */
const listPermissions = async () => {
  const permissions = await prisma.quyen.findMany({ orderBy: { ma: 'asc' } });
  return { items: permissions };
};

/**
 * Create new role
 */
const createRole = async (payload) => {
  const { ten, moTa, quyenIds = [] } = payload;

  const role = await prisma.vaiTro.create({
    data: {
      ten,
      moTa: moTa || null,
    },
  });

  // Assign permissions
  if (quyenIds.length > 0) {
    await prisma.vaiTroQuyen.createMany({
      data: quyenIds.map((quyenId) => ({ vaiTroId: role.id, quyenId })),
    });
  }

  return { message: 'Tạo vai trò thành công', role };
};

/**
 * Update role
 */
const updateRole = async (id, payload, user = null) => {
  const { ten, moTa, quyenIds } = payload;

  const role = await prisma.vaiTro.findUnique({
    where: { id },
    include: { quyen: { include: { quyen: true } } },
  });
  if (!role) throw Object.assign(new Error('Vai trò không tồn tại'), { status: 404 });

  const oldPermissions = role.quyen.map(q => q.quyen.ma);

  await prisma.vaiTro.update({
    where: { id },
    data: {
      ...(ten && { ten }),
      ...(moTa !== undefined && { moTa }),
    },
  });

  // Update permissions if provided
  if (quyenIds !== undefined) {
    await prisma.vaiTroQuyen.deleteMany({ where: { vaiTroId: id } });
    if (quyenIds.length > 0) {
      await prisma.vaiTroQuyen.createMany({
        data: quyenIds.map((quyenId) => ({ vaiTroId: id, quyenId })),
      });
    }

    // Get new permission codes for audit
    const newPerms = await prisma.quyen.findMany({ where: { id: { in: quyenIds } } });
    const newPermissions = newPerms.map(p => p.ma);

    // Audit log for permission changes
    await prisma.nhatKyHeThong.create({
      data: {
        hanhDong: 'ROLE_PERMISSIONS_CHANGE',
        thongTinBoSung: JSON.stringify({
          roleId: id,
          roleName: role.ten,
          oldPermissions,
          newPermissions,
          userId: user?.id || null,
          username: user?.username || null,
        }),
      },
    });
  }

  return { message: 'Cập nhật vai trò thành công' };
};

/**
 * Delete role
 */
const deleteRole = async (id) => {
  const role = await prisma.vaiTro.findUnique({ where: { id }, include: { _count: { select: { nhanVien: true } } } });
  if (!role) throw Object.assign(new Error('Vai trò không tồn tại'), { status: 404 });
  if (role._count.nhanVien > 0) {
    throw Object.assign(new Error('Không thể xóa vai trò đang được sử dụng'), { status: 400 });
  }

  await prisma.vaiTroQuyen.deleteMany({ where: { vaiTroId: id } });
  await prisma.vaiTro.delete({ where: { id } });
  return { message: 'Xóa vai trò thành công' };
};

// ==================== AUDIT LOGS ====================

/**
 * List audit logs with pagination
 */
const listAuditLogs = async (query = {}) => {
  const { page = 1, limit = 50, startDate, endDate, action } = query;
  const skip = (page - 1) * limit;

  const where = {};
  if (action) where.hanhDong = { contains: action, mode: 'insensitive' };
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }

  const [logs, total] = await Promise.all([
    prisma.nhatKyHeThong.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit),
    }),
    prisma.nhatKyHeThong.count({ where }),
  ]);

  return {
    items: logs.map((l) => ({
      id: l.id,
      hanhDong: l.hanhDong,
      thongTinBoSung: l.thongTinBoSung,
      createdAt: l.createdAt,
    })),
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Create audit log entry
 */
const createAuditLog = async (action, details) => {
  await prisma.nhatKyHeThong.create({
    data: {
      hanhDong: action,
      thongTinBoSung: typeof details === 'string' ? details : JSON.stringify(details),
    },
  });
};

// ==================== SYSTEM CONFIG ====================

/**
 * Get all system configs
 */
const getConfigs = async () => {
  const configs = await prisma.cauHinhHeThong.findMany({ orderBy: { key: 'asc' } });
  return { items: configs };
};

/**
 * Update system config
 */
const updateConfig = async (key, value) => {
  const config = await prisma.cauHinhHeThong.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
  return { message: 'Cập nhật cấu hình thành công', config };
};

/**
 * Batch update configs
 */
const batchUpdateConfigs = async (configs) => {
  const results = [];
  for (const { key, value } of configs) {
    const config = await prisma.cauHinhHeThong.upsert({
      where: { key },
      update: { value: String(value) },
      create: { key, value: String(value) },
    });
    results.push(config);
  }
  return { message: 'Cập nhật cấu hình thành công', items: results };
};

// ==================== LOYALTY TIERS ====================

/**
 * List all loyalty tiers
 */
const listLoyaltyTiers = async () => {
  const tiers = await prisma.hangThanhVien.findMany({ orderBy: { diemToiThieu: 'asc' } });
  return { items: tiers };
};

/**
 * Create loyalty tier
 */
const createLoyaltyTier = async (payload) => {
  const { ten, mucTichDiem, tyLeQuyDoi, diemToiThieu } = payload;
  const tier = await prisma.hangThanhVien.create({
    data: { ten, mucTichDiem, tyLeQuyDoi, diemToiThieu },
  });
  return { message: 'Tạo hạng thành viên thành công', tier };
};

/**
 * Update loyalty tier
 */
const updateLoyaltyTier = async (id, payload) => {
  const existing = await prisma.hangThanhVien.findUnique({ where: { id } });
  if (!existing) throw Object.assign(new Error('Hạng thành viên không tồn tại'), { status: 404 });

  const tier = await prisma.hangThanhVien.update({
    where: { id },
    data: payload,
  });
  return { message: 'Cập nhật hạng thành viên thành công', tier };
};

/**
 * Delete loyalty tier
 */
const deleteLoyaltyTier = async (id) => {
  const existing = await prisma.hangThanhVien.findUnique({ where: { id } });
  if (!existing) throw Object.assign(new Error('Hạng thành viên không tồn tại'), { status: 404 });

  await prisma.hangThanhVien.delete({ where: { id } });
  return { message: 'Xóa hạng thành viên thành công' };
};

// ==================== PROMOTIONS ====================

/**
 * List all promotions
 */
const listPromotions = async (query = {}) => {
  const where = {};
  if (query.active === 'true') where.trangThai = true;

  const promotions = await prisma.khuyenMai.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
  return { items: promotions };
};

/**
 * Get promotion by ID
 */
const getPromotion = async (id) => {
  const promo = await prisma.khuyenMai.findUnique({ where: { id } });
  if (!promo) throw Object.assign(new Error('Khuyến mãi không tồn tại'), { status: 404 });
  return promo;
};

/**
 * Create promotion
 */
const createPromotion = async (payload) => {
  const { ten, loai, giaTri, dieuKien, ngayBatDau, ngayKetThuc, trangThai = true } = payload;
  const promo = await prisma.khuyenMai.create({
    data: {
      ten,
      loai, // PHAN_TRAM or SO_TIEN
      giaTri,
      dieuKien: dieuKien ? JSON.stringify(dieuKien) : null,
      ngayBatDau: ngayBatDau ? new Date(ngayBatDau) : null,
      ngayKetThuc: ngayKetThuc ? new Date(ngayKetThuc) : null,
      trangThai,
    },
  });
  return { message: 'Tạo khuyến mãi thành công', promotion: promo };
};

/**
 * Update promotion
 */
const updatePromotion = async (id, payload) => {
  const existing = await prisma.khuyenMai.findUnique({ where: { id } });
  if (!existing) throw Object.assign(new Error('Khuyến mãi không tồn tại'), { status: 404 });

  const data = { ...payload };
  if (data.dieuKien) data.dieuKien = JSON.stringify(data.dieuKien);
  if (data.ngayBatDau) data.ngayBatDau = new Date(data.ngayBatDau);
  if (data.ngayKetThuc) data.ngayKetThuc = new Date(data.ngayKetThuc);

  const promo = await prisma.khuyenMai.update({ where: { id }, data });
  return { message: 'Cập nhật khuyến mãi thành công', promotion: promo };
};

/**
 * Delete promotion
 */
const deletePromotion = async (id) => {
  const existing = await prisma.khuyenMai.findUnique({ where: { id } });
  if (!existing) throw Object.assign(new Error('Khuyến mãi không tồn tại'), { status: 404 });

  await prisma.khuyenMai.delete({ where: { id } });
  return { message: 'Xóa khuyến mãi thành công' };
};

// ==================== BULK PRICE UPDATE ====================

/**
 * Update price for all dishes in a category
 */
const updateCategoryPrices = async (danhMucId, adjustment) => {
  const { type, value } = adjustment; // type: 'PHAN_TRAM' | 'SO_TIEN', value: number

  const dishes = await prisma.monAn.findMany({ where: { danhMucId } });
  if (!dishes.length) throw Object.assign(new Error('Không tìm thấy món ăn trong danh mục'), { status: 404 });

  const updates = [];
  for (const dish of dishes) {
    let newPrice;
    if (type === 'PHAN_TRAM') {
      newPrice = Number(dish.giaBan) * (1 + value / 100);
    } else {
      newPrice = Number(dish.giaBan) + value;
    }
    newPrice = Math.max(0, Math.round(newPrice / 1000) * 1000); // Round to nearest 1000

    const updated = await prisma.monAn.update({
      where: { id: dish.id },
      data: { giaBan: newPrice },
    });
    updates.push(updated);
  }

  return { message: `Đã cập nhật giá ${updates.length} món`, items: updates };
};

// ==================== EMPLOYEES (for dropdown) ====================

/**
 * List employees without accounts
 */
const listEmployeesWithoutAccount = async () => {
  const employees = await prisma.nhanVien.findMany({
    where: { taiKhoan: null },
    orderBy: { hoTen: 'asc' },
  });
  return { items: employees };
};

module.exports = {
  listUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  listRoles,
  listPermissions,
  createRole,
  updateRole,
  deleteRole,
  listAuditLogs,
  createAuditLog,
  getConfigs,
  updateConfig,
  batchUpdateConfigs,
  listLoyaltyTiers,
  createLoyaltyTier,
  updateLoyaltyTier,
  deleteLoyaltyTier,
  listPromotions,
  getPromotion,
  createPromotion,
  updatePromotion,
  deletePromotion,
  updateCategoryPrices,
  listEmployeesWithoutAccount,
};
