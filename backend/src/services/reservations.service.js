const { prisma } = require('../config/db');
const { TABLE_STATUS } = require('../utils/constants');
const { broadcastTables } = require('../utils/tableStream');

const list = async (query) => {
  const where = {};
  if (query?.startDate && query?.endDate) {
    // Date range query for week view
    const start = new Date(query.startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(query.endDate);
    end.setHours(23, 59, 59, 999);
    where.thoiGianDen = { gte: start, lte: end };
  } else if (query?.date) {
    const start = new Date(query.date);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    where.thoiGianDen = { gte: start, lt: end };
  }
  const items = await prisma.datBan.findMany({
    where,
    include: { ban: true, khachHang: true },
    orderBy: { thoiGianDen: 'asc' },
  });
  return { items, query };
};

const create = async (payload) => {
  const { khachHangId, tenKhach, soDienThoai, banId = null, soKhach, thoiGianDen, ghiChu } = payload;

  const reservationTime = new Date(thoiGianDen);

  // Validate reservation time is in the future
  if (reservationTime <= new Date()) {
    throw Object.assign(new Error('Thời gian đặt bàn phải trong tương lai'), { status: 400 });
  }

  // Validate soKhach > 0
  if (!soKhach || soKhach <= 0) {
    throw Object.assign(new Error('Số khách phải lớn hơn 0'), { status: 400 });
  }

  return prisma.$transaction(async (tx) => {
    // Check for double booking if banId is provided
    if (banId) {
      // Check for existing reservations within 2-hour window (configurable)
      const timeWindowMs = 2 * 60 * 60 * 1000; // 2 hours
      const windowStart = new Date(reservationTime.getTime() - timeWindowMs);
      const windowEnd = new Date(reservationTime.getTime() + timeWindowMs);

      const existingReservation = await tx.datBan.findFirst({
        where: {
          banId,
          thoiGianDen: { gte: windowStart, lte: windowEnd },
          trangThai: { in: ['CHODEN', 'DANHANBAN'] }, // Active reservations only
        },
      });

      if (existingReservation) {
        throw Object.assign(
          new Error(`Bàn đã được đặt vào ${new Date(existingReservation.thoiGianDen).toLocaleString('vi-VN')}. Vui lòng chọn thời gian khác.`),
          { status: 400 }
        );
      }
    }

    let customerId = khachHangId;
    if (!customerId) {
      if (!tenKhach || !soDienThoai) throw Object.assign(new Error('Cần tên và số điện thoại khách'), { status: 400 });
      const customer = await tx.khachHang.upsert({
        where: { soDienThoai },
        update: { hoTen: tenKhach },
        create: { hoTen: tenKhach, soDienThoai },
      });
      customerId = customer.id;
    }
    const resv = await tx.datBan.create({
      data: { khachHangId: customerId, banId, soKhach, thoiGianDen: reservationTime, ghiChu },
    });
    if (banId) {
      await tx.ban.update({
        where: { id: banId },
        data: { trangThai: TABLE_STATUS.DADAT },
      });
    }
    return resv;
  }).then((resv) => {
    broadcastTables().catch(() => { });
    return resv;
  });
};

const updateStatus = async (id, payload) => {
  const { status, banId } = payload;
  const result = await prisma.$transaction(async (tx) => {
    const resv = await tx.datBan.update({ where: { id }, data: { trangThai: status, banId: banId || undefined } });
    const targetBan = banId || resv.banId;
    if (targetBan) {
      if (status === 'DANHANBAN') {
        await tx.ban.update({ where: { id: targetBan }, data: { trangThai: TABLE_STATUS.COKHACH } });
      }
      if (status === 'HUY' || status === 'KHONGDEN') {
        await tx.ban.update({ where: { id: targetBan }, data: { trangThai: TABLE_STATUS.TRONG } });
      }
    }
    return resv;
  });
  await broadcastTables().catch(() => { });
  return result;
};

module.exports = { list, create, updateStatus };
