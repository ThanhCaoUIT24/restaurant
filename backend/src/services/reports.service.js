const { prisma } = require('../config/db');

const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

const endOfDay = (d) => {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
};

const formatWeekdayLabelVI = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  const day = d.getDay();
  if (day === 0) return 'CN';
  return `T${day + 1}`; // Mon=1 -> T2 ... Sat=6 -> T7
};

const localDateKey = (d) => {
  const x = new Date(d);
  const yyyy = x.getFullYear();
  const mm = String(x.getMonth() + 1).padStart(2, '0');
  const dd = String(x.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const parseYMDToLocalDate = (ymd) => {
  if (!ymd) return null;
  const s = String(ymd).trim();
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
};

const resolveLocalDateRange = (query, defaultPeriod = 'month') => {
  // Accept query.from/query.to as YYYY-MM-DD.
  // If missing, default to current month (to today).
  const now = new Date();
  const hasFrom = !!query?.from;
  const hasTo = !!query?.to;
  if (!hasFrom && !hasTo) {
    if (defaultPeriod === 'today') {
      return { from: startOfDay(now), to: endOfDay(now) };
    }
    // month
    return {
      from: startOfDay(new Date(now.getFullYear(), now.getMonth(), 1)),
      to: endOfDay(now),
    };
  }

  const fromDate = parseYMDToLocalDate(query.from);
  const toDate = parseYMDToLocalDate(query.to);
  return {
    from: fromDate ? startOfDay(fromDate) : null,
    to: toDate ? endOfDay(toDate) : null,
  };
};

// Used by menuPerformance (DonHang) and legacy invoice-createdAt filtering.
const buildDateFilter = (query) => {
  const { from, to } = resolveLocalDateRange(query, 'month');
  const where = {};
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = from;
    if (to) where.createdAt.lte = to;
  }
  return where;
};

const normalizeRoleCode = (roleName) => {
  if (!roleName) return null;
  const s = String(roleName).toLowerCase();
  if (s.includes('thungan') || s.includes('thu ngan')) return 'THUNGAN';
  if (s.includes('phucvu') || s.includes('phục vụ') || s.includes('phuc vu')) return 'PHUCVU';
  if (s.includes('quanly') || s.includes('quản lý') || s.includes('quan ly') || s.includes('manager')) return 'QUANLY';
  if (s.includes('thukho') || s.includes('thủ kho') || s.includes('thu kho')) return 'THUKHO';
  if (s.includes('bep')) return 'BEPCHINH';
  return roleName;
};

const mapPaymentsToInvoicePaidAt = (payments) => {
  const invoicePaidAt = new Map();
  for (const p of payments || []) {
    if (!p?.hoaDonId) continue;
    const t = new Date(p.createdAt);
    const prev = invoicePaidAt.get(p.hoaDonId);
    if (!prev || t < prev) invoicePaidAt.set(p.hoaDonId, t);
  }
  return invoicePaidAt;
};

const buildRevenueChart = async (range) => {
  const now = new Date();
  const safeRange = ['week', 'month', 'year'].includes(range) ? range : 'week';

  if (safeRange === 'week') {
    const from = startOfDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6));
    const to = endOfDay(now);
    const payments = await prisma.thanhToan.findMany({
      where: { createdAt: { gte: from, lte: to } },
      select: { hoaDonId: true, createdAt: true },
    });
    const invoicePaidAt = mapPaymentsToInvoicePaidAt(payments);
    const invoiceIds = Array.from(invoicePaidAt.keys());
    const invoices = invoiceIds.length
      ? await prisma.hoaDon.findMany({
        where: { id: { in: invoiceIds }, trangThai: 'PAID' },
        select: { id: true, tongThanhToan: true },
      })
      : [];
    const totalByInvoiceId = new Map(invoices.map((i) => [i.id, Number(i.tongThanhToan || 0)]));
    const dates = [];
    const buckets = new Map();
    for (let i = 0; i < 7; i++) {
      const d = new Date(from);
      d.setDate(from.getDate() + i);
      dates.push(d);
      buckets.set(localDateKey(d), 0);
    }
    for (const [invoiceId, paidAt] of invoicePaidAt.entries()) {
      const k = localDateKey(paidAt);
      if (!buckets.has(k)) continue;
      buckets.set(k, buckets.get(k) + (totalByInvoiceId.get(invoiceId) || 0));
    }
    const keys = dates.map((d) => localDateKey(d));
    const categories = dates.map((d) => formatWeekdayLabelVI(d));
    const data = keys.map((k) => buckets.get(k));
    return { categories, series: [{ name: 'Doanh thu', data }] };
  }

  if (safeRange === 'month') {
    const from = startOfDay(new Date(now.getFullYear(), now.getMonth(), 1));
    const to = endOfDay(now);
    const payments = await prisma.thanhToan.findMany({
      where: { createdAt: { gte: from, lte: to } },
      select: { hoaDonId: true, createdAt: true },
    });
    const invoicePaidAt = mapPaymentsToInvoicePaidAt(payments);
    const invoiceIds = Array.from(invoicePaidAt.keys());
    const invoices = invoiceIds.length
      ? await prisma.hoaDon.findMany({
        where: { id: { in: invoiceIds }, trangThai: 'PAID' },
        select: { id: true, tongThanhToan: true },
      })
      : [];
    const totalByInvoiceId = new Map(invoices.map((i) => [i.id, Number(i.tongThanhToan || 0)]));
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const data = Array(daysInMonth).fill(0);
    for (const [invoiceId, paidAt] of invoicePaidAt.entries()) {
      const dayIdx = paidAt.getDate() - 1;
      if (dayIdx >= 0 && dayIdx < data.length) data[dayIdx] += (totalByInvoiceId.get(invoiceId) || 0);
    }
    const categories = Array.from({ length: daysInMonth }, (_, i) => String(i + 1));
    return { categories, series: [{ name: 'Doanh thu', data }] };
  }

  // year
  const from = startOfDay(new Date(now.getFullYear(), 0, 1));
  const to = endOfDay(now);
  const payments = await prisma.thanhToan.findMany({
    where: { createdAt: { gte: from, lte: to } },
    select: { hoaDonId: true, createdAt: true },
  });
  const invoicePaidAt = mapPaymentsToInvoicePaidAt(payments);
  const invoiceIds = Array.from(invoicePaidAt.keys());
  const invoices = invoiceIds.length
    ? await prisma.hoaDon.findMany({
      where: { id: { in: invoiceIds }, trangThai: 'PAID' },
      select: { id: true, tongThanhToan: true },
    })
    : [];
  const totalByInvoiceId = new Map(invoices.map((i) => [i.id, Number(i.tongThanhToan || 0)]));
  const data = Array(12).fill(0);
  for (const [invoiceId, paidAt] of invoicePaidAt.entries()) {
    const m = paidAt.getMonth();
    if (m >= 0 && m < 12) data[m] += (totalByInvoiceId.get(invoiceId) || 0);
  }
  const categories = Array.from({ length: 12 }, (_, i) => `T${i + 1}`);
  return { categories, series: [{ name: 'Doanh thu', data }] };
};

