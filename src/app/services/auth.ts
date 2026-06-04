import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, tap } from 'rxjs';
import { Usuario } from '../interfaces/usuario';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  private usuarioActual = signal<Usuario | null>(null);

  estaAutenticado = computed(() => this.usuarioActual() !== null);
  esAdmin = computed(() => this.usuarioActual()?.rol === 'admin');
  usuario = computed(() => this.usuarioActual());

  login(credenciales: { email: string; password: string }): Observable<Usuario> {
    return this.http.post<unknown>(`${this.apiUrl}/auth/login`, credenciales).pipe(
      map(response => this.normalizarUsuario(response)),
      tap(usuario => {
        this.usuarioActual.set(usuario);
        localStorage.setItem('usuario', JSON.stringify(usuario));
      })
    );
  }

  registro(datos: { nombre: string; email: string; telefono: string; password: string }): Observable<Usuario> {
    return this.http.post<unknown>(`${this.apiUrl}/auth/registro`, datos).pipe(
      map(response => this.normalizarUsuario(response)),
      tap(usuario => {
        this.persistirUsuario(usuario);
      })
    );
  }

  // RECUPERAR CONTRASEÑA------------------------------
  forgotPassword(email: string) {
    return this.http.post(
      `${this.apiUrl}/auth/forgot-password`,
      { email }
    );
  }

  verifyResetToken(token: string) {
    return this.http.get(
      `${this.apiUrl}/auth/verify-reset-token/${token}`
    );
  }

  resetPassword(token: string, password: string) {
    return this.http.post(
      `${this.apiUrl}/auth/reset-password/${token}`,
      { password }
    );
  }
  // --------------------------------------------------

  actualizarPerfil(datos: { nombre: string; email: string; telefono: string }): Observable<Usuario> {
    return this.http.put<unknown>(`${this.apiUrl}/auth/perfil`, datos).pipe(
      map(response => this.normalizarUsuario(response, this.usuarioActual())),
      tap(usuario => {
        this.persistirUsuario(usuario);
      })
    );
  }

  logout() {
    this.usuarioActual.set(null);
    localStorage.removeItem('usuario');
  }

  cargarSesion() {
    const data = localStorage.getItem('usuario');
    if (data) {
      this.usuarioActual.set(this.normalizarUsuario(JSON.parse(data)));
    }
  }

  private persistirUsuario(usuario: Usuario) {
    this.usuarioActual.set(usuario);
    localStorage.setItem('usuario', JSON.stringify(usuario));
  }

  private normalizarUsuario(response: unknown, fallback: Usuario | null = null): Usuario {
    const raw = (response ?? {}) as Record<string, unknown>;
    const nested = this.esObjeto(raw['usuario']) ? raw['usuario'] : this.esObjeto(raw['user']) ? raw['user'] : raw;

    const nombre =
      this.texto(nested['nombre']) ??
      this.texto(nested['name']) ??
      this.texto(raw['nombre']) ??
      this.texto(raw['name']) ??
      fallback?.nombre ??
      this.texto(nested['email']) ??
      this.texto(raw['email']) ??
      'Usuario';

    return {
      id: this.numero(nested['id']) ?? this.numero(raw['id']) ?? fallback?.id ?? 0,
      nombre,
      email: this.texto(nested['email']) ?? this.texto(raw['email']) ?? fallback?.email ?? '',
      telefono: this.texto(nested['telefono']) ?? this.texto(raw['telefono']) ?? fallback?.telefono,
      rol: (this.texto(nested['rol']) ?? this.texto(raw['rol']) ?? fallback?.rol ?? 'usuario') as 'usuario' | 'admin',
      token: this.texto(raw['token']) ?? this.texto(nested['token']) ?? fallback?.token ?? '',
    };
  }

  private esObjeto(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }

  private texto(value: unknown): string | undefined {
    return typeof value === 'string' && value.trim() ? value : undefined;
  }

  private numero(value: unknown): number | undefined {
    return typeof value === 'number' ? value : undefined;
  }
}
