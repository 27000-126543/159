import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Globe, Bell, User, LogOut, ChevronDown, Menu } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useUserStore } from '@/store';
import { cn } from '@/lib/utils';

export default function DashboardLayout() {
  const navigate = useNavigate();
  const { user, logout } = useUserStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const notificationCount = 5;
  const currentTime = new Date().toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

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
    <div className="min-h-screen dashboard-bg">
      <header className="sticky top-0 z-30 h-14 bg-[#0F172A]/80 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center justify-between h-full px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors text-slate-300 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link to="/dashboard" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center animate-pulse-glow">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-base font-bold text-white font-display">
                  全球采购平台
                </h1>
                <p className="text-xs text-slate-400">数据监控大屏</p>
              </div>
            </Link>
          </div>

          <div className="hidden md:block text-center">
            <p className="text-xs text-slate-400">数据实时更新</p>
            <p className="text-sm font-medium text-white font-mono">{currentTime}</p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white transition-colors text-sm"
            >
              返回主页
            </Link>

            <button className="relative p-2 rounded-lg hover:bg-white/10 transition-colors text-slate-300 hover:text-white">
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
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-medium text-sm">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-white">
                    {user?.name || '未登录'}
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
                <div className="absolute right-0 top-full mt-2 w-56 bg-[#1E293B] rounded-xl shadow-2xl border border-white/10 py-2 animate-slide-in">
                  <div className="px-4 py-3 border-b border-white/10">
                    <p className="text-sm font-medium text-white">
                      {user?.name || '未登录'}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {user?.email || 'user@example.com'}
                    </p>
                  </div>

                  <div className="py-1">
                    <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors">
                      <User className="w-4 h-4" />
                      个人信息
                    </button>
                  </div>

                  <div className="border-t border-white/10 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-danger-400 hover:bg-danger-500/10 hover:text-danger-300 transition-colors"
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

      <main className="p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-3.5rem)]">
        <div className="animate-slide-up">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
