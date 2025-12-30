const router = require('express').Router();
const { authMiddleware } = require('../middleware/auth');
const { requirePermissions, requireAdmin } = require('../middleware/rbac');
const { PERMISSIONS } = require('../utils/permissions');
const { 
  listCustomers, 
  getCustomer,
  findByPhone,
  createCustomer, 
  updateCustomer,
  deleteCustomer,
  getCustomerPoints, 
  addPoints,
  usePoints,
  getMembershipTiers,
} = require('../controllers/customers.controller');

router.use(authMiddleware);

// Customer CRUD - Read: CUSTOMER_VIEW, Write: CUSTOMER_MANAGE
router.get('/', requirePermissions([PERMISSIONS.CUSTOMER_VIEW]), listCustomers);
router.get('/tiers', requirePermissions([PERMISSIONS.CUSTOMER_VIEW]), getMembershipTiers);
router.get('/phone/:phone', requirePermissions([PERMISSIONS.CUSTOMER_VIEW]), findByPhone);
router.get('/:id', requirePermissions([PERMISSIONS.CUSTOMER_VIEW]), getCustomer);
router.post('/', requirePermissions([PERMISSIONS.CUSTOMER_MANAGE]), createCustomer);
router.put('/:id', requirePermissions([PERMISSIONS.CUSTOMER_MANAGE]), updateCustomer);
router.delete('/:id', requireAdmin(), deleteCustomer);

// Loyalty points - CUSTOMER_MANAGE
router.get('/:id/points', requirePermissions([PERMISSIONS.CUSTOMER_VIEW]), getCustomerPoints);
router.post('/:id/points/add', requirePermissions([PERMISSIONS.CUSTOMER_MANAGE]), addPoints);
router.post('/:id/points/use', requirePermissions([PERMISSIONS.CUSTOMER_MANAGE]), usePoints);

module.exports = router;
