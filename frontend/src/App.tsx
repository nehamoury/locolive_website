import { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import Dashboard from './pages/dashboard/Dashboard'

function AppContent() {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState<'login' | 'signup'>('login')

  const toggleView = () => {
    setCurrentView(prev => prev === 'login' ? 'signup' : 'login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) {
    return <Dashboard />;
  }

  return (
    <div className="antialiased selection:bg-purple-500/30">
      {currentView === 'login' ? (
        <Login onToggle={toggleView} />
      ) : (
        <Signup onToggle={toggleView} />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