const buildPaymentDateFilter = (query) => {
  const where = {};
  if (query?.from || query?.to) {
    where.createdAt = {};
    if (query.from) {
      const d = parseYMDToLocalDate(query.from);
      where.createdAt.gte = d ? startOfDay(d) : new Date(query.from);
    }
    if (query.to) {
      const d = parseYMDToLocalDate(query.to);
      where.createdAt.lte = d ? endOfDay(d) : new Date(query.to);
    }
  }
  return where;
};

const formatOrderItemsSummary = (order) => {
  const lines = (order?.chiTiet || []).filter((ct) => ct?.trangThai !== 'DAHUY');
  if (!lines.length) return null;
  const parts = lines
    .slice(0, 2)
    .map((ct) => {
      const name = ct?.monAn?.ten || ct?.monAnId || '---';
      return `${name} x${ct?.soLuong || 0}`;
    })
    .filter(Boolean);
  const extra = lines.length > 2 ? ` +${lines.length - 2} món` : '';
  return parts.join(', ') + extra;
};

const dashboard = async (query = {}) => {
  const now = new Date();
  const wherePay = query?.from || query?.to
    ? buildPaymentDateFilter(query)
    : { createdAt: { gte: startOfDay(now), lte: endOfDay(now) } };

  const payments = await prisma.thanhToan.findMany({
    where: wherePay,
    select: { hoaDonId: true, createdAt: true },
  });
  const invoicePaidAt = mapPaymentsToInvoicePaidAt(payments);
  const paidInvoiceIds = Array.from(invoicePaidAt.keys());
  const paidInvoices = paidInvoiceIds.length
    ? await prisma.hoaDon.findMany({
      where: { id: { in: paidInvoiceIds }, trangThai: 'PAID' },
      select: {
        id: true,
        tongThanhToan: true,
        donHangId: true,
        donHang: {
          select: {
            ban: { select: { soGhe: true } }
          }
        }
      },
    })
    : [];

  const revenue = paidInvoices.reduce((sum, inv) => sum + Number(inv.tongThanhToan || 0), 0);
  const bills = paidInvoices.length;
  const avgBill = bills ? revenue / bills : 0;

  // guest approximation: sum of seats from tables of paid orders
  const paidOrderIds = paidInvoices.map((i) => i.donHangId).filter(Boolean);
  const guests = paidInvoices.reduce((sum, inv) => sum + (inv.donHang?.ban?.soGhe || 0), 0);

  // ============ CALCULATE YESTERDAY'S DATA FOR TREND COMPARISON ============
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayPayWhere = { createdAt: { gte: startOfDay(yesterday), lte: endOfDay(yesterday) } };

  const yesterdayPayments = await prisma.thanhToan.findMany({
    where: yesterdayPayWhere,
    select: { hoaDonId: true, createdAt: true },
  });
  const yesterdayInvoicePaidAt = mapPaymentsToInvoicePaidAt(yesterdayPayments);
  const yesterdayPaidInvoiceIds = Array.from(yesterdayInvoicePaidAt.keys());
  const yesterdayPaidInvoices = yesterdayPaidInvoiceIds.length
    ? await prisma.hoaDon.findMany({
      where: { id: { in: yesterdayPaidInvoiceIds }, trangThai: 'PAID' },
      select: {
        id: true,
        tongThanhToan: true,
        donHangId: true,
        donHang: {
          select: {
            ban: { select: { soGhe: true } }
          }
        }
      },
    })
    : [];

  const yesterdayRevenue = yesterdayPaidInvoices.reduce((sum, inv) => sum + Number(inv.tongThanhToan || 0), 0);
  const yesterdayBills = yesterdayPaidInvoices.length;
  const yesterdayAvgBill = yesterdayBills ? yesterdayRevenue / yesterdayBills : 0;

  const yesterdayPaidOrderIds = yesterdayPaidInvoices.map((i) => i.donHangId).filter(Boolean);
  const yesterdayGuests = yesterdayPaidInvoices.reduce((sum, inv) => sum + (inv.donHang?.ban?.soGhe || 0), 0);

  // Calculate trend percentages
  const calcTrend = (today, yesterday) => {
    if (yesterday === 0 && today === 0) return { trend: 'flat', value: 0 };
    if (yesterday === 0) return { trend: 'up', value: 100 };
    const diff = ((today - yesterday) / yesterday) * 100;
    return {
      trend: diff > 0 ? 'up' : diff < 0 ? 'down' : 'flat',
      value: Math.abs(parseFloat(diff.toFixed(1))),
    };
  };

  const revenueTrend = calcTrend(revenue, yesterdayRevenue);
  const billsTrend = calcTrend(bills, yesterdayBills);
  const avgBillTrend = calcTrend(avgBill, yesterdayAvgBill);
  const guestsTrend = calcTrend(guests, yesterdayGuests);

  const bestSellers = paidOrderIds.length
    ? await prisma.chiTietDonHang.groupBy({
      by: ['monAnId'],
      where: { donHangId: { in: paidOrderIds }, trangThai: { not: 'DAHUY' } },
      _sum: { soLuong: true, donGia: true },
      orderBy: { _sum: { soLuong: 'desc' } },
      take: 5,
    })
    : [];
  const worstSellers = paidOrderIds.length
    ? await prisma.chiTietDonHang.groupBy({
      by: ['monAnId'],
      where: { donHangId: { in: paidOrderIds }, trangThai: { not: 'DAHUY' } },
      _sum: { soLuong: true, donGia: true },
      orderBy: { _sum: { soLuong: 'asc' } },
      take: 5,
    })
    : [];

  const sellerIds = Array.from(
    new Set([
      ...bestSellers.map((r) => r.monAnId),
      ...worstSellers.map((r) => r.monAnId),
    ].filter(Boolean)),
  );
  const dishes = sellerIds.length
    ? await prisma.monAn.findMany({
      where: { id: { in: sellerIds } },
      select: { id: true, ten: true, giaBan: true },
    })
    : [];
  const dishById = new Map(dishes.map((d) => [d.id, d]));

  const mapSeller = (r) => {
    const dish = dishById.get(r.monAnId);
    const qty = Number(r?._sum?.soLuong || 0);
    const giaBan = dish?.giaBan != null ? Number(dish.giaBan) : null;
    return {
      monAnId: r.monAnId,
      ten: dish?.ten || r.monAnId,
      giaBan,
      soLuong: qty,
      doanhThuUocTinh: giaBan != null ? giaBan * qty : null,
      _sum: r._sum,
    };
  };

  const allMaterials = await prisma.nguyenVatLieu.findMany();
  const stockAlerts = (allMaterials || [])
    .filter((i) => Number(i.soLuongTon) <= Number(i.mucTonToiThieu))
    .map((i) => ({
      id: i.id,
      ten: i.ten,
      donViTinh: i.donViTinh,
      soLuongTon: Number(i.soLuongTon || 0),
      mucTonToiThieu: Number(i.mucTonToiThieu || 0),
    }));

  const recentLogs = await prisma.nhatKyHeThong.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
  }).catch(() => []);

  // Preload related orders/invoices to turn UUIDs into readable table/item info
  const metaList = (recentLogs || []).map((l) => {
    try {
      return l?.thongTinBoSung ? JSON.parse(l.thongTinBoSung) : {};
    } catch {
      return {};
    }
  });
  const orderIdsFromLogs = Array.from(new Set(metaList.map((m) => m?.orderId).filter(Boolean)));
  const invoiceIdsFromLogs = Array.from(new Set(metaList.map((m) => m?.invoiceId).filter(Boolean)));

  const orders = orderIdsFromLogs.length
    ? await prisma.donHang.findMany({
      where: { id: { in: orderIdsFromLogs } },
      include: {
        ban: true,
        chiTiet: { include: { monAn: true } },
      },
    }).catch(() => [])
    : [];
  const orderById = new Map((orders || []).map((o) => [o.id, o]));

  const invoices = invoiceIdsFromLogs.length
    ? await prisma.hoaDon.findMany({
      where: { id: { in: invoiceIdsFromLogs } },
      include: {
        donHang: {
          include: {
            ban: true,
            chiTiet: { include: { monAn: true } },
          },
        },
      },
    }).catch(() => [])
    : [];
  const invoiceById = new Map((invoices || []).map((i) => [i.id, i]));
  const parsedLogs = (recentLogs || []).map((l) => {
    let meta = {};
    try {
      meta = l.thongTinBoSung ? JSON.parse(l.thongTinBoSung) : {};
    } catch {
      meta = {};
    }

    const resolvedInvoice = meta?.invoiceId ? invoiceById.get(meta.invoiceId) : null;
    const resolvedOrder = meta?.orderId
      ? orderById.get(meta.orderId)
      : (resolvedInvoice?.donHangId ? orderById.get(resolvedInvoice.donHangId) : resolvedInvoice?.donHang || null);
    const tableName = resolvedOrder?.ban?.ten || resolvedInvoice?.donHang?.ban?.ten || null;
    const itemsSummary = formatOrderItemsSummary(resolvedOrder || resolvedInvoice?.donHang);

    const action = String(l.hanhDong || '');
    const lower = action.toLowerCase();
    let type = 'system';
    if (lower.includes('billing') || lower.includes('pay') || lower.includes('thanh-toan')) type = 'payment';
    else if (lower.includes('orders') || lower.includes('don-hang') || lower.includes('/pos')) type = 'order';
    else if (lower.includes('inventory') || lower.includes('stock') || lower.includes('kho')) type = 'inventory';
    else if (lower.includes('check-in') || lower.includes('checkin')) type = 'checkin';
    else if (lower.includes('check-out') || lower.includes('checkout')) type = 'checkout';

    const title = (() => {
      if (action === 'PAY_INVOICE') {
        const amount = meta?.tongThanhToan != null ? Number(meta.tongThanhToan).toLocaleString('vi-VN') + '₫' : null;
        const table = tableName ? `${tableName}` : null;
        const items = itemsSummary ? ` • ${itemsSummary}` : '';
        return `Thanh toán${table ? ` ${table}` : ''}${items}${amount ? ` - ${amount}` : ''}`;
      }
      if (action === 'APPLY_DISCOUNT') {
        const amount = meta?.giamGia != null ? Number(meta.giamGia).toLocaleString('vi-VN') + '₫' : null;
        const table = tableName ? `${tableName}` : null;
        return `Áp dụng giảm giá${table ? ` ${table}` : ''}${amount ? ` - ${amount}` : ''}`;
      }
      return `${meta?.method || ''} ${action || ''}`.trim() || 'Cập nhật hệ thống';
    })();

    return {
      id: l.id,
      type,
      createdAt: l.createdAt,
      action: l.hanhDong,
      method: meta?.method,
      status: meta?.status,
      userId: meta?.userId || meta?.cashierId || null,
      title,
      invoiceId: meta?.invoiceId || null,
      orderId: meta?.orderId || resolvedInvoice?.donHangId || null,
      table: tableName || null,
      items: itemsSummary || null,
    };
  });
  const activityUserIds = Array.from(new Set(parsedLogs.map((x) => x.userId).filter(Boolean)));
  const activityUsers = activityUserIds.length
    ? await prisma.nhanVien.findMany({
      where: { id: { in: activityUserIds } },
      select: { id: true, hoTen: true },
    })
    : [];
  const userNameById = new Map(activityUsers.map((u) => [u.id, u.hoTen]));
  const recentActivities = parsedLogs.map((x) => ({
    id: x.id,
    type: x.type,
    title: x.title,
    createdAt: x.createdAt,
    user: x.userId ? userNameById.get(x.userId) || null : null,
  }));

  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const todaySchedules = await prisma.lichPhanCa.findMany({
    where: { ngay: { gte: todayStart, lte: todayEnd } },
    include: {
      nhanVien: { include: { vaiTro: true } },
      caLamViec: true,
      chamCong: true,
    },
    orderBy: { ngay: 'asc' },
  }).catch(() => []);
  const todayShifts = (todaySchedules || []).map((s) => {
    const hasCheckIn = s.chamCong?.some((c) => c.thoiGianVao && !c.thoiGianRa);
    return {
      id: s.id,
      name: s.nhanVien?.hoTen || '---',
      role: normalizeRoleCode(s.nhanVien?.vaiTro?.ten),
      status: hasCheckIn ? 'active' : 'upcoming',
      time: s.caLamViec ? `${s.caLamViec.batDau} - ${s.caLamViec.ketThuc}` : '---',
    };
  });

  const range = query?.range;
  const revenueChart = await buildRevenueChart(range);

  return {
    revenue,
    bills,
    avgBill,
    guests,
    // Trend comparison data (today vs yesterday)
    trends: {
      revenue: revenueTrend,
      bills: billsTrend,
      avgBill: avgBillTrend,
      guests: guestsTrend,
    },
    revenueChart,
    bestSellers: bestSellers.map(mapSeller),
    worstSellers: worstSellers.map(mapSeller),
    stockAlerts,
    recentActivities,
    todayShifts,
  };
};

