const bcrypt = require('bcryptjs');
const { prisma } = require('../config/db');
const { TABLE_STATUS, ORDER_STATUS } = require('../utils/constants');
const { broadcastSnapshot } = require('../utils/kdsStream');
const { broadcastTables } = require('../utils/tableStream');
const billingService = require('./billing.service');

const list = async (query = {}) => {
  const where = {};
  if (query.tableId) where.banId = query.tableId;
  const orders = await prisma.donHang.findMany({
    where,
    include: {
      ban: true,
      chiTiet: {
        include: {
          monAn: true,
          tuyChon: { include: { tuyChonMon: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
  return { items: orders };
};

// QĐ-BOOK: Check if table is reserved and validate opening
const assertTableAvailable = async (ban, datBanId = null) => {
  if (!ban) throw Object.assign(new Error('Bàn không tồn tại'), { status: 404 });
  if ([TABLE_STATUS.CHOTHANHTOAN, TABLE_STATUS.CANDON].includes(ban.trangThai)) {
    throw Object.assign(new Error('Bàn đang chờ thanh toán hoặc dọn'), { status: 400 });
  }

  // QĐ-BOOK: If table is reserved (DADAT), only allow if opening for the reservation
  if (ban.trangThai === TABLE_STATUS.DADAT) {
    if (!datBanId) {
      // Check if there's an active reservation for this table in the current time window
      const now = new Date();
      const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);
      const activeReservation = await prisma.datBan.findFirst({
        where: {
          banId: ban.id,
          trangThai: 'CHODEN',
          thoiGianDen: { gte: new Date(now.getTime() - 30 * 60 * 1000), lte: twoHoursLater }, // within 30 min past to 2 hours future
        },
        include: { khachHang: true },
      });
      if (activeReservation) {
        throw Object.assign(
          new Error(`Bàn đã được đặt trước cho ${activeReservation.khachHang?.hoTen || 'khách'} lúc ${activeReservation.thoiGianDen.toLocaleTimeString('vi-VN')}. Vui lòng xác nhận đặt bàn hoặc chọn bàn khác.`),
          { status: 400, reservation: { id: activeReservation.id, time: activeReservation.thoiGianDen, customer: activeReservation.khachHang?.hoTen } }
        );
      }
    }
  }
};

const buildInventoryNeed = (menuMap, items) => {
  const need = new Map(); // nguyenVatLieuId -> qty
  items.forEach((item) => {
    const mon = menuMap.get(item.monAnId);
    if (!mon) throw Object.assign(new Error('Món ăn không tồn tại'), { status: 400 });
    if (!mon.trangThai) throw Object.assign(new Error(`Món ${mon.ten} tạm ngưng`), { status: 400 });
    mon.congThuc.forEach((ct) => {
      const current = need.get(ct.nguyenVatLieuId) || 0;
      need.set(ct.nguyenVatLieuId, current + Number(ct.soLuong) * item.quantity);
    });
  });
  return need;
};

const checkStock = (need) => {
  const shortages = [];
  need.forEach((qty, nvlId) => {
    // Assume stock already loaded; this helper used after load
  });
  return shortages;
};

const loadOptionsMap = async (tx, optionIds = []) => {
  if (!optionIds.length) return new Map();
  const uniqueIds = Array.from(new Set(optionIds));
  const options = await tx.tuyChonMon.findMany({ where: { id: { in: uniqueIds } } });
  if (options.length !== uniqueIds.length) throw Object.assign(new Error('Tùy chọn không hợp lệ'), { status: 400 });
  const map = new Map();
  options.forEach((opt) => map.set(opt.id, opt));
  return map;
};

const calculateLinePrice = (basePrice, optionIds = [], optionMap) => {
  let price = Number(basePrice);
  optionIds.forEach((id) => {
    const opt = optionMap.get(id);
    price += Number(opt?.giaThem || 0);
  });
  return price;
};

const verifyManagerPin = async (managerPin, managerUsername) => {
  if (!managerPin) throw Object.assign(new Error('Cần mã PIN của quản lý'), { status: 400 });

  const managerAccounts = await prisma.taiKhoanNguoiDung.findMany({
    where: {
      ...(managerUsername ? { username: managerUsername } : {}),
      nhanVien: {
        vaiTro: {
          quyen: {
            some: { quyen: { ma: 'VOID_ITEM' } },
          },
        },
      },
    },
    include: { nhanVien: true },
  });

  for (const acc of managerAccounts) {
    const ok = await bcrypt.compare(managerPin, acc.passwordHash);
    if (ok) return acc;
  }
  throw Object.assign(new Error('PIN không hợp lệ hoặc không có quyền'), { status: 401 });
};

/**
 * Add items to an existing order (used when table already has active order)
 */
const addItemsToExistingOrder = async (user, orderId, items, note) => {
  const result = await prisma.$transaction(async (tx) => {
    const order = await tx.donHang.findUnique({
      where: { id: orderId },
      include: { chiTiet: true, ban: true },
    });
    if (!order) throw Object.assign(new Error('Đơn hàng không tồn tại'), { status: 404 });

    const monAnIds = items.map((i) => i.monAnId);
    const menu = await tx.monAn.findMany({
      where: { id: { in: monAnIds } },
      include: { congThuc: true },
    });
    const menuMap = new Map(menu.map((m) => [m.id, m]));

    // Check inventory
    const need = buildInventoryNeed(menuMap, items);
    const nvl = await tx.nguyenVatLieu.findMany({
      where: { id: { in: Array.from(need.keys()) } },
    });
    const shortages = [];
    nvl.forEach((mat) => {
      const required = need.get(mat.id) || 0;
      if (Number(mat.soLuongTon) < required) shortages.push({ nguyenVatLieuId: mat.id, required, available: Number(mat.soLuongTon) });
    });
    if (shortages.length) {
      throw Object.assign(new Error('Nguyên vật liệu không đủ'), { status: 400, details: shortages });
    }

    const optionIds = items.flatMap((i) => i.options || []);
    const optionMap = await loadOptionsMap(tx, optionIds);

    // Add new items to existing order
    for (const item of items) {
      const mon = menuMap.get(item.monAnId);
      const linePrice = calculateLinePrice(mon.giaBan, item.options || [], optionMap);
      const line = await tx.chiTietDonHang.create({
        data: {
          donHangId: orderId,
          monAnId: item.monAnId,
          soLuong: item.quantity,
          donGia: linePrice,
          ghiChu: item.note || null,
          trangThai: ORDER_STATUS.CHOCHEBIEN,
        },
      });

      if (item.options?.length) {
        const optionLinks = item.options.map((optId) => ({
          chiTietDonHangId: line.id,
          tuyChonMonId: optId,
          monAnId: item.monAnId,
        }));
        await tx.chiTietTuyChonMon.createMany({ data: optionLinks });
      }
    }

    // Append note if provided
    if (note) {
      const newNote = order.ghiChu ? `${order.ghiChu}; ${note}` : note;
      await tx.donHang.update({ where: { id: orderId }, data: { ghiChu: newNote } });
    }

    const updated = await tx.donHang.findUnique({
      where: { id: orderId },
      include: {
        ban: true,
        chiTiet: { include: { monAn: true, tuyChon: { include: { tuyChonMon: true } } } },
        hoaDon: true,
      },
    });
    return updated;
  });

  // Sync invoice totals after adding items
  await billingService.syncInvoiceWithOrder(orderId).catch(() => { });

  await broadcastTables().catch(() => { });
  await broadcastSnapshot().catch(() => { }); // Notify KDS
  return result;
};

const create = async (user, payload) => {
  const { tableId, items, note, datBanId = null } = payload;

  // Check for existing active order on this table
  const existingOrder = await prisma.donHang.findFirst({
    where: {
      banId: tableId,
      trangThai: { notIn: ['CLOSED', 'CANCELLED'] },
    },
    orderBy: { createdAt: 'desc' },
  });

  // If existing order found, add items to it instead of creating new
  if (existingOrder) {
    return addItemsToExistingOrder(user, existingOrder.id, items, note);
  }

  // QĐ-BOOK: Pre-check table availability (outside transaction for async reservation check)
  const banCheck = await prisma.ban.findUnique({ where: { id: tableId } });
  await assertTableAvailable(banCheck, datBanId);

  const created = await prisma.$transaction(async (tx) => {
    const ban = await tx.ban.findUnique({ where: { id: tableId } });
    // Re-verify in transaction (without async check since already done)
    if (!ban) throw Object.assign(new Error('Bàn không tồn tại'), { status: 404 });
    if ([TABLE_STATUS.CHOTHANHTOAN, TABLE_STATUS.CANDON].includes(ban.trangThai)) {
      throw Object.assign(new Error('Bàn đang chờ thanh toán hoặc dọn'), { status: 400 });
    }

    const monAnIds = items.map((i) => i.monAnId);
    const menu = await tx.monAn.findMany({
      where: { id: { in: monAnIds } },
      include: { congThuc: true },
    });
    const menuMap = new Map(menu.map((m) => [m.id, m]));

    // compute inventory needs and check availability
    const need = buildInventoryNeed(menuMap, items);
    const nvl = await tx.nguyenVatLieu.findMany({
      where: { id: { in: Array.from(need.keys()) } },
    });
    const shortages = [];
    nvl.forEach((mat) => {
      const required = need.get(mat.id) || 0;
      if (Number(mat.soLuongTon) < required) shortages.push({ nguyenVatLieuId: mat.id, required, available: Number(mat.soLuongTon) });
    });
    if (shortages.length) {
      throw Object.assign(new Error('Nguyên vật liệu không đủ'), { status: 400, details: shortages });
    }

    const optionIds = items.flatMap((i) => i.options || []);
    const optionMap = await loadOptionsMap(tx, optionIds);

    const order = await tx.donHang.create({
      data: {
        banId: tableId,
        nhanVienId: user?.id || null,
        ghiChu: note || null,
        trangThai: 'OPEN',
      },
    });

    // Tính tổng tiền hàng từ các món
    let tongTienHang = 0;
    for (const item of items) {
      const mon = menuMap.get(item.monAnId);
      const linePrice = calculateLinePrice(mon.giaBan, item.options || [], optionMap);
      const line = await tx.chiTietDonHang.create({
        data: {
          donHangId: order.id,
          monAnId: item.monAnId,
          soLuong: item.quantity,
          donGia: linePrice,
          ghiChu: item.note || null,
          trangThai: ORDER_STATUS.CHOCHEBIEN,
        },
      });
      tongTienHang += linePrice * item.quantity;

      if (item.options?.length) {
        const optionLinks = item.options.map((optId) => ({
          chiTietDonHangId: line.id,
          tuyChonMonId: optId,
          monAnId: item.monAnId,
        }));
        await tx.chiTietTuyChonMon.createMany({ data: optionLinks });
      }
    }

    if ([TABLE_STATUS.TRONG, TABLE_STATUS.DADAT].includes(ban.trangThai)) {
      await tx.ban.update({ where: { id: tableId }, data: { trangThai: TABLE_STATUS.COKHACH } });
    }

    // AUTO-CREATE INVOICE: Tự động tạo hóa đơn khi tạo đơn hàng
    const vatConfig = await tx.cauHinhHeThong.findUnique({ where: { key: 'VAT' } });
    const vatRate = vatConfig ? Number(vatConfig.value) : 10;
    const thueVAT = (tongTienHang * vatRate) / 100;
    const tongThanhToan = tongTienHang + thueVAT;

    await tx.hoaDon.create({
      data: {
        donHangId: order.id,
        tongTienHang,
        giamGia: 0,
        thueVAT,
        tongThanhToan,
        trangThai: 'OPEN',
      },
    });

    const created = await tx.donHang.findUnique({
      where: { id: order.id },
      include: {
        ban: true,
        chiTiet: { include: { monAn: true, tuyChon: { include: { tuyChonMon: true } } } },
        hoaDon: true, // Include invoice
      },
    });
    return created;
  });

  // Auto send to kitchen after creating order
  await prisma.donHang.update({
    where: { id: created.id },
    data: { trangThai: 'SENT' },
  });

  await broadcastTables().catch(() => { });
  await broadcastSnapshot().catch(() => { }); // Notify KDS
  return { ...created, trangThai: 'SENT' };
};

const update = async (id, payload) => {
  const result = await prisma.$transaction(async (tx) => {
    const order = await tx.donHang.findUnique({
      where: { id },
      include: { chiTiet: true },
    });
    if (!order) throw Object.assign(new Error('Đơn hàng không tồn tại'), { status: 404 });

    if (payload.note !== undefined) {
      await tx.donHang.update({ where: { id }, data: { ghiChu: payload.note } });
    }

    if (payload.removeItemIds?.length) {
      await tx.chiTietDonHang.updateMany({
        where: { id: { in: payload.removeItemIds }, donHangId: id, trangThai: ORDER_STATUS.CHOCHEBIEN },
        data: { trangThai: ORDER_STATUS.DAHUY },
      });
    }

    if (payload.addItems?.length) {
      const monAnIds = payload.addItems.map((i) => i.monAnId);
      const menu = await tx.monAn.findMany({ where: { id: { in: monAnIds } }, include: { congThuc: true } });
      const menuMap = new Map(menu.map((m) => [m.id, m]));
      const need = buildInventoryNeed(menuMap, payload.addItems);
      const nvl = await tx.nguyenVatLieu.findMany({ where: { id: { in: Array.from(need.keys()) } } });
      const shortages = [];
      nvl.forEach((mat) => {
        const required = need.get(mat.id) || 0;
        if (Number(mat.soLuongTon) < required) shortages.push({ nguyenVatLieuId: mat.id, required, available: Number(mat.soLuongTon) });
      });
      if (shortages.length) {
        throw Object.assign(new Error('Nguyên vật liệu không đủ'), { status: 400, details: shortages });
      }
      const optionIds = payload.addItems.flatMap((i) => i.options || []);
      const optionMap = await loadOptionsMap(tx, optionIds);
      for (const item of payload.addItems) {
        const mon = menuMap.get(item.monAnId);
        const linePrice = calculateLinePrice(mon.giaBan, item.options || [], optionMap);
        const line = await tx.chiTietDonHang.create({
          data: {
            donHangId: id,
            monAnId: item.monAnId,
            soLuong: item.quantity,
            donGia: linePrice,
            ghiChu: item.note || null,
            trangThai: ORDER_STATUS.CHOCHEBIEN,
          },
        });
        if (item.options?.length) {
          const optionLinks = item.options.map((optId) => ({
            chiTietDonHangId: line.id,
            tuyChonMonId: optId,
            monAnId: item.monAnId,
          }));
          await tx.chiTietTuyChonMon.createMany({ data: optionLinks });
        }
      }
    }

    const updated = await tx.donHang.findUnique({
      where: { id },
      include: { chiTiet: { include: { monAn: true, tuyChon: { include: { tuyChonMon: true } } } }, ban: true },
    });

    return updated;
  });

  // Sync associated invoice with updated order totals (after successful transaction)
  await billingService.syncInvoiceWithOrder(id).catch(() => { });

  await broadcastSnapshot().catch(() => { }); // Notify KDS about changes
  await broadcastTables().catch(() => { }); // Update table status

  return result;
};

const sendToKitchen = async (id) => {
  const updated = await prisma.donHang.update({
    where: { id },
    data: { trangThai: 'SENT' },
  }).catch(() => null);
  if (!updated) throw Object.assign(new Error('Đơn hàng không tồn tại'), { status: 404 });
  await broadcastSnapshot().catch(() => { });
  return { message: 'Đã gửi bếp', id };
};

const voidItem = async (orderId, payload, user) => {
  const { orderItemId, reason, managerPin, managerUsername } = payload;
  const approver = await verifyManagerPin(managerPin, managerUsername);

  const result = await prisma.$transaction(async (tx) => {
    const item = await tx.chiTietDonHang.findUnique({
      where: { id: orderItemId },
    });
    if (!item || item.donHangId !== orderId) throw Object.assign(new Error('Món không tồn tại'), { status: 404 });
    if (![ORDER_STATUS.CHOCHEBIEN, ORDER_STATUS.DANGLAM].includes(item.trangThai)) {
      throw Object.assign(new Error('Không thể hủy món đã hoàn thành'), { status: 400 });
    }
    await tx.chiTietDonHang.update({
      where: { id: orderItemId },
      data: { trangThai: ORDER_STATUS.DAHUY, ghiChu: reason || item.ghiChu },
    });
    await tx.nhatKyHeThong.create({
      data: {
        hanhDong: 'VOID_ITEM',
        thongTinBoSung: JSON.stringify({
          orderId,
          orderItemId,
          reason,
          requestedBy: user?.id || null,
          approvedBy: approver?.nhanVienId || null,
          approvedUsername: approver?.username || null,
        }),
      },
    });
    return { message: 'Đã hủy món', orderItemId, orderId, approvedBy: approver?.nhanVienId || null };
  });

  // Sync associated invoice with updated order totals
  await billingService.syncInvoiceWithOrder(orderId).catch(() => { });

  await broadcastSnapshot().catch(() => { });
  return result;
};

module.exports = { list, create, update, sendToKitchen, voidItem };
