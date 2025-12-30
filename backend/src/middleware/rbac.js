const { ROLES } = require('../utils/permissions');

/**
 * RBAC Middleware - Kiểm tra quyền hạn người dùng
 * Middleware này đảm bảo user có đủ quyền để thực hiện action
 */

/**
 * Kiểm tra user có một trong các permissions được yêu cầu
 * @param {string[]} required - Mảng các permissions cần thiết (OR logic)
 */
const requirePermissions = (required = []) => (req, res, next) => {
  console.log(`[RBAC] Checking permissions: [${required.join(', ')}]`);
  
  if (!req.user) {
    console.log('[RBAC] ✗ No user in request');
    return res.status(401).json({ 
      message: 'Unauthorized - Vui lòng đăng nhập',
      code: 'UNAUTHORIZED' 
    });
  }

  if (!Array.isArray(req.user.permissions)) {
    console.log('[RBAC] ✗ User permissions is not an array:', typeof req.user.permissions);
    return res.status(403).json({ 
      message: 'Forbidden - Không có quyền truy cập',
      code: 'FORBIDDEN' 
    });
  }

  // Nếu không yêu cầu permission cụ thể, cho phép
  if (required.length === 0) {
    console.log('[RBAC] ✓ No specific permission required');
    return next();
  }

  // Kiểm tra user có ít nhất một trong các permissions required
  const hasPermission = required.some((perm) => req.user.permissions.includes(perm));
  
  if (!hasPermission) {
    console.log(`[RBAC] ✗ Permission denied. Required: [${required.join(', ')}], User has: [${req.user.permissions.join(', ')}]`);
    return res.status(403).json({ 
      message: 'Forbidden - Bạn không có quyền thực hiện hành động này',
      code: 'FORBIDDEN',
      required,
      userPermissions: req.user.permissions
    });
  }

  console.log(`[RBAC] ✓ Permission granted for user ${req.user.id}`);
  return next();
};

/**
 * Kiểm tra user có TẤT CẢ các permissions được yêu cầu
 * @param {string[]} required - Mảng các permissions cần thiết (AND logic)
 */
const requireAllPermissions = (required = []) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      message: 'Unauthorized - Vui lòng đăng nhập',
      code: 'UNAUTHORIZED' 
    });
  }

  if (!Array.isArray(req.user.permissions)) {
    return res.status(403).json({ 
      message: 'Forbidden - Không có quyền truy cập',
      code: 'FORBIDDEN' 
    });
  }

  // Nếu không yêu cầu permission cụ thể, cho phép
  if (required.length === 0) {
    return next();
  }

  // Kiểm tra user có TẤT CẢ các permissions required
  const hasAllPermissions = required.every((perm) => req.user.permissions.includes(perm));
  
  if (!hasAllPermissions) {
    return res.status(403).json({ 
      message: 'Forbidden - Bạn không có đủ quyền để thực hiện hành động này',
      code: 'FORBIDDEN',
      required,
      userPermissions: req.user.permissions
    });
  }

  return next();
};

/**
 * Kiểm tra user có một trong các roles được yêu cầu
 * @param {string[]} required - Mảng các roles cần thiết
 */
const requireRoles = (required = []) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      message: 'Unauthorized - Vui lòng đăng nhập',
      code: 'UNAUTHORIZED' 
    });
  }

  if (!Array.isArray(req.user.roles)) {
    return res.status(403).json({ 
      message: 'Forbidden - Không có vai trò',
      code: 'FORBIDDEN' 
    });
  }

  // Nếu không yêu cầu role cụ thể, cho phép
  if (required.length === 0) {
    return next();
  }

  // Kiểm tra user có ít nhất một trong các roles required
  const hasRole = required.some((role) => req.user.roles.includes(role));
  
  if (!hasRole) {
    return res.status(403).json({ 
      message: 'Forbidden - Bạn không có vai trò phù hợp',
      code: 'FORBIDDEN',
      required,
      userRoles: req.user.roles
    });
  }

  return next();
};

/**
 * Chỉ cho phép Admin truy cập
 */
const requireAdmin = () => requireRoles([ROLES.ADMIN]);

module.exports = { 
  requirePermissions,
  requireAllPermissions,
  requireRoles,
  requireAdmin
};

