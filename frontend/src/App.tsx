import { Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { BrowserRouter as Router } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { SoundProvider } from './context/SoundContext'
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import Dashboard from './pages/dashboard/Dashboard'

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/login" 
        element={!user ? <Login onToggle={() => {}} /> : <Navigate to="/dashboard/home" replace />} 
      />
      <Route 
        path="/signup" 
        element={!user ? <Signup onToggle={() => {}} /> : <Navigate to="/dashboard/home" replace />} 
      />

      {/* Protected Dashboard Route (Layout) */}
      <Route 
        path="/dashboard/*" 
        element={user ? <Dashboard /> : <Navigate to="/login" replace />} 
      />

      {/* Catch-all Redirect */}
      <Route 
        path="*" 
        element={<Navigate to={user ? "/dashboard/home" : "/login"} replace />} 
      />
    </Routes>
  );
}

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
