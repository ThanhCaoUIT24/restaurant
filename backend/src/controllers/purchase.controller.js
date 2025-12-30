const purchaseService = require('../services/purchase.service');

const listPOs = async (req, res, next) => {
  try {
    const data = await purchaseService.list(req.query);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const createPO = async (req, res, next) => {
  try {
    const data = await purchaseService.create(req.body);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
};

const updatePOStatus = async (req, res, next) => {
  try {
    const data = await purchaseService.updateStatus(req.params.id, req.body.status);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const createReceipt = async (req, res, next) => {
  try {
    const data = await purchaseService.createReceipt(req.body);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
};

const listSuppliers = async (req, res, next) => {
  try {
    const data = await purchaseService.listSuppliers();
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const createSupplier = async (req, res, next) => {
  try {
    const data = await purchaseService.createSupplier(req.body);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
};

const updateSupplier = async (req, res, next) => {
  try {
    const data = await purchaseService.updateSupplier(req.params.id, req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const deleteSupplier = async (req, res, next) => {
  try {
    const data = await purchaseService.deleteSupplier(req.params.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listPOs,
  createPO,
  updatePOStatus,
  createReceipt,
  listSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
};
