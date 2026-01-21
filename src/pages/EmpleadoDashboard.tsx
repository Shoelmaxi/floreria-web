import { useAuth } from '../contexts/AuthContext'
import { LogOut, Package, ShoppingBag, ClipboardList } from 'lucide-react'

export default function EmpleadoDashboard() {
    const { profile, signOut } = useAuth()

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                                <span className="text-xl">🌸</span>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Mi Turno
                                </h1>
                                <p className="text-sm text-gray-500">
                                    {profile?.nombre}
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

            <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <ShoppingBag className="w-8 h-8 text-primary mb-2" />
                        <h3 className="text-gray-600 text-sm">Mis Ventas Hoy</h3>
                        <p className="text-2xl font-bold text-gray-900 mt-1">$45,000</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <Package className="w-8 h-8 text-secondary mb-2" />
                        <h3 className="text-gray-600 text-sm">Productos Vendidos</h3>
                        <p className="text-2xl font-bold text-gray-900 mt-1">12</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <ClipboardList className="w-8 h-8 text-orange-500 mb-2" />
                        <h3 className="text-gray-600 text-sm">Stock Bajo</h3>
                        <p className="text-2xl font-bold text-gray-900 mt-1">3</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                        Acciones Disponibles
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <button className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition">
                            <span className="text-3xl mb-2 block">💰</span>
                            <span className="text-sm font-medium">Registrar Venta</span>
                        </button>
                        <button className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition">
                            <span className="text-3xl mb-2 block">📦</span>
                            <span className="text-sm font-medium">Ver Inventario</span>
                        </button>
                        <button className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition">
                            <span className="text-3xl mb-2 block">📋</span>
                            <span className="text-sm font-medium">Lista Producción</span>
                        </button>
                    </div>
                </div>
            </main>
        </div>
    )
}