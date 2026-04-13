import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Servicio } from '../interfaces/servicio';
import { environment } from '../../environments/environment';

type ServiciosResponse<T> = T | { success?: boolean; data?: T };

@Injectable({
  providedIn: 'root'
})
export class Servicios {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  private extraerData<T>(res: ServiciosResponse<T>): T {
    if (Array.isArray(res)) {
      return res as T;
    }

    if (res && typeof res === 'object' && 'data' in res && res.data !== undefined) {
      return res.data;
    }

    return res as T;
  }

  getServicios(): Observable<Servicio[]> {
    return this.http.get<ServiciosResponse<Servicio[]>>(`${this.apiUrl}/servicios`).pipe(
      map(res => this.extraerData(res))
    );
  }

  getServicioById(id: number): Observable<Servicio> {
    return this.http.get<ServiciosResponse<Servicio>>(`${this.apiUrl}/servicios/${id}`).pipe(
      map(res => this.extraerData(res))
    );
  }
}
