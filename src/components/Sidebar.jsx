import { useState } from 'react';
import {
  LayoutDashboard, Users, CalendarDays,
  CalendarCheck, GitBranch, Bell,
  ChevronLeft, ChevronRight, ChevronDown, Hospital, GanttChartSquare, BarChart3, Settings2
} from 'lucide-react';

// เมนูหลัก — items ที่มี children จะแสดง submenu แบบ expand/collapse
const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  {
    id: 'team-group', label: 'ทีมงาน', icon: Users,
    children: [
      { id: 'team',     label: 'รายชื่อทีมงาน',      icon: Users,        badge: null },
      { id: 'leave',    label: 'การลา',               icon: CalendarDays, badge: 3 },
      { id: 'orgchart', label: 'Organization Chart',  icon: GitBranch,    badge: null },
      { id: 'resource', label: 'Resource Planning',   icon: CalendarCheck,badge: null },
    ],
  },
  { id: 'installation', label: 'ประสานงานติดตั้ง',    icon: Hospital },
  { id: 'timeline',     label: 'ภาพรวมโครงการ',       icon: GanttChartSquare },
  { id: 'summary',      label: 'สรุปโครงการรายปี',    icon: BarChart3 },
  { id: 'notifications',label: 'การแจ้งเตือน',        icon: Bell, badge: 3 },
  { id: 'settings',     label: 'การตั้งค่า',           icon: Settings2 },
];

// ids ทั้งหมดที่เป็นลูกของ team-group
const TEAM_CHILD_IDS = ['team', 'leave', 'orgchart', 'resource'];

export default function Sidebar({ activeMenu, onMenuChange }) {
  const [collapsed, setCollapsed] = useState(false);
  // เปิด team-group อัตโนมัติถ้า activeMenu เป็นลูก
  const [expanded, setExpanded] = useState(() =>
    TEAM_CHILD_IDS.includes(activeMenu) ? { 'team-group': true } : {}
  );

  const toggleExpand = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // เมื่อ collapsed และ hover บน group icon → expand คืน
  const handleCollapsedGroupClick = (item) => {
    setCollapsed(false);
    setExpanded(prev => ({ ...prev, [item.id]: true }));
  };

  return (
    <aside className={`bg-slate-900 text-white flex flex-col transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'} min-h-screen shrink-0`}>
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        {!collapsed && (
          <div>
            <div className="font-bold text-lg text-blue-400">Paperless Team</div>
            <div className="text-xs text-slate-400">Management System</div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-slate-700 transition-colors"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;

          // ---- Group item (has children) ----
          if (item.children) {
            const isOpen = !!expanded[item.id];
            const childActive = item.children.some(c => c.id === activeMenu);

            return (
              <div key={item.id}>
                {/* Group header */}
                <button
                  onClick={() => collapsed ? handleCollapsedGroupClick(item) : toggleExpand(item.id)}
                  title={collapsed ? item.label : ''}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors relative
                    ${childActive
                      ? 'text-blue-300 bg-slate-800'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                >
                  <Icon size={18} className="shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left font-medium">{item.label}</span>
                      <ChevronDown
                        size={14}
                        className={`shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                      />
                    </>
                  )}
                  {collapsed && childActive && (
                    <span className="absolute left-0 top-0 h-full w-0.5 bg-blue-400 rounded-r" />
                  )}
                </button>

                {/* Sub-items */}
                {isOpen && !collapsed && (
                  <div className="bg-slate-950/40">
                    {item.children.map(child => {
                      const ChildIcon = child.icon;
                      const isActive = activeMenu === child.id;
                      return (
                        <button
                          key={child.id}
                          onClick={() => onMenuChange(child.id)}
                          className={`w-full flex items-center gap-3 pl-10 pr-4 py-2.5 text-sm transition-colors relative
                            ${isActive
                              ? 'bg-blue-600 text-white'
                              : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                            }`}
                        >
                          <ChildIcon size={15} className="shrink-0" />
                          <span className="flex-1 text-left">{child.label}</span>
                          {child.badge && (
                            <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                              {child.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          // ---- Regular item ----
          const isActive = activeMenu === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onMenuChange(item.id)}
              title={collapsed ? item.label : ''}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors relative
                ${isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
              {collapsed && item.badge && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-slate-700 text-xs text-slate-500 text-center">
          BMS HOSxP IPD Paperless<br />NPP3 Team © 2567
        </div>
      )}
    </aside>
  );
}
