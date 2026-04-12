import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(Auth);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  get email() { return this.form.get('email'); }
  get password() { return this.form.get('password'); }

  iniciarSesion() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // Mock login — cuando el back esté listo esto se reemplaza por una llamada HTTP
    const { email, password } = this.form.value;

    if (email === 'admin@spa.com' && password === 'admin123') {
      this.authService.login({
        id: 1,
        nombre: 'Administrador',
        email: email!,
        rol: 'admin',
        token: 'mock-token-admin'
      });
      Swal.fire({
        icon: 'success',
        title: '¡Bienvenido Admin!',
        showConfirmButton: false,
        timer: 1500
      }).then(() => this.router.navigate(['/admin/calendario']));

    } else if (email === 'usuario@spa.com' && password === 'user123') {
      this.authService.login({
        id: 2,
        nombre: 'María López',
        email: email!,
        rol: 'usuario',
        token: 'mock-token-user'
      });
      Swal.fire({
        icon: 'success',
        title: '¡Bienvenida!',
        text: 'Ya puedes agendar tu cita',
        showConfirmButton: false,
        timer: 1500
      }).then(() => this.router.navigate(['/agendar']));

    } else {
      Swal.fire({
        icon: 'error',
        title: 'Credenciales incorrectas',
        text: 'Verifica tu email y contraseña',
        confirmButtonColor: '#0d9488'
      });
    }
  }
}