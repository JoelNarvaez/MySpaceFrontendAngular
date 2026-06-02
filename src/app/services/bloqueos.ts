import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Bloqueo } from '../interfaces/bloqueo';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Bloqueos {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getBloqueos(): Observable<Bloqueo[]> {
    return this.http.get<{ success: boolean; data: Bloqueo[] }>(`${this.apiUrl}/bloqueos`)
      .pipe(map(res => res.data));
  }

  getBloqueoPublico(): Observable<Pick<Bloqueo, 'tipo' | 'fecha' | 'dia_semana'>[]> {
    return this.http.get<{ success: boolean; data: Pick<Bloqueo, 'tipo' | 'fecha' | 'dia_semana'>[] }>(`${this.apiUrl}/bloqueos/publico`)
      .pipe(map(res => res.data));
  }

  crearBloqueo(bloqueo: Omit<Bloqueo, 'id'>): Observable<any> {
    return this.http.post(`${this.apiUrl}/bloqueos`, bloqueo);
  }

  eliminarBloqueo(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/bloqueos/${id}`);
  }
}
