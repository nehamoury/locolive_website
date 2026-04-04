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
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
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

import { ThemeProvider } from './context/ThemeContext'
import { BrowserRouter as Router } from 'react-router-dom'

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <SoundProvider>
            <AppContent />
          </SoundProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
