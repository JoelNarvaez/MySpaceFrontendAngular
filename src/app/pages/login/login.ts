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
          title: `Bienvenido, ${nombre}`,
          showConfirmButton: false,
          timer: 1500
        }).then(() => this.router.navigateByUrl(destino));
      },
      error: () => {
        this.cargando = false;
        Swal.fire({
          icon: 'error',
          title: 'Credenciales incorrectas',
          text: 'Verifica tu email y contrasena',
          confirmButtonColor: '#0d9488'
        });
      }
    });
  }
}
