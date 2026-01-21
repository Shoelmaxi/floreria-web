import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Producto } from '../types'
import { useAuth } from '../contexts/AuthContext'

interface UseInventarioReturn {
    productos: Producto[]
    loading: boolean
    error: string | null
    registrarAbastecimiento: (
        productoId: string,
        cantidad: number,
        turnoId?: string,
        notas?: string
    ) => Promise<boolean>
    registrarMerma: (
        productoId: string,
        cantidad: number,
        motivo: string,
        turnoId?: string,
        notas?: string
    ) => Promise<boolean>
    recargar: () => Promise<void>
}

export function useInventario(): UseInventarioReturn {
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

            const { data, error: queryError } = await supabase
                .from('productos')
                .select('*')
                .eq('activo', true)
                .order('nombre')

            if (queryError) throw queryError

            setProductos(data || [])
        } catch (err: any) {
            console.error('Error cargando productos:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    async function registrarAbastecimiento(
        productoId: string,
        cantidad: number,
        turnoId?: string,
        notas?: string
    ): Promise<boolean> {
        try {
            setError(null)

            if (cantidad <= 0) {
                setError('La cantidad debe ser mayor a 0')
                return false
            }

            const producto = productos.find(p => p.id === productoId)
            if (!producto) {
                setError('Producto no encontrado')
                return false
            }

            // Actualizar stock
            const nuevoStock = producto.stock + cantidad
            const { error: updateError } = await supabase
                .from('productos')
                .update({ stock: nuevoStock })
                .eq('id', productoId)

            if (updateError) throw updateError

            // Registrar movimiento
            const { error: movimientoError } = await supabase
                .from('movimientos_inventario')
                .insert({
                    producto_id: productoId,
                    tipo_movimiento: 'abastecimiento',
                    cantidad: cantidad,
                    stock_anterior: producto.stock,
                    stock_nuevo: nuevoStock,
                    empleado_id: user!.id,
                    turno_id: turnoId || null,
                    notas: notas || 'Abastecimiento registrado'
                })

            if (movimientoError) throw movimientoError

            // Actualizar lista local
            setProductos(prev => prev.map(p =>
                p.id === productoId ? { ...p, stock: nuevoStock } : p
            ))

            return true
        } catch (err: any) {
            console.error('Error registrando abastecimiento:', err)
            setError(err.message)
            return false
        }
    }

    async function registrarMerma(
        productoId: string,
        cantidad: number,
        motivo: string,
        turnoId?: string,
        notas?: string
    ): Promise<boolean> {
        try {
            setError(null)

            if (cantidad <= 0) {
                setError('La cantidad debe ser mayor a 0')
                return false
            }

            const producto = productos.find(p => p.id === productoId)
            if (!producto) {
                setError('Producto no encontrado')
                return false
            }

            if (producto.stock < cantidad) {
                setError(`Stock insuficiente. Disponible: ${producto.stock}`)
                return false
            }

            // Actualizar stock
            const nuevoStock = producto.stock - cantidad
            const { error: updateError } = await supabase
                .from('productos')
                .update({ stock: nuevoStock })
                .eq('id', productoId)

            if (updateError) throw updateError

            // Registrar movimiento
            const { error: movimientoError } = await supabase
                .from('movimientos_inventario')
                .insert({
                    producto_id: productoId,
                    tipo_movimiento: 'merma',
                    cantidad: -cantidad,
                    stock_anterior: producto.stock,
                    stock_nuevo: nuevoStock,
                    motivo: motivo,
                    empleado_id: user!.id,
                    turno_id: turnoId || null,
                    notas: notas || null
                })

            if (movimientoError) throw movimientoError

            // Actualizar lista local
            setProductos(prev => prev.map(p =>
                p.id === productoId ? { ...p, stock: nuevoStock } : p
            ))

            return true
        } catch (err: any) {
            console.error('Error registrando merma:', err)
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
        registrarAbastecimiento,
        registrarMerma,
        recargar
    }
}