const sales = async (query) => {
  // Align with dashboard KPI: sales are counted by payment time (ThanhToan.createdAt)
  const { from, to } = resolveLocalDateRange(query, 'month');
  const payWhere = {};
  if (from || to) {
    payWhere.createdAt = {};
    if (from) payWhere.createdAt.gte = from;
    if (to) payWhere.createdAt.lte = to;
  }

  const payments = await prisma.thanhToan.findMany({
    where: payWhere,
    select: { hoaDonId: true, createdAt: true },
  });

  const invoicePaidAt = mapPaymentsToInvoicePaidAt(payments);
  const invoiceIds = Array.from(invoicePaidAt.keys());
  if (invoiceIds.length === 0) return { items: [], query };

  const invoices = await prisma.hoaDon.findMany({
    where: { id: { in: invoiceIds }, trangThai: 'PAID' },
    include: { donHang: { include: { ban: true } }, thanhToan: true },
  });

  const items = invoices
    .map((inv) => ({
      ...inv,
      paidAt: invoicePaidAt.get(inv.id) || null,
    }))
    .sort((a, b) => {
      const ta = a.paidAt ? new Date(a.paidAt).getTime() : 0;
      const tb = b.paidAt ? new Date(b.paidAt).getTime() : 0;
      return tb - ta;
    });

  return { items, query };
};

