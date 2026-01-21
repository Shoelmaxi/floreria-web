import { useState } from 'react'
import { Plus, Edit, Trash2, AlertCircle, Package, Sparkles, Search } from 'lucide-react'
import { useProductos } from '../../hooks/useProductos'
import { Producto } from '../../types'
import FormularioProducto from './FormularioProductos'
import GestionFormulas from './GestionFormulas'

export default function GestionProductos() {
    const { productos, loading, error, crearProducto, actualizarProducto, eliminarProducto, recargar } = useProductos()
    const [mostrarFormulario, setMostrarFormulario] = useState(false)
    const [productoEditar, setProductoEditar] = useState<Producto | undefined>(undefined)
    const [ramoFormulas, setRamoFormulas] = useState<Producto | null>(null)
    const [filtroTipo, setFiltroTipo] = useState<'todos' | 'flor' | 'ramo_base' | 'accesorio'>('todos')
    const [busqueda, setBusqueda] = useState('')

    // Modal de confirmación eliminar
    const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false)
    const [productoAEliminar, setProductoAEliminar] = useState<Producto | null>(null)

    // Filtrar productos
    const productosFiltrados = productos.filter(p => {
        const coincideBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase())
        const coincideTipo = filtroTipo === 'todos' || p.tipo === filtroTipo
        return coincideBusqueda && coincideTipo && p.activo
    })

    // Agrupar por tipo
    const flores = productosFiltrados.filter(p => p.tipo === 'flor')
    const ramos = productosFiltrados.filter(p => p.tipo === 'ramo_base')
    const accesorios = productosFiltrados.filter(p => p.tipo === 'accesorio')

    async function handleGuardar(form: Omit<Producto, 'id' | 'created_at' | 'updated_at'>) {
        if (productoEditar) {
            // Actualizar
            const exito = await actualizarProducto(productoEditar.id, form)
            if (exito) {
                setMostrarFormulario(false)
                setProductoEditar(undefined)
            }
        } else {
            // Crear
            const nuevo = await crearProducto(form)
            if (nuevo) {
                setMostrarFormulario(false)
            }
        }
    }

    async function handleEliminar(producto: Producto) {
        setProductoAEliminar(producto)
        setMostrarModalEliminar(true)
    }

    async function confirmarEliminar() {
        if (!productoAEliminar) return

        await eliminarProducto(productoAEliminar.id)
        setMostrarModalEliminar(false)
        setProductoAEliminar(null)
    }

    function abrirEditar(producto: Producto) {
        setProductoEditar(producto)
        setMostrarFormulario(true)
    }

    function abrirNuevo() {
        setProductoEditar(undefined)
        setMostrarFormulario(true)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Gestión de Productos</h2>
                    <p className="text-gray-600 mt-1">
                        {productos.filter(p => p.activo).length} productos activos
                    </p>
                </div>
                <button
                    onClick={abrirNuevo}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-blue-600 transition"
                >
                    <Plus className="w-5 h-5" />
                    Nuevo Producto
                </button>
            </div>

            {/* Error */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800">{error}</p>
                </div>
            )}

            {/* Filtros */}
            <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Búsqueda */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            placeholder="Buscar producto..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>

                    {/* Filtro por tipo */}
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
            </div>

            {/* Flores */}
            {(filtroTipo === 'todos' || filtroTipo === 'flor') && flores.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="text-2xl">🌸</span>
                        Flores Individuales ({flores.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {flores.map((producto) => (
                            <ProductoCard
                                key={producto.id}
                                producto={producto}
                                onEditar={abrirEditar}
                                onEliminar={handleEliminar}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Ramos */}
            {(filtroTipo === 'todos' || filtroTipo === 'ramo_base') && ramos.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="text-2xl">💐</span>
                        Ramos Base ({ramos.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {ramos.map((producto) => (
                            <ProductoCard
                                key={producto.id}
                                producto={producto}
                                onEditar={abrirEditar}
                                onEliminar={handleEliminar}
                                onGestionarFormula={() => setRamoFormulas(producto)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Accesorios */}
            {(filtroTipo === 'todos' || filtroTipo === 'accesorio') && accesorios.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Package className="w-6 h-6" />
                        Accesorios ({accesorios.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {accesorios.map((producto) => (
                            <ProductoCard
                                key={producto.id}
                                producto={producto}
                                onEditar={abrirEditar}
                                onEliminar={handleEliminar}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Sin resultados */}
            {productosFiltrados.length === 0 && (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                    <p className="text-gray-500">No se encontraron productos</p>
                </div>
            )}

            {/* Modales */}
            {mostrarFormulario && (
                <FormularioProducto
                    producto={productoEditar}
                    onGuardar={handleGuardar}
                    onCancelar={() => {
                        setMostrarFormulario(false)
                        setProductoEditar(undefined)
                    }}
                />
            )}

            {ramoFormulas && (
                <GestionFormulas
                    ramo={ramoFormulas}
                    onCerrar={() => setRamoFormulas(null)}
                />
            )}

            {/* Modal de Confirmación Eliminar */}
            {mostrarModalEliminar && productoAEliminar && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">
                            ¿Desactivar producto?
                        </h3>
                        <p className="text-gray-600 mb-2">
                            <strong>{productoAEliminar.nombre}</strong>
                        </p>
                        <p className="text-gray-600 mb-6">
                            El producto se ocultará pero no se eliminará de la base de datos.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setMostrarModalEliminar(false)
                                    setProductoAEliminar(null)
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmarEliminar}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
                            >
                                Desactivar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

// Componente auxiliar para tarjeta de producto
interface ProductoCardProps {
    producto: Producto
    onEditar: (producto: Producto) => void
    onEliminar: (producto: Producto) => void
    onGestionarFormula?: () => void
}

function ProductoCard({ producto, onEditar, onEliminar, onGestionarFormula }: ProductoCardProps) {
    const alertaStock = producto.stock <= producto.stock_minimo

    return (
        <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{producto.nombre}</h4>
                    <p className="text-sm text-gray-500 capitalize">{producto.unidad}</p>
                </div>
                {alertaStock && (
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                        Stock Bajo
                    </span>
                )}
            </div>

            {/* Stock */}
            <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">Stock</span>
                    <span className={`font-bold ${alertaStock ? 'text-red-600' : 'text-gray-900'}`}>
                        {producto.stock} / {producto.stock_minimo}
                    </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className={`h-2 rounded-full transition-all ${
                            alertaStock ? 'bg-red-500' : 'bg-green-500'
                        }`}
                        style={{
                            width: `${Math.min((producto.stock / producto.stock_minimo) * 100, 100)}%`
                        }}
                    />
                </div>
            </div>

            {/* Botones */}
            <div className="flex gap-2">
                {onGestionarFormula && (
                    <button
                        onClick={onGestionarFormula}
                        className="flex-1 px-3 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition flex items-center justify-center gap-1"
                        title="Gestionar fórmula"
                    >
                        <Sparkles className="w-4 h-4" />
                        Fórmula
                    </button>
                )}
                <button
                    onClick={() => onEditar(producto)}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-1"
                    title="Editar"
                >
                    <Edit className="w-4 h-4" />
                    Editar
                </button>
                <button
                    onClick={() => onEliminar(producto)}
                    className="px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition"
                    title="Desactivar"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    )
}