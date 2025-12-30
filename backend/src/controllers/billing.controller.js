const billingService = require('../services/billing.service');

const listOpenInvoices = async (req, res, next) => {
  try {
    const data = await billingService.listOpen();
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const listPendingOrders = async (req, res, next) => {
  try {
    const data = await billingService.listPendingOrders();
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const createInvoice = async (req, res, next) => {
  try {
    const data = await billingService.createFromOrder(req.params.orderId, req.body, req.user);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
};

const payInvoice = async (req, res, next) => {
  try {
    const data = await billingService.pay(req.params.id, req.body, req.user);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const openShift = async (req, res, next) => {
  try {
    const data = await billingService.openShift(req.user, req.body);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
};

const currentShift = async (req, res, next) => {
  try {
    const data = await billingService.getCurrentShift(req.user);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const closeShift = async (req, res, next) => {
  try {
    const data = await billingService.closeShift(req.user, req.params.id, req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const splitBillByItems = async (req, res, next) => {
  try {
    const data = await billingService.splitBillByItems(req.params.id, req.body.itemIds);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
};

const splitBillByPeople = async (req, res, next) => {
  try {
    const data = await billingService.splitBillByPeople(req.params.id, req.body.numPeople);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
};

const getInvoiceDetails = async (req, res, next) => {
  try {
    const data = await billingService.getInvoiceDetails(req.params.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const getInvoicePrintData = async (req, res, next) => {
  try {
    const data = await billingService.getInvoicePrintData(req.params.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const exportInvoices = async (req, res, next) => {
  try {
    const { startDate, endDate, status, format } = req.query;
    const data = await billingService.exportInvoices({ startDate, endDate, status, format });
    
    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${data.filename}"`);
      return res.send(data.data);
    }
    
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const getDailySalesReport = async (req, res, next) => {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];
    const data = await billingService.getDailySalesReport(date);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const mergeInvoices = async (req, res, next) => {
  try {
    const data = await billingService.mergeInvoices(req.body.invoiceIds, req.user);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
};

const getZReport = async (req, res, next) => {
  try {
    const data = await billingService.getZReport(req.params.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const exportZReport = async (req, res, next) => {
  try {
    const format = req.query.format || 'csv';
    const data = await billingService.exportZReportCSV(req.params.id, format);
    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="zreport_${req.params.id}.csv"`);
      return res.send(data);
    }
    // default JSON
    res.json(data);
  } catch (err) {
    next(err);
  }
};

module.exports = { 
  listOpenInvoices,
  listPendingOrders,
  createInvoice, 
  payInvoice, 
  openShift, 
  currentShift, 
  closeShift,
  splitBillByItems,
  splitBillByPeople,
  getInvoiceDetails,
  getInvoicePrintData,
  exportInvoices,
  getDailySalesReport,
  mergeInvoices,
  getZReport,
  exportZReport,
};
