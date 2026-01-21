import { useState } from 'react'
import { AlertTriangle, Minus, AlertCircle, Check } from 'lucide-react'
import { useInventario } from '../../hooks/useInventario'
import { useTurno } from '../../hooks/useTurno'
import { Producto } from '../../types'

const MOTIVOS_MERMA = [
    'Dañada',
    'Vencida',
    'Marchita',
    'Robo',
    'Pérdida',
    'Otro'
]

export default function Merma() {
    const { productos, loading, error, registrarMerma } = useInventario()
    const { turnoActual } = useTurno()

    const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null)
    const [cantidad, setCantidad] = useState('')
    const [motivo, setMotivo] = useState('')
    const [notas, setNotas] = useState('')
    const [procesando, setProcesando] = useState(false)
    const [errorLocal, setErrorLocal] = useState<string | null>(null)
    const [busqueda, setBusqueda] = useState('')

    // Filtrar productos con stock
    const productosFiltrados = productos.filter(p =>
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) && p.stock > 0
    )

    async function handleRegistrar() {
        setErrorLocal(null)

        if (!productoSeleccionado) {
            setErrorLocal('Selecciona un producto')
            return
        }

        if (!cantidad || parseInt(cantidad) <= 0) {
            setErrorLocal('Ingresa una cantidad válida')
            return
        }

        if (!motivo) {
            setErrorLocal('Selecciona un motivo')
            return
        }

        setProcesando(true)
        const exito = await registrarMerma(
            productoSeleccionado.id,
            parseInt(cantidad),
            motivo,
            turnoActual?.id,
            notas || undefined
        )

        if (exito) {
            // Limpiar formulario
            setProductoSeleccionado(null)
            setCantidad('')
            setMotivo('')
            setNotas('')
            alert('✅ Merma registrada exitosamente')
        } else {
            setErrorLocal(error || 'Error al registrar')
        }

        setProcesando(false)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm p-6">
                {/* Header */}
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <AlertTriangle className="w-7 h-7 text-red-600" />
                        Registrar Merma
                    </h2>
                    <p className="text-gray-600 mt-1">
                        Registra productos dañados, vencidos o perdidos
                    </p>
                </div>

                {/* Alerta de turno */}
                {!turnoActual && (
                    <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-yellow-800">
                            No tienes turno activo. La merma se registrará sin turno.
                        </p>
                    </div>
                )}

                {/* Error */}
                {(errorLocal || error) && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-800">{errorLocal || error}</p>
                    </div>
                )}

                {/* Formulario */}
                <div className="space-y-6">
                    {/* Búsqueda de Producto */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Buscar Producto
                        </label>
                        <input
                            type="text"
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            placeholder="Buscar por nombre..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>

                    {/* Seleccionar Producto */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Seleccionar Producto *
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3">
                            {productosFiltrados.map((producto) => (
                                <button
                                    key={producto.id}
                                    onClick={() => setProductoSeleccionado(producto)}
                                    className={`p-3 rounded-lg text-left transition border-2 ${
                                        productoSeleccionado?.id === producto.id
                                            ? 'border-red-500 bg-red-50'
                                            : 'border-gray-200 hover:border-red-500 hover:bg-gray-50'
                                    }`}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xl">
                                            {producto.tipo === 'ramo_base' ? '💐' : '🌸'}
                                        </span>
                                        {productoSeleccionado?.id === producto.id && (
                                            <Check className="w-4 h-4 text-red-600" />
                                        )}
                                    </div>
                                    <p className="font-medium text-sm text-gray-900">
                                        {producto.nombre}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                        Stock: {producto.stock}
                                    </p>
                                </button>
                            ))}
                        </div>
                        {productosFiltrados.length === 0 && (
                            <p className="text-sm text-gray-500 mt-2">
                                No hay productos con stock disponible
                            </p>
                        )}
                    </div>

                    {/* Producto Seleccionado */}
                    {productoSeleccionado && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-sm font-medium text-red-900 mb-1">
                                Producto seleccionado:
                            </p>
                            <p className="text-lg font-bold text-red-900">
                                {productoSeleccionado.nombre}
                            </p>
                            <p className="text-sm text-red-700">
                                Stock actual: {productoSeleccionado.stock} {productoSeleccionado.unidad}
                            </p>
                        </div>
                    )}

                    {/* Cantidad */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Cantidad de Merma *
                        </label>
                        <input
                            type="number"
                            value={cantidad}
                            onChange={(e) => setCantidad(e.target.value)}
                            placeholder="Ej: 5"
                            min="1"
                            max={productoSeleccionado?.stock || 0}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                        {productoSeleccionado && cantidad && parseInt(cantidad) > 0 && (
                            <p className="text-sm text-gray-600 mt-2">
                                Nuevo stock: {productoSeleccionado.stock} - {cantidad} ={' '}
                                <span className={`font-bold ${
                                    productoSeleccionado.stock - parseInt(cantidad) <= productoSeleccionado.stock_minimo
                                        ? 'text-red-600'
                                        : 'text-gray-900'
                                }`}>
                                    {productoSeleccionado.stock - parseInt(cantidad)}
                                </span>
                                {productoSeleccionado.stock - parseInt(cantidad) <= productoSeleccionado.stock_minimo && (
                                    <span className="text-red-600 ml-2">⚠️ Stock bajo</span>
                                )}
                            </p>
                        )}
                    </div>

                    {/* Motivo */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Motivo de la Merma *
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {MOTIVOS_MERMA.map((m) => (
                                <button
                                    key={m}
                                    onClick={() => setMotivo(m)}
                                    className={`px-4 py-2 rounded-lg font-medium transition border-2 ${
                                        motivo === m
                                            ? 'border-red-500 bg-red-50 text-red-700'
                                            : 'border-gray-200 text-gray-700 hover:border-red-500'
                                    }`}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Notas */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Notas / Detalles {motivo === 'Otro' ? '*' : '(opcional)'}
                        </label>
                        <textarea
                            value={notas}
                            onChange={(e) => setNotas(e.target.value)}
                            placeholder="Describe el problema o la situación..."
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                        />
                    </div>

                    {/* Advertencia */}
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-2">
                        <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-orange-800">
                            <p className="font-medium mb-1">⚠️ Esta acción no se puede deshacer</p>
                            <p>El stock se descontará permanentemente del inventario.</p>
                        </div>
                    </div>

                    {/* Botón */}
                    <button
                        onClick={handleRegistrar}
                        disabled={procesando || !productoSeleccionado || !cantidad || !motivo || (motivo === 'Otro' && !notas)}
                        className="w-full px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {procesando ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                Registrando...
                            </>
                        ) : (
                            <>
                                <Minus className="w-5 h-5" />
                                Registrar Merma
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}