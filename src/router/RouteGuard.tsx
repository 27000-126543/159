import { Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import AuthGuard from './AuthGuard';
import Loading from '@/components/ui/Loading';
import { AppRoute } from './routes';

interface RouteGuardProps {
  route: AppRoute;
}

export default function RouteGuard({ route }: RouteGuardProps) {
  const location = useLocation();

  return (
    <AuthGuard requiredRoles={route.permission} isPublic={route.public}>
      <div key={location.pathname} className="route-transition">
        <Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center">
              <Loading type="spinner" size="lg" text="页面加载中..." />
            </div>
          }
        >
          {route.element}
        </Suspense>
      </div>
    </AuthGuard>
  );
}
