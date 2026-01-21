import { useState, useEffect } from 'react'
import { Check, AlertCircle, Sparkles } from 'lucide-react'
import { useArmarRamos } from '../../hooks/useArmarRamos'
import { Producto, FormulaRamoConDetalles, FlorUsada } from '../../types'

interface FormularioArmarRamoProps {
    ramo: Producto
    turnoId?: string
    onExito: () => void
    onCancelar: () => void
}

export default function FormularioArmarRamo({ ramo, turnoId, onExito, onCancelar }: FormularioArmarRamoProps) {
    const { obtenerFormulaRamo, armarRamo, error: hookError } = useArmarRamos()
    const [formula, setFormula] = useState<FormulaRamoConDetalles[]>([])
    const [cantidades, setCantidades] = useState<Record<string, number>>({})
    const [loading, setLoading] = useState(true)
    const [armando, setArmando] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        cargarFormula()
    }, [ramo.id])

    async function cargarFormula() {
        setLoading(true)
        const data = await obtenerFormulaRamo(ramo.id)
        setFormula(data)

        // Inicializar cantidades con valores estándar
        const cantidadesIniciales: Record<string, number> = {}
        data.forEach(f => {
            cantidadesIniciales[f.flor_id] = f.cantidad_estandar
        })
        setCantidades(cantidadesIniciales)

        setLoading(false)
    }

    function actualizarCantidad(florId: string, nuevaCantidad: number) {
        setCantidades(prev => ({
            ...prev,
            [florId]: Math.max(0, nuevaCantidad)
        }))
    }

    async function handleArmar() {
        setError(null)

        // Validar que todas las cantidades sean > 0
        const hayFloresVacias = Object.values(cantidades).some(c => c <= 0)
        if (hayFloresVacias) {
            setError('Todas las flores deben tener al menos cantidad 1')
            return
        }

        // Construir array de flores usadas
        const floresUsadas: FlorUsada[] = formula.map(f => ({
            flor_id: f.flor_id,
            nombre: f.flor.nombre,
            cantidad: cantidades[f.flor_id] || f.cantidad_estandar
        }))

        setArmando(true)
        const exito = await armarRamo(ramo.id, floresUsadas, turnoId)

        if (exito) {
            onExito()
        } else {
            setError(hookError || 'Error al armar el ramo')
        }

        setArmando(false)
    }

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm p-12 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
            </div>
        )
    }

    if (formula.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Este ramo no tiene fórmula
                </h3>
                <p className="text-gray-600 mb-6">
                    El administrador debe configurar qué flores lleva este ramo
                </p>
                <button
                    onClick={onCancelar}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                    Volver
                </button>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-8 text-white">
                <div className="flex items-center gap-3 mb-2">
                    <Sparkles className="w-8 h-8" />
                    <h2 className="text-3xl font-bold">{ramo.nombre}</h2>
                </div>
                <p className="text-pink-100">
                    Ingresa las cantidades reales que vas a usar
                </p>
            </div>

            <div className="p-6">
                {/* Error */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-800">{error}</p>
                    </div>
                )}

                {/* Fórmula */}
                <div className="space-y-4 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Ingredientes del Ramo
                    </h3>

                    {formula.map((ingrediente) => {
                        const cantidadActual = cantidades[ingrediente.flor_id] || ingrediente.cantidad_estandar
                        const diferencia = cantidadActual - ingrediente.cantidad_estandar
                        const stockSuficiente = ingrediente.flor.stock >= cantidadActual

                        return (
                            <div
                                key={ingrediente.id}
                                className={`border-2 rounded-lg p-4 transition ${
                                    stockSuficiente
                                        ? 'border-gray-200 hover:border-primary'
                                        : 'border-red-300 bg-red-50'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <span className="text-3xl">🌸</span>
                                        <div>
                                            <p className="font-semibold text-gray-900">
                                                {ingrediente.flor.nombre}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Stock disponible: {ingrediente.flor.stock} {ingrediente.flor.unidad}
                                            </p>
                                        </div>
                                    </div>

                                    {!stockSuficiente && (
                                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                                            Stock Insuficiente
                                        </span>
                                    )}
                                </div>

                                {/* Cantidad */}
                                <div className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Cantidad a Usar
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => actualizarCantidad(ingrediente.flor_id, cantidadActual - 1)}
                                                disabled={armando}
                                                className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition disabled:opacity-50 font-bold text-xl"
                                            >
                                                −
                                            </button>
                                            <input
                                                type="number"
                                                value={cantidadActual}
                                                onChange={(e) => actualizarCantidad(ingrediente.flor_id, parseInt(e.target.value) || 0)}
                                                min="0"
                                                max={ingrediente.flor.stock}
                                                disabled={armando}
                                                className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center font-semibold focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => actualizarCantidad(ingrediente.flor_id, cantidadActual + 1)}
                                                disabled={armando || cantidadActual >= ingrediente.flor.stock}
                                                className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition disabled:opacity-50 font-bold text-xl"
                                            >
                                                +
                                            </button>
                                            <span className="text-sm text-gray-600">
                                                {ingrediente.flor.unidad}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Comparación con estándar */}
                                    <div className="text-right">
                                        <p className="text-sm text-gray-500 mb-1">
                                            Estándar: {ingrediente.cantidad_estandar}
                                        </p>
                                        {diferencia !== 0 && (
                                            <p className={`text-sm font-medium ${
                                                diferencia > 0 ? 'text-blue-600' : 'text-orange-600'
                                            }`}>
                                                {diferencia > 0 ? '+' : ''}{diferencia}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Resumen */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <h4 className="font-semibold text-blue-900 mb-2">
                        Resumen del Ramo
                    </h4>
                    <div className="text-sm text-blue-800 space-y-1">
                        {formula.map(f => (
                            <p key={f.id}>
                                • {cantidades[f.flor_id] || f.cantidad_estandar} {f.flor.nombre}
                            </p>
                        ))}
                    </div>
                </div>

                {/* Botones */}
                <div className="flex gap-3">
                    <button
                        onClick={onCancelar}
                        disabled={armando}
                        className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleArmar}
                        disabled={armando}
                        className="flex-1 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-blue-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {armando ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                Armando...
                            </>
                        ) : (
                            <>
                                <Check className="w-5 h-5" />
                                Confirmar y Armar Ramo
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}