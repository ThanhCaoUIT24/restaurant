import { useAuth } from '../auth/authContext';

/**
 * Hook để kiểm tra permissions của user hiện tại
 * Sử dụng: const { hasPermission, hasAllPermissions, hasAnyPermission, hasRole } = usePermissions();
 */
export const usePermissions = () => {
  const { user } = useAuth();

  /**
   * Kiểm tra user có một permission cụ thể
   * @param {string} permission - Permission cần kiểm tra
   * @returns {boolean}
   */
  const hasPermission = (permission) => {
    if (!user || !Array.isArray(user.permissions)) {
      return false;
    }
    return user.permissions.includes(permission);
  };

  /**
   * Kiểm tra user có TẤT CẢ các permissions được yêu cầu (AND logic)
   * @param {string[]} permissions - Mảng permissions cần kiểm tra
   * @returns {boolean}
   */
  const hasAllPermissions = (permissions) => {
    if (!user || !Array.isArray(user.permissions)) {
      return false;
    }
    if (!Array.isArray(permissions) || permissions.length === 0) {
      return true;
    }
    return permissions.every((perm) => user.permissions.includes(perm));
  };

  /**
   * Kiểm tra user có ÍT NHẤT MỘT trong các permissions được yêu cầu (OR logic)
   * @param {string[]} permissions - Mảng permissions cần kiểm tra
   * @returns {boolean}
   */
  const hasAnyPermission = (permissions) => {
    if (!user || !Array.isArray(user.permissions)) {
      return false;
    }
    if (!Array.isArray(permissions) || permissions.length === 0) {
      return true;
    }
    return permissions.some((perm) => user.permissions.includes(perm));
  };

  /**
   * Kiểm tra user có một role cụ thể
   * @param {string} role - Role cần kiểm tra
   * @returns {boolean}
   */
  const hasRole = (role) => {
    if (!user || !Array.isArray(user.roles)) {
      return false;
    }
    return user.roles.includes(role);
  };

  /**
   * Kiểm tra user có ÍT NHẤT MỘT trong các roles được yêu cầu
   * @param {string[]} roles - Mảng roles cần kiểm tra
   * @returns {boolean}
   */
  const hasAnyRole = (roles) => {
    if (!user || !Array.isArray(user.roles)) {
      return false;
    }
    if (!Array.isArray(roles) || roles.length === 0) {
      return true;
    }
    return roles.some((role) => user.roles.includes(role));
  };

  /**
   * Kiểm tra user có phải Admin không
   * @returns {boolean}
   */
  const isAdmin = () => {
    return hasRole('Admin');
  };

  return {
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    hasRole,
    hasAnyRole,
    isAdmin,
    // Export user permissions và roles để sử dụng trực tiếp nếu cần
    permissions: user?.permissions || [],
    roles: user?.roles || [],
  };
};
