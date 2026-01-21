import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Login from './pages/LoginPage'
import EmpleadoDashboard from './pages/EmpleadoDashboard'
import AdminDashboard from './pages/AdminDashboard'
import { useAuth } from './contexts/AuthContext'

function PrivateRoute({ children, requiredRole }: { children: React.ReactNode, requiredRole?: string }) {
    const { user, loading } = useAuth()

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        </div>
    }

    if (!user) {
        return <Navigate to="/login" />
    }

    if (requiredRole && user.role !== requiredRole) {
        return <Navigate to="/" />
    }

    return <>{children}</>
}

function AppRoutes() {
    const { user } = useAuth()

    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/empleado" element={
                <PrivateRoute requiredRole="empleado">
                    <EmpleadoDashboard />
                </PrivateRoute>
            } />
            <Route path="/admin" element={
                <PrivateRoute requiredRole="admin">
                    <AdminDashboard />
                </PrivateRoute>
            } />
            <Route path="/" element={
                user?.role === 'admin' ? <Navigate to="/admin" /> :
                    user?.role === 'empleado' ? <Navigate to="/empleado" /> :
                        <Navigate to="/login" />
            } />
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