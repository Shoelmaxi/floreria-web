import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase, Usuario } from '../lib/supabase'
import { Session, User } from '@supabase/supabase-js'

interface AuthContextType {
    user: User | null
    profile: Usuario | null
    session: Session | null
    loading: boolean
    signIn: (email: string, password: string) => Promise<{ error: any }>
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [profile, setProfile] = useState<Usuario | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Verificar sesión actual
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
            setUser(session?.user ?? null)
            if (session?.user) {
                loadUserProfile(session.user.id)
            } else {
                setLoading(false)
            }
        })

        // Escuchar cambios de autenticación
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
            setUser(session?.user ?? null)
            if (session?.user) {
                loadUserProfile(session.user.id)
            } else {
                setProfile(null)
                setLoading(false)
            }
        })

        return () => subscription.unsubscribe()
    }, [])

    async function loadUserProfile(userId: string) {
        try {
            const { data, error } = await supabase
                .from('usuarios')
                .select('*')
                .eq('id', userId)
                .single()

            if (error) throw error

            setProfile(data)

            // Actualizar último acceso
            await supabase
                .from('usuarios')
                .update({ ultimo_acceso: new Date().toISOString() })
                .eq('id', userId)
        } catch (error) {
            console.error('Error cargando perfil:', error)
        } finally {
            setLoading(false)
        }
    }

    async function signIn(email: string, password: string) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) throw error

            return { error: null }
        } catch (error: any) {
            console.error('Error en login:', error)
            return { error }
        }
    }

    async function signOut() {
        await supabase.auth.signOut()
        setProfile(null)
    }

    const value = {
        user,
        profile,
        session,
        loading,
        signIn,
        signOut,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth debe ser usado dentro de AuthProvider')
    }
    return context
}