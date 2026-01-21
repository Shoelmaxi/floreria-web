import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Producto, FormulaRamoConDetalles, FlorUsada } from '../types'
import { useAuth } from '../contexts/AuthContext'

interface UseArmarRamosReturn {
    ramos: Producto[]
    flores: Producto[]
    loading: boolean
    error: string | null
    obtenerFormulaRamo: (ramoId: string) => Promise<FormulaRamoConDetalles[]>
    armarRamo: (ramoId: string, floresUsadas: FlorUsada[], turnoId?: string) => Promise<boolean>
    recargar: () => Promise<void>
}

export function useArmarRamos(): UseArmarRamosReturn {
    const { user } = useAuth()
    const [ramos, setRamos] = useState<Producto[]>([])
    const [flores, setFlores] = useState<Producto[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        cargarProductos()
    }, [])

    async function cargarProductos() {
        try {
            setLoading(true)
            setError(null)

            // Cargar ramos base activos
            const { data: ramosData, error: ramosError } = await supabase
                .from('productos')
                .select('*')
                .eq('tipo', 'ramo_base')
                .eq('activo', true)
                .order('nombre')

            if (ramosError) throw ramosError

            // Cargar flores activas
            const { data: floresData, error: floresError } = await supabase
                .from('productos')
                .select('*')
                .eq('tipo', 'flor')
                .eq('activo', true)
                .order('nombre')

            if (floresError) throw floresError

            setRamos(ramosData || [])
            setFlores(floresData || [])
        } catch (err: any) {
            console.error('Error cargando productos:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    async function obtenerFormulaRamo(ramoId: string): Promise<FormulaRamoConDetalles[]> {
        try {
            const { data, error: queryError } = await supabase
                .from('formulas_ramos')
                .select(`
                    *,
                    flor:flor_id (
                        id,
                        nombre,
                        tipo,
                        stock,
                        stock_minimo,
                        unidad,
                        foto_url,
                        activo,
                        created_at,
                        updated_at
                    ),
                    ramo:ramo_id (
                        id,
                        nombre,
                        tipo,
                        stock,
                        stock_minimo,
                        unidad,
                        foto_url,
                        activo,
                        created_at,
                        updated_at
                    )
                `)
                .eq('ramo_id', ramoId)
                .eq('activo', true)

            if (queryError) throw queryError

            return data || []
        } catch (err: any) {
            console.error('Error obteniendo fórmula:', err)
            return []
        }
    }

    async function armarRamo(
        ramoId: string,
        floresUsadas: FlorUsada[],
        turnoId?: string
    ): Promise<boolean> {
        try {
            setError(null)

            // Validar que hay stock suficiente de todas las flores
            for (const florUsada of floresUsadas) {
                const flor = flores.find(f => f.id === florUsada.flor_id)
                if (!flor) {
                    setError(`Flor ${florUsada.nombre} no encontrada`)
                    return false
                }
                if (flor.stock < florUsada.cantidad) {
                    setError(`Stock insuficiente de ${florUsada.nombre}. Disponible: ${flor.stock}, Necesario: ${florUsada.cantidad}`)
                    return false
                }
            }

            // Obtener fórmula estándar para calcular variación
            const formula = await obtenerFormulaRamo(ramoId)
            const variacion: Record<string, { estandar: number; usado: number; diferencia: number }> = {}

            formula.forEach(f => {
                const usado = floresUsadas.find(fu => fu.flor_id === f.flor_id)?.cantidad || 0
                variacion[f.flor_id] = {
                    estandar: f.cantidad_estandar,
                    usado: usado,
                    diferencia: usado - f.cantidad_estandar
                }
            })

            // 1. Crear registro del ramo armado
            const { data: ramoArmado, error: ramoError } = await supabase
                .from('ramos_armados')
                .insert({
                    ramo_base_id: ramoId,
                    empleado_id: user!.id,
                    turno_id: turnoId || null,
                    flores_usadas: floresUsadas,
                    variacion_formula: variacion
                })
                .select()
                .single()

            if (ramoError) throw ramoError

            // 2. Descontar flores del inventario (una por una para trazabilidad)
            for (const florUsada of floresUsadas) {
                const flor = flores.find(f => f.id === florUsada.flor_id)!

                // Actualizar stock de la flor
                const { error: updateError } = await supabase
                    .from('productos')
                    .update({ stock: flor.stock - florUsada.cantidad })
                    .eq('id', florUsada.flor_id)

                if (updateError) throw updateError

                // Registrar movimiento de inventario
                const { error: movimientoError } = await supabase
                    .from('movimientos_inventario')
                    .insert({
                        producto_id: florUsada.flor_id,
                        tipo_movimiento: 'uso_ramo',
                        cantidad: -florUsada.cantidad,
                        stock_anterior: flor.stock,
                        stock_nuevo: flor.stock - florUsada.cantidad,
                        empleado_id: user!.id,
                        turno_id: turnoId || null,
                        ramo_armado_id: ramoArmado.id,
                        notas: `Usado en ramo armado`
                    })

                if (movimientoError) throw movimientoError
            }

            // 3. Incrementar stock del ramo armado
            const ramo = ramos.find(r => r.id === ramoId)!
            const { error: incrementoError } = await supabase
                .from('productos')
                .update({ stock: ramo.stock + 1 })
                .eq('id', ramoId)

            if (incrementoError) throw incrementoError

            // 4. Registrar movimiento del ramo
            const { error: movimientoRamoError } = await supabase
                .from('movimientos_inventario')
                .insert({
                    producto_id: ramoId,
                    tipo_movimiento: 'uso_ramo',
                    cantidad: 1,
                    stock_anterior: ramo.stock,
                    stock_nuevo: ramo.stock + 1,
                    empleado_id: user!.id,
                    turno_id: turnoId || null,
                    ramo_armado_id: ramoArmado.id,
                    notas: `Ramo armado`
                })

            if (movimientoRamoError) throw movimientoRamoError

            // Recargar productos para actualizar stocks en UI
            await cargarProductos()

            return true
        } catch (err: any) {
            console.error('Error armando ramo:', err)
            setError(err.message)
            return false
        }
    }

    async function recargar() {
        await cargarProductos()
    }

    return {
        ramos,
        flores,
        loading,
        error,
        obtenerFormulaRamo,
        armarRamo,
        recargar
    }
}