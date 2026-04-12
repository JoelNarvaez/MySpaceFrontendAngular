import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Cita } from '../interfaces/cita';
import { Horario } from '../interfaces/horario';

@Injectable({
  providedIn: 'root'
})
export class Citas {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api';

  private mockHorarios: Horario[] = [
    { hora: '09:00', disponible: true },
    { hora: '10:00', disponible: false },
    { hora: '11:00', disponible: true },
    { hora: '12:00', disponible: true },
    { hora: '13:00', disponible: false },
    { hora: '14:00', disponible: true },
    { hora: '15:00', disponible: true },
    { hora: '16:00', disponible: false },
    { hora: '17:00', disponible: true },
  ];



  getHorariosDisponibles(fecha: string, idServicio: number): Observable<Horario[]> {
    // return this.http.get<Horario[]>(`${this.apiUrl}/horarios?fecha=${fecha}&idServicio=${idServicio}`);
    return of(this.mockHorarios);
  }

  crearCita(cita: Omit<Cita, 'id' | 'fecha_creacion'>): Observable<any> {
    // return this.http.post(`${this.apiUrl}/citas`, cita);
    console.log('Cita creada (mock):', cita);
    return of({ mensaje: 'Cita creada correctamente', id: Math.random() });
  }

  // Para probar funcionamiento de la lógica sin la BD
  private mockCitas: Cita[] = [
  {
    id: 1,
    nombre_cliente: 'María López',
    email: 'usuario@spa.com',
    telefono: '4491234567',
    id_servicio: 1,
    nombre_servicio: 'Masaje relajante',
    fecha: '2026-04-20',
    hora: '10:00'
  },
  {
    id: 2,
    nombre_cliente: 'María López',
    email: 'usuario@spa.com',
    telefono: '4491234567',
    id_servicio: 2,
    nombre_servicio: 'Facial hidratante',
    fecha: '2026-04-25',
    hora: '12:00'
  }
]; 
/*
getCitasPorUsuario(email: string): Observable<Cita[]> {
  // return this.http.get<Cita[]>(`${this.apiUrl}/citas/usuario/${email}`);
  return of(this.mockCitas.filter(c => c.email === email));
}*/

  getCitasPorUsuario(email: string): Observable<Cita[]> {
    // return this.http.get<Cita[]>(`${this.apiUrl}/citas/usuario/${email}`);
    return of([]);
  }

  cancelarCita(id: number): Observable<any> {
    // return this.http.delete(`${this.apiUrl}/citas/${id}`);
    console.log('Cita cancelada (mock):', id);
    return of({ mensaje: 'Cita cancelada correctamente' });
  }

  getCitasAdmin(): Observable<Cita[]> {
    // return this.http.get<Cita[]>(`${this.apiUrl}/citas`);
    //return of([]);
    return of(this.mockCitas); // PROBAR FUNCIONAMIENTO SIN bd
  }
}