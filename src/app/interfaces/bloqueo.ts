export interface Bloqueo {
    id: number;
    tipo: 'dia' | 'horario';
    fecha?: string;
    dia_semana?: number;
    hora?: string;
    motivo: string;
}
