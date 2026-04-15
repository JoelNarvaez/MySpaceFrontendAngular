import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})

export class Login {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(Auth);

  cargando = false;

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

    this.cargando = true;
    const { email, password } = this.form.value;

    this.authService.login({ email: email!, password: password! }).subscribe({
      next: (usuario) => {
        this.cargando = false;
        const returnUrl = this.route.snapshot.queryParams['returnUrl'];
        const destino = returnUrl || (usuario.rol === 'admin' ? '/admin/calendario' : '/agendar');
        const nombre = usuario.nombre || usuario.email || 'Usuario';

        Swal.fire({
          icon: 'success',
          iconColor: '#D4A373', // Dorado
          title: `<span class="logo-font" style="color: #1E3A5F; font-size: 1.5rem; letter-spacing: 0.05em;">BIENVENIDO, ${nombre.toUpperCase()}</span>`,
          text: 'Es un placer tenerte de vuelta.',
          showConfirmButton: false,
          timer: 1800,
          background: '#F5F5F4',
          backdrop: `rgba(30, 58, 95, 0.4)`,
          customClass: {
            popup: 'rounded-[2rem] border-none shadow-2xl'
          }
        }).then(() => this.router.navigateByUrl(destino));
      },
      error: () => {
        this.cargando = false;
        Swal.fire({
          icon: 'error',
          iconColor: '#1E3A5F', // Navy
          title: '<span class="logo-font" style="color: #1E3A5F;">ERROR DE ACCESO</span>',
          text: 'Verifica tu email y contraseña',
          confirmButtonText: 'REINTENTAR',
          confirmButtonColor: '#1E3A5F', // Botón Navy
          background: '#F5F5F4',
          customClass: {
            popup: 'rounded-[2rem] shadow-2xl',
            confirmButton: 'rounded-full px-10 py-3 uppercase tracking-[0.2em] text-[10px] font-bold'
          }
        });
      }
    });
  }
}