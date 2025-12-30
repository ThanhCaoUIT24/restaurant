const router = require('express').Router();
const { authMiddleware } = require('../middleware/auth');
const { requirePermissions } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');
const { PERMISSIONS } = require('../utils/permissions');
const {
  createOrder,
  updateOrder,
  listOrders,
  sendToKitchen,
  voidItem,
  streamNotifications,
} = require('../controllers/orders.controller');
const {
  createOrderSchema,
  updateOrderSchema,
  sendOrderSchema,
  voidItemSchema,
} = require('../validation/orders.validation');

router.use(authMiddleware);

// List orders: ORDER_VIEW
router.get('/', requirePermissions([PERMISSIONS.ORDER_VIEW]), listOrders);
// Create/Update orders: ORDER_CREATE, ORDER_UPDATE
router.post('/', validate(createOrderSchema), requirePermissions([PERMISSIONS.ORDER_CREATE]), createOrder);
router.patch('/:id', validate(updateOrderSchema), requirePermissions([PERMISSIONS.ORDER_UPDATE]), updateOrder);
router.post('/:id/send', validate(sendOrderSchema), requirePermissions([PERMISSIONS.ORDER_CREATE, PERMISSIONS.ORDER_UPDATE]), sendToKitchen);
// Void item: ORDER_VOID hoặc ORDER_VOID_APPROVE
router.post('/:id/void-item', validate(voidItemSchema), requirePermissions([PERMISSIONS.ORDER_VOID, PERMISSIONS.ORDER_VOID_APPROVE]), voidItem);
// Notifications stream: ORDER_VIEW
router.get('/notifications/stream', requirePermissions([PERMISSIONS.ORDER_VIEW]), streamNotifications);

module.exports = router;
