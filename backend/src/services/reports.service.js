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
  let from, to;
  let categories = [];
  let mapData = () => { };

  if (safeRange === 'week') {
    from = startOfDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6));
    to = endOfDay(now);

    // Generate last 7 days keys
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(from);
      d.setDate(d.getDate() + i);
      dates.push(d);
    }
    categories = dates.map(d => formatWeekdayLabelVI(d));

    // Series data extraction
    mapData = (payments) => {
      const buckets = new Map(dates.map(d => [localDateKey(d), 0]));
      for (const p of payments) {
        const k = localDateKey(p.createdAt);
        if (buckets.has(k)) {
          buckets.set(k, buckets.get(k) + Number(p.soTien));
        }
      }
      return dates.map(d => buckets.get(localDateKey(d)));
    };
  } else if (safeRange === 'month') {
    from = startOfDay(new Date(now.getFullYear(), now.getMonth(), 1));
    to = endOfDay(now);

    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    categories = Array.from({ length: daysInMonth }, (_, i) => String(i + 1));

    mapData = (payments) => {
      const data = Array(daysInMonth).fill(0);
      for (const p of payments) {
        const d = new Date(p.createdAt).getDate(); // 1-31
        if (d >= 1 && d <= daysInMonth) {
          data[d - 1] += Number(p.soTien);
        }
      }
      return data;
    };
  } else {
    // year
    from = startOfDay(new Date(now.getFullYear(), 0, 1));
    to = endOfDay(now);

    categories = Array.from({ length: 12 }, (_, i) => `T${i + 1}`);
    mapData = (payments) => {
      const data = Array(12).fill(0);
      for (const p of payments) {
        const m = new Date(p.createdAt).getMonth(); // 0-11
        if (m >= 0 && m < 12) {
          data[m] += Number(p.soTien);
        }
      }
      return data;
    };
  }

  const payments = await prisma.thanhToan.findMany({
    where: {
      createdAt: { gte: from, lte: to },
      hoaDon: { trangThai: 'PAID' } // Only count payments for fully paid invoices, or remove this to count all cash
    },
    select: { soTien: true, createdAt: true },
  });

  const data = mapData(payments);

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

const getDishCosts = async () => {
  const allRecipes = await prisma.congThucMon.findMany({
    include: { nguyenVatLieu: true },
  });
  const costs = new Map();
  for (const r of allRecipes) {
    if (!r.nguyenVatLieu) continue;
    const price = Number(r.nguyenVatLieu.giaNhapGanNhat || 0);
    const qty = Number(r.soLuong || 0);
    const currentCost = costs.get(r.monAnId) || 0;
    costs.set(r.monAnId, currentCost + price * qty);
  }
  return costs;
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

  // Calculate Profit
  const dishCosts = await getDishCosts();
  const paidOrderIds = paidInvoices.map((i) => i.donHangId).filter(Boolean);

  // Fetch details to calculate COGS (Cost of Goods Sold)
  const soldItems = paidOrderIds.length
    ? await prisma.chiTietDonHang.findMany({
      where: { donHangId: { in: paidOrderIds }, trangThai: { not: 'DAHUY' } },
      select: { monAnId: true, soLuong: true }
    })
    : [];

  let totalCost = 0;
  for (const item of soldItems) {
    const unitCost = dishCosts.get(item.monAnId) || 0;
    totalCost += unitCost * item.soLuong;
  }
  const profit = revenue - totalCost;

  // guest approximation: sum of seats from tables of paid orders
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

  // Calculate Yesterday Profit for Trend
  const yesterdayPaidOrderIds = yesterdayPaidInvoices.map((i) => i.donHangId).filter(Boolean);
  const yesterdaySoldItems = yesterdayPaidOrderIds.length
    ? await prisma.chiTietDonHang.findMany({
      where: { donHangId: { in: yesterdayPaidOrderIds }, trangThai: { not: 'DAHUY' } },
      select: { monAnId: true, soLuong: true }
    })
    : [];
  let yesterdayTotalCost = 0;
  for (const item of yesterdaySoldItems) {
    const unitCost = dishCosts.get(item.monAnId) || 0;
    yesterdayTotalCost += unitCost * item.soLuong;
  }
  const yesterdayProfit = yesterdayRevenue - yesterdayTotalCost;
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
  const profitTrend = calcTrend(profit, yesterdayProfit);
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

    // Calculate Unit Cost (Gia Von/Don vi)
    const unitCost = dishCosts.get(r.monAnId) || 0;

    // Calculate estimates
    const revenueEst = giaBan != null ? giaBan * qty : 0;
    const totalCost = unitCost * qty;
    const profit = revenueEst - totalCost;

    return {
      monAnId: r.monAnId,
      ten: dish?.ten || r.monAnId,
      giaBan,
      giaVon: unitCost,
      soLuong: qty,
      doanhThuUocTinh: revenueEst,
      tongGiaVon: totalCost,
      loiNhuan: profit,
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

  // Calculate Category Distribution
  const categoryStats = paidOrderIds.length
    ? await prisma.chiTietDonHang.findMany({
      where: { donHangId: { in: paidOrderIds }, trangThai: { not: 'DAHUY' } },
      select: {
        soLuong: true,
        donGia: true,
        monAn: { select: { danhMuc: { select: { ten: true } } } }
      }
    })
    : [];

  const categoryMap = {};
  categoryStats.forEach(item => {
    const catName = item.monAn?.danhMuc?.ten || 'Khác';
    const rev = Number(item.donGia) * item.soLuong;
    if (!categoryMap[catName]) categoryMap[catName] = 0;
    categoryMap[catName] += rev;
  });

  const categoryDistribution = Object.entries(categoryMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

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
    profit, // New Field
    bills,
    avgBill,
    guests,
    // Trend comparison data (today vs yesterday)
    trends: {
      revenue: revenueTrend,
      profit: profitTrend, // New Trend
      bills: billsTrend,
      avgBill: avgBillTrend,
      guests: guestsTrend,
    },
    revenueChart,
    bestSellers: bestSellers.map(mapSeller),
    worstSellers: worstSellers.map(mapSeller),
    categoryDistribution,
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

  const dishCosts = await getDishCosts();

  const items = await Promise.all(
    rows.map(async (r) => {
      const dish = await prisma.monAn.findUnique({ where: { id: r.monAnId } });
      const qty = Number(r._sum.soLuong || 0);
      const revenue = Number(r._sum.donGia || 0) * qty;
      const unitCost = dishCosts.get(r.monAnId) || 0;
      const totalCost = unitCost * qty;
      const profit = revenue - totalCost;

      return {
        monAnId: r.monAnId,
        ten: dish?.ten || r.monAnId,
        soLuong: qty,
        doanhThu: revenue,
        giaVon: totalCost, // New field
        loiNhuan: profit,  // New field
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
