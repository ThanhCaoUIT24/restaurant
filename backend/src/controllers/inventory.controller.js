const inventoryService = require('../services/inventory.service');

// ==================== MATERIALS ====================

const listMaterials = async (req, res, next) => {
  try {
    const data = await inventoryService.listMaterials();
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const getMaterial = async (req, res, next) => {
  try {
    const data = await inventoryService.getMaterial(req.params.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const createMaterial = async (req, res, next) => {
  try {
    const data = await inventoryService.createMaterial(req.body);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
};

const updateMaterial = async (req, res, next) => {
  try {
    const data = await inventoryService.updateMaterial(req.params.id, req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const deleteMaterial = async (req, res, next) => {
  try {
    const data = await inventoryService.deleteMaterial(req.params.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

// ==================== ALERTS ====================

const listAlerts = async (req, res, next) => {
  try {
    const data = await inventoryService.listAlerts();
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const sendLowStockAlertEmail = async (req, res, next) => {
  try {
    const data = await inventoryService.checkAndSendLowStockAlert();
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const sendTestEmail = async (req, res, next) => {
  try {
    const { sendTestEmail: sendTest } = require('../services/email.service');
    const { to } = req.body;
    if (!to) {
      return res.status(400).json({ error: 'Email address required' });
    }
    const result = await sendTest(to);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// ==================== ADJUSTMENTS ====================

const listAdjustments = async (req, res, next) => {
  try {
    const data = await inventoryService.listAdjustments(req.query);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const createAdjustment = async (req, res, next) => {
  try {
    const data = await inventoryService.createAdjustment(req.body, req.user);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
};

const createBulkAdjustment = async (req, res, next) => {
  try {
    const data = await inventoryService.createBulkAdjustment(req.body, req.user);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
};

const getAdjustmentOrder = async (req, res, next) => {
  try {
    const data = await inventoryService.getAdjustmentOrder(req.params.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

// ==================== RECIPES ====================

const upsertRecipe = async (req, res, next) => {
  try {
    const data = await inventoryService.upsertRecipe(req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const getRecipe = async (req, res, next) => {
  try {
    const data = await inventoryService.getRecipe(req.params.monAnId);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

module.exports = { 
  listMaterials,
  getMaterial,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  listAlerts,
  sendLowStockAlertEmail,
  sendTestEmail,
  listAdjustments,
  createAdjustment,
  createBulkAdjustment,
  getAdjustmentOrder,
  upsertRecipe, 
  getRecipe,
};
