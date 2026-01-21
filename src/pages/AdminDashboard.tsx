import { useAuth } from '../contexts/AuthContext'
import { LogOut, Package, ShoppingCart, Users, TrendingUp } from 'lucide-react'

export default function AdminDashboard() {
    const { profile, signOut } = useAuth()

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                                <span className="text-xl">🌸</span>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Panel de Administración
                                </h1>
                                <p className="text-sm text-gray-500">
                                    Bienvenido, {profile?.nombre}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={signOut}
                            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                            <LogOut className="w-5 h-5" />
                            Salir
                        </button>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        icon={<ShoppingCart className="w-6 h-6" />}
                        title="Ventas Hoy"
                        value="$125,000"
                        change="+15%"
                        positive
                    />
                    <StatCard
                        icon={<Package className="w-6 h-6" />}
                        title="Productos"
                        value="48"
                        change="3 bajo stock"
                        positive={false}
                    />
                    <StatCard
                        icon={<Users className="w-6 h-6" />}
                        title="Empleados"
                        value="4"
                        change="2 en turno"
                        positive
                    />
                    <StatCard
                        icon={<TrendingUp className="w-6 h-6" />}
                        title="Ticket Promedio"
                        value="$12,500"
                        change="+8%"
                        positive
                    />
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                        Acciones Rápidas
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <QuickActionButton icon="📦" label="Nuevo Producto" />
                        <QuickActionButton icon="💰" label="Registrar Venta" />
                        <QuickActionButton icon="👤" label="Gestionar Usuarios" />
                        <QuickActionButton icon="📊" label="Ver Reportes" />
                    </div>
                </div>

                {/* Info */}
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-800">
                        ✅ <strong>Sistema funcionando correctamente.</strong> Autenticación
                        completada. Próximos pasos: implementar funcionalidades completas.
                    </p>
                </div>
            </main>
        </div>
    )
}

function StatCard({
                      icon,
                      title,
                      value,
                      change,
                      positive,
                  }: {
    icon: React.ReactNode
    title: string
    value: string
    change: string
    positive: boolean
}) {
    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
                <div className="text-primary">{icon}</div>
                <span
                    className={`text-sm font-medium ${
                        positive ? 'text-green-600' : 'text-orange-600'
                    }`}
                >
          {change}
        </span>
            </div>
            <h3 className="text-gray-600 text-sm">{title}</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
    )
}

function QuickActionButton({ icon, label }: { icon: string; label: string }) {
    return (
        <button className="flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition">
            <span className="text-3xl mb-2">{icon}</span>
            <span className="text-sm font-medium text-gray-700">{label}</span>
        </button>
    )
}