import { Package, AlertTriangle, TrendingUp, TrendingDown, Search } from 'lucide-react'
import { useState } from 'react'
import { Producto } from '../../types'

interface InventarioTiempoRealProps {
    productos: Producto[]
    onRecargar: () => void
}

export default function InventarioTiempoReal({ productos, onRecargar }: InventarioTiempoRealProps) {
    const [busqueda, setBusqueda] = useState('')
    const [filtroStock, setFiltroStock] = useState<'todos' | 'bajo' | 'normal'>('todos')

    // Filtrar productos
    const productosFiltrados = productos.filter(p => {
        const coincideBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase())
        const stockBajo = p.stock <= p.stock_minimo

        let coincideStock = true
        if (filtroStock === 'bajo') coincideStock = stockBajo
        if (filtroStock === 'normal') coincideStock = !stockBajo

        return coincideBusqueda && coincideStock
    })

    // Estadísticas
    const totalProductos = productos.length
    const productosStockBajo = productos.filter(p => p.stock <= p.stock_minimo).length
    const productosStockCritico = productos.filter(p => p.stock === 0).length

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Inventario en Tiempo Real</h2>
                    <p className="text-gray-600 mt-1">
                        Vista completa del stock actual
                    </p>
                </div>
                <button
                    onClick={onRecargar}
                    className="px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-blue-600 transition"
                >
                    🔄 Actualizar
                </button>
            </div>

            {/* Estadísticas Rápidas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow-sm p-4">
                    <Package className="w-6 h-6 text-blue-600 mb-2" />
                    <p className="text-sm text-gray-600">Total Productos</p>
                    <p className="text-2xl font-bold text-gray-900">{totalProductos}</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-4">
                    <AlertTriangle className="w-6 h-6 text-orange-600 mb-2" />
                    <p className="text-sm text-gray-600">Stock Bajo</p>
                    <p className="text-2xl font-bold text-orange-600">{productosStockBajo}</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-4">
                    <AlertTriangle className="w-6 h-6 text-red-600 mb-2" />
                    <p className="text-sm text-gray-600">Stock Crítico (0)</p>
                    <p className="text-2xl font-bold text-red-600">{productosStockCritico}</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-4">
                    <TrendingUp className="w-6 h-6 text-green-600 mb-2" />
                    <p className="text-sm text-gray-600">Stock Normal</p>
                    <p className="text-2xl font-bold text-green-600">
                        {totalProductos - productosStockBajo}
                    </p>
                </div>
            </div>

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

                    {/* Filtro Stock */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFiltroStock('todos')}
                            className={`px-4 py-2 rounded-lg font-medium transition ${
                                filtroStock === 'todos'
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Todos
                        </button>
                        <button
                            onClick={() => setFiltroStock('bajo')}
                            className={`px-4 py-2 rounded-lg font-medium transition ${
                                filtroStock === 'bajo'
                                    ? 'bg-orange-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Stock Bajo
                        </button>
                        <button
                            onClick={() => setFiltroStock('normal')}
                            className={`px-4 py-2 rounded-lg font-medium transition ${
                                filtroStock === 'normal'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Stock Normal
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabla de Productos */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Producto
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Tipo
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Stock Actual
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Stock Mínimo
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Estado
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Progreso
                            </th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {productosFiltrados.map((producto) => {
                            const porcentaje = Math.min((producto.stock / (producto.stock_minimo * 2)) * 100, 100)
                            const stockBajo = producto.stock <= producto.stock_minimo
                            const stockCritico = producto.stock === 0

                            return (
                                <tr key={producto.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                                <span className="text-2xl">
                                                    {producto.tipo === 'ramo_base' ? '💐' : '🌸'}
                                                </span>
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {producto.nombre}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {producto.unidad}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-600 capitalize">
                                                {producto.tipo === 'ramo_base' ? 'Ramo' : producto.tipo}
                                            </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`text-lg font-bold ${
                                                stockCritico ? 'text-red-600' :
                                                    stockBajo ? 'text-orange-600' :
                                                        'text-gray-900'
                                            }`}>
                                                {producto.stock}
                                            </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-600">
                                                {producto.stock_minimo}
                                            </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {stockCritico ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                    🔴 Agotado
                                                </span>
                                        ) : stockBajo ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                                    ⚠️ Stock Bajo
                                                </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    ✅ Normal
                                                </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="w-32">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className={`h-2 rounded-full transition-all ${
                                                            stockCritico ? 'bg-red-500' :
                                                                stockBajo ? 'bg-orange-500' :
                                                                    'bg-green-500'
                                                        }`}
                                                        style={{ width: `${porcentaje}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs text-gray-600">
                                                        {Math.round(porcentaje)}%
                                                    </span>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                        </tbody>
                    </table>

                    {productosFiltrados.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-gray-500">No se encontraron productos</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}