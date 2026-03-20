import { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import Dashboard from './pages/dashboard/Dashboard'
import LandingPage from './pages/auth/LandingPage'

type View = 'landing' | 'login' | 'signup'

function AppContent() {
  const { user, loading } = useAuth();
  const [view, setView] = useState<View>('landing');

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) {
    return <Dashboard />;
  }

  if (view === 'landing') {
    return (
      <LandingPage
        onLogin={() => setView('login')}
        onSignup={() => setView('signup')}
      />
    );
  }

  if (view === 'login') {
    return (
      <Login
        onToggle={() => setView('signup')}
        onBack={() => setView('landing')}
      />
    );
  }

  return (
    <Signup
      onToggle={() => setView('login')}
      onBack={() => setView('landing')}
    />
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
