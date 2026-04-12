import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Servicio } from '../interfaces/servicio';

@Injectable({
  providedIn: 'root'
})
export class Servicios {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api';

  // Mock data — se reemplaza solo cuando el back esté listo
  private mockServicios: Servicio[] = [
    { id: 1, nombre: 'Masaje relajante', descripcion: 'Masaje corporal completo para aliviar el estrés.', duracion_min: 60, precio: 850, imagen_url: 'assets/masaje.jpg' },
    { id: 2, nombre: 'Facial hidratante', descripcion: 'Tratamiento facial profundo con productos naturales.', duracion_min: 45, precio: 650, imagen_url: 'assets/facial.jpg' },
    { id: 3, nombre: 'Aromaterapia', descripcion: 'Terapia con aceites esenciales para equilibrar cuerpo y mente.', duracion_min: 50, precio: 700, imagen_url: 'assets/aromaterapia.jpg' },
    { id: 4, nombre: 'Exfoliación corporal', descripcion: 'Eliminación de células muertas para una piel suave y radiante.', duracion_min: 40, precio: 550, imagen_url: 'assets/exfoliacion.jpg' },
  ];

  getServicios(): Observable<Servicio[]> {
    // Cuando el back esté listo, cambia esta línea:
    // return this.http.get<Servicio[]>(`${this.apiUrl}/servicios`);
    return of(this.mockServicios);
  }

  getServicioById(id: number): Observable<Servicio | undefined> {
    // return this.http.get<Servicio>(`${this.apiUrl}/servicios/${id}`);
    return of(this.mockServicios.find(s => s.id === id));
  }
}