const adminService = require('../services/admin.service');

// ==================== USER CONTROLLERS ====================

const listUsers = async (req, res, next) => {
  try {
    const data = await adminService.listUsers(req.query);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const getUser = async (req, res, next) => {
  try {
    const data = await adminService.getUser(req.params.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const createUser = async (req, res, next) => {
  try {
    const data = await adminService.createUser(req.body);
    await adminService.createAuditLog('CREATE_USER', { username: req.body.username, by: req.user?.id });
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const data = await adminService.updateUser(req.params.id, req.body);
    await adminService.createAuditLog('UPDATE_USER', { userId: req.params.id, by: req.user?.id });
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const data = await adminService.deleteUser(req.params.id);
    await adminService.createAuditLog('DELETE_USER', { userId: req.params.id, by: req.user?.id });
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const listEmployeesWithoutAccount = async (req, res, next) => {
  try {
    const data = await adminService.listEmployeesWithoutAccount();
    res.json(data);
  } catch (err) {
    next(err);
  }
};

// ==================== ROLE CONTROLLERS ====================

const listRoles = async (req, res, next) => {
  try {
    const data = await adminService.listRoles();
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const listPermissions = async (req, res, next) => {
  try {
    const data = await adminService.listPermissions();
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const createRole = async (req, res, next) => {
  try {
    const data = await adminService.createRole(req.body);
    await adminService.createAuditLog('CREATE_ROLE', { roleName: req.body.ten, by: req.user?.id });
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
};

const updateRole = async (req, res, next) => {
  try {
    const data = await adminService.updateRole(req.params.id, req.body, req.user);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const deleteRole = async (req, res, next) => {
  try {
    const data = await adminService.deleteRole(req.params.id);
    await adminService.createAuditLog('DELETE_ROLE', { roleId: req.params.id, by: req.user?.id });
    res.json(data);
  } catch (err) {
    next(err);
  }
};

// ==================== AUDIT LOG CONTROLLERS ====================

const listAuditLogs = async (req, res, next) => {
  try {
    const data = await adminService.listAuditLogs(req.query);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

// ==================== CONFIG CONTROLLERS ====================

const getConfigs = async (req, res, next) => {
  try {
    const data = await adminService.getConfigs();
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const updateConfig = async (req, res, next) => {
  try {
    const { key, value } = req.body;
    const data = await adminService.updateConfig(key, value);
    await adminService.createAuditLog('UPDATE_CONFIG', { key, by: req.user?.id });
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const batchUpdateConfigs = async (req, res, next) => {
  try {
    const { configs } = req.body;
    const data = await adminService.batchUpdateConfigs(configs);
    await adminService.createAuditLog('BATCH_UPDATE_CONFIG', { keys: configs.map(c => c.key), by: req.user?.id });
    res.json(data);
  } catch (err) {
    next(err);
  }
};

// ==================== LOYALTY TIER CONTROLLERS ====================

const listLoyaltyTiers = async (req, res, next) => {
  try {
    const data = await adminService.listLoyaltyTiers();
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const createLoyaltyTier = async (req, res, next) => {
  try {
    const data = await adminService.createLoyaltyTier(req.body);
    await adminService.createAuditLog('CREATE_LOYALTY_TIER', { ten: req.body.ten, by: req.user?.id });
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
};

const updateLoyaltyTier = async (req, res, next) => {
  try {
    const data = await adminService.updateLoyaltyTier(req.params.id, req.body);
    await adminService.createAuditLog('UPDATE_LOYALTY_TIER', { id: req.params.id, by: req.user?.id });
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const deleteLoyaltyTier = async (req, res, next) => {
  try {
    const data = await adminService.deleteLoyaltyTier(req.params.id);
    await adminService.createAuditLog('DELETE_LOYALTY_TIER', { id: req.params.id, by: req.user?.id });
    res.json(data);
  } catch (err) {
    next(err);
  }
};

// ==================== PROMOTION CONTROLLERS ====================

const listPromotions = async (req, res, next) => {
  try {
    const data = await adminService.listPromotions(req.query);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const getPromotion = async (req, res, next) => {
  try {
    const data = await adminService.getPromotion(req.params.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const createPromotion = async (req, res, next) => {
  try {
    const data = await adminService.createPromotion(req.body);
    await adminService.createAuditLog('CREATE_PROMOTION', { ten: req.body.ten, by: req.user?.id });
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
};

const updatePromotion = async (req, res, next) => {
  try {
    const data = await adminService.updatePromotion(req.params.id, req.body);
    await adminService.createAuditLog('UPDATE_PROMOTION', { id: req.params.id, by: req.user?.id });
    res.json(data);
  } catch (err) {
    next(err);
  }
};

const deletePromotion = async (req, res, next) => {
  try {
    const data = await adminService.deletePromotion(req.params.id);
    await adminService.createAuditLog('DELETE_PROMOTION', { id: req.params.id, by: req.user?.id });
    res.json(data);
  } catch (err) {
    next(err);
  }
};

// ==================== BULK PRICE UPDATE ====================

const updateCategoryPrices = async (req, res, next) => {
  try {
    const data = await adminService.updateCategoryPrices(req.params.danhMucId, req.body);
    await adminService.createAuditLog('BULK_UPDATE_PRICES', { danhMucId: req.params.danhMucId, ...req.body, by: req.user?.id });
    res.json(data);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  listEmployeesWithoutAccount,
  listRoles,
  listPermissions,
  createRole,
  updateRole,
  deleteRole,
  listAuditLogs,
  getConfigs,
  updateConfig,
  batchUpdateConfigs,
  listLoyaltyTiers,
  createLoyaltyTier,
  updateLoyaltyTier,
  deleteLoyaltyTier,
  listPromotions,
  getPromotion,
  createPromotion,
  updatePromotion,
  deletePromotion,
  updateCategoryPrices,
};
