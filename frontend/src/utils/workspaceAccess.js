const normalizeRole = (user) => String(user?.role || '').trim();

export const canUserPrintEndOfDayReports = (user) => normalizeRole(user) === 'admin';

export const canUserPrintTaskReports = (user) => ['admin', 'operations_manager'].includes(normalizeRole(user));

export const canUserManageOperationsTeams = (user) => ['admin', 'operations_manager'].includes(normalizeRole(user));
