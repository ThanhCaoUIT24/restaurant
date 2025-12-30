const router = require('express').Router();
const { authMiddleware } = require('../middleware/auth');
const { requirePermissions, requireAdmin } = require('../middleware/rbac');
const { PERMISSIONS } = require('../utils/permissions');
const {
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
} = require('../controllers/admin.controller');

router.use(authMiddleware);

// User management - Chỉ Admin mới có quyền
router.get('/users', requireAdmin(), listUsers);
router.get('/users/employees-available', requireAdmin(), listEmployeesWithoutAccount);
router.get('/users/:id', requireAdmin(), getUser);
router.post('/users', requirePermissions([PERMISSIONS.ACCOUNT_CREATE]), createUser);
router.put('/users/:id', requirePermissions([PERMISSIONS.ACCOUNT_MANAGE]), updateUser);
router.delete('/users/:id', requirePermissions([PERMISSIONS.ACCOUNT_DELETE]), deleteUser);

// Role management - Chỉ Admin
router.get('/roles', requireAdmin(), listRoles);
router.get('/permissions', requireAdmin(), listPermissions);
router.post('/roles', requireAdmin(), createRole);
router.put('/roles/:id', requireAdmin(), updateRole);
router.delete('/roles/:id', requireAdmin(), deleteRole);

// Audit logs - Chỉ Admin
router.get('/audit', requireAdmin(), listAuditLogs);

// System config - Chỉ Admin
router.get('/config', requireAdmin(), getConfigs);
router.post('/config', requireAdmin(), updateConfig);
router.post('/config/batch', requireAdmin(), batchUpdateConfigs);

// Loyalty tiers - Chỉ Admin
router.get('/loyalty-tiers', requireAdmin(), listLoyaltyTiers);
router.post('/loyalty-tiers', requireAdmin(), createLoyaltyTier);
router.put('/loyalty-tiers/:id', requireAdmin(), updateLoyaltyTier);
router.delete('/loyalty-tiers/:id', requireAdmin(), deleteLoyaltyTier);

// Promotions - Chỉ Admin
router.get('/promotions', requireAdmin(), listPromotions);
router.get('/promotions/:id', requireAdmin(), getPromotion);
router.post('/promotions', requireAdmin(), createPromotion);
router.put('/promotions/:id', requireAdmin(), updatePromotion);
router.delete('/promotions/:id', requireAdmin(), deletePromotion);

// Bulk price update - Manager hoặc Admin
router.post('/categories/:danhMucId/update-prices', requirePermissions([PERMISSIONS.MENU_MANAGE]), updateCategoryPrices);

module.exports = router;
