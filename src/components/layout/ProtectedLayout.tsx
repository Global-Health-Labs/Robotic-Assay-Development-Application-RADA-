import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import NavBar from '@/components/ui/NavBar';
import { Suspense } from 'react';

export default function ProtectedLayout() {
  const { isAuthenticated, isLoading, name, role } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Loading...</h2>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div>
      <NavBar name={name} role={role} />
      <div className="px-6 md:px-20">
        <Suspense
          fallback={
            <div className="flex h-screen items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900">Loading...</h2>
              </div>
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </div>
    </div>
  );
}
