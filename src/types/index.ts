export type Categoria = 'ramos' | 'flores_sueltas'
export type MetodoPago = 'efectivo' | 'transferencia' | 'debito'
export type Rol = 'admin' | 'analista' | 'empleado'
export type TipoProducto = 'flor' | 'ramo_base' | 'accesorio'
export type TipoMovimiento = 'abastecimiento' | 'merma' | 'uso_ramo' | 'venta' | 'ajuste_manual'
export type EstadoTurno = 'abierto' | 'cerrado'
export type TipoNota = 'insight' | 'alerta' | 'recomendacion' | 'reporte'
export type PrioridadNota = 'baja' | 'normal' | 'alta' | 'critica'

// ============================================
// PRODUCTOS E INVENTARIO
// ============================================

export interface Producto {
    id: string
    nombre: string
    tipo: TipoProducto
    stock: number
    stock_minimo: number
    unidad: string
    foto_url?: string
    activo: boolean
    created_at: string
    updated_at: string
}

export interface FormulaRamo {
    id: string
    ramo_id: string
    flor_id: string
    cantidad_estandar: number
    activo: boolean
    created_at: string
}

export interface FormulaRamoConDetalles extends FormulaRamo {
    flor: Producto
    ramo: Producto
}

export interface MovimientoInventario {
    id: string
    producto_id: string
    tipo_movimiento: TipoMovimiento
    cantidad: number
    stock_anterior: number
    stock_nuevo: number
    motivo?: string
    empleado_id?: string
    turno_id?: string
    ramo_armado_id?: string
    venta_id?: string
    notas?: string
    created_at: string
}

// ============================================
// TURNOS
// ============================================

export interface Turno {
    id: string
    empleado_id: string
    hora_inicio: string
    hora_fin?: string
    estado: EstadoTurno
    notas?: string
    created_at: string
}

export interface TurnoConEmpleado extends Turno {
    empleado: Usuario | null
}

// ============================================
// RAMOS ARMADOS
// ============================================

export interface FlorUsada {
    flor_id: string
    nombre: string
    cantidad: number
}

export interface RamoArmado {
    id: string
    ramo_base_id: string
    empleado_id: string
    turno_id?: string
    flores_usadas: FlorUsada[]
    variacion_formula?: Record<string, {
        estandar: number
        usado: number
        diferencia: number
    }>
    created_at: string
}

export interface RamoArmadoConDetalles extends RamoArmado {
    ramo_base: Producto
    empleado: Usuario
}

// ============================================
// VENTAS
// ============================================

export interface ProductoVenta {
    producto_id: string
    nombre: string
    cantidad: number
}

export interface Venta {
    id: string
    empleado_id: string
    turno_id?: string
    fecha: string
    monto_total?: number
    metodo_pago?: MetodoPago
    es_uber: boolean
    productos: ProductoVenta[]
    notas?: string
    created_at: string
}

export interface VentaConDetalles extends Venta {
    empleado: Usuario | null
}

// ============================================
// USUARIOS
// ============================================

export interface Usuario {
    id: string
    email: string
    nombre: string
    role: Rol  // Cambiado de 'rol' a 'role' para coincidir con Supabase
    activo: boolean
    created_at: string
    ultimo_acceso?: string
}

// ============================================
// NOTAS ANALISTA
// ============================================

export interface NotaAnalista {
    id: string
    analista_id: string
    titulo: string
    contenido: string
    periodo_inicio?: string
    periodo_fin?: string
    tipo: TipoNota
    prioridad: PrioridadNota
    leida_por_admin: boolean
    fecha_leida?: string
    respuesta_admin?: string
    created_at: string
    updated_at: string
}

export interface NotaAnalistaConDetalles extends NotaAnalista {
    analista: Usuario
}

// ============================================
// ESTADÍSTICAS Y REPORTES
// ============================================

export interface EstadisticasVentas {
    total_ventas: number
    total_productos: number
    ticket_promedio: number
    ventas_uber: number
    ventas_normales: number
}

export interface EstadisticasProducto {
    producto: Producto
    total_vendido: number
    total_merma: number
    rotacion: number
}

export interface EstadisticasEmpleado {
    empleado: Usuario
    total_ventas: number
    cantidad_ventas: number
    ticket_promedio: number
    ramos_armados: number
}