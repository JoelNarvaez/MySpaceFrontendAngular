import { computed, Injectable, signal } from '@angular/core';
import { Usuario } from '../interfaces/usuario';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  // Signals 
  private usuarioActual = signal<Usuario | null>(null);

  estaAutenticado = computed(() => this.usuarioActual() !== null);
  esAdmin = computed(() => this.usuarioActual()?.rol === 'admin');
  usuario = computed(() => this.usuarioActual());

  login(usuario: Usuario) {
    this.usuarioActual.set(usuario);
    localStorage.setItem('usuario', JSON.stringify(usuario));
  }

  logout() {
    this.usuarioActual.set(null);
    localStorage.removeItem('usuario');
  }

  cargarSesion() {
    const data = localStorage.getItem('usuario');
    if (data) {
      this.usuarioActual.set(JSON.parse(data));
    }
  }
}
