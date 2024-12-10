import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './context/AuthContext';
import { QueryProvider } from './providers/query-provider';
import { router } from './routes/routes.config';

function App() {
  return (
    <AuthProvider>
      <QueryProvider>
        <RouterProvider router={router} />
        <Toaster />
      </QueryProvider>
    </AuthProvider>
  );
}

export default App;
