import { useState } from 'react'
import { ShoppingCart, AlertCircle, DollarSign } from 'lucide-react'
import { useVentas } from '../../hooks/useVentas'
import { useTurno } from '../../hooks/useTurno'
import { Producto, ProductoVenta, MetodoPago } from '../../types'

export default function RegistrarVenta() {
    const { productos, loading, error, registrarVenta } = useVentas()
    const { turnoActual } = useTurno()

    // Estado del carrito
    const [carrito, setCarrito] = useState<ProductoVenta[]>([])

    // Estado del formulario
    const [esUber, setEsUber] = useState(false)
    const [montoTotal, setMontoTotal] = useState('')
    const [metodoPago, setMetodoPago] = useState<MetodoPago | ''>('')
    const [notas, setNotas] = useState('')

    // Estado UI
    const [procesando, setProcesando] = useState(false)
    const [errorLocal, setErrorLocal] = useState<string | null>(null)

    // Filtros
    const [busqueda, setBusqueda] = useState('')
    const [filtroTipo, setFiltroTipo] = useState<'todos' | 'flor' | 'ramo_base'>('todos')

    // Productos filtrados
    const productosFiltrados = productos.filter(p => {
        const coincideBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase())
        const coincideTipo = filtroTipo === 'todos' || p.tipo === filtroTipo
        const tieneStock = p.stock > 0
        return coincideBusqueda && coincideTipo && tieneStock
    })

    function agregarAlCarrito(producto: Producto) {
        const existente = carrito.find(item => item.producto_id === producto.id)

        if (existente) {
            // Incrementar cantidad si no excede stock
            if (existente.cantidad < producto.stock) {
                setCarrito(carrito.map(item =>
                    item.producto_id === producto.id
                        ? { ...item, cantidad: item.cantidad + 1 }
                        : item
                ))
            } else {
                setErrorLocal(`No hay más stock de ${producto.nombre}`)
                setTimeout(() => setErrorLocal(null), 3000)
            }
        } else {
            // Agregar nuevo producto
            setCarrito([...carrito, {
                producto_id: producto.id,
                nombre: producto.nombre,
                cantidad: 1
            }])
        }
    }

    function quitarDelCarrito(productoId: string) {
        setCarrito(carrito.filter(item => item.producto_id !== productoId))
    }

    function actualizarCantidad(productoId: string, nuevaCantidad: number) {
        const producto = productos.find(p => p.id === productoId)
        if (!producto) return

        if (nuevaCantidad <= 0) {
            quitarDelCarrito(productoId)
        } else if (nuevaCantidad <= producto.stock) {
            setCarrito(carrito.map(item =>
                item.producto_id === productoId
                    ? { ...item, cantidad: nuevaCantidad }
                    : item
            ))
        }
    }

    function limpiarCarrito() {
        setCarrito([])
        setMontoTotal('')
        setMetodoPago('')
        setNotas('')
        setEsUber(false)
        setErrorLocal(null)
    }

    async function handleRegistrarVenta() {
        setErrorLocal(null)

        if (carrito.length === 0) {
            setErrorLocal('Agrega productos al carrito')
            return
        }

        if (!esUber) {
            if (!montoTotal || parseFloat(montoTotal) <= 0) {
                setErrorLocal('Ingresa un monto válido')
                return
            }
            if (!metodoPago) {
                setErrorLocal('Selecciona un método de pago')
                return
            }
        }

        setProcesando(true)
        const exito = await registrarVenta(
            carrito,
            esUber ? null : parseFloat(montoTotal),
            esUber ? null : (metodoPago as MetodoPago),
            esUber,
            turnoActual?.id,
            notas || undefined
        )

        if (exito) {
            limpiarCarrito()
            alert('✅ Venta registrada exitosamente')
        } else {
            setErrorLocal(error || 'Error al registrar la venta')
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Panel Izquierdo: Productos */}
            <div className="lg:col-span-2 space-y-4">
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <ShoppingCart className="w-7 h-7 text-primary" />
                        Seleccionar Productos
                    </h2>

                    {/* Alerta de turno */}
                    {!turnoActual && (
                        <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-yellow-800">
                                No tienes turno activo. La venta se registrará sin turno.
                            </p>
                        </div>
                    )}

                    {/* Búsqueda y Filtros */}
                    <div className="mb-4 space-y-3">
                        <input
                            type="text"
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            placeholder="Buscar producto..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={() => setFiltroTipo('todos')}
                                className={`px-4 py-2 rounded-lg font-medium transition ${
                                    filtroTipo === 'todos'
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Todos
                            </button>
                            <button
                                onClick={() => setFiltroTipo('flor')}
                                className={`px-4 py-2 rounded-lg font-medium transition ${
                                    filtroTipo === 'flor'
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Flores
                            </button>
                            <button
                                onClick={() => setFiltroTipo('ramo_base')}
                                className={`px-4 py-2 rounded-lg font-medium transition ${
                                    filtroTipo === 'ramo_base'
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Ramos
                            </button>
                        </div>
                    </div>

                    {/* Grid de productos */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto">
                        {productosFiltrados.map((producto) => (
                            <button
                                key={producto.id}
                                onClick={() => agregarAlCarrito(producto)}
                                disabled={producto.stock === 0}
                                className="bg-gray-50 hover:bg-gray-100 rounded-lg p-3 text-left transition disabled:opacity-50 disabled:cursor-not-allowed border-2 border-transparent hover:border-primary"
                            >
                                <div className="text-2xl mb-2">
                                    {producto.tipo === 'ramo_base' ? '💐' : '🌸'}
                                </div>
                                <p className="font-semibold text-sm text-gray-900 mb-1">
                                    {producto.nombre}
                                </p>
                                <p className="text-xs text-gray-600">
                                    Stock: {producto.stock}
                                </p>
                            </button>
                        ))}
                    </div>

                    {productosFiltrados.length === 0 && (
                        <p className="text-center text-gray-500 py-8">
                            No hay productos disponibles
                        </p>
                    )}
                </div>
            </div>

            {/* Panel Derecho: Carrito y Pago */}
            <div className="space-y-4">
                {/* Carrito */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                        Carrito ({carrito.length})
                    </h3>

                    {carrito.length === 0 ? (
                        <p className="text-center text-gray-500 py-8 text-sm">
                            Agrega productos al carrito
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {carrito.map((item) => {
                                const producto = productos.find(p => p.id === item.producto_id)
                                return (
                                    <div key={item.producto_id} className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
                                        <div className="flex-1">
                                            <p className="font-medium text-sm text-gray-900">{item.nombre}</p>
                                            <p className="text-xs text-gray-600">Stock: {producto?.stock}</p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => actualizarCantidad(item.producto_id, item.cantidad - 1)}
                                                className="w-7 h-7 flex items-center justify-center bg-white border border-gray-300 rounded hover:bg-gray-100 text-sm font-bold"
                                            >
                                                −
                                            </button>
                                            <span className="w-8 text-center font-semibold text-sm">{item.cantidad}</span>
                                            <button
                                                onClick={() => actualizarCantidad(item.producto_id, item.cantidad + 1)}
                                                disabled={item.cantidad >= (producto?.stock || 0)}
                                                className="w-7 h-7 flex items-center justify-center bg-white border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 text-sm font-bold"
                                            >
                                                +
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => quitarDelCarrito(item.producto_id)}
                                            className="text-red-600 hover:text-red-700 text-xs"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    {carrito.length > 0 && (
                        <button
                            onClick={limpiarCarrito}
                            className="mt-4 w-full text-sm text-red-600 hover:text-red-700"
                        >
                            Limpiar carrito
                        </button>
                    )}
                </div>

                {/* Formulario de Pago */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <DollarSign className="w-5 h-5" />
                        Detalles de Pago
                    </h3>

                    {/* Checkbox Uber */}
                    <div className="mb-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={esUber}
                                onChange={(e) => setEsUber(e.target.checked)}
                                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                            />
                            <span className="text-sm font-medium text-gray-700">
                                Venta Uber Eats 🚗
                            </span>
                        </label>
                        {esUber && (
                            <p className="text-xs text-gray-500 mt-1 ml-6">
                                No se registrará monto ni método de pago
                            </p>
                        )}
                    </div>

                    {/* Monto (solo si no es Uber) */}
                    {!esUber && (
                        <>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Monto Total *
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                                        $
                                    </span>
                                    <input
                                        type="number"
                                        value={montoTotal}
                                        onChange={(e) => setMontoTotal(e.target.value)}
                                        placeholder="0"
                                        min="0"
                                        step="100"
                                        className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Método de Pago */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Método de Pago *
                                </label>
                                <select
                                    value={metodoPago}
                                    onChange={(e) => setMetodoPago(e.target.value as MetodoPago | '')}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                >
                                    <option value="">Seleccionar...</option>
                                    <option value="efectivo">Efectivo 💵</option>
                                    <option value="transferencia">Transferencia 📱</option>
                                    <option value="debito">Débito 💳</option>
                                </select>
                            </div>
                        </>
                    )}

                    {/* Notas */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Notas (opcional)
                        </label>
                        <textarea
                            value={notas}
                            onChange={(e) => setNotas(e.target.value)}
                            placeholder="Ej: Cliente solicitó..."
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-sm"
                        />
                    </div>

                    {/* Error */}
                    {(errorLocal || error) && (
                        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-red-800">{errorLocal || error}</p>
                        </div>
                    )}

                    {/* Botón Registrar */}
                    <button
                        onClick={handleRegistrarVenta}
                        disabled={procesando || carrito.length === 0}
                        className="w-full px-4 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {procesando ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                Procesando...
                            </>
                        ) : (
                            <>
                                <ShoppingCart className="w-5 h-5" />
                                Registrar Venta
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}