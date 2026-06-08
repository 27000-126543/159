import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center px-4">
        <div className="text-9xl font-bold text-slate-200 mb-4">404</div>
        <h1 className="text-3xl font-semibold text-slate-800 mb-2">页面不存在</h1>
        <p className="text-slate-500 mb-8 max-w-md mx-auto">
          抱歉，您访问的页面不存在或已被移除。请检查URL是否正确，或返回首页继续浏览。
        </p>
        <div className="flex gap-4 justify-center">
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回上一页
          </Button>
          <Link to="/">
            <Button>
              <Home className="w-4 h-4 mr-2" />
              返回首页
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
