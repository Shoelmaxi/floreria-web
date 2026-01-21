import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Producto, FormulaRamoConDetalles, TipoProducto } from '../types'

interface UseProductosReturn {
    productos: Producto[]
    loading: boolean
    error: string | null
    crearProducto: (producto: Omit<Producto, 'id' | 'created_at' | 'updated_at'>) => Promise<Producto | null>
    actualizarProducto: (id: string, cambios: Partial<Producto>) => Promise<boolean>
    eliminarProducto: (id: string) => Promise<boolean>
    obtenerFormulasRamo: (ramoId: string) => Promise<FormulaRamoConDetalles[]>
    crearFormulaRamo: (ramoId: string, florId: string, cantidad: number) => Promise<boolean>
    eliminarFormulaRamo: (formulaId: string) => Promise<boolean>
    recargar: () => Promise<void>
}

export function useProductos(): UseProductosReturn {
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

            const { data, error: queryError } = await supabase
                .from('productos')
                .select('*')
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

    async function crearProducto(producto: Omit<Producto, 'id' | 'created_at' | 'updated_at'>): Promise<Producto | null> {
        try {
            setError(null)

            const { data, error: insertError } = await supabase
                .from('productos')
                .insert(producto)
                .select()
                .single()

            if (insertError) throw insertError

            // Actualizar lista local
            setProductos(prev => [...prev, data].sort((a, b) => {
                if (a.tipo !== b.tipo) return a.tipo.localeCompare(b.tipo)
                return a.nombre.localeCompare(b.nombre)
            }))

            return data
        } catch (err: any) {
            console.error('Error creando producto:', err)
            setError(err.message)
            return null
        }
    }

    async function actualizarProducto(id: string, cambios: Partial<Producto>): Promise<boolean> {
        try {
            setError(null)

            const { error: updateError } = await supabase
                .from('productos')
                .update(cambios)
                .eq('id', id)

            if (updateError) throw updateError

            // Actualizar lista local
            setProductos(prev => prev.map(p =>
                p.id === id ? { ...p, ...cambios, updated_at: new Date().toISOString() } : p
            ))

            return true
        } catch (err: any) {
            console.error('Error actualizando producto:', err)
            setError(err.message)
            return false
        }
    }

    async function eliminarProducto(id: string): Promise<boolean> {
        try {
            setError(null)

            // En vez de eliminar, desactivar
            const { error: updateError } = await supabase
                .from('productos')
                .update({ activo: false })
                .eq('id', id)

            if (updateError) throw updateError

            // Actualizar lista local
            setProductos(prev => prev.map(p =>
                p.id === id ? { ...p, activo: false } : p
            ))

            return true
        } catch (err: any) {
            console.error('Error eliminando producto:', err)
            setError(err.message)
            return false
        }
    }

    async function obtenerFormulasRamo(ramoId: string): Promise<FormulaRamoConDetalles[]> {
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
            console.error('Error obteniendo fórmulas:', err)
            return []
        }
    }

    async function crearFormulaRamo(ramoId: string, florId: string, cantidad: number): Promise<boolean> {
        try {
            setError(null)

            const { error: insertError } = await supabase
                .from('formulas_ramos')
                .insert({
                    ramo_id: ramoId,
                    flor_id: florId,
                    cantidad_estandar: cantidad
                })

            if (insertError) throw insertError

            return true
        } catch (err: any) {
            console.error('Error creando fórmula:', err)
            setError(err.message)
            return false
        }
    }

    async function eliminarFormulaRamo(formulaId: string): Promise<boolean> {
        try {
            setError(null)

            const { error: deleteError } = await supabase
                .from('formulas_ramos')
                .delete()
                .eq('id', formulaId)

            if (deleteError) throw deleteError

            return true
        } catch (err: any) {
            console.error('Error eliminando fórmula:', err)
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
        crearProducto,
        actualizarProducto,
        eliminarProducto,
        obtenerFormulasRamo,
        crearFormulaRamo,
        eliminarFormulaRamo,
        recargar
    }
}