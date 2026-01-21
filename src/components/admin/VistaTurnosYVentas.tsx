import { Clock, ShoppingCart, DollarSign, Package, User, Calendar } from 'lucide-react'
import { TurnoConEmpleado, VentaConDetalles } from '../../types'

interface VistaTurnosYVentasProps {
    turnosActivos: TurnoConEmpleado[]
    ventasHoy: VentaConDetalles[]
}

export default function VistaTurnosYVentas({ turnosActivos, ventasHoy }: VistaTurnosYVentasProps) {
    // Calcular tiempo transcurrido de turnos
    function calcularTiempo(horaInicio: string): string {
        const inicio = new Date(horaInicio)
        const ahora = new Date()
        const diff = ahora.getTime() - inicio.getTime()

        const horas = Math.floor(diff / (1000 * 60 * 60))
        const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

        return `${horas}h ${minutos}m`
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Turnos Activos */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary" />
                        Turnos Activos
                    </h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {turnosActivos.length} activo{turnosActivos.length !== 1 ? 's' : ''}
                    </span>
                </div>

                {turnosActivos.length === 0 ? (
                    <div className="text-center py-8">
                        <Clock className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">
                            No hay turnos activos
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {turnosActivos.map((turno) => {
                            // Validar que empleado existe
                            if (!turno.empleado) {
                                console.warn('Turno sin empleado:', turno)
                                return null
                            }

                            return (
                                <div
                                    key={turno.id}
                                    className="border border-gray-200 rounded-lg p-4 hover:border-primary transition"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                                                <User className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">
                                                    {turno.empleado.nombre}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {turno.empleado.email}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="inline-flex items-center px-2 py-1 rounded bg-green-100 text-green-800 text-xs font-medium mb-1">
                                                ● En turno
                                            </div>
                                            <p className="text-sm font-bold text-gray-900">
                                                {calcularTiempo(turno.hora_inicio)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-3 pt-3 border-t border-gray-100">
                                        <p className="text-xs text-gray-500">
                                            Inicio: {new Date(turno.hora_inicio).toLocaleString('es-CL', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                        </p>
                                    </div>
                                </div>
                            )})}
                    </div>
                )}
            </div>

            {/* Ventas del Día - Resumen */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5 text-green-600" />
                        Ventas de Hoy
                    </h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {ventasHoy.length} venta{ventasHoy.length !== 1 ? 's' : ''}
                    </span>
                </div>

                {ventasHoy.length === 0 ? (
                    <div className="text-center py-8">
                        <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">
                            No hay ventas registradas hoy
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {ventasHoy.map((venta) => {
                            // Validar que empleado existe
                            if (!venta.empleado) {
                                console.warn('Venta sin empleado:', venta)
                                return null
                            }

                            return (
                                <div
                                    key={venta.id}
                                    className="border border-gray-200 rounded-lg p-4 hover:border-green-500 transition"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <p className="font-semibold text-gray-900 flex items-center gap-2">
                                                {venta.empleado.nombre}
                                                {venta.es_uber && (
                                                    <span className="text-xs bg-black text-white px-2 py-0.5 rounded">
                                                    🚗 Uber
                                                </span>
                                                )}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(venta.created_at).toLocaleTimeString('es-CL', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                        {!venta.es_uber && venta.monto_total && (
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-green-600">
                                                    ${venta.monto_total?.toLocaleString('es-CL')}
                                                </p>
                                                <p className="text-xs text-gray-500 capitalize">
                                                    {venta.metodo_pago}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Productos */}
                                    {venta.productos && Array.isArray(venta.productos) && (
                                        <div className="space-y-1">
                                            {venta.productos.map((prod, idx) => (
                                                <div key={idx} className="flex items-center justify-between text-sm">
                                                <span className="text-gray-600">
                                                    • {prod.nombre}
                                                </span>
                                                    <span className="text-gray-500">
                                                    x{prod.cantidad}
                                                </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {venta.notas && (
                                        <div className="mt-2 pt-2 border-t border-gray-100">
                                            <p className="text-xs text-gray-500 italic">
                                                "{venta.notas}"
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )})}
                    </div>
                )}
            </div>
        </div>
    )
}