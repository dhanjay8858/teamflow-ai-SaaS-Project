import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppRoutes } from './routes/AppRoutes';
import { useAuth } from './features/auth/hooks/useAuth';
import { useAuthStore } from './stores/auth.store';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

const AuthInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { useInitUser } = useAuth();
  const { isPending, isError } = useInitUser();
  const setInitializing = useAuthStore((state) => state.setInitializing);

  useEffect(() => {
    if (!isPending || isError) {
      setInitializing(false);
    }
  }, [isPending, isError, setInitializing]);

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthInitializer>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthInitializer>
    </QueryClientProvider>
  );
};

export default App;
