import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Producto, Venta, ProductoVenta, MetodoPago } from '../types'
import { useAuth } from '../contexts/AuthContext'

interface UseVentasReturn {
    productos: Producto[]
    loading: boolean
    error: string | null
    registrarVenta: (
        productos: ProductoVenta[],
        montoTotal: number | null,
        metodoPago: MetodoPago | null,
        esUber: boolean,
        turnoId?: string,
        notas?: string
    ) => Promise<boolean>
    recargar: () => Promise<void>
}

export function useVentas(): UseVentasReturn {
    const { user } = useAuth()
    const [productos, setProductos] = useState<Producto[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        cargarProductos()
    }, [])

    async function cargarProductos() {
        try {
            setLoading(true)
            setError(null)

            // Cargar todos los productos activos (flores y ramos armados)
            const { data, error: queryError } = await supabase
                .from('productos')
                .select('*')
                .eq('activo', true)
                .order('tipo', { ascending: true })
                .order('nombre', { ascending: true })

            if (queryError) throw queryError

            setProductos(data || [])
        } catch (err: any) {
            console.error('Error cargando productos:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    async function registrarVenta(
        productosVenta: ProductoVenta[],
        montoTotal: number | null,
        metodoPago: MetodoPago | null,
        esUber: boolean,
        turnoId?: string,
        notas?: string
    ): Promise<boolean> {
        try {
            setError(null)

            // Validaciones
            if (productosVenta.length === 0) {
                setError('Debes agregar al menos un producto')
                return false
            }

            if (!esUber && (!montoTotal || montoTotal <= 0)) {
                setError('Debes ingresar un monto válido')
                return false
            }

            if (!esUber && !metodoPago) {
                setError('Debes seleccionar un método de pago')
                return false
            }

            // Validar que hay stock suficiente
            for (const prodVenta of productosVenta) {
                const producto = productos.find(p => p.id === prodVenta.producto_id)
                if (!producto) {
                    setError(`Producto ${prodVenta.nombre} no encontrado`)
                    return false
                }
                if (producto.stock < prodVenta.cantidad) {
                    setError(`Stock insuficiente de ${prodVenta.nombre}. Disponible: ${producto.stock}, Solicitado: ${prodVenta.cantidad}`)
                    return false
                }
            }

            // 1. Crear registro de venta
            const { data: venta, error: ventaError } = await supabase
                .from('ventas')
                .insert({
                    empleado_id: user!.id,
                    turno_id: turnoId || null,
                    fecha: new Date().toISOString(),
                    monto_total: esUber ? null : montoTotal,
                    metodo_pago: esUber ? null : metodoPago,
                    es_uber: esUber,
                    productos: productosVenta,
                    notas: notas || null
                })
                .select()
                .single()

            if (ventaError) throw ventaError

            // 2. Descontar productos del inventario (uno por uno)
            for (const prodVenta of productosVenta) {
                const producto = productos.find(p => p.id === prodVenta.producto_id)!

                // Actualizar stock
                const { error: updateError } = await supabase
                    .from('productos')
                    .update({ stock: producto.stock - prodVenta.cantidad })
                    .eq('id', prodVenta.producto_id)

                if (updateError) throw updateError

                // Registrar movimiento de inventario
                const { error: movimientoError } = await supabase
                    .from('movimientos_inventario')
                    .insert({
                        producto_id: prodVenta.producto_id,
                        tipo_movimiento: 'venta',
                        cantidad: -prodVenta.cantidad,
                        stock_anterior: producto.stock,
                        stock_nuevo: producto.stock - prodVenta.cantidad,
                        empleado_id: user!.id,
                        turno_id: turnoId || null,
                        venta_id: venta.id,
                        notas: esUber ? 'Venta Uber' : 'Venta normal'
                    })

                if (movimientoError) throw movimientoError
            }

            // Recargar productos para actualizar stocks
            await cargarProductos()

            return true
        } catch (err: any) {
            console.error('Error registrando venta:', err)
            setError(err.message)
            return false
        }
    }

    async function recargar() {
        await cargarProductos()
    }

    return {
        productos,
        loading,
        error,
        registrarVenta,
        recargar
    }
}