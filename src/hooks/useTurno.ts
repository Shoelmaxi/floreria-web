import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Turno } from '../types'
import { useAuth } from '../contexts/AuthContext'

interface UseTurnoReturn {
    turnoActual: Turno | null
    loading: boolean
    error: string | null
    iniciarTurno: () => Promise<boolean>
    cerrarTurno: (notas?: string) => Promise<boolean>
    tiempoTranscurrido: string
}

export function useTurno(): UseTurnoReturn {
    const { user } = useAuth()
    const [turnoActual, setTurnoActual] = useState<Turno | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [tiempoTranscurrido, setTiempoTranscurrido] = useState('')

    // Cargar turno actual al montar el componente
    useEffect(() => {
        if (user) {
            cargarTurnoActual()
        }
    }, [user])

    // Actualizar tiempo transcurrido cada segundo
    useEffect(() => {
        if (turnoActual && turnoActual.estado === 'abierto') {
            const interval = setInterval(() => {
                const inicio = new Date(turnoActual.hora_inicio)
                const ahora = new Date()
                const diff = ahora.getTime() - inicio.getTime()

                const horas = Math.floor(diff / (1000 * 60 * 60))
                const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

                setTiempoTranscurrido(`${horas}h ${minutos}m`)
            }, 1000)

            return () => clearInterval(interval)
        } else {
            setTiempoTranscurrido('')
        }
    }, [turnoActual])

    async function cargarTurnoActual() {
        try {
            setLoading(true)
            setError(null)

            const { data, error: queryError } = await supabase
                .from('turnos')
                .select('*')
                .eq('empleado_id', user!.id)
                .eq('estado', 'abierto')
                .order('hora_inicio', { ascending: false })
                .limit(1)
                .maybeSingle()

            if (queryError) throw queryError

            setTurnoActual(data)
        } catch (err: any) {
            console.error('Error cargando turno:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    async function iniciarTurno(): Promise<boolean> {
        try {
            setLoading(true)
            setError(null)

            // Verificar que no haya un turno abierto
            if (turnoActual) {
                setError('Ya tienes un turno abierto')
                return false
            }

            // Crear nuevo turno
            const { data, error: insertError } = await supabase
                .from('turnos')
                .insert({
                    empleado_id: user!.id,
                    hora_inicio: new Date().toISOString(),
                    estado: 'abierto'
                })
                .select()
                .single()

            if (insertError) throw insertError

            setTurnoActual(data)
            return true
        } catch (err: any) {
            console.error('Error iniciando turno:', err)
            setError(err.message)
            return false
        } finally {
            setLoading(false)
        }
    }

    async function cerrarTurno(notas?: string): Promise<boolean> {
        try {
            setLoading(true)
            setError(null)

            if (!turnoActual) {
                setError('No hay turno activo para cerrar')
                return false
            }

            // Actualizar turno
            const { error: updateError } = await supabase
                .from('turnos')
                .update({
                    hora_fin: new Date().toISOString(),
                    estado: 'cerrado',
                    notas: notas || null
                })
                .eq('id', turnoActual.id)

            if (updateError) throw updateError

            setTurnoActual(null)
            return true
        } catch (err: any) {
            console.error('Error cerrando turno:', err)
            setError(err.message)
            return false
        } finally {
            setLoading(false)
        }
    }

    return {
        turnoActual,
        loading,
        error,
        iniciarTurno,
        cerrarTurno,
        tiempoTranscurrido
    }
}