const menuPerformance = async (query) => {
  const where = buildDateFilter(query);
  const rows = await prisma.chiTietDonHang.groupBy({
    by: ['monAnId'],
    where: { donHang: where, trangThai: { not: 'DAHUY' } },
    _sum: { soLuong: true, donGia: true },
  });
  const totalRevenue = rows.reduce((sum, r) => sum + Number(r._sum.donGia || 0) * Number(r._sum.soLuong || 0), 0);
  const items = await Promise.all(
    rows.map(async (r) => {
      const dish = await prisma.monAn.findUnique({ where: { id: r.monAnId } });
      const qty = Number(r._sum.soLuong || 0);
      const revenue = Number(r._sum.donGia || 0) * qty;
      return {
        monAnId: r.monAnId,
        ten: dish?.ten || r.monAnId,
        soLuong: qty,
        doanhThu: revenue,
        tyTrong: totalRevenue ? (revenue / totalRevenue) * 100 : 0,
      };
    }),
  );
  return { items, query };
};

const inventory = async (query) => {
  const items = await prisma.nguyenVatLieu.findMany();
  return { items, query };
};

const attendance = async (query) => {
  const items = await prisma.chamCong.findMany({
    include: { lichPhanCa: { include: { nhanVien: true, caLamViec: true } } },
    orderBy: { thoiGianVao: 'desc' },
  });
  const mapped = items.map((i) => {
    const hours =
      i.thoiGianRa && i.thoiGianVao
        ? (new Date(i.thoiGianRa).getTime() - new Date(i.thoiGianVao).getTime()) / 3600000
        : 0;
    return { ...i, hours };
  });
  return { items: mapped, query };
};

module.exports = { dashboard, sales, menuPerformance, inventory, attendance };
