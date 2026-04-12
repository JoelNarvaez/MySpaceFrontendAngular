import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Bloqueo } from '../interfaces/bloqueo';

@Injectable({
  providedIn: 'root'
})
export class Bloqueos {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api';

  // Para probar sin la BD
  private mockBloqueos: Bloqueo[] = [
    { id: 1, tipo: 'dia', dia_semana: 0, motivo: 'Domingos cerrado' },
    { id: 2, tipo: 'dia', fecha: '2026-05-01', motivo: 'Día del trabajo' },
    { id: 3, tipo: 'horario', hora: '14:00', motivo: 'Hora de comida' }
  ];

  getBloqueos(): Observable<Bloqueo[]> {
    // return this.http.get<Bloqueo[]>(`${this.apiUrl}/bloqueos`);
    return of(this.mockBloqueos);
  }

  crearBloqueo(bloqueo: Omit<Bloqueo, 'id'>): Observable<any> {
    // return this.http.post(`${this.apiUrl}/bloqueos`, bloqueo);
    const nuevo = { ...bloqueo, id: Math.floor(Math.random() * 1000) };
    this.mockBloqueos.push(nuevo as Bloqueo);
    return of({ mensaje: 'Bloqueo creado correctamente' });
  }

  eliminarBloqueo(id: number): Observable<any> {
    // return this.http.delete(`${this.apiUrl}/bloqueos/${id}`);
    this.mockBloqueos = this.mockBloqueos.filter(b => b.id !== id);
    return of({ mensaje: 'Bloqueo eliminado correctamente' });
  }
}