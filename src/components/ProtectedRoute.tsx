import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Rol } from '../types'

interface ProtectedRouteProps {
    children: React.ReactNode
    allowedRoles?: Rol[]
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { user, profile, loading } = useAuth()

    // Mostrar loading mientras verifica autenticación
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
                    <p className="mt-4 text-gray-600">Cargando...</p>
                </div>
            </div>
        )
    }

    // Si no hay usuario, redirigir a login
    if (!user || !profile) {
        return <Navigate to="/login" replace />
    }

    // Verificar permisos por rol
    if (allowedRoles && !allowedRoles.includes(profile.rol)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
                    <div className="text-6xl mb-4">🚫</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        Acceso Denegado
                    </h2>
                    <p className="text-gray-600 mb-4">
                        No tienes permisos para acceder a esta sección.
                    </p>
                    <p className="text-sm text-gray-500">
                        Tu rol: <span className="font-semibold">{profile.rol}</span>
                    </p>
                </div>
            </div>
        )
    }

    return <>{children}</>
}