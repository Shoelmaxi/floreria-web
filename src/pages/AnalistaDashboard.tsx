import { useAuth } from '../contexts/AuthContext'
import { LogOut, BarChart3, TrendingUp, FileText } from 'lucide-react'

export default function AnalistaDashboard() {
    const { profile, signOut } = useAuth()

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                                <span className="text-xl">📊</span>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Panel de Análisis
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

            <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <BarChart3 className="w-8 h-8 text-primary mb-2" />
                        <h3 className="text-gray-600 text-sm">Análisis Disponible</h3>
                        <p className="text-2xl font-bold text-gray-900 mt-1">Completo</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <TrendingUp className="w-8 h-8 text-secondary mb-2" />
                        <h3 className="text-gray-600 text-sm">Reportes</h3>
                        <p className="text-2xl font-bold text-gray-900 mt-1">24</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <FileText className="w-8 h-8 text-orange-500 mb-2" />
                        <h3 className="text-gray-600 text-sm">Notas Enviadas</h3>
                        <p className="text-2xl font-bold text-gray-900 mt-1">8</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                        Funcionalidades del Analista
                    </h2>
                    <ul className="space-y-2 text-gray-600">
                        <li>✅ Ver todos los datos y métricas</li>
                        <li>✅ Analizar tendencias y patrones</li>
                        <li>✅ Generar reportes y gráficas</li>
                        <li>✅ Escribir recomendaciones</li>
                        <li>✅ Exportar análisis en Excel/PDF</li>
                    </ul>
                </div>
            </main>
        </div>
    )
}