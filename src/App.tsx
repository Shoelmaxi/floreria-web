import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import LoginPage from './pages/LoginPage'
import AdminDashboard from './pages/AdminDashboard'
import AnalistaDashboard from './pages/AnalistaDashboard'
import EmpleadoDashboard from './pages/EmpleadoDashboard'
import ProtectedRoute from './components/ProtectedRoute'

function AppRoutes() {
  const { profile, loading } = useAuth()

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        </div>
    )
  }

  // Redirigir según rol
  function getDashboardByRole() {
    if (!profile) return <Navigate to="/login" replace />

    switch (profile.rol) {
      case 'admin':
        return <AdminDashboard />
      case 'analista':
        return <AnalistaDashboard />
      case 'empleado':
        return <EmpleadoDashboard />
      default:
        return <Navigate to="/login" replace />
    }
  }

  return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
            path="/"
            element={
              <ProtectedRoute>
                {getDashboardByRole()}
              </ProtectedRoute>
            }
        />
        <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
        />
        <Route
            path="/analista"
            element={
              <ProtectedRoute allowedRoles={['analista']}>
                <AnalistaDashboard />
              </ProtectedRoute>
            }
        />
        <Route
            path="/empleado"
            element={
              <ProtectedRoute allowedRoles={['empleado']}>
                <EmpleadoDashboard />
              </ProtectedRoute>
            }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
  )
}

function App() {
  return (
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
  )
}

export default App