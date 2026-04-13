export interface Bloqueo {
    id: number;
    tipo: 'dia' | 'horario';
    fecha?: string;
    dia_semana?: number;
    hora_inicio?: string;
    hora_fin?: string;
    motivo: string;
    activo?: boolean;
}
