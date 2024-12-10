import * as React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Suspense } from 'react';

const PublicLayout: React.FunctionComponent = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Loading...</h2>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/experiments" replace />;
  }

  return (
    <div className="m-0 flex items-center justify-center">
      <Suspense
        fallback={
          <div className="flex h-screen items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">Loading...</h2>
            </div>
          </div>
        }
      >
        <div>
          <div className="px-6 md:px-20">
            <Outlet />
          </div>
        </div>
      </Suspense>
    </div>
  );
};

export default PublicLayout;
