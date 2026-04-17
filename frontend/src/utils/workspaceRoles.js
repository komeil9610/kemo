export const normalizeWorkspaceRole = (role) => String(role || '').trim();

export const getWorkspaceBasePath = (role) => {
  const normalized = normalizeWorkspaceRole(role);
  if (normalized === 'admin') {
    return '/admin';
  }
  if (normalized === 'operations_manager') {
    return '/operations-manager';
  }
  if (normalized === 'technician') {
    return '/technician';
  }
  if (normalized === 'customer_service') {
    return '/customer-service';
  }
  return '/login';
};

export const getWorkspaceRoleLabel = (role, lang = 'ar') => {
  const normalized = normalizeWorkspaceRole(role);
  const labels = {
    admin: { ar: 'الإدارة', en: 'Admin' },
    operations_manager: { ar: 'مدير العمليات', en: 'Operations manager' },
    customer_service: { ar: 'خدمة العملاء', en: 'Customer service' },
    technician: { ar: 'الفني', en: 'Technician' },
  };

  return labels[normalized]?.[lang] || (lang === 'ar' ? 'مستخدم' : 'User');
};

export const getWorkspaceRolesForSwitcher = (roles = []) =>
  (Array.isArray(roles) ? roles : [roles]).filter((role) => ['admin', 'operations_manager', 'customer_service', 'technician'].includes(role));
