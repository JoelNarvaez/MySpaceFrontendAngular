import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Bloqueo } from '../interfaces/bloqueo';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Bloqueos {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getBloqueos(): Observable<Bloqueo[]> {
    return this.http.get<Bloqueo[]>(`${this.apiUrl}/bloqueos`);
  }

  crearBloqueo(bloqueo: Omit<Bloqueo, 'id'>): Observable<any> {
    return this.http.post(`${this.apiUrl}/bloqueos`, bloqueo);
  }

  eliminarBloqueo(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/bloqueos/${id}`);
  }
}
