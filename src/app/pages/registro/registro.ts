import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { Auth } from '../../services/auth';

export function passwordsIgualesValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirmar = control.get('confirmarPassword');
  if (!password || !confirmar) return null;
  return password.value !== confirmar.value ? { passwordsNoCoinciden: true } : null;
}

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrl: './registro.css'
})
export class Registro {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(Auth);

  cargando = false;

  form = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(80)]],
    email: ['', [Validators.required, Validators.email]],
    telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmarPassword: ['', [Validators.required]]
  }, { validators: passwordsIgualesValidator });

  get nombre() { return this.form.get('nombre'); }
  get email() { return this.form.get('email'); }
  get telefono() { return this.form.get('telefono'); }
  get password() { return this.form.get('password'); }
  get confirmarPassword() { return this.form.get('confirmarPassword'); }

  registrarse() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.cargando = true;
    const { nombre, email, telefono, password } = this.form.value;

    this.authService.registro({ nombre: nombre!, email: email!, telefono: telefono!, password: password! }).subscribe({
      next: () => {
        this.cargando = false;
        Swal.fire({
          icon: 'success',
          title: '¡Cuenta creada!',
          text: 'Ya puedes agendar tu cita',
          showConfirmButton: false,
          timer: 1500
        }).then(() => this.router.navigate(['/agendar']));
      },
      error: (err) => {
        this.cargando = false;
        const mensaje = err.status === 409
          ? 'Este correo ya está registrado'
          : 'No se pudo crear la cuenta, intenta de nuevo';
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: mensaje,
          confirmButtonColor: '#0d9488'
        });
      }
    });
  }
}
