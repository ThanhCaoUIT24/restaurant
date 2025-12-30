import React from 'react';
import { usePermissions } from '../hooks/usePermissions';

/**
 * PermissionGate Component - Conditional Rendering dựa trên permissions
 * Component này HOÀN TOÀN KHÔNG RENDER phần tử nếu user không có quyền
 * KHÔNG sử dụng CSS display:none - tuân thủ yêu cầu "Frontend ẩn"
 * 
 * Cách sử dụng:
 * 
 * 1. Kiểm tra một permission:
 * <PermissionGate permission={PERMISSIONS.ACCOUNT_CREATE}>
 *   <Button>Tạo tài khoản</Button>
 * </PermissionGate>
 * 
 * 2. Kiểm tra nhiều permissions (OR logic - có 1 trong số đó):
 * <PermissionGate permissions={[PERMISSIONS.MENU_CREATE, PERMISSIONS.MENU_UPDATE]}>
 *   <Button>Chỉnh sửa menu</Button>
 * </PermissionGate>
 * 
 * 3. Kiểm tra tất cả permissions (AND logic - phải có tất cả):
 * <PermissionGate permissions={[PERMISSIONS.ORDER_CREATE, PERMISSIONS.MENU_VIEW]} requireAll>
 *   <Button>Tạo order</Button>
 * </PermissionGate>
 * 
 * 4. Kiểm tra role:
 * <PermissionGate role="Admin">
 *   <AdminPanel />
 * </PermissionGate>
 * 
 * 5. Hiển thị fallback khi không có quyền:
 * <PermissionGate permission={PERMISSIONS.REPORT_VIEW} fallback={<div>Không có quyền xem báo cáo</div>}>
 *   <ReportPage />
 * </PermissionGate>
 */
export const PermissionGate = ({
  children,
  permission,
  permissions,
  role,
  roles,
  requireAll = false,
  fallback = null,
}) => {
  const {
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    hasRole,
    hasAnyRole,
  } = usePermissions();

  // Kiểm tra permission đơn
  if (permission && !hasPermission(permission)) {
    return fallback;
  }

  // Kiểm tra nhiều permissions
  if (permissions && Array.isArray(permissions) && permissions.length > 0) {
    const hasAccess = requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);

    if (!hasAccess) {
      return fallback;
    }
  }

  // Kiểm tra role đơn
  if (role && !hasRole(role)) {
    return fallback;
  }

  // Kiểm tra nhiều roles
  if (roles && Array.isArray(roles) && roles.length > 0) {
    if (!hasAnyRole(roles)) {
      return fallback;
    }
  }

  // Nếu có quyền, render children
  return <>{children}</>;
};

/**
 * AdminGate Component - Chỉ cho phép Admin truy cập
 * Đây là shortcut cho PermissionGate với role="Admin"
 */
export const AdminGate = ({ children, fallback = null }) => {
  return (
    <PermissionGate role="Admin" fallback={fallback}>
      {children}
    </PermissionGate>
  );
};

/**
 * RoleGate Component - Kiểm tra role
 * Đây là wrapper rõ ràng hơn cho việc kiểm tra role
 */
export const RoleGate = ({ children, role, roles, fallback = null }) => {
  return (
    <PermissionGate role={role} roles={roles} fallback={fallback}>
      {children}
    </PermissionGate>
  );
};

export default PermissionGate;
