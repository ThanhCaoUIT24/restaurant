const router = require('express').Router();
const { authMiddleware } = require('../middleware/auth');
const { requirePermissions, requireAdmin } = require('../middleware/rbac');
const { PERMISSIONS } = require('../utils/permissions');
const { 
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
} = require('../controllers/inventory.controller');

router.use(authMiddleware);

// Materials - read accessible to STOCK_VIEW
router.get('/materials', requirePermissions([PERMISSIONS.STOCK_VIEW]), listMaterials);
router.get('/materials/:id', requirePermissions([PERMISSIONS.STOCK_VIEW]), getMaterial);

// Materials CRUD - require STOCK_MANAGE permission
router.post('/materials', requirePermissions([PERMISSIONS.STOCK_MANAGE]), createMaterial);
router.put('/materials/:id', requirePermissions([PERMISSIONS.STOCK_MANAGE]), updateMaterial);
router.delete('/materials/:id', requirePermissions([PERMISSIONS.STOCK_MANAGE]), deleteMaterial);

// Alerts
router.get('/alerts', requirePermissions([PERMISSIONS.STOCK_VIEW]), listAlerts);
router.post('/alerts/send-email', requirePermissions([PERMISSIONS.STOCK_MANAGE]), sendLowStockAlertEmail);
router.post('/alerts/test-email', requireAdmin(), sendTestEmail);

// Adjustments - critical operations require STOCK_MANAGE permission
router.get('/adjustments', requirePermissions([PERMISSIONS.STOCK_VIEW]), listAdjustments);
router.get('/adjustments/:id/order', requirePermissions([PERMISSIONS.STOCK_VIEW]), getAdjustmentOrder);
router.post('/adjustments', requirePermissions([PERMISSIONS.STOCK_MANAGE]), createAdjustment);
router.post('/adjustments/bulk', requirePermissions([PERMISSIONS.STOCK_MANAGE]), createBulkAdjustment);

// Recipes - require STOCK_MANAGE permission
router.post('/recipes', requirePermissions([PERMISSIONS.STOCK_MANAGE]), upsertRecipe);
router.get('/recipes/:monAnId', requirePermissions([PERMISSIONS.STOCK_VIEW]), getRecipe);

module.exports = router;
