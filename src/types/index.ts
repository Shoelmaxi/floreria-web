export type Categoria = 'ramos' | 'flores_sueltas'
export type MetodoPago = 'efectivo' | 'transferencia' | 'debito'
export type Rol = 'admin' | 'analista' | 'empleado'

export interface Producto {
    id: string
    nombre: string
    categoria: Categoria
    stock: number
    stock_minimo: number
    stock_apertura?: number
    unidad: string
    foto_url?: string
    creado_por?: string
    created_at: string
    updated_at: string
}

export interface Venta {
    id: string
    fecha: string
    total: number
    metodo_pago?: MetodoPago
    turno_id?: string
    empleado_id: string
    productos: ProductoVenta[]
    notas?: string
    es_uber: boolean
    created_at: string
}

export interface ProductoVenta {
    productoId: string
    productoNombre: string
    cantidad: number
}

export interface Turno {
    id: string
    fecha_apertura: string
    fecha_cierre?: string
    empleado_apertura_id?: string
    empleado_cierre_id?: string
    stock_inicial?: any
    stock_final?: any
    ventas_total: number
    estado: 'abierto' | 'cerrado'
    created_at: string
}

export interface Usuario {
    id: string
    email: string
    nombre: string
    rol: Rol
    activo: boolean
    created_at: string
    ultimo_acceso?: string
}

export interface NotaAnalista {
    id: string
    analista_id: string
    titulo: string
    contenido: string
    periodo_inicio?: string
    periodo_fin?: string
    estado: 'borrador' | 'enviada' | 'archivada'
    enviada_a_admin: boolean
    fecha_envio?: string
    leida_por_admin: boolean
    fecha_leida?: string
    created_at: string
    updated_at: string
}