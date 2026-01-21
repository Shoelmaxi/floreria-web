import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Producto, TurnoConEmpleado, VentaConDetalles, MovimientoInventario } from '../types'

interface EstadisticasGenerales {
    ventasHoy: number
    montoTotalHoy: number
    productosVendidosHoy: number
    ramosArmadosHoy: number
    turnosActivos: number
    empleadosTrabajando: number
    productosStockBajo: number
}

interface UseDashboardAdminReturn {
    productos: Producto[]
    turnosActivos: TurnoConEmpleado[]
    ventasHoy: VentaConDetalles[]
    estadisticas: EstadisticasGenerales | null
    movimientosRecientes: MovimientoInventario[]
    loading: boolean
    error: string | null
    recargar: () => Promise<void>
}

export function useDashboardAdmin(): UseDashboardAdminReturn {
    const [productos, setProductos] = useState<Producto[]>([])
    const [turnosActivos, setTurnosActivos] = useState<TurnoConEmpleado[]>([])
    const [ventasHoy, setVentasHoy] = useState<VentaConDetalles[]>([])
    const [estadisticas, setEstadisticas] = useState<EstadisticasGenerales | null>(null)
    const [movimientosRecientes, setMovimientosRecientes] = useState<MovimientoInventario[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        cargarDatos()

        // Recargar cada 30 segundos para datos en tiempo real
        const interval = setInterval(cargarDatos, 30000)
        return () => clearInterval(interval)
    }, [])

    async function cargarDatos() {
        try {
            setError(null)

            // Cargar en paralelo
            const [
                productosData,
                turnosData,
                ventasData,
                estadisticasData,
                movimientosData
            ] = await Promise.all([
                cargarProductos(),
                cargarTurnosActivos(),
                cargarVentasHoy(),
                calcularEstadisticas(),
                cargarMovimientosRecientes()
            ])

            setProductos(productosData)
            setTurnosActivos(turnosData)
            setVentasHoy(ventasData)
            setEstadisticas(estadisticasData)
            setMovimientosRecientes(movimientosData)
        } catch (err: any) {
            console.error('Error cargando datos del dashboard:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    async function cargarProductos(): Promise<Producto[]> {
        const { data, error } = await supabase
            .from('productos')
            .select('*')
            .eq('activo', true)
            .order('stock', { ascending: true })

        if (error) throw error
        return data || []
    }

    async function cargarTurnosActivos(): Promise<TurnoConEmpleado[]> {
        const { data, error } = await supabase
            .from('turnos')
            .select(`
                *,
                empleado:empleado_id (
                    id,
                    email,
                    nombre,
                    rol,
                    activo,
                    created_at
                )
            `)
            .eq('estado', 'abierto')
            .order('hora_inicio', { ascending: false })

        if (error) throw error
        return data || []
    }

    async function cargarVentasHoy(): Promise<VentaConDetalles[]> {
        const hoy = new Date().toISOString().split('T')[0]

        const { data, error } = await supabase
            .from('ventas')
            .select(`
                *,
                empleado:empleado_id (
                    id,
                    email,
                    nombre,
                    rol,
                    activo,
                    created_at
                )
            `)
            .gte('fecha', `${hoy}T00:00:00`)
            .lte('fecha', `${hoy}T23:59:59`)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data || []
    }

    async function calcularEstadisticas(): Promise<EstadisticasGenerales> {
        const hoy = new Date().toISOString().split('T')[0]

        // Ventas del día
        const { data: ventasData } = await supabase
            .from('ventas')
            .select('monto_total, productos, es_uber')
            .gte('fecha', `${hoy}T00:00:00`)
            .lte('fecha', `${hoy}T23:59:59`)

        // Ramos armados hoy
        const { data: ramosData } = await supabase
            .from('ramos_armados')
            .select('id')
            .gte('created_at', `${hoy}T00:00:00`)
            .lte('created_at', `${hoy}T23:59:59`)

        // Turnos activos
        const { data: turnosData } = await supabase
            .from('turnos')
            .select('id, empleado_id')
            .eq('estado', 'abierto')

        // Productos con stock bajo
        const { data: productosData } = await supabase
            .from('productos')
            .select('id, stock, stock_minimo')
            .eq('activo', true)

        const ventasHoy = ventasData?.length || 0
        const montoTotalHoy = ventasData?.reduce((sum, v) => sum + (v.monto_total || 0), 0) || 0

        let productosVendidosHoy = 0
        ventasData?.forEach(v => {
            v.productos?.forEach((p: any) => {
                productosVendidosHoy += p.cantidad
            })
        })

        const productosStockBajo = productosData?.filter(p => p.stock <= p.stock_minimo).length || 0

        return {
            ventasHoy,
            montoTotalHoy,
            productosVendidosHoy,
            ramosArmadosHoy: ramosData?.length || 0,
            turnosActivos: turnosData?.length || 0,
            empleadosTrabajando: new Set(turnosData?.map(t => t.empleado_id)).size || 0,
            productosStockBajo
        }
    }

    async function cargarMovimientosRecientes(): Promise<MovimientoInventario[]> {
        const { data, error } = await supabase
            .from('movimientos_inventario')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10)

        if (error) throw error
        return data || []
    }

    async function recargar() {
        setLoading(true)
        await cargarDatos()
    }

    return {
        productos,
        turnosActivos,
        ventasHoy,
        estadisticas,
        movimientosRecientes,
        loading,
        error,
        recargar
    }
}