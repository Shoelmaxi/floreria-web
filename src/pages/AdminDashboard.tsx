import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { LogOut, Package, ShoppingCart, Users, TrendingUp, Settings, RefreshCw, Crown } from 'lucide-react'
import { useDashboardAdmin } from '../hooks/useDashboardAdmin'
import GestionProductos from '../components/admin/GestionProductos'
import InventarioTiempoReal from '../components/admin/InventarioTiempoReal'
import VistaTurnosYVentas from '../components/admin/VistaTurnosYVentas'

type Vista = 'dashboard' | 'productos' | 'inventario' | 'usuarios' | 'reportes'

export default function AdminDashboard() {
    const { profile, signOut } = useAuth()
    const [vistaActual, setVistaActual] = useState<Vista>('dashboard')
    const {
        productos,
        turnosActivos,
        ventasHoy,
        estadisticas,
        movimientosRecientes,
        loading,
        error,
        recargar
    } = useDashboardAdmin()

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            {/* Header con tema administrativo */}
            <header className="bg-white/80 backdrop-blur-md shadow-lg border-b-2 border-indigo-200">
                <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {/* Logo Admin */}
                            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
                                <Crown className="w-8 h-8 text-yellow-300" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                    Panel de Administración
                                </h1>
                                <p className="text-sm text-gray-600">
                                    Bienvenido, {profile?.nombre}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {vistaActual === 'dashboard' && (
                                <button
                                    onClick={recargar}
                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-600 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                                >
                                    <RefreshCw className="w-5 h-5" />
                                    Actualizar
                                </button>
                            )}
                            <button
                                onClick={signOut}
                                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-semibold hover:from-red-600 hover:to-pink-600 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                            >
                                <LogOut className="w-5 h-5" />
                                Salir
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Navigation Tabs */}
            <div className="bg-white/60 backdrop-blur-sm border-b border-indigo-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex gap-2">
                        <TabButton
                            active={vistaActual === 'dashboard'}
                            onClick={() => setVistaActual('dashboard')}
                            icon={<TrendingUp className="w-5 h-5" />}
                            label="Dashboard"
                        />
                        <TabButton
                            active={vistaActual === 'inventario'}
                            onClick={() => setVistaActual('inventario')}
                            icon={<Package className="w-5 h-5" />}
                            label="Inventario"
                        />
                        <TabButton
                            active={vistaActual === 'productos'}
                            onClick={() => setVistaActual('productos')}
                            icon={<Settings className="w-5 h-5" />}
                            label="Productos"
                        />
                        <TabButton
                            active={vistaActual === 'usuarios'}
                            onClick={() => setVistaActual('usuarios')}
                            icon={<Users className="w-5 h-5" />}
                            label="Usuarios"
                        />
                    </nav>
                </div>
            </div>

            {/* Content */}
            <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                {loading && vistaActual === 'dashboard' ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
                    </div>
                ) : (
                    <>
                        {vistaActual === 'dashboard' && (
                            <DashboardView
                                estadisticas={estadisticas}
                                turnosActivos={turnosActivos}
                                ventasHoy={ventasHoy}
                                productos={productos}
                                onNavegar={setVistaActual}
                            />
                        )}
                        {vistaActual === 'inventario' && (
                            <InventarioTiempoReal productos={productos} onRecargar={recargar} />
                        )}
                        {vistaActual === 'productos' && <GestionProductos />}
                        {vistaActual === 'usuarios' && <UsuariosView />}
                    </>
                )}
            </main>

            {/* Footer */}
            <footer className="mt-12 py-6 bg-white/50 backdrop-blur-sm border-t border-indigo-200">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-sm text-gray-600">
                        Panel Administrativo · Hecho con 💐 para tu florería
                    </p>
                </div>
            </footer>
        </div>
    )
}

// Tab Button Component
interface TabButtonProps {
    active: boolean
    onClick: () => void
    icon: React.ReactNode
    label: string
}

