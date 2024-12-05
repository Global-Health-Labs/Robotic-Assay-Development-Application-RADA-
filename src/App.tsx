// import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './context/AuthContext';
import NavBar from './components/ui/NavBar';
import { publicRoutes, protectedRoutes, hideNavBarRoutes } from './routes/routes.config';
import LoginForm from './pages/auth/SigninPage';
import { QueryProvider } from './providers/query-provider';

function App() {
  const NavBarWrapper: React.FC = () => {
    const location = useLocation();
    const { name, role } = useAuth();

    if (hideNavBarRoutes.includes(location.pathname)) {
      return null;
    }
    return <NavBar name={name} role={role} />;
  };

  return (
    <AuthProvider>
      <QueryProvider>
        <Router>
          <div className="h-screen w-screen">
            <NavBarWrapper />
            <div className="px-20">
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<LoginForm />} />
                {publicRoutes.map((route) => (
                  <Route key={route.path} path={route.path} element={<route.component />} />
                ))}

                {/* Protected Routes */}
                {protectedRoutes.map((route) => (
                  <Route
                    key={route.path}
                    path={route.path}
                    element={
                      <ProtectedRoute>
                        <route.component />
                      </ProtectedRoute>
                    }
                  />
                ))}

                {/* Fallback Route */}
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </div>
            <Toaster />
          </div>
        </Router>
      </QueryProvider>
    </AuthProvider>
  );
}

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Loading...</h2>
        </div>
      </div>
    );
  } else if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default App;
