const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  if (process.env.NO_AUTH === 'true') {
    req.user = { id: 'dev-user', roles: ['Admin'], permissions: ['ADMIN_MANAGE'] };
    return next();
  }
  const authHeader = req.headers.authorization || '';
  let token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  
  // Also check query parameter for SSE connections (EventSource doesn't support headers)
  if (!token && req.query.token) {
    token = req.query.token;
  }
  
  if (!token) {
    console.log('[AUTH] No token provided');
    return res.status(401).json({ message: 'Unauthorized' });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = payload;
    console.log(`[AUTH] ✓ User authenticated: ${payload.id}, Roles: [${payload.roles?.join(', ')}], Permissions: ${payload.permissions?.length || 0}`);
    return next();
  } catch (err) {
    console.log('[AUTH] ✗ Token verification failed:', err.message);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = { authMiddleware };
