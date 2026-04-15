import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cita } from '../interfaces/cita';
import { Horario } from '../interfaces/horario';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Citas {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getHorariosDisponibles(fecha: string, idServicio: number): Observable<Horario[]> {
    return this.http.get<Horario[]>(`${this.apiUrl}/horarios?fecha=${fecha}&idServicio=${idServicio}`);
  }

  crearCita(cita: Omit<Cita, 'id' | 'fecha_creacion'>): Observable<any> {
    return this.http.post(`${this.apiUrl}/citas`, cita);
  }

  getCitasPorUsuario(email: string): Observable<Cita[]> {
    return this.http.get<Cita[]>(`${this.apiUrl}/citas/usuario/${email}`);
  }

  cancelarCita(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/citas/${id}`);
  }

  getCitasAdmin(): Observable<Cita[]> {
    return this.http.get<Cita[]>(`${this.apiUrl}/citas`);
  }
}
