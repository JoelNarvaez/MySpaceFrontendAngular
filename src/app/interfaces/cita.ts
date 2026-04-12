export interface Cita {
    id: number;
    nombre_cliente: string;
    telefono: string;
    email: string;
    id_servicio: number;
    nombre_servicio?: string;
    fecha: string;
    hora: string;
    fecha_creacion?: string;
}
