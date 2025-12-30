const reportsService = require('../services/reports.service');

const dashboard = async (req, res, next) => {
  try {
    const data = await reportsService.dashboard(req.query);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const salesReport = async (req, res, next) => {
  try {
    const data = await reportsService.sales(req.query);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const menuPerformance = async (req, res, next) => {
  try {
    const data = await reportsService.menuPerformance(req.query);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const inventoryReport = async (req, res, next) => {
  try {
    const data = await reportsService.inventory(req.query);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const attendanceReport = async (req, res, next) => {
  try {
    const data = await reportsService.attendance(req.query);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const exportReport = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const data = await reportsService.dashboard(req.query);

    let csv = '\uFEFF'; // BOM for Excel UTF-8
    csv += 'BAO CAO DOANH THU & LOI NHUAN\n';
    csv += `Tu ngay,${from || 'Toan thoi gian'},Den ngay,${to || 'Hien tai'}\n\n`;

    // 1. Overview
    csv += 'I. TONG QUAN TAI CHINH\n';
    csv += `Doanh thu thuan,${data.revenue}\n`;
    csv += `Loi nhuan gop,${data.profit || 0}\n`;
    csv += `Ty suat loi nhuan,${data.revenue ? ((data.profit / data.revenue) * 100).toFixed(1) + '%' : '0%'}\n`;
    csv += `So don hang,${data.bills}\n`;
    csv += `Gia tri TB/Don,${data.avgBill.toFixed(0)}\n`;
    csv += `Khach hang moi,${data.guests}\n\n`;

    // 2. Category Distribution
    csv += 'II. PHAN BO DOANH THU THEO DANH MUC\n';
    csv += 'Danh muc,Doanh thu\n';
    (data.categoryDistribution || []).forEach((cat) => {
      csv += `"${cat.name}",${cat.value}\n`;
    });
    csv += '\n';

    // 3. Best Sellers (Profitability)
    csv += 'III. DU LIEU BAN HANG CHI TIET (TOP MON)\n';
    csv += 'Ten mon,So luong,Gia von/dv,Gia ban/dv,Doanh thu,Tong gia von,Loi nhuan\n';
    (data.bestSellers || []).slice(0, 20).forEach((item) => {
      csv += `"${item.ten}",${item.soLuong},${item.giaVon || 0},${item.giaBan || 0},${item.doanhThuUocTinh || 0},${item.tongGiaVon || 0},${item.loiNhuan || 0}\n`;
    });
    csv += '\n';

    // 4. Stock Alerts
    csv += 'IV. CANH BAO TON KHO (LOW STOCK)\n';
    csv += 'Ten nguyen lieu,Ton hien tai,Muc toi thieu,Don vi\n';
    (data.stockAlerts || []).forEach((item) => {
      csv += `"${item.ten}",${item.soLuongTon},${item.mucTonToiThieu},${item.donViTinh}\n`;
    });

    const filename = `report_${from || 'all'}_${to || 'all'}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.send(csv);
  } catch (err) {
    next(err);
  }
};

module.exports = { dashboard, salesReport, menuPerformance, inventoryReport, attendanceReport, exportReport };
