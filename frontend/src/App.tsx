import { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { SoundProvider } from './context/SoundContext'
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import Dashboard from './pages/dashboard/Dashboard'

type View = 'login' | 'signup'

function AppContent() {
  const { user, loading } = useAuth();
  const [view, setView] = useState<View>('signup');

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


  if (view === 'login') {
    return (
      <Login
        onToggle={() => setView('signup')}
      />
    );
  }

  return (
    <Signup
      onToggle={() => setView('login')}
    />
  );
}

function App() {
  return (
    <AuthProvider>
      <SoundProvider>
        <AppContent />
      </SoundProvider>
    </AuthProvider>
  );
}

export default App;
