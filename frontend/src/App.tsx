import { Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { BrowserRouter as Router } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { SoundProvider } from './context/SoundContext'
import { NetworkProvider } from './context/NetworkContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import Dashboard from './pages/dashboard/Dashboard'
import { OfflineBanner } from './components/ui/OfflineBanner'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/Dashboard'
import Users from './pages/admin/Users'
import LiveMap from './pages/admin/LiveMap'
import Crossings from './pages/admin/Crossings'
import Reels from './pages/admin/Reels'
import Reports from './pages/admin/Reports'
import Notifications from './pages/admin/Notifications'
import Settings from './pages/admin/Settings'
import Admins from './pages/admin/Admins'
import ActivityPage from './pages/admin/Activity'

const queryClient = new QueryClient()

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isAdmin = user?.role === 'admin' || user?.role === 'moderator';

  return (
    <>
      <OfflineBanner />
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

        {/* Admin Routes (Protected + Role Check) */}
        <Route 
          path="/admin" 
          element={
            !user ? (
              <Navigate to="/login" replace />
            ) : isAdmin ? (
              <AdminLayout />
            ) : (
              <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-md">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🔒</span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
                  <p className="text-gray-500 mb-6">You don't have admin privileges to access this panel.</p>
                  <button 
                    onClick={() => window.location.href = '/dashboard/home'}
                    className="px-6 py-2.5 bg-[#FF006E] text-white rounded-xl font-semibold hover:bg-[#e0005f] transition-colors"
                  >
                    Go to Dashboard
                  </button>
                </div>
              </div>
            )
          } 
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="map" element={<LiveMap />} />
          <Route path="crossings" element={<Crossings />} />
          <Route path="reels" element={<Reels />} />
          <Route path="reports" element={<Reports />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="settings" element={<Settings />} />
          <Route path="admins" element={<Admins />} />
          <Route path="activity" element={<ActivityPage />} />
        </Route>

        {/* Catch-all Redirect */}
        <Route 
          path="*" 
          element={<Navigate to={user ? "/dashboard/home" : "/login"} replace />} 
        />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <SoundProvider>
              <NetworkProvider>
                <AppContent />
              </NetworkProvider>
            </SoundProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </Router>
  );
}

export default App;
