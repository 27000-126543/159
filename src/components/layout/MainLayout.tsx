import { Outlet } from 'react-router-dom';
import { useLayoutStore } from '@/store';
import { cn } from '@/lib/utils';
import Sidebar from './Sidebar';
import Header from './Header';

export default function MainLayout() {
  const { sidebarCollapsed } = useLayoutStore();

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      <div
        className={cn(
          'min-h-screen transition-all duration-300 ease-in-out',
          sidebarCollapsed ? 'ml-20' : 'ml-64'
        )}
      >
        <Header />

        <main className="p-4 sm:p-6 lg:p-8">
          <div className="animate-slide-up">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
