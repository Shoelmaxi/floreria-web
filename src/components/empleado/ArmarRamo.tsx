import { useState } from 'react'
import { Sparkles, ArrowLeft, AlertCircle } from 'lucide-react'
import { useArmarRamos } from '../../hooks/useArmarRamos'
import { useTurno } from '../../hooks/useTurno'
import { Producto } from '../../types'
import FormularioArmarRamo from './FormularioArmarRamo'

export default function ArmarRamo() {
    const { ramos, loading, error } = useArmarRamos()
    const { turnoActual } = useTurno()
    const [ramoSeleccionado, setRamoSeleccionado] = useState<Producto | null>(null)

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
            </div>
        )
    }

    // Si seleccionó un ramo, mostrar formulario
    if (ramoSeleccionado) {
        return (
            <div>
                <button
                    onClick={() => setRamoSeleccionado(null)}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Volver a selección de ramos
                </button>
                <FormularioArmarRamo
                    ramo={ramoSeleccionado}
                    turnoId={turnoActual?.id}
                    onExito={() => setRamoSeleccionado(null)}
                    onCancelar={() => setRamoSeleccionado(null)}
                />
            </div>
        )
    }

    // Vista de selección de ramo
    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Sparkles className="w-7 h-7 text-primary" />
                    Armar Ramo
                </h2>
                <p className="text-gray-600 mt-1">
                    Selecciona el tipo de ramo que vas a armar
                </p>
            </div>

            {/* Alerta de turno */}
            {!turnoActual && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-yellow-800">
                            No tienes un turno activo
                        </p>
                        <p className="text-xs text-yellow-700 mt-1">
                            Puedes armar ramos, pero no se asociarán a ningún turno
                        </p>
                    </div>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800">{error}</p>
                </div>
            )}

            {/* Grid de Ramos */}
            {ramos.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                    <div className="text-6xl mb-4">💐</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                        No hay ramos disponibles
                    </h3>
                    <p className="text-gray-600">
                        El administrador debe crear ramos base primero
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {ramos.map((ramo) => (
                        <RamoCard
                            key={ramo.id}
                            ramo={ramo}
                            onSeleccionar={() => setRamoSeleccionado(ramo)}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

// Componente de tarjeta de ramo
interface RamoCardProps {
    ramo: Producto
    onSeleccionar: () => void
}

function RamoCard({ ramo, onSeleccionar }: RamoCardProps) {
    return (
        <button
            onClick={onSeleccionar}
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md hover:scale-105 transition-all text-left border-2 border-transparent hover:border-primary"
        >
            {/* Foto o emoji */}
            <div className="w-full h-40 bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg flex items-center justify-center mb-4">
                {ramo.foto_url ? (
                    <img
                        src={ramo.foto_url}
                        alt={ramo.nombre}
                        className="w-full h-full object-cover rounded-lg"
                    />
                ) : (
                    <span className="text-6xl">💐</span>
                )}
            </div>

            {/* Info */}
            <h3 className="text-lg font-bold text-gray-900 mb-2">
                {ramo.nombre}
            </h3>

            {/* Stock */}
            <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Stock armado:</span>
                <span className="font-semibold text-gray-900">{ramo.stock} {ramo.unidad}s</span>
            </div>

            {/* Botón */}
            <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-center gap-2 text-primary font-semibold">
                    <Sparkles className="w-5 h-5" />
                    Armar este ramo
                </div>
            </div>
        </button>
    )
}