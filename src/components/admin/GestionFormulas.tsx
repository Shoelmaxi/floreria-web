import { useState, useEffect } from 'react'
import { X, Plus, Trash2, Save } from 'lucide-react'
import { Producto, FormulaRamoConDetalles } from '../../types'
import { useProductos } from '../../hooks/useProductos'

interface GestionFormulasProps {
    ramo: Producto
    onCerrar: () => void
}

export default function GestionFormulas({ ramo, onCerrar }: GestionFormulasProps) {
    const { productos, obtenerFormulasRamo, crearFormulaRamo, eliminarFormulaRamo } = useProductos()
    const [formulas, setFormulas] = useState<FormulaRamoConDetalles[]>([])
    const [loading, setLoading] = useState(true)
    const [guardando, setGuardando] = useState(false)

    // Nuevo ingrediente
    const [florSeleccionada, setFlorSeleccionada] = useState('')
    const [cantidad, setCantidad] = useState(1)

    // Modal de confirmación
    const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false)
    const [formulaAEliminar, setFormulaAEliminar] = useState<string | null>(null)

    // Solo flores disponibles
    const floresDisponibles = productos.filter(p => p.tipo === 'flor' && p.activo)

    useEffect(() => {
        cargarFormulas()
    }, [ramo.id])

    async function cargarFormulas() {
        setLoading(true)
        const data = await obtenerFormulasRamo(ramo.id)
        setFormulas(data)
        setLoading(false)
    }

    async function agregarIngrediente() {
        if (!florSeleccionada || cantidad <= 0) {
            alert('Selecciona una flor y una cantidad válida')
            return
        }

        // Verificar que no esté duplicada
        const yaExiste = formulas.some(f => f.flor_id === florSeleccionada)
        if (yaExiste) {
            alert('Esta flor ya está en la fórmula')
            return
        }

        setGuardando(true)
        const exito = await crearFormulaRamo(ramo.id, florSeleccionada, cantidad)

        if (exito) {
            await cargarFormulas()
            setFlorSeleccionada('')
            setCantidad(1)
        } else {
            alert('Error al agregar la flor')
        }

        setGuardando(false)
    }

    async function eliminarIngrediente(formulaId: string) {
        setFormulaAEliminar(formulaId)
        setMostrarModalEliminar(true)
    }

    async function confirmarEliminar() {
        if (!formulaAEliminar) return

        setGuardando(true)
        const exito = await eliminarFormulaRamo(formulaAEliminar)

        if (exito) {
            await cargarFormulas()
        } else {
            alert('Error al eliminar')
        }

        setGuardando(false)
        setMostrarModalEliminar(false)
        setFormulaAEliminar(null)
    }

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                    {/* Header */}
                    <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                Fórmula: {ramo.nombre}
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Define qué flores y en qué cantidad lleva este ramo
                            </p>
                        </div>
                        <button
                            onClick={onCerrar}
                            className="text-gray-400 hover:text-gray-600 transition"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="p-6">
                        {/* Fórmula Actual */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                Ingredientes Actuales
                            </h3>

                            {loading ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
                                </div>
                            ) : formulas.length === 0 ? (
                                <div className="bg-gray-50 rounded-lg p-8 text-center">
                                    <p className="text-gray-500">
                                        Este ramo aún no tiene fórmula definida.
                                        <br />
                                        Agrega las flores que lo componen abajo.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {formulas.map((formula) => (
                                        <div
                                            key={formula.id}
                                            className="flex items-center justify-between bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">🌸</span>
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {formula.flor.nombre}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {formula.cantidad_estandar} {formula.flor.unidad}
                                                        {formula.cantidad_estandar !== 1 ? (formula.flor.unidad === 'unidad' ? 'es' : 's') : ''}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => eliminarIngrediente(formula.id)}
                                                disabled={guardando}
                                                className="text-red-600 hover:text-red-700 transition disabled:opacity-50 p-2"
                                                title="Eliminar"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Agregar Nuevo Ingrediente */}
                        <div className="border-t border-gray-200 pt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                Agregar Flor a la Fórmula
                            </h3>

                            <div className="space-y-4">
                                {/* Selector de Flor */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Seleccionar Flor
                                    </label>
                                    <select
                                        value={florSeleccionada}
                                        onChange={(e) => setFlorSeleccionada(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                        disabled={guardando}
                                    >
                                        <option value="">-- Elige una flor --</option>
                                        {floresDisponibles.map((flor) => (
                                            <option key={flor.id} value={flor.id}>
                                                {flor.nombre} (Stock: {flor.stock} {flor.unidad})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Cantidad */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Cantidad Estándar
                                    </label>
                                    <input
                                        type="number"
                                        value={cantidad}
                                        onChange={(e) => setCantidad(parseInt(e.target.value) || 1)}
                                        min="1"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                        disabled={guardando}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Esta es la cantidad base. Los empleados podrán ajustarla al armar el ramo.
                                    </p>
                                </div>

                                {/* Botón Agregar */}
                                <button
                                    onClick={agregarIngrediente}
                                    disabled={guardando || !florSeleccionada}
                                    className="w-full px-4 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-blue-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {guardando ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                            Agregando...
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="w-5 h-5" />
                                            Agregar a Fórmula
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Info */}
                        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm text-blue-800">
                                💡 <strong>Recuerda:</strong> La fórmula define las cantidades estándar.
                                Los empleados podrán usar más o menos flores al armar cada ramo según las necesidades del cliente.
                            </p>
                        </div>

                        {/* Botón Cerrar */}
                        <div className="mt-6 pt-4 border-t border-gray-200">
                            <button
                                onClick={onCerrar}
                                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de Confirmación Eliminar */}
            {mostrarModalEliminar && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">
                            ¿Eliminar ingrediente?
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Esta flor se eliminará de la fórmula del ramo.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setMostrarModalEliminar(false)
                                    setFormulaAEliminar(null)
                                }}
                                disabled={guardando}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmarEliminar}
                                disabled={guardando}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50"
                            >
                                {guardando ? 'Eliminando...' : 'Eliminar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}