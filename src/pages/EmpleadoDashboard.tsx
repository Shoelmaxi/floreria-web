import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { LogOut, Package, ShoppingBag, ClipboardList, Sparkles, ArrowLeft, Home } from 'lucide-react'
import TurnoControl from '../components/empleado/TurnoControl'
import ArmarRamo from '../components/empleado/ArmarRamo'
import RegistrarVenta from '../components/empleado/RegistrarVenta'
import Abastecimiento from '../components/empleado/Abastecimiento'
import Merma from '../components/empleado/Merma'

type Vista = 'dashboard' | 'armar_ramo' | 'ventas' | 'abastecimiento' | 'merma' | 'inventario'

export default function EmpleadoDashboard() {
    const { profile, signOut } = useAuth()
    const [vistaActual, setVistaActual] = useState<Vista>('dashboard')

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
            {/* Header con tema floral */}
            <header className="bg-white/80 backdrop-blur-md shadow-lg border-b-2 border-pink-200">
                <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {/* Logo placeholder */}
                            <div className="w-14 h-14 bg-gradient-to-br from-pink-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
                                <span className="text-3xl">🌸</span>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                                    Mi Turno
                                </h1>
                                <p className="text-sm text-gray-600 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                    {profile?.nombre}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={signOut}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-semibold hover:from-red-600 hover:to-pink-600 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                        >
                            <LogOut className="w-5 h-5" />
                            Salir
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                {/* Botón Volver (si no está en dashboard) */}
                {vistaActual !== 'dashboard' && (
                    <button
                        onClick={() => setVistaActual('dashboard')}
                        className="flex items-center gap-2 text-purple-600 hover:text-purple-800 mb-6 transition-all hover:gap-3 font-medium"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Volver al Dashboard
                    </button>
                )}

                {/* Vistas */}
                {vistaActual === 'dashboard' && <DashboardView onNavigate={setVistaActual} />}
                {vistaActual === 'armar_ramo' && <ArmarRamo />}
                {vistaActual === 'ventas' && <RegistrarVenta />}
                {vistaActual === 'abastecimiento' && <Abastecimiento />}
                {vistaActual === 'merma' && <Merma />}
                {vistaActual === 'inventario' && <InventarioView />}
            </main>

            {/* Footer decorativo */}
            <footer className="mt-12 py-6 bg-white/50 backdrop-blur-sm border-t border-pink-200">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-sm text-gray-600">
                        Hecho con 💐 para tu florería
                    </p>
                </div>
            </footer>
        </div>
    )
}

// Vista Dashboard Principal
interface DashboardViewProps {
    onNavigate: (vista: Vista) => void
}

function DashboardView({ onNavigate }: DashboardViewProps) {
    return (
        <>
            {/* Control de Turno */}
            <div className="mb-8">
                <TurnoControl />
            </div>

            {/* Estadísticas del Día */}
            <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Home className="w-6 h-6 text-pink-500" />
                    Mi Resumen del Día
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard
                        icon={<ShoppingBag className="w-8 h-8 text-white" />}
                        title="Mis Ventas Hoy"
                        value="$45,000"
                        subtitle="8 ventas realizadas"
                        gradient="from-green-400 to-emerald-500"
                    />
                    <StatCard
                        icon={<Package className="w-8 h-8 text-white" />}
                        title="Productos Vendidos"
                        value="12"
                        subtitle="items en total"
                        gradient="from-purple-400 to-pink-500"
                    />
                    <StatCard
                        icon={<ClipboardList className="w-8 h-8 text-white" />}
                        title="Ramos Armados"
                        value="5"
                        subtitle="ramos creados hoy"
                        gradient="from-orange-400 to-red-500"
                    />
                </div>
            </div>

            {/* Acciones Rápidas */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-pink-100">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
                        ¿Qué quieres hacer?
                    </h2>
                    <p className="text-gray-600">Selecciona una acción para comenzar</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <ActionButton
                        icon="💰"
                        label="Registrar Venta"
                        onClick={() => onNavigate('ventas')}
                        gradient="from-green-400 to-emerald-500"
                        featured
                    />
                    <ActionButton
                        icon="💐"
                        label="Armar Ramo"
                        onClick={() => onNavigate('armar_ramo')}
                        gradient="from-pink-400 to-rose-500"
                    />
                    <ActionButton
                        icon="📥"
                        label="Abastecimiento"
                        onClick={() => onNavigate('abastecimiento')}
                        gradient="from-blue-400 to-cyan-500"
                    />
                    <ActionButton
                        icon="❌"
                        label="Registrar Merma"
                        onClick={() => onNavigate('merma')}
                        gradient="from-red-400 to-orange-500"
                    />
                    <ActionButton
                        icon="📦"
                        label="Ver Inventario"
                        onClick={() => onNavigate('inventario')}
                        gradient="from-purple-400 to-indigo-500"
                    />
                </div>
            </div>
        </>
    )
}

// Componente de Tarjeta de Estadística
interface StatCardProps {
    icon: React.ReactNode
    title: string
    value: string
    subtitle: string
    gradient: string
}

function StatCard({ icon, title, value, subtitle, gradient }: StatCardProps) {
    return (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-pink-100 hover:shadow-xl transition-all transform hover:scale-105">
            <div className={`w-16 h-16 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center mb-4 shadow-md`}>
                {icon}
            </div>
            <h3 className="text-gray-600 text-sm font-medium">{title}</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        </div>
    )
}

// Componente de Botón de Acción
interface ActionButtonProps {
    icon: string
    label: string
    onClick?: () => void
    gradient: string
    featured?: boolean
}

function ActionButton({ icon, label, onClick, gradient, featured }: ActionButtonProps) {
    return (
        <button
            onClick={onClick}
            className={`group relative p-6 rounded-2xl transition-all ${
                featured
                    ? 'bg-gradient-to-br from-green-400 to-emerald-500 shadow-xl hover:shadow-2xl scale-105 hover:scale-110'
                    : 'bg-white/80 backdrop-blur-sm hover:bg-white shadow-md hover:shadow-xl hover:scale-105 border border-pink-100'
            }`}
        >
            {featured && (
                <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full shadow-md">
                    Popular
                </div>
            )}
            <span className={`text-5xl mb-3 block ${featured ? 'animate-bounce' : 'group-hover:scale-110'} transition-transform`}>
                {icon}
            </span>
            <span className={`text-sm font-bold ${featured ? 'text-white' : 'text-gray-800 group-hover:text-purple-600'} transition-colors`}>
                {label}
            </span>
            {featured && (
                <div className="mt-2">
                    <Sparkles className="w-5 h-5 text-white mx-auto animate-pulse" />
                </div>
            )}
        </button>
    )
}

// Vista Inventario (placeholder)
function InventarioView() {
    return (
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-12 text-center border border-pink-100">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Package className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
                Vista de Inventario
            </h3>
            <p className="text-gray-600 text-lg">
                Módulo próximamente...
            </p>
        </div>
    )
}