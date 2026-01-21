import { createClient } from '@supabase/supabase-js'

// 🔴 REEMPLAZA ESTOS VALORES con los de tu proyecto Supabase
const supabaseUrl = 'https://gtpjwpaiawxxmilskqda.supabase.co'
const supabaseAnonKey = 'sb_publishable_Nazj-Xo6HlnxQHtg69S0nw_qMcj3ZI7'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para la base de datos
export type Rol = 'admin' | 'analista' | 'empleado'

export interface Usuario {
    id: string
    email: string
    nombre: string
    rol: Rol
    activo: boolean
    created_at: string
    ultimo_acceso?: string
}