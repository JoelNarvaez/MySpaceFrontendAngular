import { Component, inject } from '@angular/core';
import { Auth } from '../../services/auth';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-navbar',
  standalone: true,
  // 2. Agrégalo aquí al arreglo de imports
  imports: [RouterLink, RouterLinkActive], 
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  authService = inject(Auth);
  private router = inject(Router);

  isMobileMenuOpen = false;

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  irAgendar() {
    this.isMobileMenuOpen = false;

    if (this.authService.estaAutenticado()) {
      this.router.navigate(['/agendar']);
    } else {
      Swal.fire({
        icon: 'info',
        title: '¡Inicia sesión!',
        text: 'Debes iniciar sesión para agendar una cita.',
        confirmButtonText: 'Iniciar sesión',
        confirmButtonColor: '#1E3A5F',
        showCancelButton: true,
        cancelButtonText: 'Cancelar'
      }).then(result => {
        if (result.isConfirmed) {
          this.router.navigate(['/login']);
        }
      });
    }
  }
}