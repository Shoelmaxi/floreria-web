import { useState } from 'react'
import { X, Save } from 'lucide-react'
import { Producto, TipoProducto } from '../../types'

interface FormularioProductoProps {
    producto?: Producto
    onGuardar: (producto: Omit<Producto, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
    onCancelar: () => void
}

export default function FormularioProducto({ producto, onGuardar, onCancelar }: FormularioProductoProps) {
    const [guardando, setGuardando] = useState(false)
    const [form, setForm] = useState({
        nombre: producto?.nombre || '',
        tipo: producto?.tipo || 'flor' as TipoProducto,
        stock: producto?.stock || 0,
        stock_minimo: producto?.stock_minimo || 10,
        unidad: producto?.unidad || 'unidad',
        foto_url: producto?.foto_url || '',
        activo: producto?.activo !== undefined ? producto.activo : true
    })

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        if (!form.nombre.trim()) {
            alert('El nombre es obligatorio')
            return
        }

        setGuardando(true)
        try {
            await onGuardar(form)
        } finally {
            setGuardando(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {producto ? 'Editar Producto' : 'Nuevo Producto'}
                    </h2>
                    <button
                        onClick={onCancelar}
                        className="text-gray-400 hover:text-gray-600 transition"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Nombre */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nombre *
                        </label>
                        <input
                            type="text"
                            value={form.nombre}
                            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                            placeholder="Ej: Rosa Roja"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            required
                        />
                    </div>

                    {/* Tipo */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tipo *
                        </label>
                        <select
                            value={form.tipo}
                            onChange={(e) => setForm({ ...form, tipo: e.target.value as TipoProducto })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                            <option value="flor">Flor Individual</option>
                            <option value="ramo_base">Ramo (Base para armar)</option>
                            <option value="accesorio">Accesorio</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Stock Inicial */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Stock Inicial
                            </label>
                            <input
                                type="number"
                                value={form.stock}
                                onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })}
                                min="0"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>

                        {/* Stock Mínimo */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Stock Mínimo *
                            </label>
                            <input
                                type="number"
                                value={form.stock_minimo}
                                onChange={(e) => setForm({ ...form, stock_minimo: parseInt(e.target.value) || 10 })}
                                min="0"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                required
                            />
                        </div>
                    </div>

                    {/* Unidad */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Unidad de Medida *
                        </label>
                        <select
                            value={form.unidad}
                            onChange={(e) => setForm({ ...form, unidad: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                            <option value="unidad">Unidad</option>
                            <option value="ramo">Ramo</option>
                            <option value="rama">Rama</option>
                            <option value="hoja">Hoja</option>
                            <option value="paquete">Paquete</option>
                            <option value="docena">Docena</option>
                        </select>
                    </div>

                    {/* URL Foto */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            URL de la Foto (opcional)
                        </label>
                        <input
                            type="url"
                            value={form.foto_url}
                            onChange={(e) => setForm({ ...form, foto_url: e.target.value })}
                            placeholder="https://ejemplo.com/imagen.jpg"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Puedes subir la imagen a un servicio como Imgur o usar una URL directa
                        </p>
                    </div>

                    {/* Activo */}
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="activo"
                            checked={form.activo}
                            onChange={(e) => setForm({ ...form, activo: e.target.checked })}
                            className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                        />
                        <label htmlFor="activo" className="text-sm font-medium text-gray-700">
                            Producto activo
                        </label>
                    </div>

                    {/* Información sobre tipo de ramo */}
                    {form.tipo === 'ramo_base' && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm text-blue-800">
                                💡 <strong>Nota:</strong> Después de crear este ramo, podrás definir su fórmula
                                (qué flores lleva y en qué cantidad) en la sección "Gestionar Fórmulas".
                            </p>
                        </div>
                    )}

                    {/* Botones */}
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onCancelar}
                            disabled={guardando}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={guardando}
                            className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-blue-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {guardando ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    {producto ? 'Actualizar' : 'Crear Producto'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}