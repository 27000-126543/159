import { Link, useNavigate } from 'react-router-dom';
import { Lock, Home, ArrowLeft, LogIn } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useUserStore } from '@/store/userStore';

export default function Forbidden() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useUserStore();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center px-4">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="w-10 h-10 text-red-500" />
        </div>
        <div className="text-6xl font-bold text-slate-200 mb-4">403</div>
        <h1 className="text-3xl font-semibold text-slate-800 mb-2">访问被拒绝</h1>
        <p className="text-slate-500 mb-8 max-w-md mx-auto">
          抱歉，您没有权限访问此页面。请联系管理员获取相应权限，或使用其他账号登录。
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回上一页
          </Button>
          {isAuthenticated ? (
            <Button variant="outline" onClick={handleLogout}>
              <LogIn className="w-4 h-4 mr-2" />
              切换账号
            </Button>
          ) : (
            <Link to="/login">
              <Button>
                <LogIn className="w-4 h-4 mr-2" />
                去登录
              </Button>
            </Link>
          )}
          <Link to="/">
            <Button variant="secondary">
              <Home className="w-4 h-4 mr-2" />
              返回首页
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
