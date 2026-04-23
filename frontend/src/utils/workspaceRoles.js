export const normalizeWorkspaceRole = (role) => String(role || '').trim();

const ACTIVE_WORKSPACE_ROLES = ['admin', 'operations_manager', 'excel_uploader', 'technician'];

export const getWorkspaceBasePath = (role) => {
  const normalized = normalizeWorkspaceRole(role);
  if (normalized === 'admin') {
    return '/admin';
  }
  if (normalized === 'operations_manager') {
    return '/operations-manager';
  }
  if (normalized === 'excel_uploader') {
    return '/excel-uploader';
  }
  if (normalized === 'technician') {
    return '/technician';
  }
  return '/login';
};

export const getWorkspaceRoleLabel = (role, lang = 'ar') => {
  const normalized = normalizeWorkspaceRole(role);
  const labels = {
    admin: { ar: 'الإدارة', en: 'Admin' },
    operations_manager: { ar: 'مدير العمليات', en: 'Operations manager' },
    excel_uploader: { ar: 'رافع الإكسل', en: 'Excel uploader' },
    technician: { ar: 'الفني', en: 'Technician' },
  };

  return labels[normalized]?.[lang] || (lang === 'ar' ? 'مستخدم' : 'User');
};

export const getWorkspaceRolesForSwitcher = (roles = []) =>
  (Array.isArray(roles) ? roles : [roles]).filter((role) => ACTIVE_WORKSPACE_ROLES.includes(role));
