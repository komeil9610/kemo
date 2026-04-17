import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { getOperationalDate } from '../utils/internalOrders';
import { getWorkspaceBasePath, getWorkspaceRoleLabel } from '../utils/workspaceRoles';

export default function WorkspaceSidebar() {
  const { user } = useAuth();
  const { lang } = useLang();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(() => (typeof window !== 'undefined' ? window.innerWidth <= 1100 : false));
  const [isExpanded, setIsExpanded] = useState(() => (typeof window !== 'undefined' ? window.innerWidth > 1100 : true));

  const workspaceBasePath = getWorkspaceBasePath(user?.role);
  const labels =
    lang === 'ar'
      ? {
          workspace: 'مساحة العمل',
          planning: 'التخطيط والمتابعة',
          system: 'النظام',
          overview: 'الرئيسية التحليلية',
          operationsOverview: 'لوحة مدير العمليات',
          technicianOverview: 'لوحة الفني',
          pending: 'الطلبات الجديدة',
          scheduled: 'المجدولة',
          inTransit: 'في الطريق',
          completed: 'الأرشيف',
          daily: 'مهام اليوم',
          weekly: 'مهام الأسبوع',
          monthly: 'مهام الشهر',
          tomorrow: 'مهام الغد',
          myAccount: 'حسابي',
          endOfDay: 'تقرير نهاية اليوم',
          assignments: 'تعيين الفرق',
          excelSync: 'مزامنة الإكسل',
          activeDate: 'تاريخ التشغيل',
          homepage: 'إدارة الصفحة الرئيسية',
          openMenu: 'فتح قائمة المهام',
          closeMenu: 'إخفاء القائمة',
          role: getWorkspaceRoleLabel(user?.role, 'ar'),
        }
      : {
          workspace: 'Workspace',
          planning: 'Planning',
          system: 'System',
          overview: 'Analytics home',
          operationsOverview: 'Operations workspace',
          technicianOverview: 'Technician workspace',
          pending: 'New requests',
          scheduled: 'Scheduled',
          inTransit: 'In transit',
          completed: 'Archive',
          daily: 'Today tasks',
          weekly: 'Weekly tasks',
          monthly: 'Monthly tasks',
          tomorrow: 'Tomorrow tasks',
          myAccount: 'My account',
          endOfDay: 'End-of-day report',
          assignments: 'Team assignments',
          excelSync: 'Excel sync',
          activeDate: 'Operational date',
          homepage: 'Homepage editor',
          openMenu: 'Open task menu',
          closeMenu: 'Hide menu',
          role: getWorkspaceRoleLabel(user?.role, 'en'),
        };

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const syncViewport = () => {
      const nextIsMobile = window.innerWidth <= 1100;
      setIsMobile(nextIsMobile);
      setIsExpanded((current) => (nextIsMobile ? current : true));
      if (nextIsMobile && window.innerWidth <= 640) {
        setIsExpanded(false);
      }
    };

    syncViewport();
    window.addEventListener('resize', syncViewport);
    return () => window.removeEventListener('resize', syncViewport);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setIsExpanded(false);
    }
  }, [isMobile, location.pathname, location.hash]);

  const sections =
    user?.role === 'operations_manager'
      ? [
          {
            title: labels.workspace,
            items: [
              { to: workspaceBasePath, label: labels.operationsOverview, end: true },
              { to: `${workspaceBasePath}/daily`, label: labels.daily },
              { to: `${workspaceBasePath}/weekly`, label: labels.weekly },
              { to: `${workspaceBasePath}/monthly`, label: labels.monthly },
            ],
          },
          {
            title: labels.planning,
            items: [
              { to: `${workspaceBasePath}#assignments`, label: labels.assignments },
              { to: `${workspaceBasePath}#excel-sync`, label: labels.excelSync },
            ],
          },
        ]
      : user?.role === 'technician'
        ? [
            {
              title: labels.workspace,
              items: [
                { to: workspaceBasePath, label: labels.technicianOverview, end: true },
                { to: `${workspaceBasePath}/today`, label: labels.daily },
                { to: `${workspaceBasePath}/tomorrow`, label: labels.tomorrow },
              ],
            },
            {
              title: labels.system,
              items: [{ to: `${workspaceBasePath}/account`, label: labels.myAccount }],
            },
          ]
      : [
          {
            title: labels.workspace,
            items: [
              { to: workspaceBasePath, label: labels.overview, end: true },
              { to: `${workspaceBasePath}/pending`, label: labels.pending },
              { to: `${workspaceBasePath}/scheduled`, label: labels.scheduled },
              { to: `${workspaceBasePath}/in_transit`, label: labels.inTransit },
              { to: `${workspaceBasePath}/completed`, label: labels.completed },
            ],
          },
          {
            title: labels.planning,
            items: [
              { to: `${workspaceBasePath}/daily`, label: labels.daily },
              { to: `${workspaceBasePath}/weekly`, label: labels.weekly },
              { to: `${workspaceBasePath}/monthly`, label: labels.monthly },
            ],
          },
          {
            title: labels.system,
            items: [
              { to: `${workspaceBasePath}/operations-date`, label: labels.endOfDay },
              ...(user?.role === 'admin' ? [{ to: `${workspaceBasePath}/homepage`, label: labels.homepage }] : []),
            ],
          },
        ];

  return (
    <aside className={`workspace-sidebar ${isMobile && !isExpanded ? 'mobile-collapsed' : ''}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="workspace-sidebar-top">
        <p className="workspace-sidebar-kicker">{labels.role}</p>
        <h2>{user?.name || 'TrkeebPro'}</h2>
        <p>{user?.email || 'حساب داخلي'}</p>
      </div>

      <div className="workspace-sidebar-date">
        <span>{labels.activeDate}</span>
        <strong>{getOperationalDate()}</strong>
      </div>

      {isMobile ? (
        <button className="workspace-sidebar-toggle" onClick={() => setIsExpanded((current) => !current)} type="button">
          {isExpanded ? labels.closeMenu : labels.openMenu}
        </button>
      ) : null}

      {sections.map((section) => (
        <div className="workspace-sidebar-section" key={section.title}>
          <p className="workspace-sidebar-title">{section.title}</p>
          <div className="workspace-sidebar-links">
            {section.items.map((item) => (
              <NavLink
                className={({ isActive }) => `workspace-sidebar-link${isActive ? ' active' : ''}`}
                end={item.end}
                key={item.to}
                onClick={() => {
                  if (isMobile) {
                    setIsExpanded(false);
                  }
                }}
                to={item.to}
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      ))}
    </aside>
  );
}
