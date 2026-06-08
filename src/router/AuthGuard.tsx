import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUserStore } from '@/store/userStore';
import { canAccessRoute } from '@/utils/permission';
import Loading from '@/components/ui/Loading';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  isPublic?: boolean;
}

export default function AuthGuard({ children, requiredRoles, isPublic }: AuthGuardProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoading, isAuthenticated, fetchCurrentUser } = useUserStore();

  useEffect(() => {
    if (!isAuthenticated && localStorage.getItem('token')) {
      fetchCurrentUser();
    }
  }, [isAuthenticated, fetchCurrentUser]);

  useEffect(() => {
    if (isLoading) return;

    if (isPublic) {
      if (isAuthenticated && location.pathname === '/login') {
        navigate('/dashboard', { replace: true });
      }
      return;
    }

    if (!isAuthenticated) {
      navigate('/login', {
        replace: true,
        state: { from: location.pathname + location.search },
      });
      return;
    }

    if (requiredRoles && user?.role) {
      const hasAccess = canAccessRoute(user.role, location.pathname);
      if (!hasAccess) {
        navigate('/403', { replace: true });
      }
    }
  }, [isAuthenticated, isLoading, user, location, navigate, requiredRoles, isPublic]);

  if (isLoading && !isPublic) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading type="spinner" size="lg" text="加载中..." />
      </div>
    );
  }

  return <>{children}</>;
}
