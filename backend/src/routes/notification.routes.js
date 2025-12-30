const express = require('express');
const router = express.Router();
const controller = require('../controllers/notification.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.get('/stream', requireAuth, controller.streamNotifications);
router.get('/', requireAuth, controller.getMyNotifications);
router.patch('/:id/read', requireAuth, controller.markRead);
router.patch('/read-all', requireAuth, controller.markAllRead);

module.exports = router;
