export interface Usuario {
    id: number;
    nombre: string;
    email: string;
    telefono?: string;
    rol: 'usuario' | 'admin';
    token: string;
}
