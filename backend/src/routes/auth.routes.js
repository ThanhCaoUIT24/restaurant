const router = require('express').Router();
const { register, login, me, refresh } = require('../controllers/auth.controller');
const { authMiddleware } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { registerSchema, loginSchema, refreshSchema } = require('../validation/auth.validation');

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.get('/me', authMiddleware, me);
router.post('/refresh', validate(refreshSchema), refresh);

module.exports = router;
