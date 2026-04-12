export interface Usuario {
    id: number;
    nombre: string;
    email: string;
    rol: 'usuario' | 'admin';
    token: string;
}
