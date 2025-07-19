import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthForm } from './components/auth/AuthForm';
import { Dashboard } from './components/dashboard/Dashboard';
import { useAuth } from './hooks/useAuth';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { DatabaseSetupNotice } from './components/ui/DatabaseSetupNotice';

const queryClient = new QueryClient();

function AppContent() {
  const { user, profile } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [isLoading, setIsLoading] = useState(true);
  const [showDatabaseNotice, setShowDatabaseNotice] = useState(false);

  useEffect(() => {
    // Check if we need to show database setup notice
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Show database notice if user exists but no profile after a longer delay
    if (user && !profile && !isLoading) {
      const timer = setTimeout(() => {
        setShowDatabaseNotice(true);
      }, 3000); // Give even more time for profile to load
      
      return () => clearTimeout(timer);
    } else if (user && profile) {
      setShowDatabaseNotice(false);
    }
  }, [user, profile, isLoading]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Show auth form if not authenticated
  if (!user) {
    return (
      <AuthForm 
        mode={authMode} 
        onToggleMode={() => setAuthMode(prev => prev === 'login' ? 'signup' : 'login')} 
      />
    );
  }

  // Show database setup notice if user exists but no profile after waiting
  if (showDatabaseNotice && !profile) {
    return <DatabaseSetupNotice />;
  }

  // Show auth form if no profile yet (but don't show database notice immediately)
  if (!profile && !showDatabaseNotice) {
    return (
      <AuthForm 
        mode={authMode} 
        onToggleMode={() => setAuthMode(prev => prev === 'login' ? 'signup' : 'login')} 
      />
    );
  }

  // Show dashboard if authenticated
  return <Dashboard />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="App">
        <AppContent />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e293b',
              color: '#f1f5f9',
              border: '1px solid #475569',
            },
          }}
        />
      </div>
    </QueryClientProvider>
  );
}

export default App;