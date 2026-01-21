import { useState } from 'react'
import { Clock, LogIn, LogOut, AlertCircle } from 'lucide-react'
import { useTurno } from '../../hooks/useTurno'

export default function TurnoControl() {
    const { turnoActual, loading, error, iniciarTurno, cerrarTurno, tiempoTranscurrido } = useTurno()
    const [notas, setNotas] = useState('')
    const [mostrarModalCierre, setMostrarModalCierre] = useState(false)
    const [procesando, setProcesando] = useState(false)

    async function handleIniciarTurno() {
        setProcesando(true)
        const exito = await iniciarTurno()
        if (exito) {
            // Turno iniciado exitosamente
        }
        setProcesando(false)
    }

    async function handleCerrarTurno() {
        setProcesando(true)
        const exito = await cerrarTurno(notas)
        if (exito) {
            setMostrarModalCierre(false)
            setNotas('')
        }
        setProcesando(false)
    }

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
                </div>
            </div>
        )
    }

    return (
        <>
            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Clock className="w-6 h-6 text-primary" />
                        <h2 className="text-xl font-bold text-gray-900">Control de Turno</h2>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-800">{error}</p>
                    </div>
                )}

                {!turnoActual ? (
                    // No hay turno activo - Mostrar botón de iniciar
                    <div className="text-center py-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                            <LogIn className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            No hay turno activo
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Inicia tu turno para comenzar a trabajar
                        </p>
                        <button
                            onClick={handleIniciarTurno}
                            disabled={procesando}
                            className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
                        >
                            {procesando ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                    Iniciando...
                                </>
                            ) : (
                                <>
                                    <LogIn className="w-5 h-5" />
                                    Iniciar Turno
                                </>
                            )}
                        </button>
                    </div>
                ) : (
                    // Hay turno activo - Mostrar información
                    <div>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-green-700 font-medium mb-1">
                                        Turno Activo
                                    </p>
                                    <p className="text-2xl font-bold text-green-900">
                                        {tiempoTranscurrido}
                                    </p>
                                    <p className="text-sm text-green-600 mt-1">
                                        Iniciado: {new Date(turnoActual.hora_inicio).toLocaleTimeString('es-CL', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                    </p>
                                </div>
                                <div className="animate-pulse">
                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setMostrarModalCierre(true)}
                            disabled={procesando}
                            className="w-full px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <LogOut className="w-5 h-5" />
                            Cerrar Turno
                        </button>
                    </div>
                )}
            </div>

            {/* Modal para cerrar turno */}
            {mostrarModalCierre && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">
                            Cerrar Turno
                        </h3>

                        <div className="mb-4">
                            <p className="text-gray-600 mb-2">
                                Tiempo trabajado: <span className="font-semibold text-gray-900">{tiempoTranscurrido}</span>
                            </p>
                            <p className="text-sm text-gray-500">
                                Inicio: {new Date(turnoActual!.hora_inicio).toLocaleString('es-CL')}
                            </p>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Notas del turno (opcional)
                            </label>
                            <textarea
                                value={notas}
                                onChange={(e) => setNotas(e.target.value)}
                                placeholder="Ej: Todo normal, stock de rosas bajo..."
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setMostrarModalCierre(false)}
                                disabled={procesando}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleCerrarTurno}
                                disabled={procesando}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {procesando ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                        Cerrando...
                                    </>
                                ) : (
                                    <>
                                        <LogOut className="w-5 h-5" />
                                        Cerrar
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}