function TabButton({ active, onClick, icon, label }: TabButtonProps) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-6 py-4 font-medium transition-all ${
                active
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                    : 'text-gray-600 hover:text-indigo-600 hover:bg-white/50'
            } rounded-t-2xl`}
        >
            {icon}
            {label}
        </button>
    )
}

// Vista Dashboard Principal
interface DashboardViewProps {
    estadisticas: any
    turnosActivos: any[]
    ventasHoy: any[]
    productos: any[]
    onNavegar: (vista: Vista) => void
}

function DashboardView({ estadisticas, turnosActivos, ventasHoy, productos, onNavegar }: DashboardViewProps) {
    return (
        <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={<ShoppingCart className="w-7 h-7 text-white" />}
                    title="Ventas Hoy"
                    value={`$${estadisticas?.montoTotalHoy.toLocaleString('es-CL') || 0}`}
                    subtitle={`${estadisticas?.ventasHoy || 0} ventas`}
                    gradient="from-green-400 to-emerald-500"
                />
                <StatCard
                    icon={<Package className="w-7 h-7 text-white" />}
                    title="Productos Vendidos"
                    value={`${estadisticas?.productosVendidosHoy || 0}`}
                    subtitle={`${estadisticas?.ramosArmadosHoy || 0} ramos armados`}
                    gradient="from-blue-400 to-cyan-500"
                />
                <StatCard
                    icon={<Users className="w-7 h-7 text-white" />}
                    title="Empleados Activos"
                    value={`${estadisticas?.empleadosTrabajando || 0}`}
                    subtitle={`${estadisticas?.turnosActivos || 0} turno${estadisticas?.turnosActivos !== 1 ? 's' : ''}`}
                    gradient="from-purple-400 to-pink-500"
                />
                <StatCard
                    icon={<TrendingUp className="w-7 h-7 text-white" />}
                    title="Stock Bajo"
                    value={`${estadisticas?.productosStockBajo || 0}`}
                    subtitle="productos"
                    gradient="from-orange-400 to-red-500"
                    alert={estadisticas?.productosStockBajo > 0}
                />
            </div>

            {/* Turnos y Ventas */}
            <VistaTurnosYVentas turnosActivos={turnosActivos} ventasHoy={ventasHoy} />

            {/* Acciones Rápidas */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-indigo-100">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">
                    Acceso Rápido
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <QuickActionButton
                        icon="📦"
                        label="Ver Inventario"
                        onClick={() => onNavegar('inventario')}
                        gradient="from-blue-400 to-cyan-500"
                    />
                    <QuickActionButton
                        icon="🛠️"
                        label="Gestionar Productos"
                        onClick={() => onNavegar('productos')}
                        gradient="from-purple-400 to-pink-500"
                    />
                    <QuickActionButton
                        icon="👥"
                        label="Usuarios"
                        onClick={() => onNavegar('usuarios')}
                        gradient="from-indigo-400 to-purple-500"
                    />
                    <QuickActionButton
                        icon="📊"
                        label="Reportes"
                        gradient="from-green-400 to-emerald-500"
                    />
                </div>
            </div>
        </div>
    )
}

// Componentes auxiliares
interface StatCardProps {
    icon: React.ReactNode
    title: string
    value: string
    subtitle: string
    gradient: string
    alert?: boolean
}

function StatCard({ icon, title, value, subtitle, gradient, alert }: StatCardProps) {
    return (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-indigo-100 hover:shadow-xl transition-all transform hover:scale-105">
            <div className={`w-16 h-16 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center mb-4 shadow-md ${alert ? 'animate-pulse' : ''}`}>
                {icon}
            </div>
            <h3 className="text-gray-600 text-sm font-medium">{title}</h3>
            <p className={`text-3xl font-bold mt-2 ${alert ? 'text-orange-600' : 'text-gray-900'}`}>
                {value}
            </p>
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        </div>
    )
}

interface QuickActionButtonProps {
    icon: string
    label: string
    onClick?: () => void
    gradient: string
}

function QuickActionButton({ icon, label, onClick, gradient }: QuickActionButtonProps) {
    return (
        <button
            onClick={onClick}
            className="group flex flex-col items-center justify-center p-6 bg-white/80 backdrop-blur-sm hover:bg-white rounded-2xl transition-all shadow-md hover:shadow-xl hover:scale-105 border border-indigo-100"
        >
            <span className="text-5xl mb-3 group-hover:scale-110 transition-transform">{icon}</span>
            <span className="text-sm font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">{label}</span>
        </button>
    )
}

// Vista Usuarios (placeholder)
function UsuariosView() {
    return (
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-12 text-center border border-indigo-100">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Users className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
                Gestión de Usuarios
            </h3>
            <p className="text-gray-600 text-lg">
                Módulo próximamente...
            </p>
        </div>
    )
}