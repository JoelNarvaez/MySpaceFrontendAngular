export interface Cita {
    id: number;
    nombre_cliente: string;
    telefono: string;
    email: string;
    id_servicio: number;
    nombre_servicio?: string;
    fecha: string;
    hora: string;
    estado?: 'pendiente' | 'confirmada' | 'cancelada' | 'completada' | 'no_asistio';
    precio_cobrado?: number;
    motivo_cancelacion?: string;
    fecha_creacion?: string;
}
