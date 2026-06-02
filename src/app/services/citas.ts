import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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
    const cacheBuster = Date.now();
    return this.http.get<Horario[]>(`${this.apiUrl}/horarios?fecha=${fecha}&idServicio=${idServicio}&_ts=${cacheBuster}`);
  }

  crearCita(cita: Omit<Cita, 'id' | 'fecha_creacion'>): Observable<any> {
    return this.http.post(`${this.apiUrl}/citas`, cita);
  }

  getCitasPorUsuario(email: string): Observable<Cita[]> {
    return this.http.get<{ success: boolean; data: Cita[] }>(`${this.apiUrl}/citas/usuario/${email}`)
      .pipe(map(res => res.data));
  }

  cancelarCita(id: number, motivoCancelacion: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/citas/${id}/cancelar`, {
      motivo_cancelacion: motivoCancelacion
    });
  }

  getCitasAdmin(): Observable<Cita[]> {
    return this.http.get<{ success: boolean; data: Cita[] }>(`${this.apiUrl}/citas`)
      .pipe(map(res => res.data));
  }
}
