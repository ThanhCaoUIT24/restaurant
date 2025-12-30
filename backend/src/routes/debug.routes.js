const router = require('express').Router();
const { debugPermissions, getAllPermissions } = require('../controllers/debug.controller');
const { authMiddleware } = require('../middleware/auth');

// Debug endpoints - chỉ dùng trong development
if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
  // Xem permissions của user hiện tại
  router.get('/my-permissions', authMiddleware, debugPermissions);
  
  // Xem tất cả permissions trong hệ thống
  router.get('/all-permissions', authMiddleware, getAllPermissions);
}

module.exports = router;
