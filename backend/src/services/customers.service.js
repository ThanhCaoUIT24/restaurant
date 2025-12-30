const { prisma } = require('../config/db');

/**
 * List all customers with optional search
 */
const list = async (query = {}) => {
  const where = {};
  if (query.q) {
    where.OR = [
      { hoTen: { contains: query.q, mode: 'insensitive' } },
      { soDienThoai: { contains: query.q } },
    ];
  }
  if (query.hangThe) {
    where.hangThe = query.hangThe;
  }

  const customers = await prisma.khachHang.findMany({
    where,
    orderBy: { hoTen: 'asc' },
    include: {
      _count: { select: { datBan: true, lichSuDiem: true } },
    },
  });

  return {
    items: customers.map((c) => ({
      id: c.id,
      hoTen: c.hoTen,
      soDienThoai: c.soDienThoai,
      hangThe: c.hangThe || 'Thường',
      diemTichLuy: c.diemTichLuy,
      soDatBan: c._count.datBan,
      soGiaoDich: c._count.lichSuDiem,
    })),
  };
};

/**
 * Get single customer by ID
 */
const getById = async (id) => {
  const customer = await prisma.khachHang.findUnique({
    where: { id },
    include: {
      datBan: { orderBy: { thoiGianDen: 'desc' }, take: 10 },
      lichSuDiem: { orderBy: { createdAt: 'desc' }, take: 20 },
    },
  });
  if (!customer) throw Object.assign(new Error('Khách hàng không tồn tại'), { status: 404 });
  return customer;
};

/**
 * Find customer by phone number
 */
const findByPhone = async (phone) => {
  const customer = await prisma.khachHang.findUnique({
    where: { soDienThoai: phone },
  });
  return customer;
};

/**
 * Create new customer
 */
const create = async (payload) => {
  const { hoTen, soDienThoai, hangThe } = payload;
  
  // Check for duplicate phone
  const existing = await prisma.khachHang.findUnique({ where: { soDienThoai } });
  if (existing) throw Object.assign(new Error('Số điện thoại đã tồn tại'), { status: 400 });

  const customer = await prisma.khachHang.create({
    data: {
      hoTen,
      soDienThoai,
      hangThe: hangThe || 'Thường',
      diemTichLuy: 0,
    },
  });
  return { message: 'Tạo khách hàng thành công', customer };
};

/**
 * Update customer info
 */
const update = async (id, payload) => {
  const { hoTen, soDienThoai, hangThe } = payload;
  
  // Check if customer exists
  const existing = await prisma.khachHang.findUnique({ where: { id } });
  if (!existing) throw Object.assign(new Error('Khách hàng không tồn tại'), { status: 404 });

  // Check phone uniqueness if changed
  if (soDienThoai && soDienThoai !== existing.soDienThoai) {
    const phoneExists = await prisma.khachHang.findUnique({ where: { soDienThoai } });
    if (phoneExists) throw Object.assign(new Error('Số điện thoại đã tồn tại'), { status: 400 });
  }

  const customer = await prisma.khachHang.update({
    where: { id },
    data: {
      ...(hoTen && { hoTen }),
      ...(soDienThoai && { soDienThoai }),
      ...(hangThe && { hangThe }),
    },
  });
  return { message: 'Cập nhật thành công', customer };
};

/**
 * Delete customer
 */
const remove = async (id) => {
  const existing = await prisma.khachHang.findUnique({ where: { id } });
  if (!existing) throw Object.assign(new Error('Khách hàng không tồn tại'), { status: 404 });

  // Delete related records first
  await prisma.lichSuTichDiem.deleteMany({ where: { khachHangId: id } });
  await prisma.datBan.deleteMany({ where: { khachHangId: id } });
  await prisma.khachHang.delete({ where: { id } });
  
  return { message: 'Xóa khách hàng thành công' };
};

/**
 * Get customer points and history
 */
