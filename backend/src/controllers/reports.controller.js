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

module.exports = { dashboard, salesReport, menuPerformance, inventoryReport, attendanceReport };
