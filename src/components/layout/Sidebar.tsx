import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileText,
  ShoppingCart,
  CheckSquare,
  FileCheck,
  Truck,
  ShieldCheck,
  CreditCard,
  Settings,
  ChevronLeft,
  ChevronRight,
  Globe,
} from 'lucide-react';
import { useLayoutStore, useUserStore } from '@/store';
import { canAccessRoute, ROLE_NAMES } from '@/utils/permission';
import { cn } from '@/lib/utils';

interface MenuItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const menuItems: MenuItem[] = [
  { path: '/dashboard', label: '首页大屏', icon: <LayoutDashboard className="w-5 h-5" /> },
  { path: '/suppliers', label: '供应商管理', icon: <Users className="w-5 h-5" /> },
  { path: '/inquiries', label: '询价管理', icon: <FileText className="w-5 h-5" /> },
  { path: '/orders', label: '订单管理', icon: <ShoppingCart className="w-5 h-5" /> },
  { path: '/approval', label: '审批中心', icon: <CheckSquare className="w-5 h-5" /> },
  { path: '/customs', label: '报关管理', icon: <FileCheck className="w-5 h-5" /> },
  { path: '/logistics', label: '物流管理', icon: <Truck className="w-5 h-5" /> },
  { path: '/quality', label: '质检管理', icon: <ShieldCheck className="w-5 h-5" /> },
  { path: '/settlement', label: '结算中心', icon: <CreditCard className="w-5 h-5" /> },
  { path: '/settings', label: '系统设置', icon: <Settings className="w-5 h-5" /> },
];

export default function Sidebar() {
  const location = useLocation();
  const { sidebarCollapsed, toggleSidebar } = useLayoutStore();
  const { user } = useUserStore();

  const filteredMenuItems = menuItems.filter((item) =>
    canAccessRoute(user?.role, item.path)
  );

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-[#0F172A] transition-all duration-300 ease-in-out',
        sidebarCollapsed ? 'w-20' : 'w-64'
      )}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between h-16 px-4 border-b border-white/10">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center flex-shrink-0">
              <Globe className="w-6 h-6 text-white" />
            </div>
            {!sidebarCollapsed && (
              <div className="animate-slide-in whitespace-nowrap">
                <h1 className="text-lg font-bold text-white font-display">
                  全球采购平台
                </h1>
                <p className="text-xs text-slate-400">
                  {user?.role ? ROLE_NAMES[user.role] : '未登录'}
                </p>
              </div>
            )}
          </div>
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        </div>

        <nav className="flex-1 py-4 px-3 overflow-y-auto scrollbar-thin">
          <ul className="space-y-1">
            {filteredMenuItems.map((item, index) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <li key={item.path} style={{ animationDelay: `${index * 50}ms` }}>
                  <NavLink
                    to={item.path}
                    className={cn(
                      'sidebar-item group relative',
                      isActive && 'active'
                    )}
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    {!sidebarCollapsed && (
                      <span className="animate-slide-in text-sm font-medium">
                        {item.label}
                      </span>
                    )}
                    {sidebarCollapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                        {item.label}
                      </div>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-3 border-t border-white/10">
          {!sidebarCollapsed && (
            <div className="bg-gradient-to-r from-primary-500/10 to-primary-600/5 rounded-lg p-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center">
                  <span className="text-primary-400 text-xs font-bold">
                    {user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-medium text-white truncate">
                    {user?.name || '未登录'}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    {user?.email || 'user@example.com'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