const getPoints = async (customerId) => {
  const customer = await prisma.khachHang.findUnique({
    where: { id: customerId },
    include: {
      lichSuDiem: { orderBy: { createdAt: 'desc' }, take: 50 },
    },
  });
  if (!customer) throw Object.assign(new Error('Khách hàng không tồn tại'), { status: 404 });

  return {
    customerId,
    hoTen: customer.hoTen,
    points: customer.diemTichLuy,
    hangThe: customer.hangThe,
    history: customer.lichSuDiem.map((h) => ({
      id: h.id,
      diemCong: h.diemCong,
      diemTru: h.diemTru,
      moTa: h.moTa,
      createdAt: h.createdAt,
    })),
  };
};

/**
 * Add loyalty points (called after payment)
 * Rule: 10,000 VND = 1 point
 */
const addPoints = async (customerId, amount, description) => {
  const pointsToAdd = Math.floor(amount / 10000);
  if (pointsToAdd <= 0) return { added: 0 };

  const result = await prisma.$transaction(async (tx) => {
    const customer = await tx.khachHang.findUnique({ where: { id: customerId } });
    if (!customer) throw Object.assign(new Error('Khách hàng không tồn tại'), { status: 404 });

    await tx.lichSuTichDiem.create({
      data: {
        khachHangId: customerId,
        diemCong: pointsToAdd,
        diemTru: 0,
        moTa: description || `Tích điểm từ hóa đơn ${amount.toLocaleString()}đ`,
      },
    });

    const newTotal = customer.diemTichLuy + pointsToAdd;
    
    // Auto upgrade membership tier
    let newTier = customer.hangThe;
    if (newTotal >= 1000) newTier = 'VIP';
    else if (newTotal >= 500) newTier = 'Vàng';
    else if (newTotal >= 100) newTier = 'Bạc';

    await tx.khachHang.update({
      where: { id: customerId },
      data: { 
        diemTichLuy: newTotal,
        hangThe: newTier,
      },
    });

    return { added: pointsToAdd, newTotal, newTier };
  });

  return result;
};

/**
 * Use (redeem) loyalty points
 * Rule: 1 point = 1,000 VND discount
 */
const usePoints = async (customerId, pointsToUse, description) => {
  if (pointsToUse <= 0) throw Object.assign(new Error('Số điểm phải > 0'), { status: 400 });

  const result = await prisma.$transaction(async (tx) => {
    const customer = await tx.khachHang.findUnique({ where: { id: customerId } });
    if (!customer) throw Object.assign(new Error('Khách hàng không tồn tại'), { status: 404 });
    if (customer.diemTichLuy < pointsToUse) {
      throw Object.assign(new Error(`Không đủ điểm. Hiện có: ${customer.diemTichLuy}`), { status: 400 });
    }

    await tx.lichSuTichDiem.create({
      data: {
        khachHangId: customerId,
        diemCong: 0,
        diemTru: pointsToUse,
        moTa: description || `Đổi ${pointsToUse} điểm`,
      },
    });

    const newTotal = customer.diemTichLuy - pointsToUse;
    await tx.khachHang.update({
      where: { id: customerId },
      data: { diemTichLuy: newTotal },
    });

    const discountAmount = pointsToUse * 1000; // 1 point = 1,000 VND

    return { 
      used: pointsToUse, 
      discountAmount,
      newTotal,
    };
  });

  return result;
};

/**
 * Get membership tiers info
 */
const getMembershipTiers = () => {
  return {
    tiers: [
      { name: 'Thường', minPoints: 0, benefits: 'Tích điểm cơ bản' },
      { name: 'Bạc', minPoints: 100, benefits: 'Tích điểm x1.2' },
      { name: 'Vàng', minPoints: 500, benefits: 'Tích điểm x1.5, ưu tiên đặt bàn' },
      { name: 'VIP', minPoints: 1000, benefits: 'Tích điểm x2, ưu tiên đặt bàn, quà sinh nhật' },
    ],
    conversionRate: {
      earn: '10,000đ = 1 điểm',
      redeem: '1 điểm = 1,000đ giảm giá',
    },
  };
};

module.exports = { 
  list, 
  getById,
  findByPhone,
  create, 
  update,
  remove,
  getPoints, 
  addPoints,
  usePoints,
  getMembershipTiers,
};
