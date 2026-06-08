import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  User,
  LogOut,
  Settings,
  Home,
} from 'lucide-react';
import { useLayoutStore, useUserStore } from '@/store';
import { cn } from '@/lib/utils';

const breadcrumbMap: Record<string, string> = {
  '/dashboard': '首页大屏',
  '/suppliers': '供应商管理',
  '/inquiries': '询价管理',
  '/orders': '订单管理',
  '/approval': '审批中心',
  '/customs': '报关管理',
  '/logistics': '物流管理',
  '/quality': '质检管理',
  '/settlement': '结算中心',
  '/settings': '系统设置',
};

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toggleSidebar } = useLayoutStore();
  const { user, logout } = useUserStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const userMenuRef = useRef<HTMLDivElement>(null);

  const notificationCount = 5;

  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [];
    let currentPath = '';

    breadcrumbs.push({ label: '首页', path: '/', isHome: true });

    for (const path of paths) {
      currentPath += `/${path}`;
      const label = breadcrumbMap[currentPath];
      if (label) {
        breadcrumbs.push({ label, path: currentPath });
      }
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-100 backdrop-blur-sm bg-white/80">
      <div className="flex items-center justify-between h-full px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-600 hover:text-slate-900"
          >
            <Menu className="w-5 h-5" />
          </button>

          <nav className="hidden md:flex items-center gap-2 text-sm">
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb.path} className="flex items-center">
                {index > 0 && (
                  <ChevronDown className="w-4 h-4 text-slate-400 -rotate-90 mx-1" />
                )}
                {index === breadcrumbs.length - 1 ? (
                  <span className="text-slate-900 font-medium flex items-center gap-1.5">
                    {crumb.isHome && <Home className="w-4 h-4" />}
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    to={crumb.path}
                    className="text-slate-500 hover:text-primary-600 transition-colors flex items-center gap-1.5"
                  >
                    {crumb.isHome && <Home className="w-4 h-4" />}
                    {crumb.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block w-64 lg:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="搜索菜单、供应商、订单..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all text-sm outline-none"
            />
          </div>

          <button className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-600 hover:text-slate-900">
            <Bell className="w-5 h-5" />
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 flex items-center justify-center w-5 h-5 bg-danger-500 text-white text-xs font-bold rounded-full animate-pulse">
                {notificationCount > 99 ? '99+' : notificationCount}
              </span>
            )}
          </button>

          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-medium text-sm">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-slate-900">
                  {user?.name || '未登录'}
                </p>
                <p className="text-xs text-slate-500">
                  {user?.role ? (
                    user.role === 'supplier'
                      ? '供应商'
                      : user.role === 'buyer'
                      ? '采购员'
                      : user.role === 'manager'
                      ? '采购经理'
                      : user.role === 'director'
                      ? '采购总监'
                      : 'CEO'
                  ) : (
                    '请登录'
                  )}
                </p>
              </div>
              <ChevronDown
                className={cn(
                  'w-4 h-4 text-slate-400 transition-transform',
                  showUserMenu && 'rotate-180'
                )}
              />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-100 py-2 animate-slide-in">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-sm font-medium text-slate-900">
                    {user?.name || '未登录'}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {user?.email || 'user@example.com'}
                  </p>
                </div>

                <div className="py-1">
                  <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                    <User className="w-4 h-4" />
                    个人信息
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                    <Settings className="w-4 h-4" />
                    账号设置
                  </button>
                </div>

                <div className="border-t border-slate-100 pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-danger-600 hover:bg-danger-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    退出登录
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
