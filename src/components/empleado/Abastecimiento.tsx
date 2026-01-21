import { useState } from 'react'
import { Package, Plus, AlertCircle, Check } from 'lucide-react'
import { useInventario } from '../../hooks/useInventario'
import { useTurno } from '../../hooks/useTurno'
import { Producto } from '../../types'

export default function Abastecimiento() {
    const { productos, loading, error, registrarAbastecimiento } = useInventario()
    const { turnoActual } = useTurno()

    const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null)
    const [cantidad, setCantidad] = useState('')
    const [notas, setNotas] = useState('')
    const [procesando, setProcesando] = useState(false)
    const [errorLocal, setErrorLocal] = useState<string | null>(null)
    const [busqueda, setBusqueda] = useState('')

    // Filtrar productos
    const productosFiltrados = productos.filter(p =>
        p.nombre.toLowerCase().includes(busqueda.toLowerCase())
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

        setProcesando(true)
        const exito = await registrarAbastecimiento(
            productoSeleccionado.id,
            parseInt(cantidad),
            turnoActual?.id,
            notas || undefined
        )

        if (exito) {
            // Limpiar formulario
            setProductoSeleccionado(null)
            setCantidad('')
            setNotas('')
            alert('✅ Abastecimiento registrado exitosamente')
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
                        <Package className="w-7 h-7 text-green-600" />
                        Registrar Abastecimiento
                    </h2>
                    <p className="text-gray-600 mt-1">
                        Registra la entrada de nuevos productos al inventario
                    </p>
                </div>

                {/* Alerta de turno */}
                {!turnoActual && (
                    <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-yellow-800">
                            No tienes turno activo. El abastecimiento se registrará sin turno.
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
                                            ? 'border-primary bg-blue-50'
                                            : 'border-gray-200 hover:border-primary hover:bg-gray-50'
                                    }`}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xl">
                                            {producto.tipo === 'ramo_base' ? '💐' : '🌸'}
                                        </span>
                                        {productoSeleccionado?.id === producto.id && (
                                            <Check className="w-4 h-4 text-primary" />
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
                                No se encontraron productos
                            </p>
                        )}
                    </div>

                    {/* Producto Seleccionado */}
                    {productoSeleccionado && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <p className="text-sm font-medium text-green-900 mb-1">
                                Producto seleccionado:
                            </p>
                            <p className="text-lg font-bold text-green-900">
                                {productoSeleccionado.nombre}
                            </p>
                            <p className="text-sm text-green-700">
                                Stock actual: {productoSeleccionado.stock} {productoSeleccionado.unidad}
                            </p>
                        </div>
                    )}

                    {/* Cantidad */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Cantidad a Abastecer *
                        </label>
                        <input
                            type="number"
                            value={cantidad}
                            onChange={(e) => setCantidad(e.target.value)}
                            placeholder="Ej: 50"
                            min="1"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                        {productoSeleccionado && cantidad && parseInt(cantidad) > 0 && (
                            <p className="text-sm text-gray-600 mt-2">
                                Nuevo stock: {productoSeleccionado.stock} + {cantidad} ={' '}
                                <span className="font-bold text-green-600">
                                    {productoSeleccionado.stock + parseInt(cantidad)}
                                </span>
                            </p>
                        )}
                    </div>

                    {/* Notas */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Notas (opcional)
                        </label>
                        <textarea
                            value={notas}
                            onChange={(e) => setNotas(e.target.value)}
                            placeholder="Ej: Proveedor X, pedido #123..."
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                        />
                    </div>

                    {/* Botón */}
                    <button
                        onClick={handleRegistrar}
                        disabled={procesando || !productoSeleccionado || !cantidad}
                        className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {procesando ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                Registrando...
                            </>
                        ) : (
                            <>
                                <Plus className="w-5 h-5" />
                                Registrar Abastecimiento
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}